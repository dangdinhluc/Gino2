-- Keep staff content mappings atomic and auditable instead of letting a client
-- leave a partial curriculum when one insert fails.
create or replace function public.admin_replace_grammar_topic_courses(target_topic_id text, target_course_ids text[])
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  normalized_course_ids text[];
begin
  if not public.has_staff_permission('content.write') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  perform 1 from public.grammar_topics as gt where gt.id = target_topic_id;
  if not found then raise exception 'GRAMMAR_TOPIC_NOT_FOUND' using errcode = '22023'; end if;
  select coalesce(array_agg(distinct value), '{}'::text[]) into normalized_course_ids
  from unnest(coalesce(target_course_ids, '{}'::text[])) as requested(value)
  where btrim(value) <> '';
  delete from public.grammar_topic_courses as gc where gc.topic_id = target_topic_id;
  insert into public.grammar_topic_courses (topic_id, course_id)
  select target_topic_id, requested_course_id
  from unnest(normalized_course_ids) as requested(requested_course_id);
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'grammar_topic_courses_replaced', 'grammar_topic', target_topic_id, jsonb_build_object('courseIds', normalized_course_ids));
end;
$$;

create or replace function public.admin_replace_lesson_vocabulary(target_lesson_id text, target_vocabulary_ids text[])
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if not public.has_staff_permission('content.write') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  perform 1 from public.lessons as l where l.id = target_lesson_id;
  if not found then raise exception 'LESSON_NOT_FOUND' using errcode = '22023'; end if;
  delete from public.lesson_vocabulary as lv where lv.lesson_id = target_lesson_id;
  insert into public.lesson_vocabulary (lesson_id, vocabulary_item_id, position)
  select target_lesson_id, requested.vocabulary_item_id, min(requested.position)::integer - 1
  from (
    select value as vocabulary_item_id, ordinality as position
    from unnest(coalesce(target_vocabulary_ids, '{}'::text[])) with ordinality as input(value, ordinality)
    where btrim(value) <> ''
  ) as requested
  group by requested.vocabulary_item_id;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'lesson_vocabulary_replaced', 'lesson', target_lesson_id, jsonb_build_object('vocabularyIds', coalesce(target_vocabulary_ids, '{}'::text[])));
end;
$$;

-- Speaking follows the same draft/review/publish gate as the rest of the CMS.
drop policy if exists speaking_prompts_content on public.speaking_prompts;
create policy speaking_prompts_content_insert on public.speaking_prompts for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy speaking_prompts_content_update on public.speaking_prompts for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy speaking_prompts_owner_delete on public.speaking_prompts for delete to authenticated using (public.staff_role() = 'owner');

create or replace function public.record_content_revision()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  revision_entity_type text;
  revision_entity_id text;
  next_version integer;
  revision_action text;
begin
  revision_entity_type := case tg_table_name
    when 'courses' then 'course'
    when 'course_modules' then 'module'
    when 'lessons' then 'lesson'
    when 'vocabulary_items' then 'vocabulary'
    when 'assessments' then 'assessment'
    when 'documents' then 'document'
    when 'podcast_episodes' then 'podcast'
    when 'grammar_topics' then 'grammar_topic'
    when 'speaking_prompts' then 'speaking_prompt'
    else null
  end;
  if revision_entity_type is null then return new; end if;
  revision_entity_id := new.id::text;
  select coalesce(max(cr.version), 0) + 1 into next_version
  from public.content_revisions as cr
  where cr.entity_type = revision_entity_type and cr.entity_id = revision_entity_id;
  revision_action := case
    when tg_op = 'INSERT' then 'created'
    when to_jsonb(new) ? 'status' and coalesce(to_jsonb(new)->>'status', '') = 'in_review' then 'submitted'
    when to_jsonb(new) ? 'status' and coalesce(to_jsonb(new)->>'status', '') = 'published' then 'published'
    when to_jsonb(new) ? 'status' and coalesce(to_jsonb(new)->>'status', '') = 'archived' then 'archived'
    else 'updated'
  end;
  insert into public.content_revisions (entity_type, entity_id, version, action, snapshot, author_id)
  values (revision_entity_type, revision_entity_id, next_version, revision_action, to_jsonb(new), auth.uid());
  return new;
end;
$$;

drop trigger if exists speaking_prompts_record_revision on public.speaking_prompts;
create trigger speaking_prompts_record_revision after insert or update on public.speaking_prompts for each row execute function public.record_content_revision();

create or replace function public.publish_content_revision(target_entity_type text, target_entity_id text, target_status text)
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_table text;
begin
  if public.staff_role() <> 'owner' then raise exception 'OWNER_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  if target_entity_type not in ('course', 'module', 'lesson', 'assessment', 'document', 'podcast', 'grammar_topic', 'speaking_prompt') then raise exception 'INVALID_CONTENT_TYPE' using errcode = '22023'; end if;
  if target_status not in ('draft', 'in_review', 'published', 'archived') then raise exception 'INVALID_CONTENT_STATUS' using errcode = '22023'; end if;
  target_table := case target_entity_type
    when 'course' then 'courses'
    when 'module' then 'course_modules'
    when 'lesson' then 'lessons'
    when 'assessment' then 'assessments'
    when 'document' then 'documents'
    when 'podcast' then 'podcast_episodes'
    when 'grammar_topic' then 'grammar_topics'
    when 'speaking_prompt' then 'speaking_prompts'
  end;
  if target_table = 'courses' then
    execute 'update public.courses set status = $1, published_at = case when $1 = ''published'' then now() else published_at end where id = $2'
    using target_status, target_entity_id;
  else
    execute format('update public.%I set status = $1 where id = $2', target_table)
    using target_status, target_entity_id;
  end if;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'content_status_changed', target_entity_type, target_entity_id, jsonb_build_object('status', target_status));
end;
$$;

do $$
declare target_table text;
begin
  foreach target_table in array array['grammar_topics', 'grammar_rules', 'grammar_examples', 'speaking_prompts'] loop
    execute format('drop trigger if exists audit_admin_mutation on public.%I', target_table);
    execute format('create trigger audit_admin_mutation after insert or update or delete on public.%I for each row execute function public.audit_admin_mutation()', target_table);
  end loop;
end;
$$;

grant execute on function public.admin_replace_grammar_topic_courses(text, text[]), public.admin_replace_lesson_vocabulary(text, text[]) to authenticated;

-- Keep the revision log aligned with the speaking prompt CMS workflow.
alter table public.content_revisions drop constraint if exists content_revisions_entity_type_check;
alter table public.content_revisions add constraint content_revisions_entity_type_check
  check (entity_type in ('course', 'module', 'lesson', 'vocabulary', 'assessment', 'document', 'podcast', 'grammar_topic', 'speaking_prompt'));

create or replace function public.rollback_content_revision(target_revision_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  revision_row public.content_revisions%rowtype;
begin
  if public.staff_role() <> 'owner' then
    raise exception 'OWNER_PERMISSION_REQUIRED' using errcode = '42501';
  end if;

  select * into revision_row
  from public.content_revisions
  where id = target_revision_id;
  if not found then
    raise exception 'REVISION_NOT_FOUND' using errcode = '22023';
  end if;

  if revision_row.entity_type = 'course' then
    update public.courses as target
    set slug = snapshot.slug,
        title = snapshot.title,
        level = snapshot.level,
        status = snapshot.status,
        description = snapshot.description,
        theme_color = snapshot.theme_color,
        order_index = snapshot.order_index,
        published_at = snapshot.published_at
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      slug text, title text, level text, status text, description text,
      theme_color text, order_index integer, published_at timestamptz
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'module' then
    update public.course_modules as target
    set course_id = snapshot.course_id,
        title = snapshot.title,
        description = snapshot.description,
        level = snapshot.level,
        status = snapshot.status,
        order_index = snapshot.order_index
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      course_id text, title text, description text, level text,
      status text, order_index integer
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'lesson' then
    update public.lessons as target
    set course_id = snapshot.course_id,
        module_id = snapshot.module_id,
        title = snapshot.title,
        description = snapshot.description,
        lesson_type = snapshot.lesson_type,
        status = snapshot.status,
        duration_minutes = snapshot.duration_minutes,
        objectives = snapshot.objectives,
        order_index = snapshot.order_index,
        content_markdown = snapshot.content_markdown
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      course_id text, module_id text, title text, description text,
      lesson_type text, status text, duration_minutes integer,
      objectives text[], order_index integer, content_markdown text
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'vocabulary' then
    update public.vocabulary_items as target
    set term = snapshot.term,
        translation = snapshot.translation,
        example_sentence = snapshot.example_sentence,
        pronunciation = snapshot.pronunciation,
        audio_url = snapshot.audio_url,
        tags = snapshot.tags,
        reading = snapshot.reading,
        level = snapshot.level,
        metadata = snapshot.metadata
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      term text, translation text, example_sentence text, pronunciation text,
      audio_url text, tags text[], reading text, level text, metadata jsonb
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'assessment' then
    update public.assessments as target
    set course_id = snapshot.course_id,
        title = snapshot.title,
        assessment_type = snapshot.assessment_type,
        passing_score = snapshot.passing_score,
        status = snapshot.status,
        order_index = snapshot.order_index
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      course_id text, title text, assessment_type text, passing_score integer,
      status text, order_index integer
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'document' then
    update public.documents as target
    set course_id = snapshot.course_id,
        title = snapshot.title,
        document_type = snapshot.document_type,
        external_url = snapshot.external_url,
        summary = snapshot.summary,
        metadata = snapshot.metadata,
        storage_path = snapshot.storage_path,
        status = snapshot.status,
        content_markdown = snapshot.content_markdown,
        read_time_minutes = snapshot.read_time_minutes
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      course_id text, title text, document_type text, external_url text,
      summary text, metadata jsonb, storage_path text, status text,
      content_markdown text, read_time_minutes integer
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'podcast' then
    update public.podcast_episodes as target
    set course_id = snapshot.course_id,
        lesson_id = snapshot.lesson_id,
        title = snapshot.title,
        summary = snapshot.summary,
        external_url = snapshot.external_url,
        duration_minutes = snapshot.duration_minutes,
        status = snapshot.status,
        storage_path = snapshot.storage_path
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      course_id text, lesson_id text, title text, summary text,
      external_url text, duration_minutes integer, status text,
      storage_path text
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'grammar_topic' then
    update public.grammar_topics as target
    set slug = snapshot.slug,
        title = snapshot.title,
        level = snapshot.level,
        category = snapshot.category,
        summary = snapshot.summary,
        status = snapshot.status,
        order_index = snapshot.order_index
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      slug text, title text, level text, category text, summary text,
      status text, order_index integer
    )
    where target.id = revision_row.entity_id;
  elsif revision_row.entity_type = 'speaking_prompt' then
    update public.speaking_prompts as target
    set course_id = snapshot.course_id,
        title = snapshot.title,
        instructions = snapshot.instructions,
        rubric = snapshot.rubric,
        status = snapshot.status,
        order_index = snapshot.order_index
    from jsonb_to_record(revision_row.snapshot) as snapshot(
      course_id text, title text, instructions text, rubric jsonb,
      status text, order_index integer
    )
    where target.id = revision_row.entity_id;
  else
    raise exception 'INVALID_CONTENT_TYPE' using errcode = '22023';
  end if;

  if not found then
    raise exception 'REVISION_ENTITY_NOT_FOUND' using errcode = '22023';
  end if;

  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    'content_rolled_back',
    revision_row.entity_type,
    revision_row.entity_id,
    jsonb_build_object('revisionId', revision_row.id, 'version', revision_row.version)
  );
end;
$$;

revoke all on function public.rollback_content_revision(uuid) from public;
grant execute on function public.rollback_content_revision(uuid) to authenticated;

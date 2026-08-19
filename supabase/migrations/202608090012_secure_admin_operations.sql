begin;

-- These mutations are intentionally RPC-only: the browser never chooses an
-- audit actor, and role/package changes cannot leave partial state behind.
create or replace function public.admin_set_staff_role(target_user_id uuid, target_role text)
returns public.admin_roles
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  saved_role public.admin_roles%rowtype;
begin
  if public.staff_role() <> 'owner' then
    raise exception 'OWNER_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  if target_role not in ('owner', 'content_editor', 'instructor_support', 'analyst') then
    raise exception 'INVALID_STAFF_ROLE' using errcode = '22023';
  end if;
  if target_user_id = auth.uid() and target_role <> 'owner' then
    raise exception 'CANNOT_SELF_DEMOTE' using errcode = '22023';
  end if;

  insert into public.admin_roles (user_id, role, granted_by)
  values (target_user_id, target_role, auth.uid())
  on conflict (user_id) do update
    set role = excluded.role,
        granted_by = excluded.granted_by,
        granted_at = now()
  returning * into saved_role;

  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    'staff_role_set',
    'admin_role',
    target_user_id::text,
    jsonb_build_object('role', target_role)
  );
  return saved_role;
end;
$$;

create or replace function public.admin_remove_staff_role(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  existing_role text;
begin
  if public.staff_role() <> 'owner' then
    raise exception 'OWNER_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'CANNOT_REMOVE_OWN_ROLE' using errcode = '22023';
  end if;

  select role into existing_role from public.admin_roles where user_id = target_user_id;
  if existing_role is null then
    return;
  end if;
  if existing_role = 'owner' and (select count(*) from public.admin_roles where role = 'owner') <= 1 then
    raise exception 'LAST_OWNER_REQUIRED' using errcode = '22023';
  end if;

  delete from public.admin_roles where user_id = target_user_id;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    'staff_role_removed',
    'admin_role',
    target_user_id::text,
    jsonb_build_object('previousRole', existing_role)
  );
end;
$$;

create or replace function public.admin_replace_package_courses(target_package_id text, target_course_ids text[])
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  normalized_course_ids text[] := coalesce(target_course_ids, '{}'::text[]);
begin
  if public.staff_role() <> 'owner' then
    raise exception 'OWNER_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  if not exists (select 1 from public.packages where id = target_package_id) then
    raise exception 'PACKAGE_NOT_FOUND' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(normalized_course_ids) as requested_course_id
    where not exists (select 1 from public.courses where id = requested_course_id)
  ) then
    raise exception 'COURSE_NOT_FOUND' using errcode = '22023';
  end if;

  delete from public.package_courses where package_id = target_package_id;
  insert into public.package_courses (package_id, course_id)
  select target_package_id, requested_course_id
  from (select distinct unnest(normalized_course_ids) as requested_course_id) as requested;

  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    'package_courses_replaced',
    'package',
    target_package_id,
    jsonb_build_object('courseIds', normalized_course_ids)
  );
end;
$$;

create or replace function public.admin_create_intervention_note(target_learner_id uuid, target_body text)
returns public.learner_intervention_notes
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  saved_note public.learner_intervention_notes%rowtype;
  normalized_body text := trim(target_body);
begin
  if not public.has_staff_permission('learner.manage') then
    raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  if length(normalized_body) not between 1 and 5000 then
    raise exception 'INVALID_NOTE_BODY' using errcode = '22023';
  end if;

  insert into public.learner_intervention_notes (learner_id, staff_id, body)
  values (target_learner_id, auth.uid(), normalized_body)
  returning * into saved_note;

  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    'learner_note_created',
    'learner',
    target_learner_id::text,
    jsonb_build_object('noteId', saved_note.id)
  );
  return saved_note;
end;
$$;

create or replace function public.archive_announcement(target_announcement_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if not public.has_staff_permission('announcement.manage') then
    raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  update public.announcements
  set archived_at = coalesce(archived_at, now())
  where id = target_announcement_id;
  if not found then
    raise exception 'ANNOUNCEMENT_NOT_FOUND' using errcode = '22023';
  end if;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'announcement_archived', 'announcement', target_announcement_id::text);
end;
$$;

revoke all on function public.admin_set_staff_role(uuid, text), public.admin_remove_staff_role(uuid), public.admin_replace_package_courses(text, text[]), public.admin_create_intervention_note(uuid, text), public.archive_announcement(uuid) from public;
grant execute on function public.admin_set_staff_role(uuid, text), public.admin_remove_staff_role(uuid), public.admin_replace_package_courses(text, text[]), public.admin_create_intervention_note(uuid, text), public.archive_announcement(uuid) to authenticated;

commit;

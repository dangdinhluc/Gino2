begin;

alter table public.profiles
  add column if not exists active_course_id text references public.courses(id) on delete set null;

create index if not exists profiles_active_course_id_idx
  on public.profiles(active_course_id);

-- Existing learners keep their current learning path. The first active course
-- is deterministic: active status, then progress, then most recent enrollment.
with ranked_enrollments as (
  select
    e.user_id,
    e.course_id,
    row_number() over (
      partition by e.user_id
      order by
        case when e.status = 'active' then 0 else 1 end,
        e.progress_percent desc,
        e.enrolled_at desc,
        e.course_id
    ) as row_number
  from public.enrollments as e
  join public.courses as c on c.id = e.course_id
  where e.status in ('active', 'completed')
    and c.status = 'published'
)
update public.profiles as p
set active_course_id = ranked.course_id
from ranked_enrollments as ranked
where ranked.row_number = 1
  and ranked.user_id = p.user_id
  and p.active_course_id is null;

create or replace function public.set_active_course(target_course_id text)
returns text
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.enrollments as e
    join public.courses as c on c.id = e.course_id
    where e.user_id = auth.uid()
      and e.course_id = target_course_id
      and e.status in ('active', 'completed')
      and c.status = 'published'
  ) then
    raise exception 'COURSE_NOT_ENROLLED' using errcode = '42501';
  end if;

  update public.profiles
  set active_course_id = target_course_id
  where user_id = auth.uid();

  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;

  return target_course_id;
end;
$$;

create or replace function public.enroll_in_free_course(target_course_id text)
returns table (
  id text,
  package_id text,
  course_id text,
  status text,
  progress_percent numeric
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_package_id text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.courses as c
    where c.id = target_course_id
      and c.status = 'published'
  ) then
    raise exception 'COURSE_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select p.id
  into target_package_id
  from public.packages as p
  join public.package_courses as pc on pc.package_id = p.id
  where pc.course_id = target_course_id
    and p.status = 'active'
    and p.price_cents = 0
  order by p.created_at, p.id
  limit 1;

  if target_package_id is null then
    raise exception 'COURSE_REQUIRES_PACKAGE' using errcode = 'P0001';
  end if;

  insert into public.enrollments (
    id,
    user_id,
    package_id,
    course_id,
    status,
    progress_percent
  )
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_package_id,
    target_course_id,
    'active',
    0
  )
  on conflict on constraint enrollments_user_id_course_id_key do update
  set package_id = coalesce(public.enrollments.package_id, excluded.package_id),
      status = case
        when public.enrollments.status = 'completed' then 'completed'
        else 'active'
      end;

  update public.profiles
  set active_course_id = target_course_id
  where user_id = auth.uid();

  return query
  select e.id, e.package_id, e.course_id, e.status, e.progress_percent
  from public.enrollments as e
  where e.user_id = auth.uid()
    and e.course_id = target_course_id;
end;
$$;

create or replace function public.get_due_vocabulary_cards_for_course(
  target_course_id text,
  target_limit integer default 20
)
returns table (
  vocabulary_item_id text,
  term text,
  translation text,
  reading text,
  pronunciation text,
  example_sentence text,
  tags text[],
  status text,
  due_at timestamptz,
  interval_days integer,
  repetitions integer,
  lapses integer
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select distinct on (v.id)
    v.id,
    v.term,
    v.translation,
    v.reading,
    v.pronunciation,
    v.example_sentence,
    v.tags,
    coalesce(vp.status, 'new'),
    vp.due_at,
    coalesce(vp.interval_days, 0),
    coalesce(vp.repetitions, 0),
    coalesce(vp.lapses, 0)
  from public.vocabulary_items as v
  join public.lesson_vocabulary as lv on lv.vocabulary_item_id = v.id
  join public.lessons as l
    on l.id = lv.lesson_id
   and l.status = 'published'
   and l.course_id = target_course_id
  left join public.vocabulary_progress as vp
    on vp.user_id = auth.uid()
   and vp.vocabulary_item_id = v.id
  where auth.uid() is not null
    and public.can_read_course(target_course_id)
    and (vp.due_at is null or vp.due_at <= now())
  order by v.id, vp.due_at nulls first, lv.position
  limit greatest(1, least(target_limit, 100));
$$;

revoke all on function public.set_active_course(text) from anon, authenticated, public;
revoke all on function public.enroll_in_free_course(text) from anon, authenticated, public;
revoke all on function public.get_due_vocabulary_cards_for_course(text, integer) from anon, authenticated, public;

grant execute on function public.set_active_course(text) to authenticated;
grant execute on function public.enroll_in_free_course(text) to authenticated;
grant execute on function public.get_due_vocabulary_cards_for_course(text, integer) to authenticated;
grant execute on function public.set_active_course(text) to service_role;
grant execute on function public.enroll_in_free_course(text) to service_role;
grant execute on function public.get_due_vocabulary_cards_for_course(text, integer) to service_role;

commit;

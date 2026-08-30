begin;

-- Learners receive assessment papers only through the answer-key-free RPC.
drop policy if exists assessment_questions_read on public.assessment_questions;
drop policy if exists assessment_questions_authenticated_read_published on public.assessment_questions;
drop policy if exists assessment_questions_content_write on public.assessment_questions;
drop policy if exists assessment_questions_admin_manage on public.assessment_questions;
drop policy if exists assessment_questions_content_insert on public.assessment_questions;
drop policy if exists assessment_questions_content_update on public.assessment_questions;
drop policy if exists assessment_questions_content_delete on public.assessment_questions;
create policy assessment_questions_staff_read on public.assessment_questions
for select to authenticated
using (public.has_staff_permission('content.read'));
create policy assessment_questions_staff_insert on public.assessment_questions
for insert to authenticated
with check (public.has_staff_permission('content.write'));
create policy assessment_questions_staff_update on public.assessment_questions
for update to authenticated
using (public.has_staff_permission('content.write'))
with check (public.has_staff_permission('content.write'));
create policy assessment_questions_staff_delete on public.assessment_questions
for delete to authenticated
using (public.has_staff_permission('content.write'));
revoke select on public.assessment_questions from authenticated;
grant select (id, assessment_id, prompt, correct_answer, options, explanation, order_index, created_at, updated_at)
  on public.assessment_questions to authenticated;

-- Browser paths are accepted only when they identify an existing content row in
-- the same course. This blocks cross-course placement and overwrite by editors.
create or replace function public.can_write_course_asset(target_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage, extensions
set row_security = off
as $$
  select public.has_staff_permission('content.write')
    and (storage.foldername(target_name))[1] = 'content'
    and cardinality(storage.foldername(target_name)) >= 4
    and (
      exists (
        select 1 from public.documents as d
        where d.id = (storage.foldername(target_name))[3]
          and d.course_id = (storage.foldername(target_name))[2]
      )
      or exists (
        select 1 from public.podcast_episodes as p
        where p.id = (storage.foldername(target_name))[3]
          and p.course_id = (storage.foldername(target_name))[2]
      )
      or exists (
        select 1
        from public.lesson_assets as la
        join public.lessons as l on l.id = la.lesson_id
        where la.id = (storage.foldername(target_name))[3]
          and l.course_id = (storage.foldername(target_name))[2]
      )
    );
$$;

revoke all on function public.can_write_course_asset(text) from public;
grant execute on function public.can_write_course_asset(text) to authenticated;

drop policy if exists course_assets_content_insert on storage.objects;
drop policy if exists course_assets_content_update on storage.objects;
create policy course_assets_content_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'course-assets' and public.can_write_course_asset(name));
create policy course_assets_content_update on storage.objects
for update to authenticated
using (bucket_id = 'course-assets' and public.can_write_course_asset(name))
with check (bucket_id = 'course-assets' and public.can_write_course_asset(name));

-- Server-owned attempt lifecycle. Client stores only this opaque ID locally.
create table if not exists public.assessment_attempt_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null references public.assessments(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  submitted_at timestamptz,
  result_attempt_id text,
  unique (user_id, assessment_id, id)
);
create index if not exists assessment_attempt_sessions_user_active_idx
  on public.assessment_attempt_sessions(user_id, assessment_id, submitted_at);
alter table public.assessment_attempt_sessions enable row level security;
revoke all on public.assessment_attempt_sessions from anon, authenticated;

drop function if exists public.start_assessment_attempt(text);
create or replace function public.start_assessment_attempt_v2(target_assessment_id text)
returns table (
  attempt_id text,
  assessment_id text,
  started_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_assessment public.assessments%rowtype;
  active_session public.assessment_attempt_sessions%rowtype;
  duration_minutes integer;
  started timestamptz;
  expires timestamptz;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select a.* into target_assessment
  from public.assessments as a
  where a.id = target_assessment_id
    and a.status = 'published';
  if target_assessment.id is null then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;
  if not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.enrollments as e
    where e.user_id = auth.uid()
      and e.course_id = target_assessment.course_id
      and e.status in ('active', 'completed')
  ) then
    raise exception 'ENROLLMENT_REQUIRED' using errcode = '42501';
  end if;
  -- Serialize duplicate tabs so one learner gets one active session.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':' || target_assessment_id, 0));
  select s.* into active_session
  from public.assessment_attempt_sessions as s
  where s.user_id = auth.uid()
    and s.assessment_id = target_assessment_id
    and s.submitted_at is null
  order by s.started_at desc
  limit 1
  for update;
  if active_session.id is not null then
    if active_session.expires_at is not null and active_session.expires_at <= now() then
      update public.assessment_attempt_sessions
      set submitted_at = now()
      where id = active_session.id;
    else
      return query select active_session.id, active_session.assessment_id, active_session.started_at, active_session.expires_at;
      return;
    end if;
  end if;

  duration_minutes := case
    when coalesce(target_assessment.config->>'durationMinutes', '') ~ '^\d+$'
      then greatest((target_assessment.config->>'durationMinutes')::integer, 0)
    else 0
  end;
  started := now();
  expires := case when duration_minutes > 0 then started + make_interval(mins => duration_minutes) else null end;

  insert into public.assessment_attempt_sessions (id, user_id, assessment_id, started_at, expires_at)
  values (extensions.gen_random_uuid()::text, auth.uid(), target_assessment_id, started, expires)
  returning id into active_session.id;
  return query select active_session.id, target_assessment_id, started, expires;
end;
$$;

revoke all on function public.start_assessment_attempt_v2(text) from public;
grant execute on function public.start_assessment_attempt_v2(text) to authenticated;

-- Validate opaque answer payload before the legacy scoring body runs.
create or replace function public.validate_assessment_answers(target_assessment_id text, target_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if jsonb_typeof(target_answers) <> 'object'
    or jsonb_object_length(target_answers) > 200
    or coalesce((select sum(char_length(value)) from jsonb_each_text(target_answers)), 0) > 200000
    or exists (
      select 1
      from jsonb_each_text(target_answers) as submitted
      where char_length(submitted.value) > 1000
        or not exists (
          select 1 from public.assessment_questions as q
          where q.id = submitted.key and q.assessment_id = target_assessment_id
        )
    ) then
    raise exception 'INVALID_ASSESSMENT_ANSWERS' using errcode = '22023';
  end if;
end;
$$;
revoke all on function public.validate_assessment_answers(text, jsonb) from public;

-- Preserve scoring body under an internal name. Public callers must provide a
-- server-created attempt ID.
alter function public.submit_assessment_v2(text, jsonb) rename to score_assessment_v2_internal;
revoke all on function public.score_assessment_v2_internal(text, jsonb) from public, anon, authenticated;
revoke all on function public.submit_assessment_v2(text, jsonb) from public, anon, authenticated;

create or replace function public.submit_assessment_v2(
  target_assessment_id text,
  target_answers jsonb,
  target_attempt_id text
)
returns table (
  attempt_id text,
  assessment_id text,
  score integer,
  passed boolean,
  total_questions integer,
  correct_answers integer,
  attempted_at timestamptz,
  points_earned integer,
  total_points integer,
  passing_points integer,
  section_breakdown jsonb
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  session public.assessment_attempt_sessions%rowtype;
  result_row record;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if target_attempt_id is null or target_attempt_id = '' then
    raise exception 'ASSESSMENT_ATTEMPT_REQUIRED' using errcode = '42501';
  end if;
  perform public.validate_assessment_answers(target_assessment_id, target_answers);

  select s.* into session
  from public.assessment_attempt_sessions as s
  where s.id = target_attempt_id
    and s.user_id = auth.uid()
    and s.assessment_id = target_assessment_id
    and s.submitted_at is null
  for update;
  if session.id is null then
    raise exception 'ASSESSMENT_ATTEMPT_NOT_AVAILABLE' using errcode = '42501';
  end if;
  if session.expires_at is not null and session.expires_at <= now() then
    update public.assessment_attempt_sessions
    set submitted_at = now()
    where id = session.id;
    raise exception 'ASSESSMENT_ATTEMPT_EXPIRED' using errcode = '42501';
  end if;

  select * into result_row
  from public.score_assessment_v2_internal(target_assessment_id, target_answers);

  update public.assessment_attempt_sessions
  set submitted_at = result_row.attempted_at,
      result_attempt_id = result_row.attempt_id
  where id = target_attempt_id
    and submitted_at is null;

  return query select
    result_row.attempt_id, result_row.assessment_id, result_row.score,
    result_row.passed, result_row.total_questions, result_row.correct_answers,
    result_row.attempted_at, result_row.points_earned, result_row.total_points,
    result_row.passing_points, result_row.section_breakdown;
end;
$$;

revoke all on function public.submit_assessment_v2(text, jsonb, text) from public;
grant execute on function public.submit_assessment_v2(text, jsonb, text) to authenticated;

-- Results follow same published assessment lifecycle as paper/submission.
create or replace function public.get_latest_assessment_result_v2(target_assessment_id text)
returns table (
  attempt_id text,
  assessment_id text,
  score integer,
  passed boolean,
  total_questions integer,
  correct_answers integer,
  attempted_at timestamptz,
  points_earned integer,
  total_points integer,
  passing_points integer,
  section_breakdown jsonb
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  target_assessment public.assessments%rowtype;
  latest_attempt public.assessment_attempts%rowtype;
  scoring_mode text;
  configured_total_points integer;
  configured_passing_points integer;
  total_count integer;
  correct_count integer;
  calculated_total_points integer;
  calculated_points_earned integer;
  final_points_earned integer;
  final_total_points integer;
  final_passing_points integer;
  final_score integer;
  final_passed boolean;
  final_section_breakdown jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select a.* into target_assessment from public.assessments as a
  where a.id = target_assessment_id and a.status = 'published';
  if target_assessment.id is null or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;
  select att.* into latest_attempt from public.assessment_attempts as att
  where att.assessment_id = target_assessment_id and att.user_id = auth.uid()
  order by att.attempted_at desc limit 1;
  if latest_attempt.id is null then return; end if;

  scoring_mode := coalesce(nullif(target_assessment.config->>'scoringMode', ''), 'equal_percentage');
  configured_total_points := case when coalesce(target_assessment.config->>'totalPoints', '') ~ '^\d+$' then (target_assessment.config->>'totalPoints')::integer else null end;
  configured_passing_points := case when coalesce(target_assessment.config->>'passingPoints', '') ~ '^\d+$' then (target_assessment.config->>'passingPoints')::integer else null end;
  select count(*)::integer, count(*) filter (where trim(coalesce(latest_attempt.answers->>q.id, '')) = trim(q.correct_answer))::integer,
    coalesce(sum(case when scoring_mode = 'weighted_questions' then case when coalesce(q.metadata->>'points', '') ~ '^\d+$' then greatest((q.metadata->>'points')::integer, 0) else 1 end else 1 end), 0)::integer,
    coalesce(sum(case when trim(coalesce(latest_attempt.answers->>q.id, '')) = trim(q.correct_answer) then case when scoring_mode = 'weighted_questions' then case when coalesce(q.metadata->>'points', '') ~ '^\d+$' then greatest((q.metadata->>'points')::integer, 0) else 1 end else 1 end else 0 end), 0)::integer
  into total_count, correct_count, calculated_total_points, calculated_points_earned
  from public.assessment_questions as q where q.assessment_id = target_assessment_id;
  if total_count = 0 then raise exception 'ASSESSMENT_EMPTY' using errcode = 'P0001'; end if;
  if scoring_mode = 'weighted_questions' then
    final_points_earned := calculated_points_earned;
    final_total_points := coalesce(nullif(configured_total_points, 0), calculated_total_points);
    final_passing_points := coalesce(configured_passing_points, ceil(final_total_points * target_assessment.passing_score / 100.0)::integer);
    final_score := round(100.0 * final_points_earned / nullif(final_total_points, 0));
    final_passed := final_points_earned >= final_passing_points;
  else
    final_points_earned := correct_count;
    final_total_points := total_count;
    final_passing_points := ceil(total_count * target_assessment.passing_score / 100.0)::integer;
    final_score := round(100.0 * correct_count / total_count);
    final_passed := final_score >= target_assessment.passing_score;
  end if;
  return query select latest_attempt.id, target_assessment_id, final_score, final_passed, total_count, correct_count,
    latest_attempt.attempted_at, final_points_earned, final_total_points, final_passing_points, final_section_breakdown;
end;
$$;

revoke all on function public.get_latest_assessment_result_v2(text) from public;
grant execute on function public.get_latest_assessment_result_v2(text) to authenticated;

commit;

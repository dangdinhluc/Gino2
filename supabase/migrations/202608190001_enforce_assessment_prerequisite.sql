begin;

create or replace function public.submit_assessment(
  target_assessment_id text,
  target_answers jsonb
)
returns table (
  attempt_id text,
  assessment_id text,
  score integer,
  passed boolean,
  total_questions integer,
  correct_answers integer,
  attempted_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_assessment public.assessments%rowtype;
  prev_assessment_id text;
  total_count integer;
  correct_count integer;
  final_score integer;
  final_passed boolean;
  final_attempt_id text := extensions.gen_random_uuid()::text;
  attempt_time timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if jsonb_typeof(target_answers) <> 'object' then
    raise exception 'INVALID_ASSESSMENT_ANSWERS' using errcode = '22023';
  end if;

  select a.* into target_assessment
  from public.assessments as a
  where a.id = target_assessment_id and a.status = 'published';
  if target_assessment.id is null or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  select a.id into prev_assessment_id
  from public.assessments as a
  where a.course_id = target_assessment.course_id
    and a.status = 'published'
    and a.order_index < target_assessment.order_index
  order by a.order_index desc
  limit 1;

  if prev_assessment_id is not null then
    if not exists (
      select 1
      from public.assessment_attempts as att
      where att.assessment_id = prev_assessment_id
        and att.user_id = auth.uid()
        and att.passed = true
    ) then
      raise exception 'ASSESSMENT_LOCKED' using errcode = '42501';
    end if;
  end if;

  select count(*) into total_count
  from public.assessment_questions as q
  where q.assessment_id = target_assessment_id;
  if total_count = 0 then
    raise exception 'ASSESSMENT_EMPTY' using errcode = 'P0001';
  end if;

  select count(*) into correct_count
  from public.assessment_questions as q
  join jsonb_each_text(target_answers) as submitted on submitted.key = q.id
  where q.assessment_id = target_assessment_id
    and trim(submitted.value) = trim(q.correct_answer);
  final_score := round(100.0 * correct_count / total_count);
  final_passed := final_score >= target_assessment.passing_score;

  insert into public.assessment_attempts (id, user_id, assessment_id, score, passed, attempted_at, answers)
  values (final_attempt_id, auth.uid(), target_assessment_id, final_score, final_passed, attempt_time, target_answers);
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_assessment.course_id,
    'assessment_submitted',
    target_assessment.title,
    jsonb_build_object('assessmentId', target_assessment_id, 'score', final_score, 'passed', final_passed)
  );

  return query select final_attempt_id, target_assessment_id, final_score, final_passed, total_count, correct_count, attempt_time;
end;
$$;

revoke all on function public.submit_assessment(text, jsonb) from public;
grant execute on function public.submit_assessment(text, jsonb) to authenticated;

commit;

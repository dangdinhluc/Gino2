begin;

create or replace function public.record_lesson_progress(
  target_lesson_id text,
  target_status text,
  target_score integer default null
)
returns table (lesson_id text, status text, score integer, course_id text, progress_percent numeric)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_lesson public.lessons%rowtype;
  next_progress numeric;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_status not in ('not-started', 'in-progress', 'completed') then raise exception 'INVALID_LESSON_STATUS' using errcode = '22023'; end if;
  if target_score is not null and (target_score < 0 or target_score > 100) then raise exception 'INVALID_LESSON_SCORE' using errcode = '22023'; end if;

  select l.* into target_lesson
  from public.lessons as l
  where l.id = target_lesson_id and l.status = 'published';
  if target_lesson.id is null or not public.can_read_course(target_lesson.course_id) then raise exception 'LESSON_NOT_AVAILABLE' using errcode = '42501'; end if;

  insert into public.lesson_progress (user_id, lesson_id, status, score)
  values (auth.uid(), target_lesson_id, target_status, target_score)
  on conflict on constraint lesson_progress_pkey do update
    set status = excluded.status, score = excluded.score, updated_at = now();
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), target_lesson.course_id,
    case when target_status = 'completed' then 'lesson_completed' else 'lesson_progressed' end,
    target_lesson.title, jsonb_build_object('lessonId', target_lesson_id, 'status', target_status));

  select coalesce(round(100.0 * count(*) filter (where lp.status = 'completed') / nullif(count(*)::numeric, 0), 0), 0)
  into next_progress
  from public.lessons as l
  left join public.lesson_progress as lp on lp.lesson_id = l.id and lp.user_id = auth.uid()
  where l.course_id = target_lesson.course_id and l.status = 'published';
  update public.enrollments as e
  set progress_percent = next_progress,
      status = case when next_progress >= 100 then 'completed' else 'active' end,
      completed_at = case when next_progress >= 100 then coalesce(e.completed_at, now()) else null end
  where e.user_id = auth.uid() and e.course_id = target_lesson.course_id and e.status in ('active', 'completed');
  return query select target_lesson_id, target_status, target_score, target_lesson.course_id, next_progress;
end;
$$;

create or replace function public.record_vocabulary_review(
  target_vocabulary_item_id text,
  target_is_correct boolean
)
returns table (vocabulary_item_id text, status text, last_reviewed_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_course_id text;
  next_status text;
  review_time timestamptz := now();
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select l.course_id into target_course_id
  from public.lesson_vocabulary as lv
  join public.lessons as l on l.id = lv.lesson_id
  where lv.vocabulary_item_id = target_vocabulary_item_id and l.status = 'published'
  limit 1;
  if target_course_id is null or not public.can_read_course(target_course_id) then raise exception 'VOCABULARY_NOT_AVAILABLE' using errcode = '42501'; end if;
  next_status := case when target_is_correct then 'mastered' else 'learning' end;
  insert into public.vocabulary_progress (user_id, vocabulary_item_id, status, last_reviewed_at)
  values (auth.uid(), target_vocabulary_item_id, next_status, review_time)
  on conflict on constraint vocabulary_progress_pkey do update
    set status = excluded.status, last_reviewed_at = excluded.last_reviewed_at;
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), target_course_id, 'vocabulary_reviewed', 'Vocabulary review',
    jsonb_build_object('vocabularyItemId', target_vocabulary_item_id, 'isCorrect', target_is_correct));
  return query select target_vocabulary_item_id, next_status, review_time;
end;
$$;

create or replace function public.record_review_attempt(target_question_id text, target_is_correct boolean)
returns table (id text, question_id text, is_correct boolean, answered_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_course_id text;
  attempt_id text := extensions.gen_random_uuid()::text;
  answer_time timestamptz := now();
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select l.course_id into target_course_id
  from public.review_questions as rq
  join public.lessons as l on l.id = rq.lesson_id
  where rq.id = target_question_id and l.status = 'published';
  if target_course_id is null or not public.can_read_course(target_course_id) then raise exception 'QUESTION_NOT_AVAILABLE' using errcode = '42501'; end if;
  insert into public.review_attempts (id, user_id, question_id, is_correct, answered_at)
  values (attempt_id, auth.uid(), target_question_id, target_is_correct, answer_time);
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), target_course_id, 'review_answered', 'Review question answered',
    jsonb_build_object('questionId', target_question_id, 'isCorrect', target_is_correct));
  return query select attempt_id, target_question_id, target_is_correct, answer_time;
end;
$$;

create or replace function public.get_latest_assessment_result(target_assessment_id text)
returns table (attempt_id text, assessment_id text, score integer, passed boolean, total_questions integer, correct_answers integer, attempted_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  latest_attempt public.assessment_attempts%rowtype;
  target_course_id text;
  total_count integer;
  correct_count integer;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select a.course_id into target_course_id
  from public.assessments as a
  where a.id = target_assessment_id and a.status = 'published';
  if target_course_id is null or not public.can_read_course(target_course_id) then raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501'; end if;
  select aa.* into latest_attempt
  from public.assessment_attempts as aa
  where aa.assessment_id = target_assessment_id and aa.user_id = auth.uid()
  order by aa.attempted_at desc limit 1;
  if latest_attempt.id is null then return; end if;
  select count(*) into total_count from public.assessment_questions as q where q.assessment_id = target_assessment_id;
  select count(*) into correct_count
  from public.assessment_questions as q
  join jsonb_each_text(latest_attempt.answers) as submitted on submitted.key = q.id
  where q.assessment_id = target_assessment_id and trim(submitted.value) = trim(q.correct_answer);
  return query select latest_attempt.id, latest_attempt.assessment_id, latest_attempt.score, latest_attempt.passed, total_count, correct_count, latest_attempt.attempted_at;
end;
$$;

revoke all on function public.record_lesson_progress(text, text, integer) from public;
revoke all on function public.record_vocabulary_review(text, boolean) from public;
revoke all on function public.record_review_attempt(text, boolean) from public;
revoke all on function public.get_latest_assessment_result(text) from public;
grant execute on function public.record_lesson_progress(text, text, integer), public.record_vocabulary_review(text, boolean), public.record_review_attempt(text, boolean), public.get_latest_assessment_result(text) to authenticated;

commit;

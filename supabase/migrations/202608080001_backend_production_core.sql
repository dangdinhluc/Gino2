begin;

-- Package entitlement and AI quota metadata.
alter table public.enrollments
  add column if not exists package_id text references public.packages(id) on delete set null;

alter table public.packages
  add column if not exists ai_monthly_quota integer not null default 20;

alter table public.packages
  drop constraint if exists packages_ai_monthly_quota_check;

alter table public.packages
  add constraint packages_ai_monthly_quota_check check (ai_monthly_quota >= 0);

create index if not exists enrollments_package_id_idx on public.enrollments(package_id);

-- Private annotations are scoped to the authenticated learner and document.
create table if not exists public.document_annotations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id text not null references public.documents(id) on delete cascade,
  selected_text text not null default '',
  note text not null default '',
  color text not null default 'yellow' check (color in ('yellow', 'green', 'blue', 'pink')),
  anchor jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(selected_text) <= 2000),
  check (length(note) <= 5000)
);

drop trigger if exists document_annotations_set_updated_at on public.document_annotations;
create trigger document_annotations_set_updated_at
before update on public.document_annotations
for each row execute function public.set_updated_at();

create index if not exists document_annotations_user_document_idx
  on public.document_annotations(user_id, document_id, created_at desc);

-- AI history and usage are application data; provider secrets never enter these tables.
create table if not exists public.ai_conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text references public.courses(id) on delete set null,
  title text not null default 'Tokutei AI chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists ai_conversations_set_updated_at on public.ai_conversations;
create trigger ai_conversations_set_updated_at
before update on public.ai_conversations
for each row execute function public.set_updated_at();

create table if not exists public.ai_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_writing_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text references public.courses(id) on delete set null,
  prompt_id text references public.ai_prompts(id) on delete set null,
  input_text text not null,
  result jsonb not null default '{}'::jsonb,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(input_text) between 1 and 10000)
);

drop trigger if exists ai_writing_submissions_set_updated_at on public.ai_writing_submissions;
create trigger ai_writing_submissions_set_updated_at
before update on public.ai_writing_submissions
for each row execute function public.set_updated_at();

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  feature text not null check (feature in ('chat', 'writing')),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start, feature)
);

create index if not exists ai_messages_user_created_idx on public.ai_messages(user_id, created_at desc);
create index if not exists ai_writing_submissions_user_created_idx on public.ai_writing_submissions(user_id, created_at desc);
create index if not exists ai_usage_period_idx on public.ai_usage(period_start, feature);

-- Assessment answers are accepted only through server-side scoring RPC.
alter table public.assessment_attempts
  add column if not exists answers jsonb not null default '{}'::jsonb;

alter table public.documents
  add column if not exists storage_path text;

alter table public.podcast_episodes
  add column if not exists storage_path text;

alter table public.lesson_assets
  add column if not exists storage_path text;

create index if not exists documents_storage_path_idx on public.documents(storage_path)
  where storage_path is not null;
create index if not exists podcast_episodes_storage_path_idx on public.podcast_episodes(storage_path)
  where storage_path is not null;
create index if not exists lesson_assets_storage_path_idx on public.lesson_assets(storage_path)
  where storage_path is not null;

-- Storage is private. Object names start with the course id:
-- <course_id>/<document|podcast>/<content_id>/<filename>
insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', false)
on conflict (id) do update set public = false;

-- Only these learner write paths remain available after this migration.
drop policy if exists lesson_progress_insert_own on public.lesson_progress;
drop policy if exists lesson_progress_update_own on public.lesson_progress;
drop policy if exists vocabulary_progress_insert_own on public.vocabulary_progress;
drop policy if exists vocabulary_progress_update_own on public.vocabulary_progress;
drop policy if exists review_attempts_insert_own on public.review_attempts;
drop policy if exists assessment_attempts_insert_own on public.assessment_attempts;
drop policy if exists learning_activity_events_insert_own on public.learning_activity_events;

-- Prevent clients from bypassing business RPCs while preserving admin RLS management.
revoke insert, update, delete on public.lesson_progress from authenticated;
revoke insert, update, delete on public.vocabulary_progress from authenticated;
revoke insert, update, delete on public.review_attempts from authenticated;
revoke insert, update, delete on public.assessment_attempts from authenticated;
revoke insert, update, delete on public.learning_activity_events from authenticated;

create or replace function public.enroll_in_free_package(target_package_id text)
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
  target_package public.packages%rowtype;
  target_course public.courses%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select * into target_package
  from public.packages
  where packages.id = target_package_id
    and packages.status = 'active';

  if target_package.id is null then
    raise exception 'PACKAGE_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if target_package.price_cents <> 0 then
    raise exception 'PAYMENT_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.package_courses where package_id = target_package_id) then
    raise exception 'PACKAGE_EMPTY' using errcode = 'P0001';
  end if;

  for target_course in
    select courses.*
    from public.package_courses
    join public.courses on courses.id = package_courses.course_id
    where package_courses.package_id = target_package_id
      and courses.status = 'published'
  loop
    insert into public.enrollments (id, user_id, package_id, course_id, status, progress_percent)
    values (extensions.gen_random_uuid()::text, auth.uid(), target_package_id, target_course.id, 'active', 0)
    on conflict (user_id, course_id) do update
      set package_id = coalesce(public.enrollments.package_id, excluded.package_id),
          status = case when public.enrollments.status = 'completed' then 'completed' else 'active' end;
  end loop;

  return query
  select enrollments.id, enrollments.package_id, enrollments.course_id, enrollments.status, enrollments.progress_percent
  from public.enrollments
  where enrollments.user_id = auth.uid()
    and enrollments.package_id = target_package_id
  order by enrollments.course_id;
end;
$$;

create or replace function public.record_lesson_progress(
  target_lesson_id text,
  target_status text,
  target_score integer default null
)
returns table (
  lesson_id text,
  status text,
  score integer,
  course_id text,
  progress_percent numeric
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_lesson public.lessons%rowtype;
  next_progress numeric;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if target_status not in ('not-started', 'in-progress', 'completed') then
    raise exception 'INVALID_LESSON_STATUS' using errcode = '22023';
  end if;

  if target_score is not null and (target_score < 0 or target_score > 100) then
    raise exception 'INVALID_LESSON_SCORE' using errcode = '22023';
  end if;

  select * into target_lesson
  from public.lessons
  where lessons.id = target_lesson_id
    and lessons.status = 'published';

  if target_lesson.id is null or not public.can_read_course(target_lesson.course_id) then
    raise exception 'LESSON_NOT_AVAILABLE' using errcode = '42501';
  end if;

  insert into public.lesson_progress (user_id, lesson_id, status, score)
  values (auth.uid(), target_lesson_id, target_status, target_score)
  on conflict (user_id, lesson_id) do update
    set status = excluded.status,
        score = excluded.score,
        updated_at = now();

  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_lesson.course_id,
    case when target_status = 'completed' then 'lesson_completed' else 'lesson_progressed' end,
    target_lesson.title,
    jsonb_build_object('lessonId', target_lesson_id, 'status', target_status)
  );

  select coalesce(round(
    100.0 * count(*) filter (where lesson_progress.status = 'completed') /
      nullif(count(*)::numeric, 0), 0
  ), 0)
  into next_progress
  from public.lessons
  left join public.lesson_progress
    on lesson_progress.lesson_id = lessons.id
   and lesson_progress.user_id = auth.uid()
  where lessons.course_id = target_lesson.course_id
    and lessons.status = 'published';

  update public.enrollments
  set progress_percent = next_progress,
      status = case when next_progress >= 100 then 'completed' else 'active' end,
      completed_at = case when next_progress >= 100 then coalesce(completed_at, now()) else null end
  where enrollments.user_id = auth.uid()
    and enrollments.course_id = target_lesson.course_id
    and enrollments.status in ('active', 'completed');

  return query
  select target_lesson_id, target_status, target_score, target_lesson.course_id, next_progress;
end;
$$;

create or replace function public.record_vocabulary_review(
  target_vocabulary_item_id text,
  target_is_correct boolean
)
returns table (
  vocabulary_item_id text,
  status text,
  last_reviewed_at timestamptz
)
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
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select lessons.course_id into target_course_id
  from public.lesson_vocabulary
  join public.lessons on lessons.id = lesson_vocabulary.lesson_id
  where lesson_vocabulary.vocabulary_item_id = target_vocabulary_item_id
    and lessons.status = 'published'
  limit 1;

  if target_course_id is null or not public.can_read_course(target_course_id) then
    raise exception 'VOCABULARY_NOT_AVAILABLE' using errcode = '42501';
  end if;

  next_status := case when target_is_correct then 'mastered' else 'learning' end;

  insert into public.vocabulary_progress (user_id, vocabulary_item_id, status, last_reviewed_at)
  values (auth.uid(), target_vocabulary_item_id, next_status, review_time)
  on conflict (user_id, vocabulary_item_id) do update
    set status = excluded.status,
        last_reviewed_at = excluded.last_reviewed_at;

  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_course_id,
    'vocabulary_reviewed',
    'Vocabulary review',
    jsonb_build_object('vocabularyItemId', target_vocabulary_item_id, 'isCorrect', target_is_correct)
  );

  return query
  select target_vocabulary_item_id, next_status, review_time;
end;
$$;

create or replace function public.record_review_attempt(
  target_question_id text,
  target_is_correct boolean
)
returns table (
  id text,
  question_id text,
  is_correct boolean,
  answered_at timestamptz
)
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
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select lessons.course_id into target_course_id
  from public.review_questions
  join public.lessons on lessons.id = review_questions.lesson_id
  where review_questions.id = target_question_id
    and lessons.status = 'published';

  if target_course_id is null or not public.can_read_course(target_course_id) then
    raise exception 'QUESTION_NOT_AVAILABLE' using errcode = '42501';
  end if;

  insert into public.review_attempts (id, user_id, question_id, is_correct, answered_at)
  values (attempt_id, auth.uid(), target_question_id, target_is_correct, answer_time);

  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_course_id,
    'review_answered',
    'Review question answered',
    jsonb_build_object('questionId', target_question_id, 'isCorrect', target_is_correct)
  );

  return query select attempt_id, target_question_id, target_is_correct, answer_time;
end;
$$;

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

  select * into target_assessment
  from public.assessments
  where assessments.id = target_assessment_id
    and assessments.status = 'published';

  if target_assessment.id is null or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  select count(*) into total_count
  from public.assessment_questions
  where assessment_questions.assessment_id = target_assessment_id;

  if total_count = 0 then
    raise exception 'ASSESSMENT_EMPTY' using errcode = 'P0001';
  end if;

  select count(*) into correct_count
  from public.assessment_questions
  join jsonb_each_text(target_answers) submitted on submitted.key = assessment_questions.id
  where assessment_questions.assessment_id = target_assessment_id
    and trim(submitted.value) = trim(assessment_questions.correct_answer);

  final_score := round(100.0 * correct_count / total_count);
  final_passed := final_score >= target_assessment.passing_score;

  insert into public.assessment_attempts (id, user_id, assessment_id, score, passed, attempted_at, answers)
  values (final_attempt_id, auth.uid(), target_assessment_id, final_score, final_passed, attempt_time, target_answers);

  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_assessment.course_id,
    'assessment_completed',
    target_assessment.title,
    jsonb_build_object('assessmentId', target_assessment_id, 'score', final_score, 'passed', final_passed)
  );

  return query select final_attempt_id, target_assessment_id, final_score, final_passed, total_count, correct_count, attempt_time;
end;
$$;

create or replace function public.get_latest_assessment_result(target_assessment_id text)
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
  latest_attempt public.assessment_attempts%rowtype;
  target_course_id text;
  total_count integer;
  correct_count integer;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select course_id into target_course_id
  from public.assessments
  where id = target_assessment_id and status = 'published';

  if target_course_id is null or not public.can_read_course(target_course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  select * into latest_attempt
  from public.assessment_attempts
  where assessment_id = target_assessment_id and user_id = auth.uid()
  order by attempted_at desc
  limit 1;

  if latest_attempt.id is null then
    return;
  end if;

  select count(*) into total_count
  from public.assessment_questions
  where assessment_id = target_assessment_id;

  select count(*) into correct_count
  from public.assessment_questions
  join jsonb_each_text(latest_attempt.answers) submitted on submitted.key = assessment_questions.id
  where assessment_questions.assessment_id = target_assessment_id
    and trim(submitted.value) = trim(assessment_questions.correct_answer);

  return query select latest_attempt.id, latest_attempt.assessment_id, latest_attempt.score,
    latest_attempt.passed, total_count, correct_count, latest_attempt.attempted_at;
end;
$$;

create or replace function public.consume_ai_quota(target_feature text)
returns table (
  period_start date,
  feature text,
  request_count integer,
  monthly_quota integer
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  current_period date := date_trunc('month', now())::date;
  current_count integer;
  quota integer;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  if target_feature not in ('chat', 'writing') then
    raise exception 'INVALID_AI_FEATURE' using errcode = '22023';
  end if;

  select coalesce(max(packages.ai_monthly_quota), 20)
  into quota
  from public.enrollments
  left join public.packages on packages.id = enrollments.package_id
  where enrollments.user_id = auth.uid()
    and enrollments.status in ('active', 'completed');

  if not exists (
    select 1 from public.enrollments
    where user_id = auth.uid() and status in ('active', 'completed')
  ) then
    raise exception 'ENROLLMENT_REQUIRED' using errcode = '42501';
  end if;

  insert into public.ai_usage (user_id, period_start, feature, request_count)
  values (auth.uid(), current_period, target_feature, 1)
  on conflict (user_id, period_start, feature) do update
    set request_count = public.ai_usage.request_count + 1,
        updated_at = now()
  returning ai_usage.request_count into current_count;

  if current_count > quota then
    raise exception 'AI_QUOTA_EXCEEDED' using errcode = 'P0001';
  end if;

  return query select current_period, target_feature, current_count, quota;
end;
$$;

create or replace function public.get_learner_dashboard()
returns table (
  active_courses bigint,
  completed_lessons bigint,
  mastered_vocabulary bigint,
  due_vocabulary bigint,
  streak_days bigint,
  recent_activity jsonb
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
with active_days as (
  select distinct occurred_at::date as day
  from public.learning_activity_events
  where user_id = auth.uid()
), numbered_days as (
  select day, day - (row_number() over (order by day desc))::integer as group_key
  from active_days
), latest_streak as (
  select case
    when max(day) >= current_date - 1 then count(*)
    else 0
  end as value
  from numbered_days
  where group_key = (select group_key from numbered_days order by day desc limit 1)
), activity as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'eventType', event_type,
    'label', event_label,
    'courseId', course_id,
    'occurredAt', occurred_at
  ) order by occurred_at desc), '[]'::jsonb) as value
  from (
    select id, event_type, event_label, course_id, occurred_at
    from public.learning_activity_events
    where user_id = auth.uid()
    order by occurred_at desc
    limit 10
  ) recent
)
select
  (select count(*) from public.enrollments where user_id = auth.uid() and status in ('active', 'completed')),
  (select count(*) from public.lesson_progress where user_id = auth.uid() and status = 'completed'),
  (select count(*) from public.vocabulary_progress where user_id = auth.uid() and status = 'mastered'),
  (select count(*) from public.vocabulary_progress where user_id = auth.uid() and status <> 'mastered'),
  coalesce((select value from latest_streak), 0),
  (select value from activity);
$$;

-- Keep an append-only audit trail for privileged CMS and entitlement changes.
create or replace function public.audit_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if public.is_admin() then
    insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
    values (
      extensions.gen_random_uuid()::text,
      auth.uid(),
      lower(tg_op),
      tg_table_name,
      coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id')),
      jsonb_build_object(
        'new', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
        'old', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end
      )
    );
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'courses', 'course_modules', 'lessons', 'lesson_assets', 'lesson_exercises',
    'vocabulary_items', 'lesson_vocabulary', 'review_questions', 'review_options',
    'assessments', 'assessment_questions', 'documents', 'podcast_episodes',
    'packages', 'package_courses', 'enrollments', 'ai_prompts', 'admin_alerts'
  ] loop
    execute format('drop trigger if exists audit_admin_mutation on public.%I', target_table);
    execute format(
      'create trigger audit_admin_mutation after insert or update or delete on public.%I for each row execute function public.audit_admin_mutation()',
      target_table
    );
  end loop;
end;
$$;

-- Learner-owned rows and annotations.
alter table public.document_annotations enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_writing_submissions enable row level security;
alter table public.ai_usage enable row level security;

create policy document_annotations_select_own_or_admin on public.document_annotations
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy document_annotations_insert_own on public.document_annotations
for insert to authenticated with check (
  document_annotations.user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where public.documents.id = document_annotations.document_id
      and public.can_read_course(public.documents.course_id)
  )
);
create policy document_annotations_update_own on public.document_annotations
for update to authenticated using (user_id = auth.uid()) with check (
  document_annotations.user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where public.documents.id = document_annotations.document_id
      and public.can_read_course(public.documents.course_id)
  )
);
create policy document_annotations_delete_own on public.document_annotations
for delete to authenticated using (user_id = auth.uid() or public.is_admin());

create policy ai_conversations_select_own_or_admin on public.ai_conversations
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy ai_conversations_insert_own on public.ai_conversations
for insert to authenticated with check (user_id = auth.uid());
create policy ai_conversations_update_own on public.ai_conversations
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ai_messages_select_own_or_admin on public.ai_messages
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy ai_messages_insert_own on public.ai_messages
for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from public.ai_conversations where public.ai_conversations.id = conversation_id and public.ai_conversations.user_id = auth.uid())
);

create policy ai_writing_submissions_select_own_or_admin on public.ai_writing_submissions
for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy ai_writing_submissions_insert_own on public.ai_writing_submissions
for insert to authenticated with check (user_id = auth.uid());

create policy ai_usage_select_own_or_admin on public.ai_usage
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy course_assets_read_enrolled on storage.objects
for select to authenticated using (
  bucket_id = 'course-assets'
  and public.can_read_course((storage.foldername(name))[1])
);

create policy course_assets_admin_insert on storage.objects
for insert to authenticated with check (bucket_id = 'course-assets' and public.is_admin());
create policy course_assets_admin_update on storage.objects
for update to authenticated using (bucket_id = 'course-assets' and public.is_admin())
with check (bucket_id = 'course-assets' and public.is_admin());
create policy course_assets_admin_delete on storage.objects
for delete to authenticated using (bucket_id = 'course-assets' and public.is_admin());

grant select on public.document_annotations, public.ai_conversations, public.ai_messages,
  public.ai_writing_submissions, public.ai_usage to authenticated;
grant insert, update, delete on public.document_annotations to authenticated;
grant insert, update on public.ai_conversations to authenticated;
grant insert on public.ai_messages, public.ai_writing_submissions to authenticated;

revoke insert, update, delete on public.admin_activity_logs from authenticated;
revoke insert, update on public.ai_conversations from authenticated;
revoke insert on public.ai_messages, public.ai_writing_submissions from authenticated;

grant execute on function public.enroll_in_free_package(text) to authenticated;
grant execute on function public.record_lesson_progress(text, text, integer) to authenticated;
grant execute on function public.record_vocabulary_review(text, boolean) to authenticated;
grant execute on function public.record_review_attempt(text, boolean) to authenticated;
grant execute on function public.submit_assessment(text, jsonb) to authenticated;
grant execute on function public.get_latest_assessment_result(text) to authenticated;
grant execute on function public.consume_ai_quota(text) to authenticated;
grant execute on function public.get_learner_dashboard() to authenticated;

revoke all on function public.enroll_in_free_package(text) from public;
revoke all on function public.record_lesson_progress(text, text, integer) from public;
revoke all on function public.record_vocabulary_review(text, boolean) from public;
revoke all on function public.record_review_attempt(text, boolean) from public;
revoke all on function public.submit_assessment(text, jsonb) from public;
revoke all on function public.get_latest_assessment_result(text) from public;
revoke all on function public.consume_ai_quota(text) from public;
revoke all on function public.get_learner_dashboard() from public;

commit;

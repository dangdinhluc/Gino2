begin;

-- Staff roles are the source of truth for the management console. Existing
-- `admin` records become owners so no current administrator loses access.
alter table public.admin_roles drop constraint if exists admin_roles_role_check;
update public.admin_roles set role = 'owner' where role = 'admin';
alter table public.admin_roles
  add constraint admin_roles_role_check
  check (role in ('owner', 'content_editor', 'instructor_support', 'analyst'));

create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select ar.role
  from public.admin_roles as ar
  where ar.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.staff_role() is not null;
$$;

create or replace function public.has_staff_permission(target_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select case public.staff_role()
    when 'owner' then true
    when 'content_editor' then target_permission in ('content.read', 'content.write')
    when 'instructor_support' then target_permission in ('learner.read', 'learner.manage', 'announcement.manage')
    when 'analyst' then target_permission in ('analytics.read', 'audit.read')
    else false
  end;
$$;

create or replace function public.can_write_content_status(target_status text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.staff_role() = 'owner'
    or (public.staff_role() = 'content_editor' and target_status in ('draft', 'in_review'));
$$;

create or replace function public.prevent_profile_role_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if new.profile_role is distinct from old.profile_role
    and auth.uid() is not null
    and public.staff_role() <> 'owner' then
    raise exception 'profile_role is owner-managed';
  end if;
  return new;
end;
$$;

-- Content becomes reviewable before publish. Existing published data remains
-- published so current learner access is uninterrupted.
alter table public.courses drop constraint if exists courses_status_check;
alter table public.courses add constraint courses_status_check check (status in ('draft', 'in_review', 'published', 'archived'));
alter table public.course_modules add column if not exists status text not null default 'draft';
alter table public.course_modules drop constraint if exists course_modules_status_check;
alter table public.course_modules add constraint course_modules_status_check check (status in ('draft', 'in_review', 'published', 'archived'));
alter table public.lessons drop constraint if exists lessons_status_check;
alter table public.lessons add constraint lessons_status_check check (status in ('draft', 'in_review', 'published', 'archived'));
alter table public.assessments drop constraint if exists assessments_status_check;
alter table public.assessments add constraint assessments_status_check check (status in ('draft', 'in_review', 'published', 'archived'));
alter table public.podcast_episodes drop constraint if exists podcast_episodes_status_check;
alter table public.podcast_episodes add constraint podcast_episodes_status_check check (status in ('draft', 'in_review', 'published', 'archived'));
alter table public.documents add column if not exists status text not null default 'draft';
alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents add constraint documents_status_check check (status in ('draft', 'in_review', 'published', 'archived'));
alter table public.lessons add column if not exists content_markdown text not null default '';
alter table public.documents add column if not exists content_markdown text not null default '';
alter table public.documents add column if not exists read_time_minutes integer not null default 0 check (read_time_minutes >= 0);
alter table public.vocabulary_items add column if not exists reading text;
alter table public.vocabulary_items add column if not exists level text;
alter table public.vocabulary_items add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.assessment_questions add column if not exists explanation text;

update public.course_modules as m
set status = case when c.status = 'published' then 'published' else 'draft' end
from public.courses as c
where m.course_id = c.id and m.status = 'draft';
update public.documents as d
set status = case when c.status = 'published' then 'published' else 'draft' end
from public.courses as c
where d.course_id = c.id and d.status = 'draft';

create table if not exists public.content_revisions (
  id uuid primary key default extensions.gen_random_uuid(),
  entity_type text not null check (entity_type in ('course', 'module', 'lesson', 'vocabulary', 'assessment', 'document', 'podcast', 'grammar_topic')),
  entity_id text not null,
  version integer not null,
  action text not null check (action in ('created', 'updated', 'submitted', 'published', 'archived')),
  snapshot jsonb not null,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);

create index if not exists content_revisions_entity_idx on public.content_revisions(entity_type, entity_id, version desc);

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

drop trigger if exists courses_record_revision on public.courses;
create trigger courses_record_revision after insert or update on public.courses for each row execute function public.record_content_revision();
drop trigger if exists course_modules_record_revision on public.course_modules;
create trigger course_modules_record_revision after insert or update on public.course_modules for each row execute function public.record_content_revision();
drop trigger if exists lessons_record_revision on public.lessons;
create trigger lessons_record_revision after insert or update on public.lessons for each row execute function public.record_content_revision();
drop trigger if exists vocabulary_items_record_revision on public.vocabulary_items;
create trigger vocabulary_items_record_revision after insert or update on public.vocabulary_items for each row execute function public.record_content_revision();
drop trigger if exists assessments_record_revision on public.assessments;
create trigger assessments_record_revision after insert or update on public.assessments for each row execute function public.record_content_revision();
drop trigger if exists documents_record_revision on public.documents;
create trigger documents_record_revision after insert or update on public.documents for each row execute function public.record_content_revision();
drop trigger if exists podcast_episodes_record_revision on public.podcast_episodes;
create trigger podcast_episodes_record_revision after insert or update on public.podcast_episodes for each row execute function public.record_content_revision();

-- Learner profile, settings, achievements and grammar catalogue.
create table if not exists public.learner_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'Asia/Tokyo',
  daily_goal_minutes integer not null default 20 check (daily_goal_minutes between 5 and 240),
  new_cards_per_day integer not null default 10 check (new_cards_per_day between 0 and 100),
  reminder_time time,
  ai_concise boolean not null default true,
  tts_enabled boolean not null default true,
  email_notifications boolean not null default true,
  in_app_notifications boolean not null default true,
  onboarding_completed_at timestamptz,
  updated_at timestamptz not null default now()
);
drop trigger if exists learner_settings_set_updated_at on public.learner_settings;
create trigger learner_settings_set_updated_at before update on public.learner_settings for each row execute function public.set_updated_at();

create table if not exists public.achievement_definitions (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default 'award',
  criteria jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.learner_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievement_definitions(id) on delete cascade,
  earned_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, achievement_id)
);

create table if not exists public.grammar_topics (
  id text primary key,
  slug text not null unique,
  title text not null,
  level text not null default 'JFT Basic',
  category text not null default 'Tokutei',
  summary text not null default '',
  status text not null default 'draft' check (status in ('draft', 'in_review', 'published', 'archived')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists grammar_topics_set_updated_at on public.grammar_topics;
create trigger grammar_topics_set_updated_at before update on public.grammar_topics for each row execute function public.set_updated_at();
drop trigger if exists grammar_topics_record_revision on public.grammar_topics;
create trigger grammar_topics_record_revision after insert or update on public.grammar_topics for each row execute function public.record_content_revision();

create table if not exists public.grammar_rules (
  id text primary key,
  topic_id text not null references public.grammar_topics(id) on delete cascade,
  title text not null,
  body_markdown text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists grammar_rules_set_updated_at on public.grammar_rules;
create trigger grammar_rules_set_updated_at before update on public.grammar_rules for each row execute function public.set_updated_at();

create table if not exists public.grammar_examples (
  id text primary key,
  topic_id text not null references public.grammar_topics(id) on delete cascade,
  japanese_text text not null,
  vietnamese_text text not null,
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists grammar_examples_set_updated_at on public.grammar_examples;
create trigger grammar_examples_set_updated_at before update on public.grammar_examples for each row execute function public.set_updated_at();

create table if not exists public.grammar_topic_courses (
  topic_id text not null references public.grammar_topics(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  primary key (topic_id, course_id)
);
create table if not exists public.grammar_topic_vocabulary (
  topic_id text not null references public.grammar_topics(id) on delete cascade,
  vocabulary_item_id text not null references public.vocabulary_items(id) on delete cascade,
  primary key (topic_id, vocabulary_item_id)
);

-- Private learner workspaces.
create table if not exists public.journal_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Ghi chú không tiêu đề',
  content text not null,
  prompt text,
  tags text[] not null default '{}',
  writing_submission_id uuid references public.ai_writing_submissions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(content) between 1 and 30000),
  check (cardinality(tags) <= 10)
);
drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();

-- Speaking files stay in a separate private bucket. The browser can upload only
-- to its own prefix; transcription and scoring happen in an Edge Function.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learner-submissions', 'learner-submissions', false, 8388608, array['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.speaking_prompts (
  id text primary key,
  course_id text references public.courses(id) on delete set null,
  title text not null,
  instructions text not null,
  rubric jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'published', 'archived')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists speaking_prompts_set_updated_at on public.speaking_prompts;
create trigger speaking_prompts_set_updated_at before update on public.speaking_prompts for each row execute function public.set_updated_at();

create table if not exists public.speaking_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id text references public.speaking_prompts(id) on delete set null,
  course_id text references public.courses(id) on delete set null,
  storage_path text not null unique,
  mime_type text not null,
  duration_seconds integer check (duration_seconds is null or duration_seconds between 1 and 600),
  status text not null default 'uploading' check (status in ('uploading', 'processing', 'completed', 'failed', 'deleted')),
  transcript text,
  result jsonb not null default '{}'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists speaking_submissions_set_updated_at on public.speaking_submissions;
create trigger speaking_submissions_set_updated_at before update on public.speaking_submissions for each row execute function public.set_updated_at();

-- In-app notifications and email delivery outbox.
create table if not exists public.announcements (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all_learners' check (audience in ('all_learners', 'active_learners', 'course_learners')),
  course_id text references public.courses(id) on delete set null,
  action_url text,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  archived_at timestamptz
);
create table if not exists public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  announcement_id uuid references public.announcements(id) on delete set null,
  notification_type text not null default 'announcement',
  title text not null,
  body text not null,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.notification_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel text not null check (channel in ('email')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempts integer not null default 0 check (attempts between 0 and 5),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (notification_id, channel)
);
drop trigger if exists notification_deliveries_set_updated_at on public.notification_deliveries;
create trigger notification_deliveries_set_updated_at before update on public.notification_deliveries for each row execute function public.set_updated_at();

create table if not exists public.learner_intervention_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  learner_id uuid not null references auth.users(id) on delete cascade,
  staff_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(body) between 1 and 5000)
);
drop trigger if exists learner_intervention_notes_set_updated_at on public.learner_intervention_notes;
create trigger learner_intervention_notes_set_updated_at before update on public.learner_intervention_notes for each row execute function public.set_updated_at();

create table if not exists public.site_pages (
  slug text primary key,
  title text not null,
  body_markdown text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
drop trigger if exists site_pages_set_updated_at on public.site_pages;
create trigger site_pages_set_updated_at before update on public.site_pages for each row execute function public.set_updated_at();

-- SRS data moves out of localStorage and becomes server-owned.
alter table public.vocabulary_progress add column if not exists due_at timestamptz;
alter table public.vocabulary_progress add column if not exists interval_days integer not null default 0 check (interval_days >= 0);
alter table public.vocabulary_progress add column if not exists repetitions integer not null default 0 check (repetitions >= 0);
alter table public.vocabulary_progress add column if not exists lapses integer not null default 0 check (lapses >= 0);
create index if not exists vocabulary_progress_due_idx on public.vocabulary_progress(user_id, due_at) where due_at is not null;

alter table public.ai_usage drop constraint if exists ai_usage_feature_check;
alter table public.ai_usage add constraint ai_usage_feature_check check (feature in ('chat', 'writing', 'speaking'));

-- New auth users receive the minimum private profile/settings rows. Email
-- confirmation remains an Auth setting; free enrollment happens only after
-- the verified learner completes onboarding.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  learner_name text := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'learner'), '@', 1));
begin
  insert into public.profiles (user_id, email, display_name, profile_role)
  values (new.id, coalesce(new.email, ''), learner_name, 'learner')
  on conflict (user_id) do nothing;
  insert into public.learner_profiles (id, user_id, display_name, target_level)
  values (extensions.gen_random_uuid()::text, new.id, learner_name, 'Tokutei Gino')
  on conflict (user_id) do nothing;
  insert into public.learner_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

insert into public.learner_settings (user_id)
select p.user_id from public.profiles as p
on conflict (user_id) do nothing;

insert into public.learner_profiles (id, user_id, display_name, target_level)
select extensions.gen_random_uuid()::text, p.user_id, p.display_name, 'Tokutei Gino'
from public.profiles as p
on conflict (user_id) do nothing;

-- Secure learning RPCs.
create or replace function public.submit_vocabulary_rating(
  target_vocabulary_item_id text,
  target_rating text
)
returns table (
  vocabulary_item_id text,
  status text,
  due_at timestamptz,
  interval_days integer,
  repetitions integer,
  lapses integer
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_course_id text;
  current_progress public.vocabulary_progress%rowtype;
  next_interval integer;
  next_repetitions integer;
  next_lapses integer;
  next_status text;
  next_due_at timestamptz;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_rating not in ('again', 'hard', 'good', 'easy') then raise exception 'INVALID_VOCABULARY_RATING' using errcode = '22023'; end if;
  select l.course_id into target_course_id
  from public.lesson_vocabulary as lv
  join public.lessons as l on l.id = lv.lesson_id
  where lv.vocabulary_item_id = target_vocabulary_item_id and l.status = 'published'
  limit 1;
  if target_course_id is null or not public.can_read_course(target_course_id) then
    raise exception 'VOCABULARY_NOT_AVAILABLE' using errcode = '42501';
  end if;
  select * into current_progress from public.vocabulary_progress as vp
  where vp.user_id = auth.uid() and vp.vocabulary_item_id = target_vocabulary_item_id;
  next_repetitions := coalesce(current_progress.repetitions, 0);
  next_lapses := coalesce(current_progress.lapses, 0);
  next_interval := coalesce(current_progress.interval_days, 0);
  if target_rating = 'again' then
    next_repetitions := 0;
    next_lapses := next_lapses + 1;
    next_interval := 0;
    next_due_at := now() + interval '10 minutes';
  elsif target_rating = 'hard' then
    next_repetitions := next_repetitions + 1;
    next_interval := greatest(1, ceil(greatest(next_interval, 1) * 1.25)::integer);
    next_due_at := now() + make_interval(days => next_interval);
  elsif target_rating = 'good' then
    next_repetitions := next_repetitions + 1;
    next_interval := greatest(1, ceil(greatest(next_interval, 1) * 2)::integer);
    next_due_at := now() + make_interval(days => next_interval);
  else
    next_repetitions := next_repetitions + 1;
    next_interval := greatest(3, ceil(greatest(next_interval, 1) * 3)::integer);
    next_due_at := now() + make_interval(days => next_interval);
  end if;
  next_status := case when next_repetitions >= 3 and target_rating in ('good', 'easy') then 'mastered' else 'learning' end;
  insert into public.vocabulary_progress (user_id, vocabulary_item_id, status, last_reviewed_at, due_at, interval_days, repetitions, lapses)
  values (auth.uid(), target_vocabulary_item_id, next_status, now(), next_due_at, next_interval, next_repetitions, next_lapses)
  on conflict on constraint vocabulary_progress_pkey do update
    set status = excluded.status, last_reviewed_at = excluded.last_reviewed_at, due_at = excluded.due_at,
        interval_days = excluded.interval_days, repetitions = excluded.repetitions, lapses = excluded.lapses;
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), target_course_id, 'vocabulary_reviewed', 'Vocabulary review',
    jsonb_build_object('vocabularyItemId', target_vocabulary_item_id, 'rating', target_rating, 'intervalDays', next_interval));
  return query select target_vocabulary_item_id, next_status, next_due_at, next_interval, next_repetitions, next_lapses;
end;
$$;

create or replace function public.get_due_vocabulary_cards(target_limit integer default 20)
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
    v.id, v.term, v.translation, v.reading, v.pronunciation, v.example_sentence, v.tags,
    coalesce(vp.status, 'new'), vp.due_at, coalesce(vp.interval_days, 0), coalesce(vp.repetitions, 0), coalesce(vp.lapses, 0)
  from public.vocabulary_items as v
  join public.lesson_vocabulary as lv on lv.vocabulary_item_id = v.id
  join public.lessons as l on l.id = lv.lesson_id and l.status = 'published'
  left join public.vocabulary_progress as vp on vp.user_id = auth.uid() and vp.vocabulary_item_id = v.id
  where auth.uid() is not null
    and public.can_read_course(l.course_id)
    and (vp.due_at is null or vp.due_at <= now())
  order by v.id, vp.due_at nulls first, lv.position
  limit greatest(1, least(target_limit, 100));
$$;

drop function if exists public.get_course_review_questions(text);
create function public.get_course_review_questions(target_course_id text)
returns table (
  question_id text,
  prompt text,
  explanation text,
  source text,
  options jsonb
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    rq.id,
    rq.prompt,
    rq.explanation,
    l.title,
    coalesce(jsonb_agg(jsonb_build_object('id', ro.id, 'label', ro.label) order by ro.order_index), '[]'::jsonb)
  from public.review_questions as rq
  join public.lessons as l on l.id = rq.lesson_id and l.status = 'published'
  join public.review_options as ro on ro.question_id = rq.id
  where auth.uid() is not null and l.course_id = target_course_id and public.can_read_course(target_course_id)
  group by rq.id, rq.prompt, rq.explanation, l.title, rq.order_index
  order by rq.order_index;
$$;

create or replace function public.submit_review_answer(
  target_question_id text,
  target_option_id text
)
returns table (
  attempt_id text,
  question_id text,
  selected_option_id text,
  is_correct boolean,
  explanation text,
  answered_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_course_id text;
  answer_is_correct boolean;
  answer_explanation text;
  next_attempt_id text := extensions.gen_random_uuid()::text;
  answer_time timestamptz := now();
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select l.course_id, ro.is_correct, rq.explanation
  into target_course_id, answer_is_correct, answer_explanation
  from public.review_questions as rq
  join public.lessons as l on l.id = rq.lesson_id and l.status = 'published'
  join public.review_options as ro on ro.question_id = rq.id and ro.id = target_option_id
  where rq.id = target_question_id;
  if target_course_id is null or not public.can_read_course(target_course_id) then
    raise exception 'QUESTION_NOT_AVAILABLE' using errcode = '42501';
  end if;
  insert into public.review_attempts (id, user_id, question_id, is_correct, answered_at)
  values (next_attempt_id, auth.uid(), target_question_id, answer_is_correct, answer_time);
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), target_course_id, 'review_answered', 'Review question answered',
    jsonb_build_object('questionId', target_question_id, 'optionId', target_option_id, 'isCorrect', answer_is_correct));
  return query select next_attempt_id, target_question_id, target_option_id, answer_is_correct, answer_explanation, answer_time;
end;
$$;

create or replace function public.get_assessment_result_detail(target_attempt_id text)
returns table (
  attempt_id text,
  question_id text,
  prompt text,
  selected_answer text,
  is_correct boolean,
  explanation text,
  order_index integer
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select aa.id, q.id, q.prompt, aa.answers ->> q.id,
    coalesce(trim(aa.answers ->> q.id) = trim(q.correct_answer), false), q.explanation, q.order_index
  from public.assessment_attempts as aa
  join public.assessment_questions as q on q.assessment_id = aa.assessment_id
  where aa.id = target_attempt_id and aa.user_id = auth.uid()
  order by q.order_index;
$$;

create or replace function public.get_daily_learning_plan()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  due_count integer;
  next_lesson jsonb;
  weak_exam jsonb;
  goal_minutes integer;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select count(*) into due_count from public.get_due_vocabulary_cards(100);
  select jsonb_build_object('id', l.id, 'title', l.title, 'courseId', l.course_id, 'courseTitle', c.title)
  into next_lesson
  from public.lessons as l
  join public.courses as c on c.id = l.course_id
  left join public.lesson_progress as lp on lp.lesson_id = l.id and lp.user_id = auth.uid()
  where l.status = 'published' and public.can_read_course(l.course_id)
    and coalesce(lp.status, 'not-started') <> 'completed'
  order by c.order_index, l.order_index
  limit 1;
  select jsonb_build_object('id', a.id, 'title', a.title, 'score', aa.score, 'courseId', a.course_id)
  into weak_exam
  from public.assessment_attempts as aa
  join public.assessments as a on a.id = aa.assessment_id
  where aa.user_id = auth.uid()
  order by aa.score asc, aa.attempted_at desc
  limit 1;
  select coalesce(ls.daily_goal_minutes, 20) into goal_minutes from public.learner_settings as ls where ls.user_id = auth.uid();
  return jsonb_build_object(
    'goalMinutes', coalesce(goal_minutes, 20),
    'dueVocabulary', coalesce(due_count, 0),
    'nextLesson', next_lesson,
    'weakAssessment', weak_exam
  );
end;
$$;

create or replace function public.activate_default_starter_enrollment()
returns table (id text, package_id text, course_id text, status text, progress_percent numeric)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  starter_id text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  select p.id into starter_id
  from public.packages as p
  where p.status = 'active' and p.price_cents = 0
  order by p.created_at, p.id
  limit 1;
  if starter_id is null then return; end if;
  return query select * from public.enroll_in_free_package(starter_id);
end;
$$;

create or replace function public.complete_learner_onboarding(
  target_display_name text,
  target_level text,
  target_timezone text,
  target_daily_goal_minutes integer
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if length(trim(target_display_name)) not between 1 and 100 then raise exception 'INVALID_DISPLAY_NAME' using errcode = '22023'; end if;
  if target_daily_goal_minutes not between 5 and 240 then raise exception 'INVALID_DAILY_GOAL' using errcode = '22023'; end if;
  update public.profiles set display_name = trim(target_display_name) where user_id = auth.uid();
  update public.learner_profiles set display_name = trim(target_display_name), target_level = coalesce(nullif(trim(target_level), ''), 'Tokutei Gino') where user_id = auth.uid();
  update public.learner_settings set timezone = coalesce(nullif(trim(target_timezone), ''), 'Asia/Tokyo'),
    daily_goal_minutes = target_daily_goal_minutes, onboarding_completed_at = now() where user_id = auth.uid();
  perform public.activate_default_starter_enrollment();
end;
$$;

-- Safe assessment feedback after submission: a learner gets only their own
-- selection and correctness, never the stored correct answer.
create or replace function public.get_global_search_results(target_query text, target_limit integer default 30)
returns table (result_type text, id text, title text, subtitle text, route text)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  with needle as (select nullif(trim(target_query), '') as value)
  select * from (
    select 'course'::text, c.id, c.title, c.description, '/app/courses/' || c.id || '/learn'
    from public.courses as c, needle
    where c.status = 'published' and public.can_read_course(c.id)
      and needle.value is not null and (c.title ilike '%' || needle.value || '%' or c.description ilike '%' || needle.value || '%')
    union all
    select 'lesson', l.id, l.title, l.description, '/app/courses/' || l.course_id || '/learn'
    from public.lessons as l, needle
    where l.status = 'published' and public.can_read_course(l.course_id)
      and needle.value is not null and (l.title ilike '%' || needle.value || '%' or l.description ilike '%' || needle.value || '%')
    union all
    select 'vocabulary', v.id, v.term, v.translation, '/app/vocabulary/' || v.id
    from public.vocabulary_items as v, needle
    where needle.value is not null and v.term ilike '%' || needle.value || '%'
      and exists (select 1 from public.lesson_vocabulary as lv join public.lessons as l on l.id = lv.lesson_id where lv.vocabulary_item_id = v.id and l.status = 'published' and public.can_read_course(l.course_id))
    union all
    select 'grammar', gt.id, gt.title, gt.summary, '/app/grammar/' || gt.id
    from public.grammar_topics as gt, needle
    where gt.status = 'published' and needle.value is not null and (gt.title ilike '%' || needle.value || '%' or gt.summary ilike '%' || needle.value || '%')
      and exists (select 1 from public.grammar_topic_courses as gc where gc.topic_id = gt.id and public.can_read_course(gc.course_id))
    union all
    select 'document', d.id, d.title, d.summary, '/app/courses/' || d.course_id || '/learn'
    from public.documents as d, needle
    where d.status = 'published' and public.can_read_course(d.course_id) and needle.value is not null
      and (d.title ilike '%' || needle.value || '%' or d.summary ilike '%' || needle.value || '%' or d.content_markdown ilike '%' || needle.value || '%')
  ) as results
  limit greatest(1, least(target_limit, 50));
$$;

-- Staff operations that must never be writable directly by a learner.
create or replace function public.admin_grant_enrollment(target_user_id uuid, target_course_id text, target_package_id text default null)
returns public.enrollments
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  granted public.enrollments%rowtype;
begin
  if not public.has_staff_permission('learner.manage') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  if not exists (select 1 from public.courses as c where c.id = target_course_id and c.status = 'published') then raise exception 'COURSE_NOT_AVAILABLE' using errcode = '22023'; end if;
  insert into public.enrollments (id, user_id, course_id, package_id, status, progress_percent)
  values (extensions.gen_random_uuid()::text, target_user_id, target_course_id, target_package_id, 'active', 0)
  on conflict (user_id, course_id) do update set package_id = excluded.package_id, status = 'active', completed_at = null
  returning * into granted;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'enrollment_granted', 'enrollment', granted.id,
    jsonb_build_object('learnerId', target_user_id, 'courseId', target_course_id, 'packageId', target_package_id));
  return granted;
end;
$$;

create or replace function public.admin_revoke_enrollment(target_user_id uuid, target_course_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if not public.has_staff_permission('learner.manage') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  update public.enrollments set status = 'paused' where user_id = target_user_id and course_id = target_course_id;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'enrollment_revoked', 'enrollment', target_course_id,
    jsonb_build_object('learnerId', target_user_id, 'courseId', target_course_id));
end;
$$;

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
  if target_entity_type not in ('course', 'module', 'lesson', 'assessment', 'document', 'podcast', 'grammar_topic') then raise exception 'INVALID_CONTENT_TYPE' using errcode = '22023'; end if;
  if target_status not in ('draft', 'in_review', 'published', 'archived') then raise exception 'INVALID_CONTENT_STATUS' using errcode = '22023'; end if;
  target_table := case target_entity_type
    when 'course' then 'courses'
    when 'module' then 'course_modules'
    when 'lesson' then 'lessons'
    when 'assessment' then 'assessments'
    when 'document' then 'documents'
    when 'podcast' then 'podcast_episodes'
    when 'grammar_topic' then 'grammar_topics'
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

create or replace function public.start_speaking_submission(target_prompt_id text, target_mime_type text, target_duration_seconds integer default null)
returns table (submission_id uuid, storage_path text)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  prompt_course_id text;
  next_id uuid := extensions.gen_random_uuid();
  next_path text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_mime_type not in ('audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg') then raise exception 'INVALID_AUDIO_TYPE' using errcode = '22023'; end if;
  if target_duration_seconds is not null and target_duration_seconds not between 1 and 600 then raise exception 'INVALID_AUDIO_DURATION' using errcode = '22023'; end if;
  select sp.course_id into prompt_course_id from public.speaking_prompts as sp where sp.id = target_prompt_id and sp.status = 'published';
  if not found then raise exception 'SPEAKING_PROMPT_NOT_AVAILABLE' using errcode = '42501'; end if;
  if prompt_course_id is not null and not public.can_read_course(prompt_course_id) then raise exception 'ENROLLMENT_REQUIRED' using errcode = '42501'; end if;
  next_path := auth.uid()::text || '/speaking/' || next_id::text || '/recording';
  insert into public.speaking_submissions (id, user_id, prompt_id, course_id, storage_path, mime_type, duration_seconds)
  values (next_id, auth.uid(), target_prompt_id, prompt_course_id, next_path, target_mime_type, target_duration_seconds);
  return query select next_id, next_path;
end;
$$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns void
language sql
security definer
set search_path = public
set row_security = off
as $$
  update public.notifications set read_at = coalesce(read_at, now()) where id = target_notification_id and user_id = auth.uid();
$$;

create or replace function public.create_announcement(
  target_title text,
  target_body text,
  target_audience text default 'all_learners',
  target_course_id text default null,
  target_action_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  next_announcement_id uuid := extensions.gen_random_uuid();
begin
  if not public.has_staff_permission('announcement.manage') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  if target_audience not in ('all_learners', 'active_learners', 'course_learners') then raise exception 'INVALID_AUDIENCE' using errcode = '22023'; end if;
  if target_audience = 'course_learners' and target_course_id is null then raise exception 'COURSE_REQUIRED' using errcode = '22023'; end if;
  insert into public.announcements (id, title, body, audience, course_id, action_url, created_by)
  values (next_announcement_id, trim(target_title), trim(target_body), target_audience, target_course_id, target_action_url, auth.uid());
  insert into public.notifications (user_id, announcement_id, notification_type, title, body, action_url)
  select p.user_id, next_announcement_id, 'announcement', trim(target_title), trim(target_body), target_action_url
  from public.profiles as p
  where p.profile_role = 'learner'
    and (
      target_audience = 'all_learners'
      or (target_audience = 'active_learners' and exists (select 1 from public.enrollments as e where e.user_id = p.user_id and e.status in ('active', 'completed')))
      or (target_audience = 'course_learners' and exists (select 1 from public.enrollments as e where e.user_id = p.user_id and e.course_id = target_course_id and e.status in ('active', 'completed')))
    );
  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email'
  from public.notifications as n
  join public.learner_settings as ls on ls.user_id = n.user_id and ls.email_notifications
  where n.announcement_id = next_announcement_id
  on conflict do nothing;
  return next_announcement_id;
end;
$$;

create or replace function public.queue_due_reminders()
returns integer
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  queued_count integer := 0;
begin
  if auth.role() <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501'; end if;
  insert into public.notifications (user_id, notification_type, title, body, action_url)
  select ls.user_id, 'review_due', 'Đến giờ ôn từ vựng', 'Anh có thẻ nhớ đến hạn hôm nay. Ôn một lượt ngắn để giữ nhịp.', '/app/review/flashcards?mode=due'
  from public.learner_settings as ls
  where ls.in_app_notifications
    and exists (select 1 from public.vocabulary_progress as vp where vp.user_id = ls.user_id and vp.due_at <= now())
    and not exists (
      select 1 from public.notifications as n
      where n.user_id = ls.user_id and n.notification_type = 'review_due' and n.created_at::date = current_date
    );
  get diagnostics queued_count = row_count;
  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email'
  from public.notifications as n
  join public.learner_settings as ls on ls.user_id = n.user_id and ls.email_notifications
  where n.notification_type = 'review_due' and n.created_at::date = current_date
  on conflict do nothing;
  return queued_count;
end;
$$;

create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
begin
  if not public.has_staff_permission('analytics.read') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  return jsonb_build_object(
    'verifiedUsers', (select count(*) from public.profiles),
    'activeLearners', (select count(distinct e.user_id) from public.enrollments as e where e.status in ('active', 'completed')),
    'activeEnrollments', (select count(*) from public.enrollments as e where e.status = 'active'),
    'courseCompletion', coalesce((select round(avg(e.progress_percent), 1) from public.enrollments as e), 0),
    'dueVocabulary', (select count(*) from public.vocabulary_progress as vp where vp.due_at <= now()),
    'examPassRate', coalesce((select round(100.0 * count(*) filter (where aa.passed) / nullif(count(*), 0), 1) from public.assessment_attempts as aa), 0),
    'aiRequestsThisMonth', (select coalesce(sum(au.request_count), 0) from public.ai_usage as au where au.period_start = date_trunc('month', now())::date),
    'pendingEmail', (select count(*) from public.notification_deliveries as nd where nd.status = 'pending')
  );
end;
$$;

-- RLS: remove the old single-admin policies before allowing the four roles.
drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_update_own_or_admin on public.profiles;
drop policy if exists admin_roles_select_own_or_admin on public.admin_roles;
drop policy if exists admin_roles_admin_manage on public.admin_roles;
drop policy if exists courses_authenticated_read_published on public.courses;
drop policy if exists courses_admin_manage on public.courses;
drop policy if exists course_modules_authenticated_read_published on public.course_modules;
drop policy if exists course_modules_admin_manage on public.course_modules;
drop policy if exists lessons_authenticated_read_published on public.lessons;
drop policy if exists lessons_admin_manage on public.lessons;
drop policy if exists lesson_assets_authenticated_read_published on public.lesson_assets;
drop policy if exists lesson_assets_admin_manage on public.lesson_assets;
drop policy if exists lesson_exercises_authenticated_read_published on public.lesson_exercises;
drop policy if exists lesson_exercises_admin_manage on public.lesson_exercises;
drop policy if exists vocabulary_items_authenticated_read_published on public.vocabulary_items;
drop policy if exists vocabulary_items_admin_manage on public.vocabulary_items;
drop policy if exists lesson_vocabulary_authenticated_read_published on public.lesson_vocabulary;
drop policy if exists lesson_vocabulary_admin_manage on public.lesson_vocabulary;
drop policy if exists review_questions_authenticated_read_published on public.review_questions;
drop policy if exists review_questions_admin_manage on public.review_questions;
drop policy if exists review_options_authenticated_read_published on public.review_options;
drop policy if exists review_options_admin_manage on public.review_options;
drop policy if exists assessments_authenticated_read_published on public.assessments;
drop policy if exists assessments_admin_manage on public.assessments;
drop policy if exists assessment_questions_authenticated_read_published on public.assessment_questions;
drop policy if exists assessment_questions_admin_manage on public.assessment_questions;
drop policy if exists documents_authenticated_read_published on public.documents;
drop policy if exists documents_admin_manage on public.documents;
drop policy if exists podcast_episodes_authenticated_read_published on public.podcast_episodes;
drop policy if exists podcast_episodes_admin_manage on public.podcast_episodes;
drop policy if exists learner_profiles_select_own_or_admin on public.learner_profiles;
drop policy if exists learner_profiles_update_own_or_admin on public.learner_profiles;
drop policy if exists learner_profiles_admin_manage on public.learner_profiles;
drop policy if exists enrollments_select_own_or_admin on public.enrollments;
drop policy if exists enrollments_admin_manage on public.enrollments;
drop policy if exists lesson_progress_select_own_or_admin on public.lesson_progress;
drop policy if exists lesson_progress_admin_manage on public.lesson_progress;
drop policy if exists vocabulary_progress_select_own_or_admin on public.vocabulary_progress;
drop policy if exists vocabulary_progress_admin_manage on public.vocabulary_progress;
drop policy if exists review_attempts_select_own_or_admin on public.review_attempts;
drop policy if exists review_attempts_admin_manage on public.review_attempts;
drop policy if exists assessment_attempts_select_own_or_admin on public.assessment_attempts;
drop policy if exists assessment_attempts_admin_manage on public.assessment_attempts;
drop policy if exists learning_activity_events_select_own_or_admin on public.learning_activity_events;
drop policy if exists learning_activity_events_admin_manage on public.learning_activity_events;
drop policy if exists packages_authenticated_read_active on public.packages;
drop policy if exists packages_admin_manage on public.packages;
drop policy if exists package_courses_authenticated_read_active on public.package_courses;
drop policy if exists package_courses_admin_manage on public.package_courses;
drop policy if exists admin_alerts_admin_manage on public.admin_alerts;
drop policy if exists admin_activity_logs_admin_manage on public.admin_activity_logs;
drop policy if exists ai_prompts_admin_manage on public.ai_prompts;
drop policy if exists api_key_metadata_admin_manage on public.api_key_metadata;
drop policy if exists document_annotations_select_own_or_admin on public.document_annotations;
drop policy if exists document_annotations_delete_own on public.document_annotations;
drop policy if exists ai_conversations_select_own_or_admin on public.ai_conversations;
drop policy if exists ai_messages_select_own_or_admin on public.ai_messages;
drop policy if exists ai_writing_submissions_select_own_or_admin on public.ai_writing_submissions;
drop policy if exists ai_usage_select_own_or_admin on public.ai_usage;

create policy profiles_select_own_or_learner_staff on public.profiles for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy profiles_update_own_or_learner_staff on public.profiles for update to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.manage')) with check (user_id = auth.uid() or public.has_staff_permission('learner.manage'));
create policy admin_roles_select_own_or_owner on public.admin_roles for select to authenticated using (user_id = auth.uid() or public.staff_role() = 'owner');
create policy admin_roles_owner_manage on public.admin_roles for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');

create policy courses_catalog_or_content_read on public.courses for select to authenticated using (status = 'published' or public.has_staff_permission('content.read'));
create policy courses_content_insert on public.courses for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy courses_content_update on public.courses for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy courses_owner_delete on public.courses for delete to authenticated using (public.staff_role() = 'owner');

create policy course_modules_read on public.course_modules for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and public.can_read_course(course_id)));
create policy course_modules_content_insert on public.course_modules for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy course_modules_content_update on public.course_modules for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy course_modules_owner_delete on public.course_modules for delete to authenticated using (public.staff_role() = 'owner');

create policy lessons_read on public.lessons for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and public.can_read_course(course_id)));
create policy lessons_content_insert on public.lessons for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy lessons_content_update on public.lessons for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy lessons_owner_delete on public.lessons for delete to authenticated using (public.staff_role() = 'owner');

create policy lesson_assets_read on public.lesson_assets for select to authenticated using (public.has_staff_permission('content.read') or public.can_read_lesson(lesson_id));
create policy lesson_assets_content_write on public.lesson_assets for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy lesson_exercises_read on public.lesson_exercises for select to authenticated using (public.has_staff_permission('content.read') or public.can_read_lesson(lesson_id));
create policy lesson_exercises_content_write on public.lesson_exercises for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy vocabulary_items_read on public.vocabulary_items for select to authenticated using (public.has_staff_permission('content.read') or exists (select 1 from public.lesson_vocabulary as lv join public.lessons as l on l.id = lv.lesson_id where lv.vocabulary_item_id = vocabulary_items.id and l.status = 'published' and public.can_read_course(l.course_id)));
create policy vocabulary_items_content_write on public.vocabulary_items for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy lesson_vocabulary_read on public.lesson_vocabulary for select to authenticated using (public.has_staff_permission('content.read') or public.can_read_lesson(lesson_id));
create policy lesson_vocabulary_content_write on public.lesson_vocabulary for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy review_questions_read on public.review_questions for select to authenticated using (public.has_staff_permission('content.read') or public.can_read_lesson(lesson_id));
create policy review_questions_content_write on public.review_questions for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy review_options_read on public.review_options for select to authenticated using (public.has_staff_permission('content.read') or exists (select 1 from public.review_questions as rq where rq.id = review_options.question_id and public.can_read_lesson(rq.lesson_id)));
create policy review_options_content_write on public.review_options for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy assessments_read on public.assessments for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and public.can_read_course(course_id)));
create policy assessments_content_insert on public.assessments for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy assessments_content_update on public.assessments for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy assessments_owner_delete on public.assessments for delete to authenticated using (public.staff_role() = 'owner');
create policy assessment_questions_read on public.assessment_questions for select to authenticated using (public.has_staff_permission('content.read') or exists (select 1 from public.assessments as a where a.id = assessment_questions.assessment_id and a.status = 'published' and public.can_read_course(a.course_id)));
create policy assessment_questions_content_write on public.assessment_questions for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy documents_read on public.documents for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and public.can_read_course(course_id)));
create policy documents_content_insert on public.documents for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy documents_content_update on public.documents for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy documents_owner_delete on public.documents for delete to authenticated using (public.staff_role() = 'owner');
create policy podcasts_read on public.podcast_episodes for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and public.can_read_course(course_id)));
create policy podcasts_content_insert on public.podcast_episodes for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy podcasts_content_update on public.podcast_episodes for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy podcasts_owner_delete on public.podcast_episodes for delete to authenticated using (public.staff_role() = 'owner');

create policy learner_profiles_select on public.learner_profiles for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy learner_profiles_update on public.learner_profiles for update to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.manage')) with check (user_id = auth.uid() or public.has_staff_permission('learner.manage'));
create policy enrollments_select on public.enrollments for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy enrollments_staff_manage on public.enrollments for all to authenticated using (public.has_staff_permission('learner.manage')) with check (public.has_staff_permission('learner.manage'));
create policy lesson_progress_select on public.lesson_progress for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy vocabulary_progress_select on public.vocabulary_progress for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy review_attempts_select on public.review_attempts for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy assessment_attempts_select on public.assessment_attempts for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy learning_activity_events_select on public.learning_activity_events for select to authenticated using (user_id = auth.uid() or public.has_staff_permission('learner.read'));
create policy packages_read on public.packages for select to authenticated using (status = 'active' or public.staff_role() = 'owner');
create policy packages_owner_manage on public.packages for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy package_courses_read on public.package_courses for select to authenticated using (public.staff_role() = 'owner' or exists (select 1 from public.packages as p where p.id = package_courses.package_id and p.status = 'active'));
create policy package_courses_owner_manage on public.package_courses for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy admin_alerts_read on public.admin_alerts for select to authenticated using (public.staff_role() in ('owner', 'analyst'));
create policy admin_alerts_owner_manage on public.admin_alerts for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy admin_activity_logs_read on public.admin_activity_logs for select to authenticated using (public.has_staff_permission('audit.read'));
create policy ai_prompts_owner_manage on public.ai_prompts for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy api_key_metadata_owner_read on public.api_key_metadata for select to authenticated using (public.staff_role() = 'owner');

create policy document_annotations_select_own on public.document_annotations for select to authenticated using (user_id = auth.uid());
create policy document_annotations_delete_own_only on public.document_annotations for delete to authenticated using (user_id = auth.uid());
create policy ai_conversations_select_own_or_owner on public.ai_conversations for select to authenticated using (user_id = auth.uid() or public.staff_role() = 'owner');
create policy ai_messages_select_own_or_owner on public.ai_messages for select to authenticated using (user_id = auth.uid() or public.staff_role() = 'owner');
create policy ai_writing_submissions_select_own_or_owner on public.ai_writing_submissions for select to authenticated using (user_id = auth.uid() or public.staff_role() = 'owner');
create policy ai_usage_select_own_or_owner on public.ai_usage for select to authenticated using (user_id = auth.uid() or public.staff_role() = 'owner');

alter table public.content_revisions enable row level security;
alter table public.learner_settings enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.learner_achievements enable row level security;
alter table public.grammar_topics enable row level security;
alter table public.grammar_rules enable row level security;
alter table public.grammar_examples enable row level security;
alter table public.grammar_topic_courses enable row level security;
alter table public.grammar_topic_vocabulary enable row level security;
alter table public.journal_entries enable row level security;
alter table public.speaking_prompts enable row level security;
alter table public.speaking_submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.learner_intervention_notes enable row level security;
alter table public.site_pages enable row level security;

create policy content_revisions_read on public.content_revisions for select to authenticated using (public.has_staff_permission('content.read'));
create policy learner_settings_own on public.learner_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy achievement_definitions_read on public.achievement_definitions for select to authenticated using (status = 'active' or public.staff_role() = 'owner');
create policy achievement_definitions_owner_manage on public.achievement_definitions for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');
create policy learner_achievements_select_own on public.learner_achievements for select to authenticated using (user_id = auth.uid());
create policy grammar_topics_read on public.grammar_topics for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and exists (select 1 from public.grammar_topic_courses as gc where gc.topic_id = grammar_topics.id and public.can_read_course(gc.course_id))));
create policy grammar_topics_content_insert on public.grammar_topics for insert to authenticated with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy grammar_topics_content_update on public.grammar_topics for update to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write') and public.can_write_content_status(status));
create policy grammar_topics_owner_delete on public.grammar_topics for delete to authenticated using (public.staff_role() = 'owner');
create policy grammar_rules_read on public.grammar_rules for select to authenticated using (public.has_staff_permission('content.read') or exists (select 1 from public.grammar_topics as gt where gt.id = grammar_rules.topic_id and gt.status = 'published' and exists (select 1 from public.grammar_topic_courses as gc where gc.topic_id = gt.id and public.can_read_course(gc.course_id))));
create policy grammar_rules_content_write on public.grammar_rules for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy grammar_examples_read on public.grammar_examples for select to authenticated using (public.has_staff_permission('content.read') or exists (select 1 from public.grammar_topics as gt where gt.id = grammar_examples.topic_id and gt.status = 'published' and exists (select 1 from public.grammar_topic_courses as gc where gc.topic_id = gt.id and public.can_read_course(gc.course_id))));
create policy grammar_examples_content_write on public.grammar_examples for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy grammar_topic_courses_content on public.grammar_topic_courses for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy grammar_topic_vocabulary_content on public.grammar_topic_vocabulary for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy journal_entries_own on public.journal_entries for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy speaking_prompts_read on public.speaking_prompts for select to authenticated using (public.has_staff_permission('content.read') or (status = 'published' and (course_id is null or public.can_read_course(course_id))));
create policy speaking_prompts_content on public.speaking_prompts for all to authenticated using (public.has_staff_permission('content.write')) with check (public.has_staff_permission('content.write'));
create policy speaking_submissions_own on public.speaking_submissions for select to authenticated using (user_id = auth.uid());
create policy announcements_staff_read on public.announcements for select to authenticated using (public.has_staff_permission('announcement.manage') or public.has_staff_permission('analytics.read'));
create policy notifications_own_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notification_deliveries_owner_read on public.notification_deliveries for select to authenticated using (public.staff_role() = 'owner');
create policy intervention_notes_staff on public.learner_intervention_notes for all to authenticated using (public.has_staff_permission('learner.manage')) with check (public.has_staff_permission('learner.manage') and staff_id = auth.uid());
create policy site_pages_public_read on public.site_pages for select to anon, authenticated using (status = 'published' or public.staff_role() = 'owner');
create policy site_pages_owner_manage on public.site_pages for all to authenticated using (public.staff_role() = 'owner') with check (public.staff_role() = 'owner');

-- Storage policies are scoped by path and staff capability, never by UI state.
drop policy if exists course_assets_admin_insert on storage.objects;
drop policy if exists course_assets_admin_update on storage.objects;
drop policy if exists course_assets_admin_delete on storage.objects;
create policy course_assets_content_insert on storage.objects for insert to authenticated with check (bucket_id = 'course-assets' and public.has_staff_permission('content.write'));
create policy course_assets_content_update on storage.objects for update to authenticated using (bucket_id = 'course-assets' and public.has_staff_permission('content.write')) with check (bucket_id = 'course-assets' and public.has_staff_permission('content.write'));
create policy course_assets_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'course-assets' and public.staff_role() = 'owner');
create policy learner_submissions_select_own on storage.objects for select to authenticated using (bucket_id = 'learner-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy learner_submissions_insert_own on storage.objects for insert to authenticated with check (bucket_id = 'learner-submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy learner_submissions_delete_own on storage.objects for delete to authenticated using (bucket_id = 'learner-submissions' and (storage.foldername(name))[1] = auth.uid()::text);

-- Privileges for the newly protected tables and RPCs.
grant select, insert, update, delete on public.learner_settings, public.journal_entries to authenticated;
grant select on public.achievement_definitions, public.learner_achievements, public.grammar_topics, public.grammar_rules, public.grammar_examples, public.speaking_prompts, public.speaking_submissions, public.notifications to authenticated;
grant select on public.content_revisions, public.grammar_topic_courses, public.grammar_topic_vocabulary, public.announcements, public.notification_deliveries, public.learner_intervention_notes, public.site_pages to authenticated;
grant insert, update, delete on public.achievement_definitions, public.grammar_topics, public.grammar_rules, public.grammar_examples, public.grammar_topic_courses, public.grammar_topic_vocabulary, public.speaking_prompts, public.learner_intervention_notes, public.site_pages to authenticated;
grant select on public.site_pages to anon;
revoke insert, update, delete on public.speaking_submissions, public.notifications, public.notification_deliveries, public.announcements, public.content_revisions, public.learner_achievements from authenticated;

revoke all on function public.get_due_vocabulary_cards(integer) from public;
revoke all on function public.submit_vocabulary_rating(text, text) from public;
revoke all on function public.get_course_review_questions(text) from public;
revoke all on function public.submit_review_answer(text, text) from public;
revoke all on function public.get_assessment_result_detail(text) from public;
revoke all on function public.get_daily_learning_plan() from public;
revoke all on function public.activate_default_starter_enrollment() from public;
revoke all on function public.complete_learner_onboarding(text, text, text, integer) from public;
revoke all on function public.get_global_search_results(text, integer) from public;
revoke all on function public.admin_grant_enrollment(uuid, text, text) from public;
revoke all on function public.admin_revoke_enrollment(uuid, text) from public;
revoke all on function public.publish_content_revision(text, text, text) from public;
revoke all on function public.start_speaking_submission(text, text, integer) from public;
revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.create_announcement(text, text, text, text, text) from public;
revoke all on function public.queue_due_reminders() from public;
revoke all on function public.get_admin_analytics() from public;
grant execute on function public.staff_role(), public.is_admin(), public.has_staff_permission(text) to authenticated;
grant execute on function public.get_due_vocabulary_cards(integer), public.submit_vocabulary_rating(text, text), public.get_course_review_questions(text), public.submit_review_answer(text, text), public.get_assessment_result_detail(text), public.get_daily_learning_plan(), public.activate_default_starter_enrollment(), public.complete_learner_onboarding(text, text, text, integer), public.get_global_search_results(text, integer), public.start_speaking_submission(text, text, integer), public.mark_notification_read(uuid) to authenticated;
grant execute on function public.admin_grant_enrollment(uuid, text, text), public.admin_revoke_enrollment(uuid, text), public.publish_content_revision(text, text, text), public.create_announcement(text, text, text, text, text), public.get_admin_analytics() to authenticated;

commit;

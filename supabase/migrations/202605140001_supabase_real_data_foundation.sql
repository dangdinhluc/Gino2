create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  profile_role text not null default 'learner' check (profile_role in ('admin', 'learner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.prevent_profile_role_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if new.profile_role is distinct from old.profile_role and auth.uid() is not null and not public.is_admin() then
    raise exception 'profile_role is admin-managed';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_role_self_update
before update on public.profiles
for each row execute function public.prevent_profile_role_self_update();

create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role = 'admin'),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1
    from public.admin_roles
    where admin_roles.user_id = auth.uid()
      and admin_roles.role = 'admin'
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  insert into public.profiles (user_id, email, display_name, profile_role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'learner'), '@', 1)),
    'learner'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create table public.courses (
  id text primary key,
  slug text not null unique,
  title text not null,
  level text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  description text not null,
  theme_color text,
  order_index integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create or replace function public.can_read_course(target_course_id text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.courses
      where id = target_course_id
        and status = 'published'
    );
$$;

create table public.course_modules (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  level text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger course_modules_set_updated_at
before update on public.course_modules
for each row execute function public.set_updated_at();

create table public.lessons (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  module_id text not null references public.course_modules(id) on delete cascade,
  title text not null,
  description text not null,
  lesson_type text not null check (lesson_type in ('vocabulary', 'grammar', 'conversation', 'exam-prep', 'listening')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  objectives text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lessons_set_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create table public.lesson_assets (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  asset_type text not null check (asset_type in ('audio', 'document', 'image', 'video')),
  title text not null,
  description text,
  external_url text check (external_url is null or external_url not like 'supabase://%'),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lesson_assets_set_updated_at
before update on public.lesson_assets
for each row execute function public.set_updated_at();

create table public.lesson_exercises (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  exercise_type text not null,
  prompt text not null,
  answer text not null,
  choices jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lesson_exercises_set_updated_at
before update on public.lesson_exercises
for each row execute function public.set_updated_at();

create table public.vocabulary_items (
  id text primary key,
  term text not null,
  translation text not null,
  example_sentence text,
  pronunciation text,
  audio_url text check (audio_url is null or audio_url not like 'supabase://%'),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger vocabulary_items_set_updated_at
before update on public.vocabulary_items
for each row execute function public.set_updated_at();

create table public.lesson_vocabulary (
  lesson_id text not null references public.lessons(id) on delete cascade,
  vocabulary_item_id text not null references public.vocabulary_items(id) on delete cascade,
  position integer not null default 0,
  primary key (lesson_id, vocabulary_item_id)
);

create table public.review_questions (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  prompt text not null,
  explanation text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger review_questions_set_updated_at
before update on public.review_questions
for each row execute function public.set_updated_at();

create table public.review_options (
  id text primary key,
  question_id text not null references public.review_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  order_index integer not null default 0
);

create table public.assessments (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  assessment_type text not null,
  passing_score integer not null check (passing_score between 0 and 100),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger assessments_set_updated_at
before update on public.assessments
for each row execute function public.set_updated_at();

create table public.assessment_questions (
  id text primary key,
  assessment_id text not null references public.assessments(id) on delete cascade,
  prompt text not null,
  correct_answer text not null,
  options jsonb not null default '[]'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger assessment_questions_set_updated_at
before update on public.assessment_questions
for each row execute function public.set_updated_at();

create table public.documents (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  document_type text not null,
  external_url text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create table public.podcast_episodes (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  lesson_id text references public.lessons(id) on delete set null,
  title text not null,
  summary text not null,
  external_url text check (external_url is null or external_url not like 'supabase://%'),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger podcast_episodes_set_updated_at
before update on public.podcast_episodes
for each row execute function public.set_updated_at();

create table public.learner_profiles (
  id text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  target_level text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger learner_profiles_set_updated_at
before update on public.learner_profiles
for each row execute function public.set_updated_at();

create table public.enrollments (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  status text not null check (status in ('active', 'completed', 'paused')),
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null references public.lessons(id) on delete cascade,
  status text not null check (status in ('not-started', 'in-progress', 'completed')),
  score integer check (score is null or score between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.vocabulary_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_item_id text not null references public.vocabulary_items(id) on delete cascade,
  status text not null check (status in ('new', 'learning', 'mastered')),
  last_reviewed_at timestamptz,
  primary key (user_id, vocabulary_item_id)
);

create table public.review_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.review_questions(id) on delete cascade,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create table public.assessment_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id text not null references public.assessments(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  attempted_at timestamptz not null default now()
);

create table public.learning_activity_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text references public.courses(id) on delete set null,
  event_type text not null,
  event_label text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.packages (
  id text primary key,
  name text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'VND',
  status text not null check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger packages_set_updated_at
before update on public.packages
for each row execute function public.set_updated_at();

create table public.package_courses (
  package_id text not null references public.packages(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  primary key (package_id, course_id)
);

create table public.admin_alerts (
  id text primary key,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  body text not null,
  status text not null check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create table public.admin_activity_logs (
  id text primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.ai_prompts (
  id text primary key,
  name text not null,
  provider text not null,
  purpose text not null,
  status text not null check (status in ('draft', 'active', 'archived')),
  prompt_body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_prompts_set_updated_at
before update on public.ai_prompts
for each row execute function public.set_updated_at();

create table public.api_key_metadata (
  id text primary key,
  provider text not null,
  owner_name text not null,
  masked_key text not null check (masked_key = 'not configured' or position('••••' in masked_key) > 0),
  status text not null check (status in ('missing', 'configured', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger api_key_metadata_set_updated_at
before update on public.api_key_metadata
for each row execute function public.set_updated_at();

create or replace function public.can_read_course(target_course_id text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.courses
      join public.enrollments on enrollments.course_id = courses.id
      where courses.id = target_course_id
        and courses.status = 'published'
        and enrollments.user_id = auth.uid()
        and enrollments.status in ('active', 'completed')
    );
$$;

create or replace function public.can_read_lesson(target_lesson_id text)
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.lessons
      where lessons.id = target_lesson_id
        and lessons.status = 'published'
        and public.can_read_course(lessons.course_id)
    );
$$;

create or replace function public.get_admin_lesson_exercises()
returns table (
  id text,
  lesson_id text,
  exercise_type text,
  prompt text,
  answer text,
  choices jsonb,
  order_index integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    lesson_exercises.id,
    lesson_exercises.lesson_id,
    lesson_exercises.exercise_type,
    lesson_exercises.prompt,
    lesson_exercises.answer,
    lesson_exercises.choices,
    lesson_exercises.order_index,
    lesson_exercises.created_at,
    lesson_exercises.updated_at
  from public.lesson_exercises
  where public.is_admin()
  order by lesson_exercises.lesson_id, lesson_exercises.order_index;
$$;

create or replace function public.get_admin_review_options()
returns table (
  id text,
  question_id text,
  label text,
  is_correct boolean,
  order_index integer
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    review_options.id,
    review_options.question_id,
    review_options.label,
    review_options.is_correct,
    review_options.order_index
  from public.review_options
  where public.is_admin()
  order by review_options.question_id, review_options.order_index;
$$;

create or replace function public.get_admin_assessment_questions()
returns table (
  id text,
  assessment_id text,
  prompt text,
  correct_answer text,
  options jsonb,
  order_index integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    assessment_questions.id,
    assessment_questions.assessment_id,
    assessment_questions.prompt,
    assessment_questions.correct_answer,
    assessment_questions.options,
    assessment_questions.order_index,
    assessment_questions.created_at,
    assessment_questions.updated_at
  from public.assessment_questions
  where public.is_admin()
  order by assessment_questions.assessment_id, assessment_questions.order_index;
$$;

alter function public.is_admin() owner to postgres;
alter function public.can_read_course(text) owner to postgres;
alter function public.can_read_lesson(text) owner to postgres;
alter function public.get_admin_lesson_exercises() owner to postgres;
alter function public.get_admin_review_options() owner to postgres;
alter function public.get_admin_assessment_questions() owner to postgres;

create index courses_status_idx on public.courses(status);
create index course_modules_course_id_idx on public.course_modules(course_id);
create index lessons_course_id_idx on public.lessons(course_id);
create index lessons_module_id_idx on public.lessons(module_id);
create index lesson_assets_lesson_id_idx on public.lesson_assets(lesson_id);
create index lesson_exercises_lesson_id_idx on public.lesson_exercises(lesson_id);
create index lesson_vocabulary_vocabulary_item_id_idx on public.lesson_vocabulary(vocabulary_item_id);
create index review_questions_lesson_id_idx on public.review_questions(lesson_id);
create index review_options_question_id_idx on public.review_options(question_id);
create index assessments_course_id_idx on public.assessments(course_id);
create index assessment_questions_assessment_id_idx on public.assessment_questions(assessment_id);
create index documents_course_id_idx on public.documents(course_id);
create index podcast_episodes_course_id_idx on public.podcast_episodes(course_id);
create index enrollments_user_id_idx on public.enrollments(user_id);
create index learning_activity_events_user_id_idx on public.learning_activity_events(user_id);
create index admin_activity_logs_actor_id_idx on public.admin_activity_logs(actor_id);

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_assets enable row level security;
alter table public.lesson_exercises enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.lesson_vocabulary enable row level security;
alter table public.review_questions enable row level security;
alter table public.review_options enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.documents enable row level security;
alter table public.podcast_episodes enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.vocabulary_progress enable row level security;
alter table public.review_attempts enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.learning_activity_events enable row level security;
alter table public.packages enable row level security;
alter table public.package_courses enable row level security;
alter table public.admin_alerts enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.ai_prompts enable row level security;
alter table public.api_key_metadata enable row level security;

create policy profiles_select_own_or_admin on public.profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy profiles_update_own_or_admin on public.profiles for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy admin_roles_select_own_or_admin on public.admin_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy admin_roles_admin_manage on public.admin_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy courses_authenticated_read_published on public.courses for select to authenticated using (status = 'published' or public.is_admin());
create policy courses_admin_manage on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy course_modules_authenticated_read_published on public.course_modules for select to authenticated using (public.can_read_course(course_id));
create policy course_modules_admin_manage on public.course_modules for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lessons_authenticated_read_published on public.lessons for select to authenticated using (public.is_admin() or (status = 'published' and public.can_read_course(course_id)));
create policy lessons_admin_manage on public.lessons for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lesson_assets_authenticated_read_published on public.lesson_assets for select to authenticated using (public.can_read_lesson(lesson_id));
create policy lesson_assets_admin_manage on public.lesson_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lesson_exercises_authenticated_read_published on public.lesson_exercises for select to authenticated using (public.can_read_lesson(lesson_id));
create policy lesson_exercises_admin_manage on public.lesson_exercises for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy vocabulary_items_authenticated_read_published on public.vocabulary_items for select to authenticated using (
  public.is_admin()
  or exists (
    select 1
    from public.lesson_vocabulary
    join public.lessons on lessons.id = lesson_vocabulary.lesson_id
    where lesson_vocabulary.vocabulary_item_id = vocabulary_items.id
      and public.can_read_lesson(lessons.id)
  )
);
create policy vocabulary_items_admin_manage on public.vocabulary_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lesson_vocabulary_authenticated_read_published on public.lesson_vocabulary for select to authenticated using (public.can_read_lesson(lesson_id));
create policy lesson_vocabulary_admin_manage on public.lesson_vocabulary for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy review_questions_authenticated_read_published on public.review_questions for select to authenticated using (public.can_read_lesson(lesson_id));
create policy review_questions_admin_manage on public.review_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy review_options_authenticated_read_published on public.review_options for select to authenticated using (
  exists (
    select 1
    from public.review_questions
    join public.lessons on lessons.id = review_questions.lesson_id
    where review_questions.id = review_options.question_id
      and public.can_read_lesson(lessons.id)
  )
);
create policy review_options_admin_manage on public.review_options for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy assessments_authenticated_read_published on public.assessments for select to authenticated using (status = 'published' and public.can_read_course(course_id) or public.is_admin());
create policy assessments_admin_manage on public.assessments for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy assessment_questions_authenticated_read_published on public.assessment_questions for select to authenticated using (
  exists (select 1 from public.assessments where assessments.id = assessment_questions.assessment_id and assessments.status = 'published' and public.can_read_course(assessments.course_id))
  or public.is_admin()
);
create policy assessment_questions_admin_manage on public.assessment_questions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy documents_authenticated_read_published on public.documents for select to authenticated using (public.can_read_course(course_id));
create policy documents_admin_manage on public.documents for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy podcast_episodes_authenticated_read_published on public.podcast_episodes for select to authenticated using (status = 'published' and public.can_read_course(course_id) or public.is_admin());
create policy podcast_episodes_admin_manage on public.podcast_episodes for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy learner_profiles_select_own_or_admin on public.learner_profiles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy learner_profiles_update_own_or_admin on public.learner_profiles for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy learner_profiles_admin_manage on public.learner_profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy enrollments_select_own_or_admin on public.enrollments for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy enrollments_admin_manage on public.enrollments for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy lesson_progress_select_own_or_admin on public.lesson_progress for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy lesson_progress_admin_manage on public.lesson_progress for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy vocabulary_progress_select_own_or_admin on public.vocabulary_progress for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy vocabulary_progress_admin_manage on public.vocabulary_progress for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy review_attempts_select_own_or_admin on public.review_attempts for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy review_attempts_admin_manage on public.review_attempts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy assessment_attempts_select_own_or_admin on public.assessment_attempts for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy assessment_attempts_admin_manage on public.assessment_attempts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy learning_activity_events_select_own_or_admin on public.learning_activity_events for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy learning_activity_events_admin_manage on public.learning_activity_events for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy packages_authenticated_read_active on public.packages for select to authenticated using (status = 'active' or public.is_admin());
create policy packages_admin_manage on public.packages for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy package_courses_authenticated_read_active on public.package_courses for select to authenticated using (
  public.is_admin()
  or exists (select 1 from public.packages where packages.id = package_courses.package_id and packages.status = 'active')
);
create policy package_courses_admin_manage on public.package_courses for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy admin_alerts_admin_manage on public.admin_alerts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_activity_logs_admin_manage on public.admin_activity_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy ai_prompts_admin_manage on public.ai_prompts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy api_key_metadata_admin_manage on public.api_key_metadata for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on all tables in schema public from anon, authenticated;

grant usage on schema public to authenticated;

grant select on public.profiles, public.admin_roles, public.courses, public.course_modules, public.lessons, public.lesson_assets,
  public.vocabulary_items, public.lesson_vocabulary, public.review_questions, public.assessments, public.documents,
  public.podcast_episodes, public.learner_profiles, public.enrollments, public.lesson_progress, public.vocabulary_progress,
  public.review_attempts, public.assessment_attempts, public.learning_activity_events, public.packages, public.package_courses,
  public.admin_alerts, public.admin_activity_logs, public.ai_prompts, public.api_key_metadata to authenticated;

grant select (id, lesson_id, exercise_type, prompt, choices, order_index, created_at, updated_at) on public.lesson_exercises to authenticated;
grant select (id, question_id, label, order_index) on public.review_options to authenticated;
grant select (id, assessment_id, prompt, options, order_index, created_at, updated_at) on public.assessment_questions to authenticated;

grant update on public.profiles to authenticated;
grant insert, update, delete on public.admin_roles, public.courses, public.course_modules, public.lessons, public.lesson_assets,
  public.lesson_exercises, public.vocabulary_items, public.lesson_vocabulary, public.review_questions, public.review_options,
  public.assessments, public.assessment_questions, public.documents, public.podcast_episodes, public.learner_profiles,
  public.enrollments, public.lesson_progress, public.vocabulary_progress, public.review_attempts, public.assessment_attempts,
  public.learning_activity_events, public.packages, public.package_courses, public.admin_alerts, public.admin_activity_logs,
  public.ai_prompts, public.api_key_metadata to authenticated;

revoke all on function public.get_admin_lesson_exercises() from public;
revoke all on function public.get_admin_review_options() from public;
revoke all on function public.get_admin_assessment_questions() from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_read_course(text) to authenticated;
grant execute on function public.can_read_lesson(text) to authenticated;
grant execute on function public.get_admin_lesson_exercises() to authenticated;
grant execute on function public.get_admin_review_options() to authenticated;
grant execute on function public.get_admin_assessment_questions() to authenticated;

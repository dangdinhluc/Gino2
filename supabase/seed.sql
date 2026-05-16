begin;

-- Local-only credentials: admin@example.test / LocalAdmin123!, learner@example.test / LocalLearner123!
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@example.test',
    extensions.crypt('LocalAdmin123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"app_role":"admin"}'::jsonb,
    '{"display_name":"Local Admin"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'learner@example.test',
    extensions.crypt('LocalLearner123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"app_role":"learner"}'::jsonb,
    '{"display_name":"Sample Learner"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@example.test"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"learner@example.test"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.profiles (user_id, email, display_name, profile_role)
values
  ('11111111-1111-1111-1111-111111111111', 'admin@example.test', 'Local Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'learner@example.test', 'Sample Learner', 'learner')
on conflict (user_id) do update set
  email = excluded.email,
  display_name = excluded.display_name,
  profile_role = excluded.profile_role;

insert into public.admin_roles (user_id, role, granted_by)
values ('11111111-1111-1111-1111-111111111111', 'admin', '11111111-1111-1111-1111-111111111111')
on conflict (user_id) do update set role = excluded.role;

insert into public.courses (id, slug, title, level, status, description, theme_color, order_index, published_at)
values
  ('course-a1', 'german-a1-foundation', 'German A1 Foundation', 'A1', 'published', 'Core everyday German for first-time learners.', '#2563eb', 1, now()),
  ('course-tokutei', 'tokutei-gino-german', 'Tokutei Gino German Prep', 'A2', 'published', 'Job-readiness German with vocabulary and interview practice.', '#16a34a', 2, now())
on conflict (id) do update set
  title = excluded.title,
  level = excluded.level,
  status = excluded.status,
  description = excluded.description,
  theme_color = excluded.theme_color,
  order_index = excluded.order_index,
  published_at = excluded.published_at;

insert into public.course_modules (id, course_id, title, description, level, order_index)
values
  ('module-a1-greetings', 'course-a1', 'Greetings and Introductions', 'Start conversations, introduce yourself, and ask simple questions.', 'A1', 1),
  ('module-a2-question-order', 'course-tokutei', 'Question Order for Work', 'Practice sentence order for workplace questions.', 'A2', 1)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  order_index = excluded.order_index;

insert into public.lessons (id, course_id, module_id, title, description, lesson_type, status, duration_minutes, objectives, order_index)
values
  ('lesson-a1-greetings', 'course-a1', 'module-a1-greetings', 'Hallo und guten Tag', 'Learn basic greetings and polite introductions.', 'vocabulary', 'published', 15, array['Say hello politely', 'Introduce your name'], 1),
  ('lesson-a2-question-order', 'course-tokutei', 'module-a2-question-order', 'Question order audio prompts', 'Build workplace questions with correct German word order.', 'grammar', 'published', 20, array['Ask workplace questions', 'Place verbs correctly'], 1)
on conflict (id) do update set
  course_id = excluded.course_id,
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  lesson_type = excluded.lesson_type,
  status = excluded.status,
  duration_minutes = excluded.duration_minutes,
  objectives = excluded.objectives,
  order_index = excluded.order_index;

insert into public.lesson_assets (id, lesson_id, asset_type, title, description, external_url, metadata)
values
  ('asset-audio-1', 'lesson-a1-greetings', 'audio', 'Greeting pronunciation guide', 'Metadata-only pronunciation prompt for local development.', null, '{"durationSeconds":42}'::jsonb),
  ('asset-question-order-audio', 'lesson-a2-question-order', 'audio', 'Question order audio prompts', 'Metadata-only audio prompt set without Supabase Storage.', null, '{"durationSeconds":75}'::jsonb)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  asset_type = excluded.asset_type,
  title = excluded.title,
  description = excluded.description,
  external_url = excluded.external_url,
  metadata = excluded.metadata;

insert into public.lesson_exercises (id, lesson_id, exercise_type, prompt, answer, choices, order_index)
values
  ('exercise-a1-greeting-1', 'lesson-a1-greetings', 'multiple-choice', 'Choose the polite morning greeting.', 'Guten Morgen', '["Hallo","Guten Morgen","Tschüss"]'::jsonb, 1),
  ('exercise-a2-order-1', 'lesson-a2-question-order', 'sentence-order', 'Order the words: Sie / arbeiten / wann / ?', 'Wann arbeiten Sie?', '["Wann","arbeiten","Sie","?"]'::jsonb, 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  exercise_type = excluded.exercise_type,
  prompt = excluded.prompt,
  answer = excluded.answer,
  choices = excluded.choices,
  order_index = excluded.order_index;

insert into public.vocabulary_items (id, term, translation, example_sentence, pronunciation, audio_url, tags)
values
  ('vocab-hallo', 'Hallo', 'Hello', 'Hallo, ich heiße Anna.', 'HA-lo', null, array['greeting', 'a1']),
  ('vocab-guten-tag', 'Guten Tag', 'Good day', 'Guten Tag, wie geht es Ihnen?', 'GOO-ten tahk', null, array['greeting', 'formal']),
  ('vocab-arbeiten', 'arbeiten', 'to work', 'Wann arbeiten Sie morgen?', 'AR-bai-ten', null, array['work', 'verb'])
on conflict (id) do update set
  term = excluded.term,
  translation = excluded.translation,
  example_sentence = excluded.example_sentence,
  pronunciation = excluded.pronunciation,
  audio_url = excluded.audio_url,
  tags = excluded.tags;

insert into public.lesson_vocabulary (lesson_id, vocabulary_item_id, position)
values
  ('lesson-a1-greetings', 'vocab-hallo', 1),
  ('lesson-a1-greetings', 'vocab-guten-tag', 2),
  ('lesson-a2-question-order', 'vocab-arbeiten', 1)
on conflict (lesson_id, vocabulary_item_id) do update set position = excluded.position;

insert into public.review_questions (id, lesson_id, prompt, explanation, order_index)
values
  ('review-a1-greeting-1', 'lesson-a1-greetings', 'What does “Guten Tag” mean?', 'It is a polite daytime greeting.', 1),
  ('review-a2-order-1', 'lesson-a2-question-order', 'Which question has correct word order?', 'German wh-questions usually place the conjugated verb second.', 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  order_index = excluded.order_index;

insert into public.review_options (id, question_id, label, is_correct, order_index)
values
  ('review-a1-greeting-1-a', 'review-a1-greeting-1', 'Good day', true, 1),
  ('review-a1-greeting-1-b', 'review-a1-greeting-1', 'Good night', false, 2),
  ('review-a2-order-1-a', 'review-a2-order-1', 'Wann arbeiten Sie?', true, 1),
  ('review-a2-order-1-b', 'review-a2-order-1', 'Wann Sie arbeiten?', false, 2)
on conflict (id) do update set
  question_id = excluded.question_id,
  label = excluded.label,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;

insert into public.assessments (id, course_id, title, assessment_type, passing_score, status, order_index)
values
  ('assessment-a1-checkpoint', 'course-a1', 'A1 Greeting Checkpoint', 'quiz', 70, 'published', 1),
  ('assessment-tokutei-checkpoint', 'course-tokutei', 'Tokutei Question Order Checkpoint', 'quiz', 75, 'published', 1)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  assessment_type = excluded.assessment_type,
  passing_score = excluded.passing_score,
  status = excluded.status,
  order_index = excluded.order_index;

insert into public.assessment_questions (id, assessment_id, prompt, correct_answer, options, order_index)
values
  ('assessment-q-a1-1', 'assessment-a1-checkpoint', 'Translate: Hallo', 'Hello', '["Hello","Thanks","Goodbye"]'::jsonb, 1),
  ('assessment-q-tokutei-1', 'assessment-tokutei-checkpoint', 'Write: When do you work?', 'Wann arbeiten Sie?', '["Wann arbeiten Sie?","Sie arbeiten wann?"]'::jsonb, 1)
on conflict (id) do update set
  assessment_id = excluded.assessment_id,
  prompt = excluded.prompt,
  correct_answer = excluded.correct_answer,
  options = excluded.options,
  order_index = excluded.order_index;

insert into public.documents (id, course_id, title, document_type, external_url, summary, metadata)
values
  ('doc-a1-greetings-cheatsheet', 'course-a1', 'A1 greeting cheat sheet', 'pdf', null, 'Printable phrases for greetings and introductions.', '{"pages":2}'::jsonb),
  ('doc-tokutei-question-order', 'course-tokutei', 'Question order worksheet', 'worksheet', null, 'Practice sheet for workplace question order.', '{"pages":3}'::jsonb)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  document_type = excluded.document_type,
  external_url = excluded.external_url,
  summary = excluded.summary,
  metadata = excluded.metadata;

insert into public.podcast_episodes (id, course_id, lesson_id, title, summary, external_url, duration_minutes, status)
values
  ('podcast-a1-daily-greetings', 'course-a1', 'lesson-a1-greetings', 'Daily greeting role-play', 'Short dialogue for morning greetings.', null, 6, 'published'),
  ('podcast-tokutei-work-shift', 'course-tokutei', 'lesson-a2-question-order', 'Asking about work shifts', 'Practice asking when someone works.', null, 8, 'published')
on conflict (id) do update set
  course_id = excluded.course_id,
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  summary = excluded.summary,
  external_url = excluded.external_url,
  duration_minutes = excluded.duration_minutes,
  status = excluded.status;

insert into public.learner_profiles (id, user_id, display_name, target_level)
values ('learner-sample', '22222222-2222-2222-2222-222222222222', 'Sample Learner', 'A2')
on conflict (id) do update set
  user_id = excluded.user_id,
  display_name = excluded.display_name,
  target_level = excluded.target_level;

insert into public.enrollments (id, user_id, course_id, status, progress_percent, enrolled_at)
values
  ('enrollment-sample-a1', '22222222-2222-2222-2222-222222222222', 'course-a1', 'active', 50, now()),
  ('enrollment-sample-tokutei', '22222222-2222-2222-2222-222222222222', 'course-tokutei', 'active', 20, now())
on conflict (id) do update set
  status = excluded.status,
  progress_percent = excluded.progress_percent;

insert into public.lesson_progress (user_id, lesson_id, status, score)
values
  ('22222222-2222-2222-2222-222222222222', 'lesson-a1-greetings', 'completed', 88),
  ('22222222-2222-2222-2222-222222222222', 'lesson-a2-question-order', 'in-progress', 64)
on conflict (user_id, lesson_id) do update set
  status = excluded.status,
  score = excluded.score,
  updated_at = now();

insert into public.vocabulary_progress (user_id, vocabulary_item_id, status, last_reviewed_at)
values
  ('22222222-2222-2222-2222-222222222222', 'vocab-hallo', 'mastered', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-guten-tag', 'learning', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-arbeiten', 'new', null)
on conflict (user_id, vocabulary_item_id) do update set
  status = excluded.status,
  last_reviewed_at = excluded.last_reviewed_at;

insert into public.review_attempts (id, user_id, question_id, is_correct, answered_at)
values ('review-attempt-sample-1', '22222222-2222-2222-2222-222222222222', 'review-a1-greeting-1', true, now())
on conflict (id) do update set is_correct = excluded.is_correct;

insert into public.assessment_attempts (id, user_id, assessment_id, score, passed, attempted_at)
values ('assessment-attempt-sample-1', '22222222-2222-2222-2222-222222222222', 'assessment-a1-checkpoint', 82, true, now())
on conflict (id) do update set
  score = excluded.score,
  passed = excluded.passed;

insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
values
  ('activity-sample-1', '22222222-2222-2222-2222-222222222222', 'course-a1', 'lesson_completed', 'Completed Hallo und guten Tag', '{"lessonId":"lesson-a1-greetings"}'::jsonb),
  ('activity-sample-2', '22222222-2222-2222-2222-222222222222', 'course-tokutei', 'review_started', 'Started workplace question review', '{"lessonId":"lesson-a2-question-order"}'::jsonb)
on conflict (id) do update set
  event_type = excluded.event_type,
  event_label = excluded.event_label,
  metadata = excluded.metadata;

insert into public.packages (id, name, description, price_cents, currency, status)
values
  ('package-a1-core', 'A1 Core Bundle', 'German A1 lessons, vocabulary, review, and checkpoint exam.', 990000, 'VND', 'active'),
  ('package-tokutei-prep', 'Tokutei Prep Bundle', 'Workplace German prep with grammar and question practice.', 1490000, 'VND', 'active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  status = excluded.status;

insert into public.package_courses (package_id, course_id)
values
  ('package-a1-core', 'course-a1'),
  ('package-tokutei-prep', 'course-tokutei')
on conflict (package_id, course_id) do nothing;

insert into public.admin_alerts (id, severity, title, body, status)
values
  ('alert-seed-quality', 'info', 'Seed data ready', 'Local Supabase seed includes curated sample courses and learner progress.', 'open'),
  ('alert-audio-metadata', 'warning', 'Audio storage disabled', 'Audio and podcast records are metadata-only in phase 1.', 'open')
on conflict (id) do update set
  severity = excluded.severity,
  title = excluded.title,
  body = excluded.body,
  status = excluded.status;

insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
values
  ('admin-activity-seed-1', '11111111-1111-1111-1111-111111111111', 'seeded', 'course', 'course-a1', '{"source":"supabase/seed.sql"}'::jsonb),
  ('admin-activity-seed-2', '11111111-1111-1111-1111-111111111111', 'seeded', 'course', 'course-tokutei', '{"source":"supabase/seed.sql"}'::jsonb)
on conflict (id) do update set
  action = excluded.action,
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  metadata = excluded.metadata;

insert into public.ai_prompts (id, name, provider, purpose, status, prompt_body)
values ('ai-prompt-vocab-review', 'Vocabulary review prompt', 'gemini', 'Generate local sample review prompts from seeded vocabulary.', 'draft', 'Use only seeded vocabulary metadata; do not include private learner data.')
on conflict (id) do update set
  name = excluded.name,
  provider = excluded.provider,
  purpose = excluded.purpose,
  status = excluded.status,
  prompt_body = excluded.prompt_body;

insert into public.api_key_metadata (id, provider, owner_name, masked_key, status)
values
  ('api-key-gemini-local', 'gemini', 'Local Developer', 'not configured', 'missing'),
  ('api-key-gemini-prod', 'gemini', 'Security Owner', 'Gemini •••• D3V1', 'configured')
on conflict (id) do update set
  provider = excluded.provider,
  owner_name = excluded.owner_name,
  masked_key = excluded.masked_key,
  status = excluded.status;

commit;

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
  ('course-a1', 'tokutei-a1-foundation', 'Tokutei Foundation A1', 'A1', 'published', 'Core everyday Japanese for first-time Tokutei learners.', '#2563eb', 1, now()),
  ('course-tokutei', 'tokutei-gino-japanese', 'Tokutei Gino Japanese Prep', 'A2', 'published', 'Job-readiness Japanese with vocabulary and interview practice.', '#16a34a', 2, now())
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
  ('lesson-a1-greetings', 'course-a1', 'module-a1-greetings', 'Ohayou gozaimasu', 'Learn basic greetings and polite introductions for the first shift.', 'vocabulary', 'published', 15, array['Say hello politely', 'Introduce your name'], 1),
  ('lesson-a2-question-order', 'course-tokutei', 'module-a2-question-order', 'Question order audio prompts', 'Build workplace questions with correct Japanese word order.', 'grammar', 'published', 20, array['Ask workplace questions', 'Place verbs correctly'], 1)
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
  ('exercise-a1-greeting-1', 'lesson-a1-greetings', 'multiple-choice', 'Choose the polite morning greeting.', 'Ohayou gozaimasu', '["Konbanwa","Ohayou gozaimasu","Sayounara"]'::jsonb, 1),
  ('exercise-a2-order-1', 'lesson-a2-question-order', 'sentence-order', 'Order the words: itsu / shigoto / ga / arimasu ka / ?', 'Itsu shigoto ga arimasu ka?', '["Itsu","shigoto","ga","arimasu ka","?"]'::jsonb, 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  exercise_type = excluded.exercise_type,
  prompt = excluded.prompt,
  answer = excluded.answer,
  choices = excluded.choices,
  order_index = excluded.order_index;

insert into public.vocabulary_items (id, term, translation, example_sentence, pronunciation, audio_url, tags)
values
  ('vocab-ohayou', 'Ohayou gozaimasu', 'Good morning', 'Ohayou gozaimasu. Kyou mo yoroshiku onegaishimasu.', 'o-ha-yo go-zai-ma-su', null, array['greeting', 'a1']),
  ('vocab-houkoku', 'Houkoku', 'Report', 'Mondai ga areba, sugu houkoku shimasu.', 'hou-ko-ku', null, array['work', 'safety']),
  ('vocab-shigoto', 'Shigoto', 'Work / job', 'Itsu shigoto ga arimasu ka?', 'shi-go-to', null, array['work', 'noun'])
on conflict (id) do update set
  term = excluded.term,
  translation = excluded.translation,
  example_sentence = excluded.example_sentence,
  pronunciation = excluded.pronunciation,
  audio_url = excluded.audio_url,
  tags = excluded.tags;

insert into public.lesson_vocabulary (lesson_id, vocabulary_item_id, position)
values
  ('lesson-a1-greetings', 'vocab-ohayou', 1),
  ('lesson-a1-greetings', 'vocab-houkoku', 2),
  ('lesson-a2-question-order', 'vocab-shigoto', 1)
on conflict (lesson_id, vocabulary_item_id) do update set position = excluded.position;

insert into public.review_questions (id, lesson_id, prompt, explanation, order_index)
values
  ('review-a1-greeting-1', 'lesson-a1-greetings', 'What does "Ohayou gozaimasu" mean?', 'It is a polite morning greeting used at the start of a shift.', 1),
  ('review-a2-order-1', 'lesson-a2-question-order', 'Which question has correct word order?', 'Japanese questions usually place the question particle "ka" at the end.', 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  order_index = excluded.order_index;

insert into public.review_options (id, question_id, label, is_correct, order_index)
values
  ('review-a1-greeting-1-a', 'review-a1-greeting-1', 'Good morning', true, 1),
  ('review-a1-greeting-1-b', 'review-a1-greeting-1', 'Good night', false, 2),
  ('review-a2-order-1-a', 'review-a2-order-1', 'Itsu shigoto ga arimasu ka?', true, 1),
  ('review-a2-order-1-b', 'review-a2-order-1', 'Itsu ga shigoto arimasu ka?', false, 2)
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
  ('assessment-q-a1-1', 'assessment-a1-checkpoint', 'Translate: Ohayou gozaimasu', 'Good morning', '["Good morning","Thanks","Goodbye"]'::jsonb, 1),
  ('assessment-q-tokutei-1', 'assessment-tokutei-checkpoint', 'Write: When do you work?', 'Itsu shigoto ga arimasu ka?', '["Itsu shigoto ga arimasu ka?","Shigoto itsu arimasu ka?"]'::jsonb, 1)
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
  ('podcast-a1-daily-greetings', 'course-a1', 'lesson-a1-greetings', 'Daily greeting role-play', 'Short dialogue for morning greetings before a shift.', null, 6, 'published'),
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
  ('22222222-2222-2222-2222-222222222222', 'vocab-ohayou', 'mastered', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-houkoku', 'learning', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-shigoto', 'new', null)
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
  ('activity-sample-1', '22222222-2222-2222-2222-222222222222', 'course-a1', 'lesson_completed', 'Completed Ohayou gozaimasu', '{"lessonId":"lesson-a1-greetings"}'::jsonb),
  ('activity-sample-2', '22222222-2222-2222-2222-222222222222', 'course-tokutei', 'review_started', 'Started workplace question review', '{"lessonId":"lesson-a2-question-order"}'::jsonb)
on conflict (id) do update set
  event_type = excluded.event_type,
  event_label = excluded.event_label,
  metadata = excluded.metadata;

insert into public.packages (id, name, description, price_cents, currency, status, ai_monthly_quota)
values
  ('package-free', 'Free Starter', 'Free starter lessons for local integration tests.', 0, 'VND', 'active', 5),
  ('package-a1-core', 'A1 Core Bundle', 'Tokutei A1 lessons, vocabulary, review, and checkpoint exam.', 990000, 'VND', 'active', 20),
  ('package-tokutei-prep', 'Tokutei Prep Bundle', 'Workplace Japanese prep with grammar and question practice.', 1490000, 'VND', 'active', 40)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  status = excluded.status,
  ai_monthly_quota = excluded.ai_monthly_quota;

insert into public.package_courses (package_id, course_id)
values
  ('package-free', 'course-a1'),
  ('package-a1-core', 'course-a1'),
  ('package-tokutei-prep', 'course-tokutei')
on conflict (package_id, course_id) do nothing;

delete from public.vocabulary_items
where id in ('vocab-hallo', 'vocab-guten-tag', 'vocab-arbeiten');

insert into public.courses (id, slug, title, level, status, description, theme_color, order_index, published_at)
values
  ('course-interview', 'tokutei-interview-practice', 'Tokutei Interview Practice', 'N4', 'published', 'Mock interview lessons for self-introduction, motivation, strengths, and workplace answers.', '#db2777', 3, now()),
  ('course-kaigo', 'kaigo-workplace-japanese', 'Kaigo Workplace Japanese', 'A2', 'published', 'Caregiving Japanese for requests, body care, incident reports, and safety communication.', '#ea580c', 4, now())
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
  ('module-a1-daily-basics', 'course-a1', 'Daily Basics', 'Numbers, time, and simple self-introduction for daily life.', 'A1', 2),
  ('module-tokutei-safety', 'course-tokutei', 'Safety and Reporting', 'Report issues, confirm instructions, and use simple workplace safety phrases.', 'A2', 2),
  ('module-interview-self-intro', 'course-interview', 'Self Introduction', 'Prepare a clear personal profile and motivation answer.', 'N4', 1),
  ('module-interview-roleplay', 'course-interview', 'Interview Role-play', 'Practice common Tokutei interview questions with model answers.', 'N4', 2),
  ('module-kaigo-basic-care', 'course-kaigo', 'Basic Care Communication', 'Speak with residents politely during daily care.', 'A2', 1),
  ('module-kaigo-safety-report', 'course-kaigo', 'Safety and Incident Reports', 'Report pain, falls, changes, and urgent situations.', 'A2', 2)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  order_index = excluded.order_index;

insert into public.lessons (id, course_id, module_id, title, description, lesson_type, status, duration_minutes, objectives, order_index)
values
  ('lesson-a1-self-intro', 'course-a1', 'module-a1-daily-basics', 'Watashi wa ... desu', 'Build a simple, polite self-introduction for school, dorm, and work.', 'conversation', 'published', 18, array['Say your name and country', 'Use desu politely'], 1),
  ('lesson-a1-time-numbers', 'course-a1', 'module-a1-daily-basics', 'Time and Numbers', 'Read work times, dates, and small numbers used in daily schedules.', 'vocabulary', 'published', 22, array['Say time', 'Confirm a schedule'], 2),
  ('lesson-tokutei-reporting', 'course-tokutei', 'module-tokutei-safety', 'Reporting a Problem', 'Use short Japanese phrases to report a delay, mistake, or broken item.', 'conversation', 'published', 24, array['Report a problem', 'Ask for confirmation'], 1),
  ('lesson-tokutei-safety-signs', 'course-tokutei', 'module-tokutei-safety', 'Safety Signs and Warnings', 'Recognize common safety words used in factories, restaurants, and care work.', 'listening', 'published', 20, array['Read warning words', 'Respond to safety instructions'], 2),
  ('lesson-interview-profile', 'course-interview', 'module-interview-self-intro', 'Profile and Motivation', 'Prepare a concise interview answer about background and reason for working in Japan.', 'conversation', 'published', 25, array['Introduce your profile', 'Explain motivation'], 1),
  ('lesson-interview-strengths', 'course-interview', 'module-interview-self-intro', 'Strengths and Weaknesses', 'Answer common questions about strong points, weak points, and teamwork.', 'exam-prep', 'published', 25, array['Describe a strength', 'Give a practical example'], 2),
  ('lesson-interview-questions', 'course-interview', 'module-interview-roleplay', 'Common Interview Questions', 'Practice short answers for schedule, experience, and workplace rules.', 'exam-prep', 'published', 30, array['Answer clearly', 'Use polite endings'], 1),
  ('lesson-kaigo-body-care', 'course-kaigo', 'module-kaigo-basic-care', 'Body Care Phrases', 'Use gentle phrases for bathing, meals, movement, and daily support.', 'vocabulary', 'published', 24, array['Ask before helping', 'Use gentle requests'], 1),
  ('lesson-kaigo-requests', 'course-kaigo', 'module-kaigo-basic-care', 'Resident Requests', 'Listen to simple requests and respond politely in care settings.', 'listening', 'published', 22, array['Understand requests', 'Confirm needs'], 2),
  ('lesson-kaigo-incident-report', 'course-kaigo', 'module-kaigo-safety-report', 'Incident Report Basics', 'Report pain, falls, fever, and sudden changes with simple sentence patterns.', 'conversation', 'published', 28, array['Report symptoms', 'Escalate urgent issues'], 1)
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
  ('asset-a1-self-intro-audio', 'lesson-a1-self-intro', 'audio', 'Self-introduction audio drill', 'Short listen-and-repeat pattern for personal introduction.', null, '{"durationSeconds":95}'::jsonb),
  ('asset-a1-time-worksheet', 'lesson-a1-time-numbers', 'document', 'Time and numbers worksheet', 'Practice sheet for schedules and work times.', null, '{"pages":4}'::jsonb),
  ('asset-tokutei-reporting-audio', 'lesson-tokutei-reporting', 'audio', 'Reporting dialogue audio', 'Model dialogue for reporting a workplace issue.', null, '{"durationSeconds":130}'::jsonb),
  ('asset-tokutei-safety-cards', 'lesson-tokutei-safety-signs', 'image', 'Safety sign flashcards', 'Image metadata for safety word practice.', null, '{"cards":12}'::jsonb),
  ('asset-interview-profile-video', 'lesson-interview-profile', 'video', 'Profile answer walkthrough', 'Metadata-only video script for local interview practice.', null, '{"durationSeconds":210}'::jsonb),
  ('asset-interview-strengths-doc', 'lesson-interview-strengths', 'document', 'Strength answer template', 'Fill-in template for strengths and examples.', null, '{"pages":3}'::jsonb),
  ('asset-interview-questions-audio', 'lesson-interview-questions', 'audio', 'Interview question prompts', 'Question prompt audio for timed role-play.', null, '{"durationSeconds":180}'::jsonb),
  ('asset-kaigo-body-care-audio', 'lesson-kaigo-body-care', 'audio', 'Care phrase pronunciation', 'Gentle request phrases for daily care.', null, '{"durationSeconds":120}'::jsonb),
  ('asset-kaigo-requests-audio', 'lesson-kaigo-requests', 'audio', 'Resident request listening set', 'Listening prompts for common resident requests.', null, '{"durationSeconds":135}'::jsonb),
  ('asset-kaigo-report-doc', 'lesson-kaigo-incident-report', 'document', 'Incident report mini template', 'Simple reporting structure for symptoms and falls.', null, '{"pages":2}'::jsonb)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  asset_type = excluded.asset_type,
  title = excluded.title,
  description = excluded.description,
  external_url = excluded.external_url,
  metadata = excluded.metadata;

insert into public.lesson_exercises (id, lesson_id, exercise_type, prompt, answer, choices, order_index)
values
  ('exercise-a1-self-intro-1', 'lesson-a1-self-intro', 'fill-blank', 'Complete: Watashi wa ___ desu.', 'Luc desu', '["Luc desu","Luc ka","Luc no"]'::jsonb, 1),
  ('exercise-a1-time-1', 'lesson-a1-time-numbers', 'multiple-choice', 'What does "kuji" mean?', '9 o clock', '["7 o clock","9 o clock","Friday"]'::jsonb, 1),
  ('exercise-tokutei-reporting-1', 'lesson-tokutei-reporting', 'multiple-choice', 'Choose the phrase for "I will report immediately."', 'Sugu houkoku shimasu', '["Sugu houkoku shimasu","Mou ichido kudasai","Daijoubu desu"]'::jsonb, 1),
  ('exercise-tokutei-safety-1', 'lesson-tokutei-safety-signs', 'multiple-choice', 'What does "abunai" mean?', 'Dangerous', '["Clean","Dangerous","Finished"]'::jsonb, 1),
  ('exercise-interview-profile-1', 'lesson-interview-profile', 'fill-blank', 'Complete: Nihon de hatarakitai desu. Reason: ___', 'Keiken o tsukuritai kara desu', '["Keiken o tsukuritai kara desu","Yasumi desu","Wakarimasen"]'::jsonb, 1),
  ('exercise-interview-strengths-1', 'lesson-interview-strengths', 'multiple-choice', 'Which answer sounds like a strength?', 'Team de hataraku koto ga tokui desu', '["Team de hataraku koto ga tokui desu","Chikoku shimasu","Yasumi ga ii desu"]'::jsonb, 1),
  ('exercise-interview-questions-1', 'lesson-interview-questions', 'sentence-order', 'Order: itsu / kara / hatarakemasu / ka', 'Itsu kara hatarakemasu ka?', '["Itsu","kara","hatarakemasu","ka?"]'::jsonb, 1),
  ('exercise-kaigo-body-care-1', 'lesson-kaigo-body-care', 'multiple-choice', 'Choose a gentle request before helping.', 'Tetsudatte mo ii desu ka?', '["Tetsudatte mo ii desu ka?","Hayaku shite","Dame desu"]'::jsonb, 1),
  ('exercise-kaigo-requests-1', 'lesson-kaigo-requests', 'multiple-choice', 'What does "mizu ga hoshii desu" mean?', 'I want water', '["I want water","I am cold","I will sleep"]'::jsonb, 1),
  ('exercise-kaigo-report-1', 'lesson-kaigo-incident-report', 'multiple-choice', 'Choose the phrase for "The resident fell."', 'Riyousha san ga korobimashita', '["Riyousha san ga korobimashita","Mizu o nomimashita","Heya wa kirei desu"]'::jsonb, 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  exercise_type = excluded.exercise_type,
  prompt = excluded.prompt,
  answer = excluded.answer,
  choices = excluded.choices,
  order_index = excluded.order_index;

insert into public.vocabulary_items (id, term, translation, example_sentence, pronunciation, audio_url, tags)
values
  ('vocab-watashi', 'Watashi', 'I / me', 'Watashi wa Betonamu kara kimashita.', 'wa-ta-shi', null, array['a1', 'intro']),
  ('vocab-kuji', 'Kuji', '9 o clock', 'Kuji kara shigoto desu.', 'ku-ji', null, array['a1', 'time']),
  ('vocab-yotei', 'Yotei', 'Schedule / plan', 'Ashita no yotei o kakunin shimasu.', 'yo-tei', null, array['a1', 'time']),
  ('vocab-sugu', 'Sugu', 'Immediately', 'Sugu houkoku shimasu.', 'su-gu', null, array['work', 'report']),
  ('vocab-kakunin', 'Kakunin', 'Confirmation', 'Mou ichido kakunin shimasu.', 'ka-ku-nin', null, array['work', 'report']),
  ('vocab-abunai', 'Abunai', 'Dangerous', 'Abunai tokoro ni hairimasen.', 'a-bu-nai', null, array['safety']),
  ('vocab-chuui', 'Chuui', 'Caution', 'Chuui shite kudasai.', 'chu-u-i', null, array['safety']),
  ('vocab-hatarakitai', 'Hatarakitai', 'Want to work', 'Nihon de hatarakitai desu.', 'ha-ta-ra-ki-tai', null, array['interview']),
  ('vocab-keiken', 'Keiken', 'Experience', 'Keiken o tsukuritai desu.', 'kei-ken', null, array['interview']),
  ('vocab-tokui', 'Tokui', 'Strong at / good at', 'Team de hataraku koto ga tokui desu.', 'to-ku-i', null, array['interview']),
  ('vocab-yowai', 'Yowai', 'Weak / not strong', 'Kanji ga sukoshi yowai desu.', 'yo-wai', null, array['interview']),
  ('vocab-hatarakemasu', 'Hatarakemasu', 'Can work', 'Itsu kara hatarakemasu ka?', 'ha-ta-ra-ke-ma-su', null, array['interview', 'work']),
  ('vocab-tetsudau', 'Tetsudau', 'To help', 'Tetsudatte mo ii desu ka?', 'te-tsu-dau', null, array['kaigo']),
  ('vocab-nyuyoku', 'Nyuyoku', 'Bathing care', 'Nyuyoku no junbi o shimasu.', 'nyu-yo-ku', null, array['kaigo']),
  ('vocab-mizu', 'Mizu', 'Water', 'Mizu ga hoshii desu ka?', 'mi-zu', null, array['kaigo', 'request']),
  ('vocab-samui', 'Samui', 'Cold', 'Samui desu ka?', 'sa-mu-i', null, array['kaigo', 'request']),
  ('vocab-korobu', 'Korobu', 'To fall', 'Riyousha san ga korobimashita.', 'ko-ro-bu', null, array['kaigo', 'incident']),
  ('vocab-itami', 'Itami', 'Pain', 'Itami ga arimasu ka?', 'i-ta-mi', null, array['kaigo', 'incident'])
on conflict (id) do update set
  term = excluded.term,
  translation = excluded.translation,
  example_sentence = excluded.example_sentence,
  pronunciation = excluded.pronunciation,
  audio_url = excluded.audio_url,
  tags = excluded.tags;

insert into public.lesson_vocabulary (lesson_id, vocabulary_item_id, position)
values
  ('lesson-a1-self-intro', 'vocab-watashi', 1),
  ('lesson-a1-self-intro', 'vocab-hatarakitai', 2),
  ('lesson-a1-time-numbers', 'vocab-kuji', 1),
  ('lesson-a1-time-numbers', 'vocab-yotei', 2),
  ('lesson-tokutei-reporting', 'vocab-sugu', 1),
  ('lesson-tokutei-reporting', 'vocab-kakunin', 2),
  ('lesson-tokutei-safety-signs', 'vocab-abunai', 1),
  ('lesson-tokutei-safety-signs', 'vocab-chuui', 2),
  ('lesson-interview-profile', 'vocab-hatarakitai', 1),
  ('lesson-interview-profile', 'vocab-keiken', 2),
  ('lesson-interview-strengths', 'vocab-tokui', 1),
  ('lesson-interview-strengths', 'vocab-yowai', 2),
  ('lesson-interview-questions', 'vocab-hatarakemasu', 1),
  ('lesson-interview-questions', 'vocab-yotei', 2),
  ('lesson-kaigo-body-care', 'vocab-tetsudau', 1),
  ('lesson-kaigo-body-care', 'vocab-nyuyoku', 2),
  ('lesson-kaigo-requests', 'vocab-mizu', 1),
  ('lesson-kaigo-requests', 'vocab-samui', 2),
  ('lesson-kaigo-incident-report', 'vocab-korobu', 1),
  ('lesson-kaigo-incident-report', 'vocab-itami', 2)
on conflict (lesson_id, vocabulary_item_id) do update set position = excluded.position;

insert into public.review_questions (id, lesson_id, prompt, explanation, order_index)
values
  ('review-a1-self-intro-1', 'lesson-a1-self-intro', 'Which phrase means "I am ..." in a polite introduction?', '"Watashi wa ... desu" is the simple polite pattern.', 1),
  ('review-a1-time-1', 'lesson-a1-time-numbers', 'What does "Kuji kara shigoto desu" mean?', '"Kuji" means 9 o clock and "kara" means from.', 1),
  ('review-tokutei-reporting-1', 'lesson-tokutei-reporting', 'Which phrase means "I will report immediately"?', '"Sugu" means immediately and "houkoku shimasu" means report.', 1),
  ('review-tokutei-safety-1', 'lesson-tokutei-safety-signs', 'What should you do when you hear "Chuui shite kudasai"?', 'It means please be careful or pay attention.', 1),
  ('review-interview-profile-1', 'lesson-interview-profile', 'Which answer gives a clear motivation?', 'Interview answers should connect work in Japan with learning and contribution.', 1),
  ('review-interview-strengths-1', 'lesson-interview-strengths', 'Which phrase describes a strength?', '"Tokui desu" means being good at something.', 1),
  ('review-interview-questions-1', 'lesson-interview-questions', 'Which question asks "From when can you work"?', 'The pattern is "Itsu kara ... ka?" for from when.', 1),
  ('review-kaigo-body-care-1', 'lesson-kaigo-body-care', 'Which phrase asks permission before helping?', 'Care communication should ask before touching or assisting.', 1),
  ('review-kaigo-requests-1', 'lesson-kaigo-requests', 'What does "Mizu ga hoshii desu" mean?', '"Hoshii" means want.', 1),
  ('review-kaigo-report-1', 'lesson-kaigo-incident-report', 'Which phrase reports that a resident fell?', '"Korobimashita" is the past polite form of fall.', 1)
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  order_index = excluded.order_index;

insert into public.review_options (id, question_id, label, is_correct, order_index)
values
  ('review-a1-self-intro-1-a', 'review-a1-self-intro-1', 'Watashi wa Luc desu', true, 1),
  ('review-a1-self-intro-1-b', 'review-a1-self-intro-1', 'Luc wa ka desu', false, 2),
  ('review-a1-time-1-a', 'review-a1-time-1', 'Work starts from 9 o clock', true, 1),
  ('review-a1-time-1-b', 'review-a1-time-1', 'Today is Friday', false, 2),
  ('review-tokutei-reporting-1-a', 'review-tokutei-reporting-1', 'Sugu houkoku shimasu', true, 1),
  ('review-tokutei-reporting-1-b', 'review-tokutei-reporting-1', 'Sugu yasumimasu', false, 2),
  ('review-tokutei-safety-1-a', 'review-tokutei-safety-1', 'Pay attention and be careful', true, 1),
  ('review-tokutei-safety-1-b', 'review-tokutei-safety-1', 'Take a break now', false, 2),
  ('review-interview-profile-1-a', 'review-interview-profile-1', 'Nihon de keiken o tsukuritai kara desu', true, 1),
  ('review-interview-profile-1-b', 'review-interview-profile-1', 'Wakarimasen dake desu', false, 2),
  ('review-interview-strengths-1-a', 'review-interview-strengths-1', 'Team de hataraku koto ga tokui desu', true, 1),
  ('review-interview-strengths-1-b', 'review-interview-strengths-1', 'Mainichi chikoku shimasu', false, 2),
  ('review-interview-questions-1-a', 'review-interview-questions-1', 'Itsu kara hatarakemasu ka?', true, 1),
  ('review-interview-questions-1-b', 'review-interview-questions-1', 'Doko hatarakemasu itsu?', false, 2),
  ('review-kaigo-body-care-1-a', 'review-kaigo-body-care-1', 'Tetsudatte mo ii desu ka?', true, 1),
  ('review-kaigo-body-care-1-b', 'review-kaigo-body-care-1', 'Hayaku kudasai', false, 2),
  ('review-kaigo-requests-1-a', 'review-kaigo-requests-1', 'I want water', true, 1),
  ('review-kaigo-requests-1-b', 'review-kaigo-requests-1', 'I am sleepy', false, 2),
  ('review-kaigo-report-1-a', 'review-kaigo-report-1', 'Riyousha san ga korobimashita', true, 1),
  ('review-kaigo-report-1-b', 'review-kaigo-report-1', 'Riyousha san ga tabemashita', false, 2)
on conflict (id) do update set
  question_id = excluded.question_id,
  label = excluded.label,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;

insert into public.assessments (id, course_id, title, assessment_type, passing_score, status, order_index)
values
  ('assessment-a1-daily-checkpoint', 'course-a1', 'A1 Daily Basics Checkpoint', 'quiz', 70, 'published', 2),
  ('assessment-tokutei-safety-checkpoint', 'course-tokutei', 'Workplace Safety Checkpoint', 'quiz', 75, 'published', 2),
  ('assessment-interview-mock-1', 'course-interview', 'Interview Mock Test 1', 'mock-interview', 80, 'published', 1),
  ('assessment-kaigo-checkpoint', 'course-kaigo', 'Kaigo Communication Checkpoint', 'quiz', 75, 'published', 1)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  assessment_type = excluded.assessment_type,
  passing_score = excluded.passing_score,
  status = excluded.status,
  order_index = excluded.order_index;

insert into public.assessment_questions (id, assessment_id, prompt, correct_answer, options, order_index)
values
  ('assessment-q-a1-daily-1', 'assessment-a1-daily-checkpoint', 'Translate: Watashi wa Luc desu', 'I am Luc', '["I am Luc","Luc is where","Good morning"]'::jsonb, 1),
  ('assessment-q-a1-daily-2', 'assessment-a1-daily-checkpoint', 'Translate: Kuji kara shigoto desu', 'Work starts from 9 o clock', '["Work starts from 9 o clock","I finish at 9","Today is holiday"]'::jsonb, 2),
  ('assessment-q-tokutei-safety-1', 'assessment-tokutei-safety-checkpoint', 'Choose: I will confirm once more.', 'Mou ichido kakunin shimasu', '["Mou ichido kakunin shimasu","Sugu kaerimasu","Abunai desu ka"]'::jsonb, 1),
  ('assessment-q-tokutei-safety-2', 'assessment-tokutei-safety-checkpoint', 'What does "abunai" mean?', 'Dangerous', '["Dangerous","Clean","Finished"]'::jsonb, 2),
  ('assessment-q-interview-1', 'assessment-interview-mock-1', 'Pick the strongest motivation answer.', 'Nihon de keiken o tsukuritai kara desu', '["Nihon de keiken o tsukuritai kara desu","Wakarimasen","Yasumi ga ii desu"]'::jsonb, 1),
  ('assessment-q-interview-2', 'assessment-interview-mock-1', 'Ask: From when can you work?', 'Itsu kara hatarakemasu ka?', '["Itsu kara hatarakemasu ka?","Dare kara hatarakemasu?","Hataraku itsu?"]'::jsonb, 2),
  ('assessment-q-kaigo-1', 'assessment-kaigo-checkpoint', 'Choose a gentle phrase before helping.', 'Tetsudatte mo ii desu ka?', '["Tetsudatte mo ii desu ka?","Dame desu","Hayaku shite"]'::jsonb, 1),
  ('assessment-q-kaigo-2', 'assessment-kaigo-checkpoint', 'Report: The resident fell.', 'Riyousha san ga korobimashita', '["Riyousha san ga korobimashita","Riyousha san ga nemashita","Mizu ga hoshii desu"]'::jsonb, 2)
on conflict (id) do update set
  assessment_id = excluded.assessment_id,
  prompt = excluded.prompt,
  correct_answer = excluded.correct_answer,
  options = excluded.options,
  order_index = excluded.order_index;

insert into public.documents (id, course_id, title, document_type, external_url, summary, metadata)
values
  ('doc-a1-time-table', 'course-a1', 'A1 time and number table', 'worksheet', null, 'Printable chart for time, dates, and work schedule phrases.', '{"pages":4}'::jsonb),
  ('doc-tokutei-safety-phrases', 'course-tokutei', 'Workplace safety phrase list', 'pdf', null, 'Safety, confirmation, and report phrases for daily work.', '{"pages":5}'::jsonb),
  ('doc-interview-answer-bank', 'course-interview', 'Interview answer bank', 'pdf', null, 'Model answers for profile, motivation, strengths, and schedule questions.', '{"pages":6}'::jsonb),
  ('doc-kaigo-report-template', 'course-kaigo', 'Kaigo incident report mini guide', 'worksheet', null, 'Simple template for reporting pain, falls, fever, and changes.', '{"pages":4}'::jsonb)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  document_type = excluded.document_type,
  external_url = excluded.external_url,
  summary = excluded.summary,
  metadata = excluded.metadata;

insert into public.podcast_episodes (id, course_id, lesson_id, title, summary, external_url, duration_minutes, status)
values
  ('podcast-a1-self-intro', 'course-a1', 'lesson-a1-self-intro', 'Self-introduction shadowing', 'Repeat a short self-introduction at natural speed.', null, 7, 'published'),
  ('podcast-tokutei-reporting', 'course-tokutei', 'lesson-tokutei-reporting', 'Problem reporting role-play', 'Practice reporting a broken item and confirming next steps.', null, 9, 'published'),
  ('podcast-interview-mock', 'course-interview', 'lesson-interview-questions', 'Timed interview prompts', 'Short prompts with pause time for speaking practice.', null, 12, 'published'),
  ('podcast-kaigo-requests', 'course-kaigo', 'lesson-kaigo-requests', 'Resident request listening', 'Listen and answer common care requests.', null, 10, 'published')
on conflict (id) do update set
  course_id = excluded.course_id,
  lesson_id = excluded.lesson_id,
  title = excluded.title,
  summary = excluded.summary,
  external_url = excluded.external_url,
  duration_minutes = excluded.duration_minutes,
  status = excluded.status;

insert into public.enrollments (id, user_id, course_id, status, progress_percent, enrolled_at)
values
  ('enrollment-sample-interview', '22222222-2222-2222-2222-222222222222', 'course-interview', 'active', 35, now()),
  ('enrollment-sample-kaigo', '22222222-2222-2222-2222-222222222222', 'course-kaigo', 'active', 18, now())
on conflict (id) do update set
  status = excluded.status,
  progress_percent = excluded.progress_percent;

insert into public.lesson_progress (user_id, lesson_id, status, score)
values
  ('22222222-2222-2222-2222-222222222222', 'lesson-a1-self-intro', 'completed', 85),
  ('22222222-2222-2222-2222-222222222222', 'lesson-a1-time-numbers', 'in-progress', 55),
  ('22222222-2222-2222-2222-222222222222', 'lesson-tokutei-reporting', 'in-progress', 62),
  ('22222222-2222-2222-2222-222222222222', 'lesson-interview-profile', 'completed', 78),
  ('22222222-2222-2222-2222-222222222222', 'lesson-kaigo-body-care', 'in-progress', 40)
on conflict (user_id, lesson_id) do update set
  status = excluded.status,
  score = excluded.score,
  updated_at = now();

insert into public.vocabulary_progress (user_id, vocabulary_item_id, status, last_reviewed_at)
values
  ('22222222-2222-2222-2222-222222222222', 'vocab-watashi', 'mastered', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-kuji', 'learning', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-sugu', 'learning', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-abunai', 'new', null),
  ('22222222-2222-2222-2222-222222222222', 'vocab-hatarakitai', 'mastered', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-tokui', 'learning', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-tetsudau', 'learning', now()),
  ('22222222-2222-2222-2222-222222222222', 'vocab-korobu', 'new', null)
on conflict (user_id, vocabulary_item_id) do update set
  status = excluded.status,
  last_reviewed_at = excluded.last_reviewed_at;

insert into public.review_attempts (id, user_id, question_id, is_correct, answered_at)
values
  ('review-attempt-sample-2', '22222222-2222-2222-2222-222222222222', 'review-a1-self-intro-1', true, now()),
  ('review-attempt-sample-3', '22222222-2222-2222-2222-222222222222', 'review-interview-profile-1', true, now()),
  ('review-attempt-sample-4', '22222222-2222-2222-2222-222222222222', 'review-kaigo-body-care-1', false, now())
on conflict (id) do update set is_correct = excluded.is_correct;

insert into public.assessment_attempts (id, user_id, assessment_id, score, passed, attempted_at)
values
  ('assessment-attempt-sample-2', '22222222-2222-2222-2222-222222222222', 'assessment-a1-daily-checkpoint', 76, true, now()),
  ('assessment-attempt-sample-3', '22222222-2222-2222-2222-222222222222', 'assessment-interview-mock-1', 72, false, now())
on conflict (id) do update set
  score = excluded.score,
  passed = excluded.passed;

insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
values
  ('activity-sample-3', '22222222-2222-2222-2222-222222222222', 'course-interview', 'lesson_completed', 'Completed interview profile practice', '{"lessonId":"lesson-interview-profile"}'::jsonb),
  ('activity-sample-4', '22222222-2222-2222-2222-222222222222', 'course-kaigo', 'lesson_started', 'Started body care phrases', '{"lessonId":"lesson-kaigo-body-care"}'::jsonb)
on conflict (id) do update set
  event_type = excluded.event_type,
  event_label = excluded.event_label,
  metadata = excluded.metadata;

insert into public.packages (id, name, description, price_cents, currency, status)
values
  ('package-interview-practice', 'Interview Practice Bundle', 'Mock interview lessons, answer bank, role-play podcasts, and checkpoint exam.', 1290000, 'VND', 'active'),
  ('package-kaigo-workplace', 'Kaigo Workplace Bundle', 'Caregiving Japanese lessons with resident requests and incident report drills.', 1590000, 'VND', 'active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  status = excluded.status;

insert into public.package_courses (package_id, course_id)
values
  ('package-a1-core', 'course-interview'),
  ('package-tokutei-prep', 'course-kaigo'),
  ('package-interview-practice', 'course-interview'),
  ('package-kaigo-workplace', 'course-kaigo')
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

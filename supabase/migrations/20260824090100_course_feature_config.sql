begin;

alter table public.courses
  add column if not exists feature_config jsonb not null default '{}'::jsonb;

comment on column public.courses.feature_config is
  'Optional capability flags: vocabulary, documents, practice, games, exams. Missing keys default to enabled.';

commit;

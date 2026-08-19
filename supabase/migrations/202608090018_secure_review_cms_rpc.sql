-- Review options carry scoring truth. Only the server-side CMS RPC may replace
-- them, ensuring every published question has exactly one correct option.
drop policy if exists review_questions_content_write on public.review_questions;
drop policy if exists review_options_content_write on public.review_options;
revoke insert, update, delete on public.review_questions, public.review_options from authenticated;

create or replace function public.admin_save_review_question(
  target_question_id text,
  target_lesson_id text,
  target_prompt text,
  target_explanation text,
  target_order_index integer,
  target_options text[],
  target_correct_index integer
)
returns text
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  normalized_options text[];
  saved_question_id text := nullif(btrim(target_question_id), '');
begin
  if not public.has_staff_permission('content.write') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  if nullif(btrim(target_lesson_id), '') is null or nullif(btrim(target_prompt), '') is null then raise exception 'REVIEW_QUESTION_REQUIRED_FIELDS' using errcode = '22023'; end if;
  if coalesce(target_order_index, 0) < 0 then raise exception 'INVALID_ORDER_INDEX' using errcode = '22023'; end if;
  perform 1 from public.lessons as l where l.id = target_lesson_id;
  if not found then raise exception 'LESSON_NOT_FOUND' using errcode = '22023'; end if;
  select array_agg(btrim(value) order by ordinality) into normalized_options
  from unnest(coalesce(target_options, '{}'::text[])) with ordinality as input(value, ordinality)
  where btrim(value) <> '';
  if coalesce(cardinality(normalized_options), 0) < 2 or coalesce(cardinality(normalized_options), 0) > 8 then raise exception 'REVIEW_OPTIONS_MUST_BE_2_TO_8' using errcode = '22023'; end if;
  if target_correct_index is null or target_correct_index < 0 or target_correct_index >= cardinality(normalized_options) then raise exception 'INVALID_CORRECT_OPTION' using errcode = '22023'; end if;
  if saved_question_id is null then saved_question_id := extensions.gen_random_uuid()::text; end if;
  insert into public.review_questions (id, lesson_id, prompt, explanation, order_index)
  values (saved_question_id, target_lesson_id, btrim(target_prompt), nullif(btrim(target_explanation), ''), coalesce(target_order_index, 0))
  on conflict (id) do update set lesson_id = excluded.lesson_id, prompt = excluded.prompt, explanation = excluded.explanation, order_index = excluded.order_index;
  delete from public.review_options as ro where ro.question_id = saved_question_id;
  insert into public.review_options (id, question_id, label, is_correct, order_index)
  select extensions.gen_random_uuid()::text, saved_question_id, option_label, false, ordinality - 1
  from unnest(normalized_options) with ordinality as options(option_label, ordinality);
  update public.review_options as ro
  set is_correct = true
  where ro.question_id = saved_question_id and ro.order_index = target_correct_index;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'review_question_saved', 'review_question', saved_question_id, jsonb_build_object('lessonId', target_lesson_id, 'optionCount', cardinality(normalized_options)));
  return saved_question_id;
end;
$$;

create or replace function public.admin_delete_review_question(target_question_id text)
returns void
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if not public.has_staff_permission('content.write') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  delete from public.review_questions as rq where rq.id = target_question_id;
  if not found then raise exception 'REVIEW_QUESTION_NOT_FOUND' using errcode = '22023'; end if;
  insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id)
  values (extensions.gen_random_uuid()::text, auth.uid(), 'review_question_deleted', 'review_question', target_question_id);
end;
$$;

grant execute on function public.admin_save_review_question(text, text, text, text, integer, text[], integer), public.admin_delete_review_question(text) to authenticated;

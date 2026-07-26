create or replace function public.get_course_review_questions(target_course_id text)
returns table (
  id text,
  prompt text,
  explanation text,
  source text,
  options jsonb,
  answer text
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select
    review_questions.id,
    review_questions.prompt,
    review_questions.explanation,
    lessons.title,
    jsonb_agg(review_options.label order by review_options.order_index),
    max(review_options.label) filter (where review_options.is_correct)
  from public.review_questions
  join public.lessons on lessons.id = review_questions.lesson_id
  join public.review_options on review_options.question_id = review_questions.id
  where lessons.course_id = target_course_id
    and public.can_read_course(target_course_id)
  group by review_questions.id, lessons.title
  order by min(review_questions.order_index);
$$;

revoke all on function public.get_course_review_questions(text) from public;
grant execute on function public.get_course_review_questions(text) to authenticated;

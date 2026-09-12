-- Hotfix: validate_assessment_answers used jsonb_object_length(), which does not
-- exist in PostgreSQL. submit_assessment_v2 calls it on every submit, so learners
-- could not submit any exam. Replace with a valid object-count expression.
create or replace function public.validate_assessment_answers(target_assessment_id text, target_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if jsonb_typeof(target_answers) <> 'object'
    or (select count(*) from jsonb_object_keys(target_answers)) > 200
    or coalesce((select sum(char_length(value)) from jsonb_each_text(target_answers)), 0) > 200000
    or exists (
      select 1
      from jsonb_each_text(target_answers) as submitted
      where char_length(submitted.value) > 1000
        or not exists (
          select 1 from public.assessment_questions as q
          where q.id = submitted.key and q.assessment_id = target_assessment_id
        )
    ) then
    raise exception 'INVALID_ASSESSMENT_ANSWERS' using errcode = '22023';
  end if;
end;
$$;
revoke all on function public.validate_assessment_answers(text, jsonb) from public;

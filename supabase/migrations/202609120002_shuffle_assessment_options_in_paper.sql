-- Every seeded assessment stored the correct option first: 490/546 questions had
-- correct_answer at options[0], including all mock exams at 100%. A learner could
-- pass by always picking the first option. The paper RPC returned options in
-- stored order, so the bias leaked straight to the UI.
--
-- Shuffle option order server-side with a deterministic per-(question, learner)
-- sort key. Ordering is stable across refetches for one learner, differs between
-- learners, and cannot be gamed: nothing about the correct option is exposed, and
-- scoring still matches the submitted option text against correct_answer.
create or replace function public.get_assessment_paper_v2(target_assessment_id text)
returns table (
  assessment_id text,
  course_id text,
  title text,
  assessment_type text,
  passing_score integer,
  config jsonb,
  questions jsonb
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  target_assessment public.assessments%rowtype;
  learner_key text := coalesce(auth.uid()::text, '');
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select a.* into target_assessment
  from public.assessments as a
  where a.id = target_assessment_id
    and a.status = 'published';

  if target_assessment.id is null
    or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  return query
  select
    target_assessment.id,
    target_assessment.course_id,
    target_assessment.title,
    target_assessment.assessment_type,
    target_assessment.passing_score,
    coalesce(target_assessment.config, '{}'::jsonb),
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', q.id,
          'assessmentId', q.assessment_id,
          'prompt', q.prompt,
          'options', coalesce((
            select jsonb_agg(shuffled.option_text order by shuffled.sort_key)
            from (
              select opt.option_text,
                     md5(q.id || ':' || learner_key || ':' || opt.option_text) as sort_key
              from jsonb_array_elements_text(q.options) as opt(option_text)
            ) as shuffled
          ), '[]'::jsonb),
          'orderIndex', q.order_index,
          'metadata', jsonb_build_object(
            'domain', q.metadata->>'domain',
            'section', q.metadata->>'section',
            'kind', q.metadata->>'kind',
            'points', case
              when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                then (q.metadata->>'points')::integer
              else null
            end
          )
        )
        order by q.order_index
      )
      from public.assessment_questions as q
      where q.assessment_id = target_assessment_id
    ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_assessment_paper_v2(text) from public, anon;
grant execute on function public.get_assessment_paper_v2(text) to authenticated, service_role;

comment on function public.get_assessment_paper_v2(text) is
  'Learner-safe assessment paper. Option order is shuffled deterministically per (question, learner) so the stored answer position never leaks.';

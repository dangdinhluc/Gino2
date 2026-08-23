begin;

-- Generic assessment configuration. These columns are intentionally JSONB so
-- each course can define its own scoring/timing/strategy rules without
-- hardcoding course-specific behavior in the application.
alter table public.review_questions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.assessment_questions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.assessments
  add column if not exists config jsonb not null default '{}'::jsonb;

-- Safe learner paper payload: never returns correct_answer, explanation, or
-- strategy hints before the attempt has been submitted.
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
          'options', q.options,
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

-- V2 submission keeps existing prerequisite behavior but supports generic
-- weighted-question scoring. Legacy assessments remain percentage-based.
create or replace function public.submit_assessment_v2(
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
  attempted_at timestamptz,
  points_earned integer,
  total_points integer,
  passing_points integer,
  section_breakdown jsonb
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_assessment public.assessments%rowtype;
  prev_assessment_id text;
  scoring_mode text;
  configured_total_points integer;
  configured_passing_points integer;
  total_count integer;
  correct_count integer;
  calculated_total_points integer;
  calculated_points_earned integer;
  final_points_earned integer;
  final_total_points integer;
  final_passing_points integer;
  final_score integer;
  final_passed boolean;
  final_section_breakdown jsonb := '[]'::jsonb;
  final_attempt_id text := extensions.gen_random_uuid()::text;
  attempt_time timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if jsonb_typeof(target_answers) <> 'object' then
    raise exception 'INVALID_ASSESSMENT_ANSWERS' using errcode = '22023';
  end if;

  select a.* into target_assessment
  from public.assessments as a
  where a.id = target_assessment_id
    and a.status = 'published';

  if target_assessment.id is null
    or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  -- Preserve the existing course prerequisite chain.
  select a.id into prev_assessment_id
  from public.assessments as a
  where a.course_id = target_assessment.course_id
    and a.status = 'published'
    and a.order_index < target_assessment.order_index
  order by a.order_index desc
  limit 1;

  if prev_assessment_id is not null
    and not exists (
      select 1
      from public.assessment_attempts as att
      where att.assessment_id = prev_assessment_id
        and att.user_id = auth.uid()
        and att.passed = true
    ) then
    raise exception 'ASSESSMENT_LOCKED' using errcode = '42501';
  end if;

  scoring_mode := coalesce(nullif(target_assessment.config->>'scoringMode', ''), 'equal_percentage');
  configured_total_points := case
    when coalesce(target_assessment.config->>'totalPoints', '') ~ '^\d+$'
      then (target_assessment.config->>'totalPoints')::integer
    else null
  end;
  configured_passing_points := case
    when coalesce(target_assessment.config->>'passingPoints', '') ~ '^\d+$'
      then (target_assessment.config->>'passingPoints')::integer
    else null
  end;

  select
    count(*)::integer,
    count(*) filter (
      where trim(coalesce(submitted.value, '')) = trim(q.correct_answer)
    )::integer,
    coalesce(sum(
      case
        when scoring_mode = 'weighted_questions' then
          case
            when coalesce(q.metadata->>'points', '') ~ '^\d+$'
              then greatest((q.metadata->>'points')::integer, 0)
            else 1
          end
        else 1
      end
    ), 0)::integer,
    coalesce(sum(
      case
        when trim(coalesce(submitted.value, '')) = trim(q.correct_answer) then
          case
            when scoring_mode = 'weighted_questions' then
              case
                when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                  then greatest((q.metadata->>'points')::integer, 0)
                else 1
              end
            else 1
          end
        else 0
      end
    ), 0)::integer
  into total_count, correct_count, calculated_total_points, calculated_points_earned
  from public.assessment_questions as q
  left join jsonb_each_text(target_answers) as submitted(key, value)
    on submitted.key = q.id
  where q.assessment_id = target_assessment_id;

  if total_count = 0 then
    raise exception 'ASSESSMENT_EMPTY' using errcode = 'P0001';
  end if;

  if scoring_mode = 'weighted_questions' then
    final_points_earned := calculated_points_earned;
    final_total_points := coalesce(nullif(configured_total_points, 0), calculated_total_points);
    final_passing_points := coalesce(
      configured_passing_points,
      ceil(final_total_points * target_assessment.passing_score / 100.0)::integer
    );
    final_score := round(100.0 * final_points_earned / nullif(final_total_points, 0));
    final_passed := final_points_earned >= final_passing_points;
  else
    final_points_earned := correct_count;
    final_total_points := total_count;
    final_passing_points := ceil(total_count * target_assessment.passing_score / 100.0)::integer;
    final_score := round(100.0 * correct_count / total_count);
    final_passed := final_score >= target_assessment.passing_score;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'domain', grouped.domain_name,
      'section', grouped.section_name,
      'questions', grouped.question_count,
      'correctAnswers', grouped.correct_count,
      'pointsEarned', grouped.points_earned,
      'totalPoints', grouped.total_points
    ) order by grouped.first_order
  ), '[]'::jsonb)
  into final_section_breakdown
  from (
    select
      coalesce(nullif(q.metadata->>'domain', ''), 'Tổng hợp') as domain_name,
      coalesce(nullif(q.metadata->>'section', ''), 'Chung') as section_name,
      min(q.order_index) as first_order,
      count(*)::integer as question_count,
      count(*) filter (
        where trim(coalesce(submitted.value, '')) = trim(q.correct_answer)
      )::integer as correct_count,
      coalesce(sum(
        case
          when trim(coalesce(submitted.value, '')) = trim(q.correct_answer) then
            case
              when scoring_mode = 'weighted_questions' then
                case
                  when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                    then greatest((q.metadata->>'points')::integer, 0)
                  else 1
                end
              else 1
            end
          else 0
        end
      ), 0)::integer as points_earned,
      coalesce(sum(
        case
          when scoring_mode = 'weighted_questions' then
            case
              when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                then greatest((q.metadata->>'points')::integer, 0)
              else 1
            end
          else 1
        end
      ), 0)::integer as total_points
    from public.assessment_questions as q
    left join jsonb_each_text(target_answers) as submitted(key, value)
      on submitted.key = q.id
    where q.assessment_id = target_assessment_id
    group by
      coalesce(nullif(q.metadata->>'domain', ''), 'Tổng hợp'),
      coalesce(nullif(q.metadata->>'section', ''), 'Chung')
  ) as grouped;

  insert into public.assessment_attempts (
    id, user_id, assessment_id, score, passed, attempted_at, answers
  )
  values (
    final_attempt_id, auth.uid(), target_assessment_id, final_score,
    final_passed, attempt_time, target_answers
  );

  insert into public.learning_activity_events (
    id, user_id, course_id, event_type, event_label, metadata
  )
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_assessment.course_id,
    'assessment_submitted',
    target_assessment.title,
    jsonb_build_object(
      'assessmentId', target_assessment_id,
      'score', final_score,
      'passed', final_passed,
      'pointsEarned', final_points_earned,
      'totalPoints', final_total_points
    )
  );

  return query
  select
    final_attempt_id,
    target_assessment_id,
    final_score,
    final_passed,
    total_count,
    correct_count,
    attempt_time,
    final_points_earned,
    final_total_points,
    final_passing_points,
    final_section_breakdown;
end;
$$;

create or replace function public.get_latest_assessment_result_v2(target_assessment_id text)
returns table (
  attempt_id text,
  assessment_id text,
  score integer,
  passed boolean,
  total_questions integer,
  correct_answers integer,
  attempted_at timestamptz,
  points_earned integer,
  total_points integer,
  passing_points integer,
  section_breakdown jsonb
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  target_assessment public.assessments%rowtype;
  latest_attempt public.assessment_attempts%rowtype;
  scoring_mode text;
  configured_total_points integer;
  configured_passing_points integer;
  total_count integer;
  correct_count integer;
  calculated_total_points integer;
  calculated_points_earned integer;
  final_points_earned integer;
  final_total_points integer;
  final_passing_points integer;
  final_score integer;
  final_passed boolean;
  final_section_breakdown jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select a.* into target_assessment
  from public.assessments as a
  where a.id = target_assessment_id;

  if target_assessment.id is null
    or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  select att.* into latest_attempt
  from public.assessment_attempts as att
  where att.assessment_id = target_assessment_id
    and att.user_id = auth.uid()
  order by att.attempted_at desc
  limit 1;

  if latest_attempt.id is null then
    return;
  end if;

  scoring_mode := coalesce(nullif(target_assessment.config->>'scoringMode', ''), 'equal_percentage');
  configured_total_points := case
    when coalesce(target_assessment.config->>'totalPoints', '') ~ '^\d+$'
      then (target_assessment.config->>'totalPoints')::integer
    else null
  end;
  configured_passing_points := case
    when coalesce(target_assessment.config->>'passingPoints', '') ~ '^\d+$'
      then (target_assessment.config->>'passingPoints')::integer
    else null
  end;

  select
    count(*)::integer,
    count(*) filter (
      where trim(coalesce(latest_attempt.answers->>q.id, '')) = trim(q.correct_answer)
    )::integer,
    coalesce(sum(
      case
        when scoring_mode = 'weighted_questions' then
          case
            when coalesce(q.metadata->>'points', '') ~ '^\d+$'
              then greatest((q.metadata->>'points')::integer, 0)
            else 1
          end
        else 1
      end
    ), 0)::integer,
    coalesce(sum(
      case
        when trim(coalesce(latest_attempt.answers->>q.id, '')) = trim(q.correct_answer) then
          case
            when scoring_mode = 'weighted_questions' then
              case
                when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                  then greatest((q.metadata->>'points')::integer, 0)
                else 1
              end
            else 1
          end
        else 0
      end
    ), 0)::integer
  into total_count, correct_count, calculated_total_points, calculated_points_earned
  from public.assessment_questions as q
  where q.assessment_id = target_assessment_id;

  if scoring_mode = 'weighted_questions' then
    final_points_earned := calculated_points_earned;
    final_total_points := coalesce(nullif(configured_total_points, 0), calculated_total_points);
    final_passing_points := coalesce(
      configured_passing_points,
      ceil(final_total_points * target_assessment.passing_score / 100.0)::integer
    );
    final_score := round(100.0 * final_points_earned / nullif(final_total_points, 0));
    final_passed := final_points_earned >= final_passing_points;
  else
    final_points_earned := correct_count;
    final_total_points := total_count;
    final_passing_points := ceil(total_count * target_assessment.passing_score / 100.0)::integer;
    final_score := round(100.0 * correct_count / nullif(total_count, 0));
    final_passed := final_score >= target_assessment.passing_score;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'domain', grouped.domain_name,
      'section', grouped.section_name,
      'questions', grouped.question_count,
      'correctAnswers', grouped.correct_count,
      'pointsEarned', grouped.points_earned,
      'totalPoints', grouped.total_points
    ) order by grouped.first_order
  ), '[]'::jsonb)
  into final_section_breakdown
  from (
    select
      coalesce(nullif(q.metadata->>'domain', ''), 'Tổng hợp') as domain_name,
      coalesce(nullif(q.metadata->>'section', ''), 'Chung') as section_name,
      min(q.order_index) as first_order,
      count(*)::integer as question_count,
      count(*) filter (
        where trim(coalesce(latest_attempt.answers->>q.id, '')) = trim(q.correct_answer)
      )::integer as correct_count,
      coalesce(sum(
        case
          when trim(coalesce(latest_attempt.answers->>q.id, '')) = trim(q.correct_answer) then
            case
              when scoring_mode = 'weighted_questions' then
                case
                  when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                    then greatest((q.metadata->>'points')::integer, 0)
                  else 1
                end
              else 1
            end
          else 0
        end
      ), 0)::integer as points_earned,
      coalesce(sum(
        case
          when scoring_mode = 'weighted_questions' then
            case
              when coalesce(q.metadata->>'points', '') ~ '^\d+$'
                then greatest((q.metadata->>'points')::integer, 0)
              else 1
            end
          else 1
        end
      ), 0)::integer as total_points
    from public.assessment_questions as q
    where q.assessment_id = target_assessment_id
    group by
      coalesce(nullif(q.metadata->>'domain', ''), 'Tổng hợp'),
      coalesce(nullif(q.metadata->>'section', ''), 'Chung')
  ) as grouped;

  return query
  select
    latest_attempt.id,
    target_assessment_id,
    final_score,
    final_passed,
    total_count,
    correct_count,
    latest_attempt.attempted_at,
    final_points_earned,
    final_total_points,
    final_passing_points,
    final_section_breakdown;
end;
$$;

create or replace function public.get_assessment_result_detail_v2(target_attempt_id text)
returns table (
  question_id text,
  prompt text,
  selected_answer text,
  correct_answer text,
  is_correct boolean,
  explanation text,
  order_index integer,
  metadata jsonb,
  points integer,
  points_earned integer
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  target_attempt public.assessment_attempts%rowtype;
  target_assessment public.assessments%rowtype;
  scoring_mode text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select att.* into target_attempt
  from public.assessment_attempts as att
  where att.id = target_attempt_id
    and att.user_id = auth.uid();

  if target_attempt.id is null then
    raise exception 'ASSESSMENT_ATTEMPT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  select a.* into target_assessment
  from public.assessments as a
  where a.id = target_attempt.assessment_id;

  if target_assessment.id is null
    or not public.can_read_course(target_assessment.course_id) then
    raise exception 'ASSESSMENT_NOT_AVAILABLE' using errcode = '42501';
  end if;

  scoring_mode := coalesce(nullif(target_assessment.config->>'scoringMode', ''), 'equal_percentage');

  return query
  select
    q.id,
    q.prompt,
    coalesce(target_attempt.answers->>q.id, ''),
    q.correct_answer,
    trim(coalesce(target_attempt.answers->>q.id, '')) = trim(q.correct_answer),
    coalesce(q.explanation, ''),
    q.order_index,
    coalesce(q.metadata, '{}'::jsonb),
    case
      when scoring_mode = 'weighted_questions'
        and coalesce(q.metadata->>'points', '') ~ '^\d+$'
        then greatest((q.metadata->>'points')::integer, 0)
      else 1
    end,
    case
      when trim(coalesce(target_attempt.answers->>q.id, '')) = trim(q.correct_answer) then
        case
          when scoring_mode = 'weighted_questions'
            and coalesce(q.metadata->>'points', '') ~ '^\d+$'
            then greatest((q.metadata->>'points')::integer, 0)
          else 1
        end
      else 0
    end
  from public.assessment_questions as q
  where q.assessment_id = target_attempt.assessment_id
  order by q.order_index;
end;
$$;

revoke all on function public.get_assessment_paper_v2(text) from public;
revoke all on function public.submit_assessment_v2(text, jsonb) from public;
revoke all on function public.get_latest_assessment_result_v2(text) from public;
revoke all on function public.get_assessment_result_detail_v2(text) from public;

grant execute on function public.get_assessment_paper_v2(text) to authenticated;
grant execute on function public.submit_assessment_v2(text, jsonb) to authenticated;
grant execute on function public.get_latest_assessment_result_v2(text) to authenticated;
grant execute on function public.get_assessment_result_detail_v2(text) to authenticated;

commit;

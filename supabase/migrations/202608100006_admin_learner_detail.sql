create or replace function public.get_admin_learner_detail(target_learner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if not public.has_staff_permission('learner.read') then
    raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles as p
    where p.user_id = target_learner_id and p.profile_role = 'learner'
  ) then
    raise exception 'LEARNER_NOT_FOUND' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'settings', coalesce((
      select jsonb_build_object(
        'dailyGoalMinutes', ls.daily_goal_minutes,
        'timezone', ls.timezone,
        'reminderTime', ls.reminder_time,
        'emailNotifications', ls.email_notifications,
        'aiConcise', ls.ai_concise,
        'ttsEnabled', ls.tts_enabled,
        'inAppNotifications', ls.in_app_notifications
      )
      from public.learner_settings as ls
      where ls.user_id = target_learner_id
    ), '{}'::jsonb),
    'enrollments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'courseId', e.course_id,
        'courseTitle', c.title,
        'status', e.status,
        'progressPercent', e.progress_percent,
        'enrolledAt', e.enrolled_at
      ) order by e.enrolled_at desc)
      from public.enrollments as e
      left join public.courses as c on c.id = e.course_id
      where e.user_id = target_learner_id
    ), '[]'::jsonb),
    'lessonProgress', jsonb_build_object(
      'completed', (select count(*) from public.lesson_progress as lp where lp.user_id = target_learner_id and lp.status = 'completed'),
      'total', (
        select count(distinct l.id)
        from public.enrollments as e
        join public.lessons as l on l.course_id = e.course_id and l.status = 'published'
        where e.user_id = target_learner_id and e.status in ('active', 'completed')
      ),
      'recent', coalesce((
        select jsonb_agg(jsonb_build_object(
          'lessonId', recent.lesson_id,
          'title', recent.title,
          'status', recent.status,
          'score', recent.score,
          'updatedAt', recent.updated_at
        ) order by recent.updated_at desc)
        from (
          select lp.lesson_id, l.title, lp.status, lp.score, lp.updated_at
          from public.lesson_progress as lp
          join public.lessons as l on l.id = lp.lesson_id
          where lp.user_id = target_learner_id
          order by lp.updated_at desc
          limit 8
        ) as recent
      ), '[]'::jsonb)
    ),
    'vocabulary', jsonb_build_object(
      'reviewed', (select count(*) from public.vocabulary_progress as vp where vp.user_id = target_learner_id),
      'mastered', (select count(*) from public.vocabulary_progress as vp where vp.user_id = target_learner_id and vp.status = 'mastered'),
      'due', (select count(*) from public.vocabulary_progress as vp where vp.user_id = target_learner_id and vp.due_at <= now())
    ),
    'assessments', jsonb_build_object(
      'attempts', (select count(*) from public.assessment_attempts as aa where aa.user_id = target_learner_id),
      'passRate', coalesce((
        select round(100.0 * count(*) filter (where aa.passed) / nullif(count(*), 0), 1)
        from public.assessment_attempts as aa
        where aa.user_id = target_learner_id
      ), 0),
      'recent', coalesce((
        select jsonb_agg(jsonb_build_object(
          'assessmentId', recent.assessment_id,
          'title', recent.title,
          'score', recent.score,
          'passed', recent.passed,
          'attemptedAt', recent.attempted_at
        ) order by recent.attempted_at desc)
        from (
          select aa.assessment_id, a.title, aa.score, aa.passed, aa.attempted_at
          from public.assessment_attempts as aa
          join public.assessments as a on a.id = aa.assessment_id
          where aa.user_id = target_learner_id
          order by aa.attempted_at desc
          limit 8
        ) as recent
      ), '[]'::jsonb)
    ),
    'activity', coalesce((
      select jsonb_agg(jsonb_build_object(
        'eventType', recent.event_type,
        'eventLabel', recent.event_label,
        'courseId', recent.course_id,
        'occurredAt', recent.occurred_at
      ) order by recent.occurred_at desc)
      from (
        select la.event_type, la.event_label, la.course_id, la.occurred_at
        from public.learning_activity_events as la
        where la.user_id = target_learner_id
        order by la.occurred_at desc
        limit 10
      ) as recent
    ), '[]'::jsonb),
    'notes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', recent.id,
        'body', recent.body,
        'staffId', recent.staff_id,
        'createdAt', recent.created_at
      ) order by recent.created_at desc)
      from (
        select lin.id, lin.body, lin.staff_id, lin.created_at
        from public.learner_intervention_notes as lin
        where lin.learner_id = target_learner_id
        order by lin.created_at desc
        limit 10
      ) as recent
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_admin_learner_detail(uuid) from public;
grant execute on function public.get_admin_learner_detail(uuid) to authenticated;

begin;

create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
set row_security = off
as $$
declare
  current_period date := date_trunc('month', now())::date;
  content_total bigint;
  content_published bigint;
begin
  if not public.has_staff_permission('analytics.read') then
    raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501';
  end if;

  select
    (select count(*) from public.courses)
    + (select count(*) from public.lessons)
    + (select count(*) from public.documents)
    + (select count(*) from public.assessments)
  into content_total;
  select
    (select count(*) from public.courses where status = 'published')
    + (select count(*) from public.lessons where status = 'published')
    + (select count(*) from public.documents where status = 'published')
    + (select count(*) from public.assessments where status = 'published')
  into content_published;

  return jsonb_build_object(
    'verifiedUsers', (select count(*) from public.profiles),
    'activeLearners', (select count(distinct e.user_id) from public.enrollments as e where e.status in ('active', 'completed')),
    'activeEnrollments', (select count(*) from public.enrollments as e where e.status = 'active'),
    'weeklyActiveLearners', (select count(distinct e.user_id) from public.learning_activity_events as e where e.occurred_at >= now() - interval '7 days'),
    'courseCompletion', coalesce((select round(avg(e.progress_percent), 1) from public.enrollments as e), 0),
    'masteredVocabulary', (select count(*) from public.vocabulary_progress as vp where vp.status = 'mastered'),
    'dueVocabulary', (select count(*) from public.vocabulary_progress as vp where vp.due_at <= now()),
    'currentStreakLearners', (
      select count(*)
      from (
        select e.user_id
        from public.learning_activity_events as e
        where e.occurred_at::date >= current_date - 2
        group by e.user_id
        having count(distinct e.occurred_at::date) = 3
      ) as streaks
    ),
    'examAttempts', (select count(*) from public.assessment_attempts),
    'examPassRate', coalesce((select round(100.0 * count(*) filter (where aa.passed) / nullif(count(*), 0), 1) from public.assessment_attempts as aa), 0),
    'weakTopics', coalesce((
      select jsonb_agg(jsonb_build_object(
        'title', weak.title,
        'courseId', weak.course_id,
        'attempts', weak.attempts,
        'passRate', weak.pass_rate
      ) order by weak.pass_rate asc, weak.attempts desc)
      from (
        select
          a.title,
          a.course_id,
          count(*)::integer as attempts,
          round(100.0 * count(*) filter (where aa.passed) / nullif(count(*), 0), 1) as pass_rate
        from public.assessment_attempts as aa
        join public.assessments as a on a.id = aa.assessment_id
        group by a.id, a.title, a.course_id
        order by pass_rate asc, attempts desc
        limit 5
      ) as weak
    ), '[]'::jsonb),
    'cohortRetention', jsonb_build_object(
      'day7', coalesce((
        select round(100.0 * count(*) filter (where exists (
          select 1
          from public.learning_activity_events as la
          where la.user_id = cohort.user_id
            and la.occurred_at >= cohort.enrolled_at + interval '7 days'
        )) / nullif(count(*), 0), 1)
        from (
          select e.user_id, min(e.enrolled_at) as enrolled_at
          from public.enrollments as e
          where e.status in ('active', 'completed')
          group by e.user_id
        ) as cohort
        where cohort.enrolled_at <= now() - interval '7 days'
      ), 0),
      'day30', coalesce((
        select round(100.0 * count(*) filter (where exists (
          select 1
          from public.learning_activity_events as la
          where la.user_id = cohort.user_id
            and la.occurred_at >= cohort.enrolled_at + interval '30 days'
        )) / nullif(count(*), 0), 1)
        from (
          select e.user_id, min(e.enrolled_at) as enrolled_at
          from public.enrollments as e
          where e.status in ('active', 'completed')
          group by e.user_id
        ) as cohort
        where cohort.enrolled_at <= now() - interval '30 days'
      ), 0)
    ),
    'aiRequestsThisMonth', (select coalesce(sum(au.request_count), 0) from public.ai_usage as au where au.period_start = current_period),
    'aiErrorsThisMonth',
      (select count(*) from public.ai_writing_submissions as aw where aw.status = 'failed' and aw.created_at >= date_trunc('month', now()))
      + (select count(*) from public.speaking_submissions as ss where ss.status = 'failed' and ss.created_at >= date_trunc('month', now())),
    'aiQuotaConsumed', (select coalesce(sum(au.request_count), 0) from public.ai_usage as au where au.period_start = current_period),
    'aiQuotaCapacity', coalesce((
      select sum(learner_quota.quota)
      from (
        select e.user_id, max(coalesce(p.ai_monthly_quota, 20)) as quota
        from public.enrollments as e
        left join public.packages as p on p.id = e.package_id
        where e.status in ('active', 'completed')
        group by e.user_id
      ) as learner_quota
    ), 0),
    'contentReadiness', jsonb_build_object(
      'publishedCourses', (select count(*) from public.courses where status = 'published'),
      'totalCourses', (select count(*) from public.courses),
      'publishedLessons', (select count(*) from public.lessons where status = 'published'),
      'totalLessons', (select count(*) from public.lessons),
      'publishedDocuments', (select count(*) from public.documents where status = 'published'),
      'totalDocuments', (select count(*) from public.documents),
      'publishedAssessments', (select count(*) from public.assessments where status = 'published'),
      'totalAssessments', (select count(*) from public.assessments),
      'percent', coalesce(round(100.0 * content_published / nullif(content_total, 0), 1), 0)
    ),
    'emailDelivery', jsonb_build_object(
      'pending', (select count(*) from public.notification_deliveries where status = 'pending'),
      'processing', (select count(*) from public.notification_deliveries where status = 'processing'),
      'sent', (select count(*) from public.notification_deliveries where status = 'sent'),
      'failed', (select count(*) from public.notification_deliveries where status = 'failed')
    ),
    'pendingEmail', (select count(*) from public.notification_deliveries as nd where nd.status = 'pending')
  );
end;
$$;

revoke all on function public.get_admin_analytics() from public;
grant execute on function public.get_admin_analytics() to authenticated;

commit;

begin;

create or replace function public.get_daily_learning_plan()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
set row_security to 'off'
as $function$
declare
  actor_id uuid := auth.uid();
  actor_is_admin boolean := false;
  due_count integer := 0;
  next_lesson jsonb;
  weak_exam jsonb;
  goal_minutes integer;
begin
  if actor_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  actor_is_admin := public.is_admin();

  select least(count(distinct lv.vocabulary_item_id), 100)::integer
  into due_count
  from public.lesson_vocabulary as lv
  join public.lessons as l
    on l.id = lv.lesson_id
   and l.status = 'published'
  join public.courses as c
    on c.id = l.course_id
   and c.status = 'published'
  left join public.vocabulary_progress as vp
    on vp.user_id = actor_id
   and vp.vocabulary_item_id = lv.vocabulary_item_id
  where (
      actor_is_admin
      or exists (
        select 1
        from public.enrollments as e
        where e.user_id = actor_id
          and e.course_id = l.course_id
          and e.status in ('active', 'completed')
      )
    )
    and (vp.due_at is null or vp.due_at <= now());

  select jsonb_build_object(
      'id', l.id,
      'title', l.title,
      'courseId', l.course_id,
      'courseTitle', c.title
    )
  into next_lesson
  from public.lessons as l
  join public.courses as c
    on c.id = l.course_id
   and c.status = 'published'
  left join public.lesson_progress as lp
    on lp.lesson_id = l.id
   and lp.user_id = actor_id
  where l.status = 'published'
    and (
      actor_is_admin
      or exists (
        select 1
        from public.enrollments as e
        where e.user_id = actor_id
          and e.course_id = l.course_id
          and e.status in ('active', 'completed')
      )
    )
    and coalesce(lp.status, 'not-started') <> 'completed'
  order by c.order_index, l.order_index
  limit 1;

  select jsonb_build_object(
      'id', a.id,
      'title', a.title,
      'score', aa.score,
      'courseId', a.course_id
    )
  into weak_exam
  from public.assessment_attempts as aa
  join public.assessments as a on a.id = aa.assessment_id
  where aa.user_id = actor_id
  order by aa.score asc, aa.attempted_at desc
  limit 1;

  select coalesce(ls.daily_goal_minutes, 20)
  into goal_minutes
  from public.learner_settings as ls
  where ls.user_id = actor_id;

  return jsonb_build_object(
    'goalMinutes', coalesce(goal_minutes, 20),
    'dueVocabulary', coalesce(due_count, 0),
    'nextLesson', next_lesson,
    'weakAssessment', weak_exam
  );
end;
$function$;

create index if not exists notifications_user_type_created_idx
on public.notifications (user_id, notification_type, created_at);

create or replace function public.queue_due_reminders()
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions'
set row_security to 'off'
as $function$
declare
  queued_count integer := 0;
  now_at timestamptz := now();
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  insert into public.notifications (user_id, notification_type, title, body, action_url)
  select
    ls.user_id,
    'review_due',
    'Đến giờ ôn từ vựng',
    'Anh có thẻ nhớ đến hạn hôm nay. Ôn một lượt ngắn để giữ nhịp.',
    '/app/review/flashcards?mode=due'
  from public.learner_settings as ls
  cross join lateral (
    select coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo') as tz
  ) as z
  cross join lateral (
    select
      ((now_at at time zone z.tz)::date::timestamp at time zone z.tz) as day_start,
      (((now_at at time zone z.tz)::date + 1)::timestamp at time zone z.tz) as day_end
  ) as d
  where (ls.in_app_notifications or ls.email_notifications or ls.push_notifications)
    and exists (
      select 1
      from public.vocabulary_progress as vp
      where vp.user_id = ls.user_id
        and vp.due_at <= now_at
    )
    and not exists (
      select 1
      from public.notifications as n
      where n.user_id = ls.user_id
        and n.notification_type = 'review_due'
        and n.created_at >= d.day_start
        and n.created_at < d.day_end
    );

  get diagnostics queued_count = row_count;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email'
  from public.notifications as n
  join public.learner_settings as ls
    on ls.user_id = n.user_id
   and ls.email_notifications
  cross join lateral (
    select coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo') as tz
  ) as z
  cross join lateral (
    select
      ((now_at at time zone z.tz)::date::timestamp at time zone z.tz) as day_start,
      (((now_at at time zone z.tz)::date + 1)::timestamp at time zone z.tz) as day_end
  ) as d
  where n.notification_type = 'review_due'
    and n.created_at >= d.day_start
    and n.created_at < d.day_end
  on conflict do nothing;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'push'
  from public.notifications as n
  join public.learner_settings as ls
    on ls.user_id = n.user_id
   and ls.push_notifications
  cross join lateral (
    select coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo') as tz
  ) as z
  cross join lateral (
    select
      ((now_at at time zone z.tz)::date::timestamp at time zone z.tz) as day_start,
      (((now_at at time zone z.tz)::date + 1)::timestamp at time zone z.tz) as day_end
  ) as d
  where n.notification_type = 'review_due'
    and n.created_at >= d.day_start
    and n.created_at < d.day_end
  on conflict do nothing;

  return queued_count;
end;
$function$;

commit;

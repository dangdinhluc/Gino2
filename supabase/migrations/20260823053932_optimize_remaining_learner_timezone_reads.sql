begin;

create or replace function public.record_game_completion(target_course_id text, target_game_type text)
returns table (awarded boolean, xp_awarded integer, completed_at timestamptz)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  completion_time timestamptz;
  learner_timezone text;
  today date;
begin
  if auth.uid() is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if target_game_type not in ('vocab-sprint', 'flappy-vocab', 'memory-match', 'word-builder') then
    raise exception 'GAME_NOT_AVAILABLE' using errcode = '22023';
  end if;
  if not public.can_read_course(target_course_id) then
    raise exception 'COURSE_NOT_AVAILABLE' using errcode = '42501';
  end if;

  learner_timezone := public.learner_timezone();
  today := (now() at time zone learner_timezone)::date;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  select e.occurred_at
  into completion_time
  from public.learning_activity_events e
  where e.user_id = auth.uid()
    and e.course_id = target_course_id
    and e.event_type = 'game_completed'
    and e.metadata ->> 'gameType' = target_game_type
    and (e.occurred_at at time zone learner_timezone)::date = today
  order by e.occurred_at desc
  limit 1;

  if completion_time is not null then
    return query select false, 0, completion_time;
    return;
  end if;

  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_course_id,
    'game_completed',
    'Course vocabulary game',
    jsonb_build_object('gameType', target_game_type)
  )
  returning occurred_at into completion_time;

  return query select true, 5, completion_time;
end;
$$;

create or replace function public.get_learner_dashboard()
returns table (
  active_courses bigint,
  completed_lessons bigint,
  mastered_vocabulary bigint,
  due_vocabulary bigint,
  streak_days bigint,
  recent_activity jsonb
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
with context as materialized (
  select auth.uid() as user_id, public.learner_timezone() as timezone
), today as materialized (
  select user_id, timezone, (now() at time zone timezone)::date as local_day
  from context
), events as materialized (
  select (e.occurred_at at time zone today.timezone)::date as local_day
  from public.learning_activity_events e
  cross join today
  where e.user_id = today.user_id
), active_days as (
  select distinct local_day as day
  from events
), numbered_days as (
  select day, day + (row_number() over (order by day desc))::integer as group_key
  from active_days
), latest_streak as (
  select case
    when max(day) >= (select local_day - 1 from today) then count(*)
    else 0
  end as value
  from numbered_days
  where group_key = (select group_key from numbered_days order by day desc limit 1)
), activity as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id,
    'eventType', event_type,
    'label', event_label,
    'courseId', course_id,
    'occurredAt', occurred_at
  ) order by occurred_at desc), '[]'::jsonb) as value
  from (
    select id, event_type, event_label, course_id, occurred_at
    from public.learning_activity_events
    where user_id = (select user_id from context)
    order by occurred_at desc
    limit 10
  ) recent
)
select
  (select count(*) from public.enrollments where user_id = (select user_id from context) and status in ('active', 'completed')),
  (select count(*) from public.lesson_progress where user_id = (select user_id from context) and status = 'completed'),
  (select count(*) from public.vocabulary_progress where user_id = (select user_id from context) and status = 'mastered'),
  (select count(*) from public.vocabulary_progress where user_id = (select user_id from context) and status <> 'mastered'),
  coalesce((select value from latest_streak), 0),
  (select value from activity);
$$;

create or replace function public.create_progress_post()
returns table (post_id text, daily_xp integer, current_streak integer)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  new_id text;
  xp_today integer;
  streak integer := 0;
  learner_timezone text;
  today date;
  cursor_day date;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if not exists (select 1 from public.community_profiles where user_id = auth.uid() and is_public) then
    raise exception 'PUBLIC_PROFILE_REQUIRED' using errcode = '42501';
  end if;

  learner_timezone := public.learner_timezone();
  today := (now() at time zone learner_timezone)::date;
  cursor_day := today;
  select coalesce(sum(case
    when event_type = 'vocabulary_reviewed' then 10
    when event_type = 'review_answered' then 5
    when event_type = 'lesson_completed' then 25
    when event_type = 'assessment_submitted' then 40
    when event_type = 'game_completed' then 5
    when event_type = 'daily_reward_claimed' then 15
    else 0
  end), 0)::integer
  into xp_today
  from public.learning_activity_events
  where user_id = auth.uid()
    and (occurred_at at time zone learner_timezone)::date = today;

  while exists (
    select 1
    from public.learning_activity_events
    where user_id = auth.uid()
      and (occurred_at at time zone learner_timezone)::date = cursor_day
  ) loop
    streak := streak + 1;
    cursor_day := cursor_day - 1;
    exit when streak >= 365;
  end loop;

  insert into public.community_posts (user_id, body, post_type, metadata)
  values (
    auth.uid(),
    format('Hôm nay tôi đã tích lũy %s XP và giữ chuỗi %s ngày học tập.', xp_today, streak),
    'progress',
    jsonb_build_object('dailyXp', xp_today, 'currentStreak', streak)
  )
  returning id into new_id;

  return query select new_id, xp_today, streak;
end;
$$;

create or replace function public.claim_daily_reward()
returns table (claimed boolean, reward_xp integer, current_streak bigint, newly_earned jsonb)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  today date;
  learner_timezone text;
  event_id text;
  streak_days bigint := 0;
  reward integer := 15;
  earned jsonb := '[]'::jsonb;
  day_cursor date;
  completed_course_id text;
  certificate_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  learner_timezone := public.learner_timezone();
  today := (now() at time zone learner_timezone)::date;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if exists (
    select 1
    from public.learning_activity_events
    where user_id = auth.uid()
      and event_type = 'daily_reward_claimed'
      and (occurred_at at time zone learner_timezone)::date = today
  ) then
    select coalesce(s.current_streak, 0) into streak_days from public.get_learner_stats() s;
    return query select false, 0, streak_days, '[]'::jsonb;
    return;
  end if;
  event_id := extensions.gen_random_uuid()::text;
  insert into public.learning_activity_events (id,user_id,course_id,event_type,event_label,metadata)
  values (event_id,auth.uid(),null,'daily_reward_claimed','Daily reward',jsonb_build_object('xp',reward,'date',today));
  day_cursor := today;
  while exists (
    select 1
    from public.learning_activity_events
    where user_id = auth.uid()
      and (occurred_at at time zone learner_timezone)::date = day_cursor
  ) loop
    streak_days := streak_days + 1;
    day_cursor := day_cursor - 1;
    exit when streak_days >= 365;
  end loop;
  if streak_days >= 7 then
    insert into public.learner_achievements (user_id,achievement_id,metadata)
    values (auth.uid(),'streak-7',jsonb_build_object('streak',streak_days))
    on conflict do nothing;
    if found then earned := earned || jsonb_build_array('streak-7'); end if;
  end if;
  if streak_days >= 30 then
    insert into public.learner_achievements (user_id,achievement_id,metadata)
    values (auth.uid(),'streak-30',jsonb_build_object('streak',streak_days))
    on conflict do nothing;
    if found then earned := earned || jsonb_build_array('streak-30'); end if;
  end if;
  if streak_days >= 100 then
    insert into public.learner_achievements (user_id,achievement_id,metadata)
    values (auth.uid(),'streak-100',jsonb_build_object('streak',streak_days))
    on conflict do nothing;
    if found then earned := earned || jsonb_build_array('streak-100'); end if;
  end if;
  for completed_course_id in
    select e.course_id
    from public.enrollments e
    where e.user_id = auth.uid() and e.status = 'completed'
  loop
    insert into public.learner_certificates (user_id,course_id,certificate_code,metadata)
    values (
      auth.uid(),
      completed_course_id,
      'GINO-' || upper(substr(md5(auth.uid()::text || completed_course_id),1,12)),
      jsonb_build_object('source','course_completion')
    )
    on conflict (user_id,course_id) do nothing
    returning id into certificate_id;
    if certificate_id is not null then
      insert into public.learner_achievements (user_id,achievement_id,metadata)
      values (auth.uid(),'first-course-complete',jsonb_build_object('courseId',completed_course_id))
      on conflict do nothing;
      if found then earned := earned || jsonb_build_array('first-course-complete'); end if;
    end if;
    certificate_id := null;
  end loop;
  return query select true,reward,streak_days,earned;
end;
$$;

create or replace function public.queue_due_reminders()
returns integer
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  queued_count integer := 0;
begin
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;

  insert into public.notifications (user_id, notification_type, title, body, action_url)
  select ls.user_id, 'review_due', 'Đến giờ ôn từ vựng', 'Anh có thẻ nhớ đến hạn hôm nay. Ôn một lượt ngắn để giữ nhịp.', '/app/review/flashcards?mode=due'
  from public.learner_settings ls
  where (ls.in_app_notifications or ls.email_notifications or ls.push_notifications)
    and exists (select 1 from public.vocabulary_progress vp where vp.user_id = ls.user_id and vp.due_at <= now())
    and not exists (
      select 1
      from public.notifications n
      where n.user_id = ls.user_id
        and n.notification_type = 'review_due'
        and (n.created_at at time zone coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo'))::date = (now() at time zone coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo'))::date
    );
  get diagnostics queued_count = row_count;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email'
  from public.notifications n
  join public.learner_settings ls on ls.user_id = n.user_id and ls.email_notifications
  where n.notification_type = 'review_due'
    and (n.created_at at time zone coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo'))::date = (now() at time zone coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo'))::date
  on conflict do nothing;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'push'
  from public.notifications n
  join public.learner_settings ls on ls.user_id = n.user_id and ls.push_notifications
  where n.notification_type = 'review_due'
    and (n.created_at at time zone coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo'))::date = (now() at time zone coalesce(nullif(ls.timezone, ''), 'Asia/Tokyo'))::date
  on conflict do nothing;

  return queued_count;
end;
$$;

commit;

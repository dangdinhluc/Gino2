begin;

create unique index if not exists learning_activity_events_game_completion_daily_unique
on public.learning_activity_events (
  user_id,
  course_id,
  (metadata ->> 'gameType'),
  ((occurred_at at time zone 'UTC')::date)
)
where event_type = 'game_completed';

create or replace function public.record_game_completion(target_course_id text, target_game_type text)
returns table (awarded boolean, xp_awarded integer, completed_at timestamptz)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  completion_time timestamptz;
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

  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (
    extensions.gen_random_uuid()::text,
    auth.uid(),
    target_course_id,
    'game_completed',
    'Course vocabulary game',
    jsonb_build_object('gameType', target_game_type)
  )
  on conflict do nothing
  returning occurred_at into completion_time;

  if found then
    return query select true, 5, completion_time;
    return;
  end if;

  select occurred_at into completion_time
  from public.learning_activity_events
  where user_id = auth.uid()
    and course_id = target_course_id
    and event_type = 'game_completed'
    and metadata ->> 'gameType' = target_game_type
    and (occurred_at at time zone 'UTC')::date = (now() at time zone 'UTC')::date
  order by occurred_at desc
  limit 1;
  return query select false, 0, completion_time;
end;
$$;

create or replace function public.get_learner_stats()
returns table (
  total_xp bigint,
  weekly_xp bigint,
  daily_xp bigint,
  reviewed_today bigint,
  total_reviews bigint,
  current_streak bigint,
  mastered_vocabulary bigint,
  due_vocabulary bigint,
  weekly_activity jsonb,
  topic_mastery jsonb
)
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
with events as (
  select
    occurred_at,
    event_type,
    case
      when event_type = 'lesson_completed' then 25
      when event_type = 'vocabulary_reviewed' then 10
      when event_type = 'review_answered' then 5
      when event_type = 'assessment_submitted' then 40
      when event_type = 'game_completed' then 5
      else 0
    end as xp
  from public.learning_activity_events
  where user_id = auth.uid()
), active_days as (
  select distinct occurred_at::date as day
  from events
), numbered_days as (
  select day, day - (row_number() over (order by day desc))::integer as group_key
  from active_days
), streak as (
  select case
    when max(day) >= current_date - 1 then count(*)
    else 0
  end as value
  from numbered_days
  where group_key = (select group_key from numbered_days order by day desc limit 1)
), week_days as (
  select generate_series(current_date - 6, current_date, interval '1 day')::date as day
), weekly_activity as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'date', week_days.day,
    'reviews', coalesce(review_counts.reviews, 0),
    'xp', coalesce(review_counts.xp, 0)
  ) order by week_days.day), '[]'::jsonb) as value
  from week_days
  left join (
    select occurred_at::date as day, count(*) as reviews, sum(xp) as xp
    from events
    where occurred_at::date >= current_date - 6
    group by occurred_at::date
  ) review_counts on review_counts.day = week_days.day
), topic_mastery as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'courseId', topic.course_id,
    'courseTitle', topic.course_title,
    'mastered', topic.mastered,
    'total', topic.total,
    'percent', round(100.0 * topic.mastered / nullif(topic.total, 0))
  ) order by topic.course_title), '[]'::jsonb) as value
  from (
    select
      courses.id as course_id,
      courses.title as course_title,
      count(distinct lesson_vocabulary.vocabulary_item_id) as total,
      count(distinct lesson_vocabulary.vocabulary_item_id) filter (where vocabulary_progress.status = 'mastered') as mastered
    from public.courses
    join public.lessons on lessons.course_id = courses.id and lessons.status = 'published'
    join public.lesson_vocabulary on lesson_vocabulary.lesson_id = lessons.id
    left join public.vocabulary_progress
      on vocabulary_progress.vocabulary_item_id = lesson_vocabulary.vocabulary_item_id
     and vocabulary_progress.user_id = auth.uid()
    where public.can_read_course(courses.id)
    group by courses.id, courses.title
  ) topic
)
select
  coalesce((select sum(xp) from events), 0),
  coalesce((select sum(xp) from events where occurred_at::date >= current_date - 6), 0),
  coalesce((select sum(xp) from events where occurred_at::date = current_date), 0),
  coalesce((select count(*) from events where occurred_at::date = current_date and event_type in ('vocabulary_reviewed', 'review_answered')), 0),
  coalesce((select count(*) from events where event_type in ('vocabulary_reviewed', 'review_answered')), 0),
  coalesce((select value from streak), 0),
  (select count(*) from public.vocabulary_progress where user_id = auth.uid() and status = 'mastered'),
  (select count(*) from public.vocabulary_progress where user_id = auth.uid() and status <> 'mastered'),
  (select value from weekly_activity),
  (select value from topic_mastery);
$$;

revoke insert, update, delete on public.learning_activity_events from authenticated;
revoke all on function public.record_game_completion(text, text) from public;
grant execute on function public.record_game_completion(text, text) to authenticated;

commit;

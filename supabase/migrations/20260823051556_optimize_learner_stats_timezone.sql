begin;

create or replace function public.validate_learner_settings_timezone()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.timezone := coalesce(nullif(btrim(new.timezone), ''), 'Asia/Tokyo');
  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.timezone
  ) then
    new.timezone := 'Asia/Tokyo';
  end if;
  return new;
end;
$$;

update public.learner_settings
set timezone = 'Asia/Tokyo'
where timezone is null
   or btrim(timezone) = ''
   or not exists (
     select 1
     from pg_catalog.pg_timezone_names
     where name = public.learner_settings.timezone
   );

drop trigger if exists learner_settings_validate_timezone on public.learner_settings;
create trigger learner_settings_validate_timezone
before insert or update of timezone on public.learner_settings
for each row execute function public.validate_learner_settings_timezone();

create or replace function public.learner_timezone(target_user_id uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce(ls.timezone, 'Asia/Tokyo')
  from (select target_user_id as user_id) target
  left join public.learner_settings ls on ls.user_id = target.user_id;
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
with identity as materialized (
  select auth.uid() as user_id
), context as materialized (
  select identity.user_id, public.learner_timezone(identity.user_id) as timezone
  from identity
), today as materialized (
  select user_id, timezone, (now() at time zone timezone)::date as local_day
  from context
), events as materialized (
  select
    (e.occurred_at at time zone today.timezone)::date as local_day,
    e.event_type,
    case
      when e.event_type = 'lesson_completed' then 25
      when e.event_type = 'vocabulary_reviewed' then 10
      when e.event_type = 'review_answered' then 5
      when e.event_type = 'assessment_submitted' then 40
      when e.event_type = 'daily_reward_claimed' then 15
      else 0
    end as xp
  from public.learning_activity_events e
  cross join today
  where e.user_id = today.user_id
), active_days as (
  select distinct local_day
  from events
), numbered_days as (
  select local_day, local_day + row_number() over (order by local_day desc)::integer as group_key
  from active_days
), streak as (
  select case
    when max(local_day) >= (select local_day - 1 from today) then count(*)
    else 0
  end as value
  from numbered_days
  where group_key = (select group_key from numbered_days order by local_day desc limit 1)
), week_days as (
  select generate_series(
    (select local_day - 6 from today),
    (select local_day from today),
    '1 day'
  )::date as local_day
), weekly_activity as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', w.local_day,
        'reviews', coalesce(r.reviews, 0),
        'xp', coalesce(r.xp, 0)
      ) order by w.local_day
    ),
    '[]'::jsonb
  ) as value
  from week_days w
  left join (
    select local_day, count(*) as reviews, sum(xp) as xp
    from events
    where local_day >= (select local_day - 6 from today)
    group by local_day
  ) r on r.local_day = w.local_day
), topic_mastery as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'courseId', topic.course_id,
        'courseTitle', topic.course_title,
        'mastered', topic.mastered,
        'total', topic.total,
        'percent', round(100.0 * topic.mastered / nullif(topic.total, 0))
      ) order by topic.course_title
    ),
    '[]'::jsonb
  ) as value
  from (
    select
      c.id as course_id,
      c.title as course_title,
      count(distinct lv.vocabulary_item_id) as total,
      count(distinct lv.vocabulary_item_id) filter (where vp.status = 'mastered') as mastered
    from public.courses c
    join public.lessons l on l.course_id = c.id and l.status = 'published'
    join public.lesson_vocabulary lv on lv.lesson_id = l.id
    left join public.vocabulary_progress vp
      on vp.vocabulary_item_id = lv.vocabulary_item_id
     and vp.user_id = (select user_id from today)
    where public.can_read_course(c.id)
    group by c.id, c.title
  ) topic
)
select
  coalesce((select sum(xp) from events), 0),
  coalesce((select sum(xp) from events where local_day >= (select local_day - 6 from today)), 0),
  coalesce((select sum(xp) from events where local_day = (select local_day from today)), 0),
  coalesce((select count(*) from events where local_day = (select local_day from today) and event_type in ('vocabulary_reviewed', 'review_answered')), 0),
  coalesce((select count(*) from events where event_type in ('vocabulary_reviewed', 'review_answered')), 0),
  coalesce((select value from streak), 0),
  (select count(*) from public.vocabulary_progress where user_id = (select user_id from today) and status = 'mastered'),
  (select count(*) from public.vocabulary_progress where user_id = (select user_id from today) and status <> 'mastered'),
  (select value from weekly_activity),
  (select value from topic_mastery);
$$;

revoke all on function public.learner_timezone(uuid) from public;
grant execute on function public.learner_timezone(uuid) to authenticated;

commit;

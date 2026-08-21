begin;

-- Daily reward is one real activity event per learner/day. It is not client-awarded XP.
create table if not exists public.learner_certificates (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (user_id, course_id)
);

create index if not exists learner_certificates_user_idx on public.learner_certificates(user_id, issued_at desc);

alter table public.learner_certificates enable row level security;
drop policy if exists learner_certificates_select_own on public.learner_certificates;
create policy learner_certificates_select_own
on public.learner_certificates for select to authenticated
using (user_id = auth.uid());

grant select on public.learner_certificates to authenticated;
revoke insert, update, delete on public.learner_certificates from authenticated;

insert into public.achievement_definitions (id, title, description, icon, criteria, status)
values
  ('streak-7', 'Giữ nhịp 7 ngày', 'Học liên tiếp 7 ngày.', 'flame', '{"type":"streak","days":7}'::jsonb, 'active'),
  ('streak-30', 'Bền bỉ 30 ngày', 'Học liên tiếp 30 ngày.', 'trophy', '{"type":"streak","days":30}'::jsonb, 'active'),
  ('streak-100', 'Kỷ luật 100 ngày', 'Học liên tiếp 100 ngày.', 'crown', '{"type":"streak","days":100}'::jsonb, 'active'),
  ('first-course-complete', 'Hoàn thành khóa đầu tiên', 'Hoàn thành toàn bộ bài học trong một khóa.', 'graduation-cap', '{"type":"course_completion","count":1}'::jsonb, 'active')
on conflict (id) do update set title = excluded.title, description = excluded.description, icon = excluded.icon, criteria = excluded.criteria, status = excluded.status;

create or replace function public.claim_daily_reward()
returns table (claimed boolean, reward_xp integer, current_streak bigint, newly_earned jsonb)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  today date := (now() at time zone 'UTC')::date;
  event_id text;
  streak_days bigint := 0;
  reward integer := 15;
  earned jsonb := '[]'::jsonb;
  day_cursor date;
  completed_course_id text;
  certificate_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));

  if exists (
    select 1 from public.learning_activity_events
    where user_id = auth.uid() and event_type = 'daily_reward_claimed' and occurred_at::date = today
  ) then
    select coalesce(s.current_streak, 0) into streak_days from public.get_learner_stats() s;
    return query select false, 0, streak_days, '[]'::jsonb;
    return;
  end if;

  event_id := extensions.gen_random_uuid()::text;
  insert into public.learning_activity_events (id, user_id, course_id, event_type, event_label, metadata)
  values (event_id, auth.uid(), null, 'daily_reward_claimed', 'Daily reward', jsonb_build_object('xp', reward, 'date', today));

  day_cursor := today;
  while exists (select 1 from public.learning_activity_events where user_id = auth.uid() and occurred_at::date = day_cursor) loop
    streak_days := streak_days + 1;
    day_cursor := day_cursor - 1;
    exit when streak_days >= 365;
  end loop;

  if streak_days >= 7 then
    insert into public.learner_achievements (user_id, achievement_id, metadata)
    values (auth.uid(), 'streak-7', jsonb_build_object('streak', streak_days)) on conflict do nothing;
    if found then earned := earned || jsonb_build_array('streak-7'); end if;
  end if;
  if streak_days >= 30 then
    insert into public.learner_achievements (user_id, achievement_id, metadata)
    values (auth.uid(), 'streak-30', jsonb_build_object('streak', streak_days)) on conflict do nothing;
    if found then earned := earned || jsonb_build_array('streak-30'); end if;
  end if;
  if streak_days >= 100 then
    insert into public.learner_achievements (user_id, achievement_id, metadata)
    values (auth.uid(), 'streak-100', jsonb_build_object('streak', streak_days)) on conflict do nothing;
    if found then earned := earned || jsonb_build_array('streak-100'); end if;
  end if;

  for completed_course_id in
    select e.course_id from public.enrollments e
    where e.user_id = auth.uid() and e.status = 'completed'
  loop
    insert into public.learner_certificates (user_id, course_id, certificate_code, metadata)
    values (auth.uid(), completed_course_id, 'GINO-' || upper(substr(md5(auth.uid()::text || completed_course_id), 1, 12)), jsonb_build_object('source', 'course_completion'))
    on conflict (user_id, course_id) do nothing
    returning id into certificate_id;
    if certificate_id is not null then
      insert into public.learner_achievements (user_id, achievement_id, metadata)
      values (auth.uid(), 'first-course-complete', jsonb_build_object('courseId', completed_course_id)) on conflict do nothing;
      if found then earned := earned || jsonb_build_array('first-course-complete'); end if;
    end if;
    certificate_id := null;
  end loop;

  return query select true, reward, streak_days, earned;
end;
$$;

create or replace function public.list_learner_achievements()
returns table (achievement_id text, title text, description text, icon text, earned_at timestamptz, metadata jsonb)
language sql
security invoker
set search_path = public
as $$
  select a.id, a.title, a.description, a.icon, la.earned_at, la.metadata
  from public.learner_achievements la
  join public.achievement_definitions a on a.id = la.achievement_id
  where la.user_id = auth.uid()
  order by la.earned_at desc;
$$;

create or replace function public.list_learner_certificates()
returns table (id uuid, course_id text, course_title text, certificate_code text, issued_at timestamptz, metadata jsonb)
language sql
security invoker
set search_path = public
as $$
  select c.id, c.course_id, co.title, c.certificate_code, c.issued_at, c.metadata
  from public.learner_certificates c
  join public.courses co on co.id = c.course_id
  where c.user_id = auth.uid()
  order by c.issued_at desc;
$$;

revoke all on function public.claim_daily_reward() from public;
revoke all on function public.list_learner_achievements() from public;
revoke all on function public.list_learner_certificates() from public;
grant execute on function public.claim_daily_reward() to authenticated;
grant execute on function public.list_learner_achievements() to authenticated;
grant execute on function public.list_learner_certificates() to authenticated;

-- Include daily reward in real XP totals.
create or replace function public.get_learner_stats()
returns table (
  total_xp bigint, weekly_xp bigint, daily_xp bigint, reviewed_today bigint, total_reviews bigint,
  current_streak bigint, mastered_vocabulary bigint, due_vocabulary bigint, weekly_activity jsonb, topic_mastery jsonb
)
language sql stable security definer set search_path = public set row_security = off
as $$
with events as (
  select occurred_at, event_type,
    case
      when event_type = 'lesson_completed' then 25
      when event_type = 'vocabulary_reviewed' then 10
      when event_type = 'review_answered' then 5
      when event_type = 'assessment_submitted' then 40
      when event_type = 'daily_reward_claimed' then 15
      else 0
    end as xp
  from public.learning_activity_events where user_id = auth.uid()
), active_days as (select distinct occurred_at::date as day from events), numbered_days as (
  select day, day + (row_number() over (order by day desc))::integer as group_key from active_days
), streak as (
  select case when max(day) >= current_date - 1 then count(*) else 0 end as value
  from numbered_days where group_key = (select group_key from numbered_days order by day desc limit 1)
), week_days as (select generate_series(current_date - 6, current_date, interval '1 day')::date as day), weekly_activity as (
  select coalesce(jsonb_agg(jsonb_build_object('date', week_days.day, 'reviews', coalesce(review_counts.reviews, 0), 'xp', coalesce(review_counts.xp, 0)) order by week_days.day), '[]'::jsonb) as value
  from week_days left join (select occurred_at::date as day, count(*) as reviews, sum(xp) as xp from events where occurred_at::date >= current_date - 6 group by occurred_at::date) review_counts on review_counts.day = week_days.day
), topic_mastery as (
  select coalesce(jsonb_agg(jsonb_build_object('courseId', topic.course_id, 'courseTitle', topic.course_title, 'mastered', topic.mastered, 'total', topic.total, 'percent', round(100.0 * topic.mastered / nullif(topic.total, 0))) order by topic.course_title), '[]'::jsonb) as value
  from (select courses.id as course_id, courses.title as course_title, count(distinct lesson_vocabulary.vocabulary_item_id) as total, count(distinct lesson_vocabulary.vocabulary_item_id) filter (where vocabulary_progress.status = 'mastered') as mastered from public.courses join public.lessons on lessons.course_id = courses.id and lessons.status = 'published' join public.lesson_vocabulary on lesson_vocabulary.lesson_id = lessons.id left join public.vocabulary_progress on vocabulary_progress.vocabulary_item_id = lesson_vocabulary.vocabulary_item_id and vocabulary_progress.user_id = auth.uid() where public.can_read_course(courses.id) group by courses.id, courses.title) topic
)
select coalesce((select sum(xp) from events), 0), coalesce((select sum(xp) from events where occurred_at::date >= current_date - 6), 0), coalesce((select sum(xp) from events where occurred_at::date = current_date), 0), coalesce((select count(*) from events where occurred_at::date = current_date and event_type in ('vocabulary_reviewed', 'review_answered')), 0), coalesce((select count(*) from events where event_type in ('vocabulary_reviewed', 'review_answered')), 0), (select coalesce(value, 0) from streak), (select count(*) from public.vocabulary_progress where user_id = auth.uid() and status = 'mastered'), (select count(*) from public.vocabulary_progress where user_id = auth.uid() and status <> 'mastered'), (select value from weekly_activity), (select value from topic_mastery);
$$;

revoke all on function public.get_learner_stats() from public;
grant execute on function public.get_learner_stats() to authenticated;

commit;

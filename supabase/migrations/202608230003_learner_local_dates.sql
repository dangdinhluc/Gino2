begin;

create or replace function public.learner_timezone(target_user_id uuid default auth.uid())
returns text language sql stable security definer set search_path = public set row_security = off as $$
  select case
    when coalesce(ls.timezone, 'Asia/Tokyo') in (select name from pg_timezone_names) then coalesce(ls.timezone, 'Asia/Tokyo')
    else 'Asia/Tokyo'
  end
  from (select target_user_id as user_id) target
  left join public.learner_settings ls on ls.user_id = target.user_id;
$$;

create or replace function public.learner_local_date(target_user_id uuid default auth.uid(), target_at timestamptz default now())
returns date language sql stable security definer set search_path = public set row_security = off as $$
  select target_at at time zone public.learner_timezone(target_user_id);
$$;

create or replace function public.claim_daily_reward()
returns table (claimed boolean, reward_xp integer, current_streak bigint, newly_earned jsonb)
language plpgsql security definer set search_path = public, extensions set row_security = off as $$
declare today date := public.learner_local_date(); event_id text; streak_days bigint := 0; reward integer := 15; earned jsonb := '[]'::jsonb; day_cursor date; completed_course_id text; certificate_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if exists (select 1 from public.learning_activity_events where user_id = auth.uid() and event_type = 'daily_reward_claimed' and public.learner_local_date(auth.uid(), occurred_at) = today) then
    select coalesce(s.current_streak, 0) into streak_days from public.get_learner_stats() s; return query select false, 0, streak_days, '[]'::jsonb; return;
  end if;
  event_id := extensions.gen_random_uuid()::text;
  insert into public.learning_activity_events (id,user_id,course_id,event_type,event_label,metadata) values (event_id,auth.uid(),null,'daily_reward_claimed','Daily reward',jsonb_build_object('xp',reward,'date',today));
  day_cursor := today;
  while exists (select 1 from public.learning_activity_events where user_id = auth.uid() and public.learner_local_date(auth.uid(), occurred_at) = day_cursor) loop streak_days := streak_days + 1; day_cursor := day_cursor - 1; exit when streak_days >= 365; end loop;
  if streak_days >= 7 then insert into public.learner_achievements (user_id,achievement_id,metadata) values (auth.uid(),'streak-7',jsonb_build_object('streak',streak_days)) on conflict do nothing; if found then earned := earned || jsonb_build_array('streak-7'); end if; end if;
  if streak_days >= 30 then insert into public.learner_achievements (user_id,achievement_id,metadata) values (auth.uid(),'streak-30',jsonb_build_object('streak',streak_days)) on conflict do nothing; if found then earned := earned || jsonb_build_array('streak-30'); end if; end if;
  if streak_days >= 100 then insert into public.learner_achievements (user_id,achievement_id,metadata) values (auth.uid(),'streak-100',jsonb_build_object('streak',streak_days)) on conflict do nothing; if found then earned := earned || jsonb_build_array('streak-100'); end if; end if;
  for completed_course_id in select e.course_id from public.enrollments e where e.user_id = auth.uid() and e.status = 'completed' loop
    insert into public.learner_certificates (user_id,course_id,certificate_code,metadata) values (auth.uid(),completed_course_id,'GINO-' || upper(substr(md5(auth.uid()::text || completed_course_id),1,12)),jsonb_build_object('source','course_completion')) on conflict (user_id,course_id) do nothing returning id into certificate_id;
    if certificate_id is not null then insert into public.learner_achievements (user_id,achievement_id,metadata) values (auth.uid(),'first-course-complete',jsonb_build_object('courseId',completed_course_id)) on conflict do nothing; if found then earned := earned || jsonb_build_array('first-course-complete'); end if; end if; certificate_id := null;
  end loop;
  return query select true,reward,streak_days,earned;
end; $$;

create or replace function public.get_learner_stats()
returns table (total_xp bigint, weekly_xp bigint, daily_xp bigint, reviewed_today bigint, total_reviews bigint, current_streak bigint, mastered_vocabulary bigint, due_vocabulary bigint, weekly_activity jsonb, topic_mastery jsonb)
language sql stable security definer set search_path = public set row_security = off as $$
with today as (select public.learner_local_date() as local_day), events as (
 select public.learner_local_date(auth.uid(), occurred_at) as local_day, event_type, case when event_type='lesson_completed' then 25 when event_type='vocabulary_reviewed' then 10 when event_type='review_answered' then 5 when event_type='assessment_submitted' then 40 when event_type='daily_reward_claimed' then 15 else 0 end xp from public.learning_activity_events where user_id=auth.uid()
), active_days as (select distinct local_day from events), numbered_days as (select local_day, local_day + row_number() over(order by local_day desc)::integer group_key from active_days), streak as (select case when max(local_day)>=(select local_day-1 from today) then count(*) else 0 end value from numbered_days where group_key=(select group_key from numbered_days order by local_day desc limit 1)), week_days as (select generate_series((select local_day-6 from today),(select local_day from today),'1 day')::date local_day), weekly_activity as (select coalesce(jsonb_agg(jsonb_build_object('date',w.local_day,'reviews',coalesce(r.reviews,0),'xp',coalesce(r.xp,0)) order by w.local_day),'[]'::jsonb) value from week_days w left join (select local_day,count(*) reviews,sum(xp) xp from events where local_day >= (select local_day-6 from today) group by local_day) r on r.local_day=w.local_day), topic_mastery as (select coalesce(jsonb_agg(jsonb_build_object('courseId',topic.course_id,'courseTitle',topic.course_title,'mastered',topic.mastered,'total',topic.total,'percent',round(100.0*topic.mastered/nullif(topic.total,0))) order by topic.course_title),'[]'::jsonb) value from (select c.id course_id,c.title course_title,count(distinct lv.vocabulary_item_id) total,count(distinct lv.vocabulary_item_id) filter(where vp.status='mastered') mastered from public.courses c join public.lessons l on l.course_id=c.id and l.status='published' join public.lesson_vocabulary lv on lv.lesson_id=l.id left join public.vocabulary_progress vp on vp.vocabulary_item_id=lv.vocabulary_item_id and vp.user_id=auth.uid() where public.can_read_course(c.id) group by c.id,c.title) topic)
select coalesce((select sum(xp) from events),0),coalesce((select sum(xp) from events where local_day >= (select local_day-6 from today)),0),coalesce((select sum(xp) from events where local_day=(select local_day from today)),0),coalesce((select count(*) from events where local_day=(select local_day from today) and event_type in('vocabulary_reviewed','review_answered')),0),coalesce((select count(*) from events where event_type in('vocabulary_reviewed','review_answered')),0),coalesce((select value from streak),0),(select count(*) from public.vocabulary_progress where user_id=auth.uid() and status='mastered'),(select count(*) from public.vocabulary_progress where user_id=auth.uid() and status<>'mastered'),(select value from weekly_activity),(select value from topic_mastery);
$$;

revoke all on function public.learner_timezone(uuid), public.learner_local_date(uuid,timestamptz) from public;
grant execute on function public.learner_timezone(uuid), public.learner_local_date(uuid,timestamptz) to authenticated;
commit;

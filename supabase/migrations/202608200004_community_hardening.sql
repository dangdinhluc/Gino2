begin;

create table if not exists public.community_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.community_reports (
  id uuid primary key default extensions.gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'post', 'message')),
  target_id text not null check (char_length(trim(target_id)) between 1 and 200),
  reason text not null check (char_length(trim(reason)) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create table if not exists public.community_groups (
  id text primary key default extensions.gen_random_uuid()::text,
  course_id text references public.courses(id) on delete set null,
  name text not null check (char_length(trim(name)) between 2 and 120),
  description text not null default '' check (char_length(description) <= 500),
  created_by uuid not null references auth.users(id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.community_group_members (
  group_id text not null references public.community_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.community_posts add column if not exists group_id text references public.community_groups(id) on delete set null;
create index if not exists community_groups_course_idx on public.community_groups(course_id, created_at desc);
create index if not exists community_group_members_user_idx on public.community_group_members(user_id, joined_at desc);
create index if not exists community_reports_status_idx on public.community_reports(status, created_at desc);
create index if not exists community_posts_group_idx on public.community_posts(group_id, created_at desc);

alter table public.community_blocks enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_groups enable row level security;
alter table public.community_group_members enable row level security;

drop policy if exists community_blocks_own on public.community_blocks;
create policy community_blocks_own on public.community_blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
drop policy if exists community_reports_own on public.community_reports;
create policy community_reports_own on public.community_reports for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists community_reports_owner on public.community_reports;
create policy community_reports_owner on public.community_reports for select to authenticated using (public.staff_role() in ('owner', 'admin', 'moderator'));
drop policy if exists community_groups_read_public on public.community_groups;
create policy community_groups_read_public on public.community_groups for select to authenticated using (is_public or exists (select 1 from public.community_group_members m where m.group_id = id and m.user_id = auth.uid()));
drop policy if exists community_groups_manage_owner on public.community_groups;
create policy community_groups_manage_owner on public.community_groups for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
drop policy if exists community_group_members_own_or_owner on public.community_group_members;
create policy community_group_members_own_or_owner on public.community_group_members for all to authenticated using (user_id = auth.uid() or exists (select 1 from public.community_group_members m where m.group_id = community_group_members.group_id and m.user_id = auth.uid() and m.role in ('owner', 'moderator'))) with check (user_id = auth.uid() or exists (select 1 from public.community_group_members m where m.group_id = community_group_members.group_id and m.user_id = auth.uid() and m.role in ('owner', 'moderator')));

grant select on public.community_groups, public.community_group_members to authenticated;
grant insert, delete on public.community_blocks to authenticated;
grant insert on public.community_reports to authenticated;
grant select on public.community_reports to authenticated;

create or replace function public.block_community_user(target_user_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null or target_user_id = auth.uid() then raise exception 'INVALID_BLOCK_TARGET' using errcode = '22023'; end if;
  insert into public.community_blocks (blocker_id, blocked_id) values (auth.uid(), target_user_id) on conflict do nothing;
end; $$;

create or replace function public.unblock_community_user(target_user_id uuid)
returns void language sql security invoker set search_path = public as $$
  delete from public.community_blocks where blocker_id = auth.uid() and blocked_id = target_user_id;
$$;

create or replace function public.report_community_content(target_type text, target_id text, target_reason text)
returns uuid language plpgsql security invoker set search_path = public as $$
declare report_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_type not in ('profile', 'post', 'message') or char_length(trim(coalesce(target_reason, ''))) not between 1 and 500 then raise exception 'INVALID_REPORT' using errcode = '22023'; end if;
  insert into public.community_reports (reporter_id, target_type, target_id, reason) values (auth.uid(), target_type, trim(target_id), trim(target_reason)) on conflict (reporter_id, target_type, target_id) do update set reason = excluded.reason, status = 'open', reviewed_by = null, reviewed_at = null returning id into report_id;
  return report_id;
end; $$;

create or replace function public.get_community_leaderboard(target_limit integer default 20)
returns table (user_id uuid, display_name text, handle text, weekly_xp bigint, current_streak bigint)
language sql security definer set search_path = public, extensions set row_security = off as $$
  with public_users as (
    select cp.user_id, p.display_name, cp.handle from public.community_profiles cp join public.profiles p on p.user_id = cp.user_id where cp.is_public and not exists (select 1 from public.community_blocks b where b.blocker_id = auth.uid() and b.blocked_id = cp.user_id)
  ), xp as (
    select e.user_id, sum(case when e.event_type = 'lesson_completed' then 25 when e.event_type = 'vocabulary_reviewed' then 10 when e.event_type = 'review_answered' then 5 when e.event_type = 'assessment_submitted' then 40 when e.event_type = 'daily_reward_claimed' then 15 else 0 end)::bigint as weekly_xp
    from public.learning_activity_events e where e.occurred_at >= now() - interval '7 days' group by e.user_id
  )
  select u.user_id, u.display_name, u.handle, coalesce(x.weekly_xp, 0), 0::bigint from public_users u left join xp x on x.user_id = u.user_id order by 4 desc, u.display_name limit greatest(1, least(coalesce(target_limit, 20), 50));
$$;

create or replace function public.list_community_groups(target_limit integer default 30)
returns table (id text, course_id text, name text, description text, member_count bigint, joined boolean)
language sql security definer set search_path = public as $$
  select g.id, g.course_id, g.name, g.description, (select count(*) from public.community_group_members gm where gm.group_id = g.id), exists(select 1 from public.community_group_members mine where mine.group_id = g.id and mine.user_id = auth.uid())
  from public.community_groups g where g.is_public order by g.created_at desc limit greatest(1, least(coalesce(target_limit, 30), 50));
$$;

create or replace function public.join_community_group(target_group_id text)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if not exists (select 1 from public.community_groups where id = target_group_id and is_public) then raise exception 'COMMUNITY_GROUP_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into public.community_group_members (group_id, user_id) values (target_group_id, auth.uid()) on conflict do nothing;
end; $$;

create or replace function public.leave_community_group(target_group_id text)
returns void language sql security invoker set search_path = public as $$
  delete from public.community_group_members where group_id = target_group_id and user_id = auth.uid() and role <> 'owner';
$$;

-- Blocked users cannot be searched, followed, messaged, or shown in feed.
create or replace function public.follow_community_user(target_user_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_user_id = auth.uid() then raise exception 'CANNOT_FOLLOW_SELF' using errcode = '22023'; end if;
  if exists (select 1 from public.community_blocks where (blocker_id = auth.uid() and blocked_id = target_user_id) or (blocker_id = target_user_id and blocked_id = auth.uid())) then raise exception 'COMMUNITY_USER_BLOCKED' using errcode = '42501'; end if;
  if not exists (select 1 from public.community_profiles where user_id = target_user_id and is_public) then raise exception 'COMMUNITY_USER_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into public.community_follows (follower_id, followed_id) values (auth.uid(), target_user_id) on conflict do nothing;
end; $$;

create or replace function public.send_community_message(target_user_id uuid, target_body text)
returns table (message_id text) language plpgsql security invoker set search_path = public as $$
declare new_id text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_user_id = auth.uid() or exists (select 1 from public.community_blocks where (blocker_id = auth.uid() and blocked_id = target_user_id) or (blocker_id = target_user_id and blocked_id = auth.uid())) then raise exception 'COMMUNITY_USER_BLOCKED' using errcode = '42501'; end if;
  if char_length(trim(coalesce(target_body, ''))) not between 1 and 2000 then raise exception 'INVALID_MESSAGE' using errcode = '22023'; end if;
  if not exists (select 1 from public.community_profiles where user_id = target_user_id and is_public) then raise exception 'COMMUNITY_USER_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into public.community_messages (sender_id, recipient_id, body) values (auth.uid(), target_user_id, trim(target_body)) returning id into new_id;
  message_id := new_id;
  return next;
end; $$;

create or replace function public.get_community_feed(target_limit integer default 50)
returns table (post_id text, user_id uuid, display_name text, handle text, body text, post_type text, metadata jsonb, created_at timestamptz)
language sql security definer set search_path = public as $$
  select cp.id, cp.user_id, p.display_name, profile.handle, cp.body, cp.post_type, cp.metadata, cp.created_at
  from public.community_posts cp join public.community_profiles profile on profile.user_id = cp.user_id and profile.is_public join public.profiles p on p.user_id = cp.user_id
  where cp.deleted_at is null and not exists (select 1 from public.community_blocks b where (b.blocker_id = auth.uid() and b.blocked_id = cp.user_id) or (b.blocker_id = cp.user_id and b.blocked_id = auth.uid()))
  order by cp.created_at desc limit greatest(1, least(coalesce(target_limit, 50), 100));
$$;

create or replace function public.get_community_leaderboard(target_limit integer default 20)
returns table (user_id uuid, display_name text, handle text, weekly_xp bigint, current_streak bigint)
language sql security definer set search_path = public, extensions set row_security = off as $$
  with public_users as (
    select cp.user_id, p.display_name, cp.handle from public.community_profiles cp join public.profiles p on p.user_id = cp.user_id where cp.is_public and not exists (select 1 from public.community_blocks b where (b.blocker_id = auth.uid() and b.blocked_id = cp.user_id) or (b.blocker_id = cp.user_id and b.blocked_id = auth.uid()))
  ), xp as (
    select e.user_id, sum(case when e.event_type = 'lesson_completed' then 25 when e.event_type = 'vocabulary_reviewed' then 10 when e.event_type = 'review_answered' then 5 when e.event_type = 'assessment_submitted' then 40 when e.event_type = 'daily_reward_claimed' then 15 else 0 end)::bigint as weekly_xp from public.learning_activity_events e where e.occurred_at >= now() - interval '7 days' group by e.user_id
  ) select u.user_id, u.display_name, u.handle, coalesce(x.weekly_xp, 0), 0::bigint from public_users u left join xp x on x.user_id = u.user_id order by 4 desc, u.display_name limit greatest(1, least(coalesce(target_limit, 20), 50));
$$;

create or replace function public.search_community_members(target_query text default '', target_limit integer default 30)
returns table (user_id uuid, display_name text, handle text, bio text, follower_count bigint, following boolean)
language sql security definer set search_path = public as $$
  select cp.user_id, p.display_name, cp.handle, cp.bio, (select count(*) from public.community_follows f where f.followed_id = cp.user_id), exists (select 1 from public.community_follows f where f.follower_id = auth.uid() and f.followed_id = cp.user_id)
  from public.community_profiles cp join public.profiles p on p.user_id = cp.user_id
  where cp.is_public and cp.user_id <> auth.uid() and not exists (select 1 from public.community_blocks b where (b.blocker_id = auth.uid() and b.blocked_id = cp.user_id) or (b.blocker_id = cp.user_id and b.blocked_id = auth.uid()))
    and (coalesce(target_query, '') = '' or cp.handle ilike '%' || target_query || '%' or p.display_name ilike '%' || target_query || '%') order by 5 desc, p.display_name limit greatest(1, least(coalesce(target_limit, 30), 50));
$$;

revoke all on function public.block_community_user(uuid), public.unblock_community_user(uuid), public.report_community_content(text, text, text), public.get_community_leaderboard(integer), public.list_community_groups(integer), public.join_community_group(text), public.leave_community_group(text) from public;
grant execute on function public.block_community_user(uuid), public.unblock_community_user(uuid), public.report_community_content(text, text, text), public.get_community_leaderboard(integer), public.list_community_groups(integer), public.join_community_group(text), public.leave_community_group(text) to authenticated;

-- Realtime messages. Safe to run repeatedly.
do $$ begin
  alter publication supabase_realtime add table public.community_messages;
exception when duplicate_object then null;
end $$;

commit;

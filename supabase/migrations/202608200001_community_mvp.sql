begin;

create table if not exists public.community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,32}$'),
  bio text not null default '' check (char_length(bio) <= 240),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);

create table if not exists public.community_posts (
  id text primary key default extensions.gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  post_type text not null default 'text' check (post_type in ('text', 'progress')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.community_messages (
  id text primary key default extensions.gen_random_uuid()::text,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_user_id_idx on public.community_posts (user_id, created_at desc);
create index if not exists community_messages_pair_idx on public.community_messages (sender_id, recipient_id, created_at desc);
create index if not exists community_messages_recipient_unread_idx on public.community_messages (recipient_id, read_at) where read_at is null;

create or replace function public.community_profile_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists community_profiles_set_updated_at on public.community_profiles;
create trigger community_profiles_set_updated_at
before update on public.community_profiles
for each row execute function public.community_profile_touch_updated_at();

create or replace function public.ensure_community_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
begin
  if new.profile_role = 'learner' then
    base_handle := 'learner_' || substr(replace(new.user_id::text, '-', ''), 1, 24);
    insert into public.community_profiles (user_id, handle)
    values (new.user_id, base_handle)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists community_profile_on_profile_created on public.profiles;
create trigger community_profile_on_profile_created
after insert on public.profiles
for each row execute function public.ensure_community_profile();

insert into public.community_profiles (user_id, handle)
select p.user_id, 'learner_' || substr(replace(p.user_id::text, '-', ''), 1, 24)
from public.profiles p
on conflict (user_id) do nothing;

alter table public.community_profiles enable row level security;
alter table public.community_follows enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_messages enable row level security;

drop policy if exists community_profiles_select_public on public.community_profiles;
create policy community_profiles_select_public
on public.community_profiles for select to authenticated
using (is_public or user_id = auth.uid());

drop policy if exists community_profiles_insert_own on public.community_profiles;
create policy community_profiles_insert_own
on public.community_profiles for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists community_profiles_update_own on public.community_profiles;
create policy community_profiles_update_own
on public.community_profiles for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists community_follows_select_own on public.community_follows;
create policy community_follows_select_own
on public.community_follows for select to authenticated
using (follower_id = auth.uid() or followed_id = auth.uid());

drop policy if exists community_follows_insert_own on public.community_follows;
create policy community_follows_insert_own
on public.community_follows for insert to authenticated
with check (follower_id = auth.uid());

drop policy if exists community_follows_delete_own on public.community_follows;
create policy community_follows_delete_own
on public.community_follows for delete to authenticated
using (follower_id = auth.uid());

drop policy if exists community_posts_select_public on public.community_posts;
create policy community_posts_select_public
on public.community_posts for select to authenticated
using (
  deleted_at is null
  and (user_id = auth.uid() or exists (
    select 1 from public.community_profiles cp
    where cp.user_id = community_posts.user_id and cp.is_public
  ))
);

drop policy if exists community_posts_insert_own on public.community_posts;
create policy community_posts_insert_own
on public.community_posts for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists community_posts_update_own on public.community_posts;
create policy community_posts_update_own
on public.community_posts for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists community_messages_select_own on public.community_messages;
create policy community_messages_select_own
on public.community_messages for select to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid());

drop policy if exists community_messages_insert_own on public.community_messages;
create policy community_messages_insert_own
on public.community_messages for insert to authenticated
with check (sender_id = auth.uid());

drop policy if exists community_messages_update_recipient on public.community_messages;
create policy community_messages_update_recipient
on public.community_messages for update to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

create or replace function public.upsert_community_profile(
  target_handle text,
  target_bio text default '',
  target_public boolean default true
)
returns table (user_id uuid, handle text, bio text, is_public boolean)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_handle !~ '^[a-z0-9_]{3,32}$' then raise exception 'INVALID_HANDLE' using errcode = '22023'; end if;
  if char_length(coalesce(target_bio, '')) > 240 then raise exception 'INVALID_BIO' using errcode = '22023'; end if;
  insert into public.community_profiles (user_id, handle, bio, is_public)
  values (auth.uid(), target_handle, coalesce(target_bio, ''), coalesce(target_public, true))
  on conflict (user_id) do update set handle = excluded.handle, bio = excluded.bio, is_public = excluded.is_public
  returning community_profiles.user_id, community_profiles.handle, community_profiles.bio, community_profiles.is_public
  into user_id, handle, bio, is_public;
  return next;
exception when unique_violation then
  raise exception 'HANDLE_TAKEN' using errcode = '23505';
end;
$$;

create or replace function public.get_community_me()
returns table (user_id uuid, display_name text, email text, handle text, bio text, is_public boolean)
language sql
security invoker
set search_path = public
as $$
  select p.user_id, p.display_name, p.email, cp.handle, cp.bio, cp.is_public
  from public.profiles p
  left join public.community_profiles cp on cp.user_id = p.user_id
  where p.user_id = auth.uid();
$$;

create or replace function public.search_community_members(target_query text default '', target_limit integer default 30)
returns table (user_id uuid, display_name text, handle text, bio text, follower_count bigint, following boolean)
language sql
security definer
set search_path = public
as $$
  select cp.user_id,
    p.display_name,
    cp.handle,
    cp.bio,
    (select count(*) from public.community_follows f where f.followed_id = cp.user_id),
    exists (select 1 from public.community_follows f where f.follower_id = auth.uid() and f.followed_id = cp.user_id)
  from public.community_profiles cp
  join public.profiles p on p.user_id = cp.user_id
  where cp.is_public
    and cp.user_id <> auth.uid()
    and (coalesce(target_query, '') = '' or cp.handle ilike '%' || target_query || '%' or p.display_name ilike '%' || target_query || '%')
  order by 5 desc, p.display_name
  limit greatest(1, least(coalesce(target_limit, 30), 50));
$$;

create or replace function public.follow_community_user(target_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_user_id = auth.uid() then raise exception 'CANNOT_FOLLOW_SELF' using errcode = '22023'; end if;
  if not exists (select 1 from public.community_profiles where user_id = target_user_id and is_public) then raise exception 'COMMUNITY_USER_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into public.community_follows (follower_id, followed_id) values (auth.uid(), target_user_id) on conflict do nothing;
end;
$$;

create or replace function public.unfollow_community_user(target_user_id uuid)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.community_follows where follower_id = auth.uid() and followed_id = target_user_id;
$$;

create or replace function public.create_community_post(target_body text)
returns table (post_id text)
language plpgsql
security invoker
set search_path = public
as $$
declare new_id text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if char_length(trim(coalesce(target_body, ''))) not between 1 and 1000 then raise exception 'INVALID_POST' using errcode = '22023'; end if;
  if not exists (select 1 from public.community_profiles where user_id = auth.uid() and is_public) then raise exception 'PUBLIC_PROFILE_REQUIRED' using errcode = '42501'; end if;
  insert into public.community_posts (user_id, body, post_type) values (auth.uid(), trim(target_body), 'text') returning id into new_id;
  post_id := new_id;
  return next;
end;
$$;

create or replace function public.create_progress_post()
returns table (post_id text, daily_xp integer, current_streak integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_id text;
  xp_today integer;
  streak integer := 0;
  cursor_day date := (now() at time zone 'UTC')::date;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if not exists (select 1 from public.community_profiles where user_id = auth.uid() and is_public) then raise exception 'PUBLIC_PROFILE_REQUIRED' using errcode = '42501'; end if;
  select coalesce(sum(case when event_type = 'vocabulary_reviewed' then 10 when event_type = 'review_answered' then 5 when event_type = 'lesson_completed' then 25 when event_type = 'assessment_submitted' then 40 when event_type = 'game_completed' then 5 else 0 end), 0)::integer
  into xp_today from public.learning_activity_events
  where user_id = auth.uid() and occurred_at::date = cursor_day;
  while exists (select 1 from public.learning_activity_events where user_id = auth.uid() and occurred_at::date = cursor_day) loop
    streak := streak + 1;
    cursor_day := cursor_day - 1;
    exit when streak >= 365;
  end loop;
  insert into public.community_posts (user_id, body, post_type, metadata)
  values (auth.uid(), format('Hôm nay tôi đã tích lũy %s XP và giữ chuỗi %s ngày học tập.', xp_today, streak), 'progress', jsonb_build_object('dailyXp', xp_today, 'currentStreak', streak))
  returning id into new_id;
  post_id := new_id;
  daily_xp := xp_today;
  current_streak := streak;
  return next;
end;
$$;

create or replace function public.get_community_feed(target_limit integer default 50)
returns table (post_id text, user_id uuid, display_name text, handle text, body text, post_type text, metadata jsonb, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select cp.id, cp.user_id, p.display_name, profile.handle, cp.body, cp.post_type, cp.metadata, cp.created_at
  from public.community_posts cp
  join public.community_profiles profile on profile.user_id = cp.user_id and profile.is_public
  join public.profiles p on p.user_id = cp.user_id
  where cp.deleted_at is null
  order by cp.created_at desc
  limit greatest(1, least(coalesce(target_limit, 50), 100));
$$;

create or replace function public.list_community_threads()
returns table (other_user_id uuid, display_name text, handle text, last_body text, last_at timestamptz, unread_count bigint)
language sql
security definer
set search_path = public
as $$
  with participants as (
    select case when sender_id = auth.uid() then recipient_id else sender_id end as other_user_id
    from public.community_messages
    where sender_id = auth.uid() or recipient_id = auth.uid()
    group by 1
  )
  select part.other_user_id, p.display_name, cp.handle, latest.body, latest.created_at,
    (select count(*) from public.community_messages unread where unread.sender_id = part.other_user_id and unread.recipient_id = auth.uid() and unread.read_at is null)
  from participants part
  join public.profiles p on p.user_id = part.other_user_id
  join public.community_profiles cp on cp.user_id = part.other_user_id and cp.is_public
  cross join lateral (
    select m.body, m.created_at from public.community_messages m
    where (m.sender_id = auth.uid() and m.recipient_id = part.other_user_id) or (m.sender_id = part.other_user_id and m.recipient_id = auth.uid())
    order by m.created_at desc limit 1
  ) latest
  order by latest.created_at desc;
$$;

create or replace function public.get_community_messages(target_user_id uuid, target_limit integer default 100)
returns table (id text, sender_id uuid, recipient_id uuid, body text, read_at timestamptz, created_at timestamptz)
language sql
security invoker
set search_path = public
as $$
  update public.community_messages set read_at = coalesce(read_at, now())
  where sender_id = target_user_id and recipient_id = auth.uid();
  select m.id, m.sender_id, m.recipient_id, m.body, m.read_at, m.created_at
  from public.community_messages m
  where (m.sender_id = auth.uid() and m.recipient_id = target_user_id) or (m.sender_id = target_user_id and m.recipient_id = auth.uid())
  order by m.created_at asc
  limit greatest(1, least(coalesce(target_limit, 100), 200));
$$;

create or replace function public.send_community_message(target_user_id uuid, target_body text)
returns table (message_id text)
language plpgsql
security invoker
set search_path = public
as $$
declare new_id text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_user_id = auth.uid() then raise exception 'CANNOT_MESSAGE_SELF' using errcode = '22023'; end if;
  if char_length(trim(coalesce(target_body, ''))) not between 1 and 2000 then raise exception 'INVALID_MESSAGE' using errcode = '22023'; end if;
  if not exists (select 1 from public.community_profiles where user_id = target_user_id and is_public) then raise exception 'COMMUNITY_USER_NOT_FOUND' using errcode = 'P0002'; end if;
  insert into public.community_messages (sender_id, recipient_id, body) values (auth.uid(), target_user_id, trim(target_body)) returning id into new_id;
  message_id := new_id;
  return next;
end;
$$;

revoke all on function public.upsert_community_profile(text, text, boolean) from public;
revoke all on function public.get_community_me() from public;
revoke all on function public.search_community_members(text, integer) from public;
revoke all on function public.follow_community_user(uuid) from public;
revoke all on function public.unfollow_community_user(uuid) from public;
revoke all on function public.create_community_post(text) from public;
revoke all on function public.create_progress_post() from public;
revoke all on function public.get_community_feed(integer) from public;
revoke all on function public.list_community_threads() from public;
revoke all on function public.get_community_messages(uuid, integer) from public;
revoke all on function public.send_community_message(uuid, text) from public;
grant execute on function public.upsert_community_profile(text, text, boolean) to authenticated;
grant execute on function public.get_community_me() to authenticated;
grant execute on function public.search_community_members(text, integer) to authenticated;
grant execute on function public.follow_community_user(uuid) to authenticated;
grant execute on function public.unfollow_community_user(uuid) to authenticated;
grant execute on function public.create_community_post(text) to authenticated;
grant execute on function public.create_progress_post() to authenticated;
grant execute on function public.get_community_feed(integer) to authenticated;
grant execute on function public.list_community_threads() to authenticated;
grant execute on function public.get_community_messages(uuid, integer) to authenticated;
grant execute on function public.send_community_message(uuid, text) to authenticated;

commit;

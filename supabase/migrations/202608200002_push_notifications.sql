begin;

-- 1. Learner push preference.
alter table public.learner_settings
  add column if not exists push_notifications boolean not null default false;

-- 2. Device push subscriptions (one per user + endpoint + auth key).
create table if not exists public.push_subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);
drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions for each row execute function public.set_updated_at();

-- 3. Allow the `push` channel on notification_deliveries.
alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_channel_check;
alter table public.notification_deliveries
  add constraint notification_deliveries_channel_check
  check (channel in ('email', 'push'));

create index if not exists notification_deliveries_push_dispatch_idx
  on public.notification_deliveries (channel, status, created_at)
  where channel = 'push' and status in ('pending', 'processing', 'failed');

-- 4. Register / unregister a device subscription.
create or replace function public.register_push_subscription(
  target_endpoint text,
  target_p256dh text,
  target_auth text,
  target_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  next_id uuid := extensions.gen_random_uuid();
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if length(btrim(target_endpoint)) < 8 or length(btrim(target_endpoint)) > 2048 then raise exception 'INVALID_PUSH_ENDPOINT' using errcode = '22023'; end if;
  if length(btrim(target_p256dh)) < 8 or length(btrim(target_auth)) < 8 then raise exception 'INVALID_PUSH_KEY' using errcode = '22023'; end if;
  insert into public.push_subscriptions (id, user_id, endpoint, p256dh, auth, user_agent)
  values (next_id, auth.uid(), btrim(target_endpoint), btrim(target_p256dh), btrim(target_auth), nullif(btrim(coalesce(target_user_agent, '')), ''))
  on conflict (user_id, endpoint)
  do update set p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent, updated_at = now()
  returning id into next_id;
  return next_id;
end;
$$;

create or replace function public.unregister_push_subscription(target_endpoint text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  delete from public.push_subscriptions where user_id = auth.uid() and endpoint = btrim(target_endpoint);
end;
$$;

-- 5. Claim push deliveries (service_role only), honouring the learner preference.
create or replace function public.claim_notification_push_deliveries(target_batch_size integer default 50)
returns table (
  delivery_id uuid,
  notification_id uuid,
  user_id uuid,
  title text,
  body text,
  action_url text,
  status text,
  attempts integer
)
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501'; end if;
  if target_batch_size is null or target_batch_size not between 1 and 100 then raise exception 'INVALID_BATCH_SIZE' using errcode = '22023'; end if;

  return query
  with candidates as (
    select nd.id
    from public.notification_deliveries as nd
    where nd.channel = 'push'
      and (
        nd.status = 'pending'
        or (
          nd.status = 'failed'
          and nd.attempts < 5
          and (nd.last_attempt_at is null or nd.last_attempt_at <= now() - (interval '5 minutes' * power(2, least(nd.attempts, 4))))
        )
        or (nd.status = 'processing' and nd.locked_at is not null and nd.locked_at <= now() - interval '15 minutes')
      )
    order by nd.created_at
    limit target_batch_size
    for update skip locked
  ), marked as (
    update public.notification_deliveries as nd
    set
      status = case when coalesce((select ls.push_notifications from public.learner_settings as ls join public.notifications as n on n.user_id = ls.user_id where n.id = nd.notification_id), false) then 'processing' else 'skipped' end,
      attempts = case when coalesce((select ls.push_notifications from public.learner_settings as ls join public.notifications as n on n.user_id = ls.user_id where n.id = nd.notification_id), false) then least(nd.attempts + 1, 5) else nd.attempts end,
      locked_at = case when coalesce((select ls.push_notifications from public.learner_settings as ls join public.notifications as n on n.user_id = ls.user_id where n.id = nd.notification_id), false) then now() else null end,
      last_attempt_at = case when coalesce((select ls.push_notifications from public.learner_settings as ls join public.notifications as n on n.user_id = ls.user_id where n.id = nd.notification_id), false) then now() else nd.last_attempt_at end,
      last_error = case when coalesce((select ls.push_notifications from public.learner_settings as ls join public.notifications as n on n.user_id = ls.user_id where n.id = nd.notification_id), false) then null else 'PUSH_NOT_ENABLED' end
    where nd.id in (select c.id from candidates as c)
    returning nd.id, nd.notification_id, nd.status, nd.attempts
  )
  select
    m.id, m.notification_id, n.user_id, n.title, n.body, n.action_url, m.status, m.attempts
  from marked as m
  join public.notifications as n on n.id = m.notification_id;
end;
$$;

-- 6. Complete a push delivery (service_role only).
create or replace function public.complete_notification_push_delivery(
  target_delivery_id uuid,
  target_status text,
  target_error text default null
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501'; end if;
  if target_status not in ('sent', 'failed', 'skipped') then raise exception 'INVALID_DELIVERY_STATUS' using errcode = '22023'; end if;
  update public.notification_deliveries
  set status = target_status,
      last_error = case when target_status = 'sent' then null else left(coalesce(target_error, 'DELIVERY_FAILED'), 2000) end,
      sent_at = case when target_status = 'sent' then now() else sent_at end,
      locked_at = null
  where id = target_delivery_id and status = 'processing';
end;
$$;

-- 7. Create push deliveries alongside email for announcements + due reminders.
create or replace function public.create_announcement(
  target_title text,
  target_body text,
  target_audience text default 'all_learners',
  target_course_id text default null,
  target_action_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  next_announcement_id uuid := extensions.gen_random_uuid();
  normalized_action_url text := nullif(btrim(target_action_url), '');
begin
  if not public.has_staff_permission('announcement.manage') then raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501'; end if;
  if length(btrim(coalesce(target_title, ''))) not between 1 and 180 then raise exception 'INVALID_ANNOUNCEMENT_TITLE' using errcode = '22023'; end if;
  if length(btrim(coalesce(target_body, ''))) not between 1 and 5000 then raise exception 'INVALID_ANNOUNCEMENT_BODY' using errcode = '22023'; end if;
  if target_audience not in ('all_learners', 'active_learners', 'course_learners') then raise exception 'INVALID_AUDIENCE' using errcode = '22023'; end if;
  if target_audience = 'course_learners' and target_course_id is null then raise exception 'COURSE_REQUIRED' using errcode = '22023'; end if;
  if target_course_id is not null and not exists (select 1 from public.courses as c where c.id = target_course_id) then raise exception 'COURSE_NOT_FOUND' using errcode = '22023'; end if;
  if normalized_action_url is not null and (length(normalized_action_url) > 500 or left(normalized_action_url, 1) <> '/' or left(normalized_action_url, 2) = '//' or normalized_action_url !~ '^/[A-Za-z0-9_/?#&=.%:+~,-]*$') then raise exception 'INVALID_ACTION_URL' using errcode = '22023'; end if;

  insert into public.announcements (id, title, body, audience, course_id, action_url, created_by)
  values (next_announcement_id, btrim(target_title), btrim(target_body), target_audience, target_course_id, normalized_action_url, auth.uid());

  insert into public.notifications (user_id, announcement_id, notification_type, title, body, action_url)
  select p.user_id, next_announcement_id, 'announcement', btrim(target_title), btrim(target_body), normalized_action_url
  from public.profiles as p
  where p.profile_role = 'learner'
    and (target_audience = 'all_learners'
      or (target_audience = 'active_learners' and exists (select 1 from public.enrollments as e where e.user_id = p.user_id and e.status in ('active', 'completed')))
      or (target_audience = 'course_learners' and exists (select 1 from public.enrollments as e where e.user_id = p.user_id and e.course_id = target_course_id and e.status in ('active', 'completed'))));

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email' from public.notifications as n
  join public.learner_settings as ls on ls.user_id = n.user_id and ls.email_notifications
  where n.announcement_id = next_announcement_id
  on conflict do nothing;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'push' from public.notifications as n
  join public.learner_settings as ls on ls.user_id = n.user_id and ls.push_notifications
  where n.announcement_id = next_announcement_id
  on conflict do nothing;

  return next_announcement_id;
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
  if auth.role() <> 'service_role' then raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501'; end if;
  insert into public.notifications (user_id, notification_type, title, body, action_url)
  select ls.user_id, 'review_due', 'Đến giờ ôn từ vựng', 'Anh có thẻ nhớ đến hạn hôm nay. Ôn một lượt ngắn để giữ nhịp.', '/app/review/flashcards?mode=due'
  from public.learner_settings as ls
  where (ls.in_app_notifications or ls.email_notifications or ls.push_notifications)
    and exists (select 1 from public.vocabulary_progress as vp where vp.user_id = ls.user_id and vp.due_at <= now())
    and not exists (select 1 from public.notifications as n where n.user_id = ls.user_id and n.notification_type = 'review_due' and n.created_at::date = current_date);
  get diagnostics queued_count = row_count;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email' from public.notifications as n
  join public.learner_settings as ls on ls.user_id = n.user_id and ls.email_notifications
  where n.notification_type = 'review_due' and n.created_at::date = current_date
  on conflict do nothing;

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'push' from public.notifications as n
  join public.learner_settings as ls on ls.user_id = n.user_id and ls.push_notifications
  where n.notification_type = 'review_due' and n.created_at::date = current_date
  on conflict do nothing;

  return queued_count;
end;
$$;

-- 8. Grants.
revoke all on function public.register_push_subscription(text, text, text, text) from public;
revoke all on function public.unregister_push_subscription(text) from public;
revoke all on function public.claim_notification_push_deliveries(integer) from public;
revoke all on function public.complete_notification_push_delivery(uuid, text, text) from public;
revoke all on function public.create_announcement(text, text, text, text, text) from public;
revoke all on function public.queue_due_reminders() from public;

grant execute on function public.register_push_subscription(text, text, text, text) to authenticated;
grant execute on function public.unregister_push_subscription(text) to authenticated;
grant execute on function public.claim_notification_push_deliveries(integer) to service_role;
grant execute on function public.complete_notification_push_delivery(uuid, text, text) to service_role;
grant execute on function public.create_announcement(text, text, text, text, text) to authenticated;
grant execute on function public.queue_due_reminders() to service_role;

-- 9. RLS: users read/delete only their own subscriptions.
alter table public.push_subscriptions enable row level security;
drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_select_own on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
create policy push_subscriptions_insert_own on public.push_subscriptions for insert to authenticated with check (user_id = auth.uid());
create policy push_subscriptions_delete_own on public.push_subscriptions for delete to authenticated using (user_id = auth.uid());

commit;

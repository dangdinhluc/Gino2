begin;

alter table public.notification_deliveries
  add column if not exists locked_at timestamptz,
  add column if not exists last_attempt_at timestamptz;

alter table public.notification_deliveries
  drop constraint if exists notification_deliveries_status_check;

alter table public.notification_deliveries
  add constraint notification_deliveries_status_check
  check (status in ('pending', 'processing', 'sent', 'failed', 'skipped'));

create index if not exists notification_deliveries_dispatch_idx
  on public.notification_deliveries (channel, status, created_at)
  where channel = 'email' and status in ('pending', 'processing', 'failed');

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
  if not public.has_staff_permission('announcement.manage') then
    raise exception 'STAFF_PERMISSION_REQUIRED' using errcode = '42501';
  end if;
  if length(btrim(coalesce(target_title, ''))) not between 1 and 180 then
    raise exception 'INVALID_ANNOUNCEMENT_TITLE' using errcode = '22023';
  end if;
  if length(btrim(coalesce(target_body, ''))) not between 1 and 5000 then
    raise exception 'INVALID_ANNOUNCEMENT_BODY' using errcode = '22023';
  end if;
  if target_audience not in ('all_learners', 'active_learners', 'course_learners') then
    raise exception 'INVALID_AUDIENCE' using errcode = '22023';
  end if;
  if target_audience = 'course_learners' and target_course_id is null then
    raise exception 'COURSE_REQUIRED' using errcode = '22023';
  end if;
  if target_course_id is not null and not exists (
    select 1 from public.courses as c where c.id = target_course_id
  ) then
    raise exception 'COURSE_NOT_FOUND' using errcode = '22023';
  end if;
  if normalized_action_url is not null and (
    length(normalized_action_url) > 500
    or left(normalized_action_url, 1) <> '/'
    or left(normalized_action_url, 2) = '//'
    or normalized_action_url !~ '^/[A-Za-z0-9_/?#&=.%:+~,-]*$'
  ) then
    raise exception 'INVALID_ACTION_URL' using errcode = '22023';
  end if;

  insert into public.announcements (id, title, body, audience, course_id, action_url, created_by)
  values (
    next_announcement_id,
    btrim(target_title),
    btrim(target_body),
    target_audience,
    target_course_id,
    normalized_action_url,
    auth.uid()
  );

  insert into public.notifications (user_id, announcement_id, notification_type, title, body, action_url)
  select p.user_id, next_announcement_id, 'announcement', btrim(target_title), btrim(target_body), normalized_action_url
  from public.profiles as p
  where p.profile_role = 'learner'
    and (
      target_audience = 'all_learners'
      or (
        target_audience = 'active_learners'
        and exists (
          select 1
          from public.enrollments as e
          where e.user_id = p.user_id and e.status in ('active', 'completed')
        )
      )
      or (
        target_audience = 'course_learners'
        and exists (
          select 1
          from public.enrollments as e
          where e.user_id = p.user_id
            and e.course_id = target_course_id
            and e.status in ('active', 'completed')
        )
      )
    );

  insert into public.notification_deliveries (notification_id, channel)
  select n.id, 'email'
  from public.notifications as n
  join public.learner_settings as ls
    on ls.user_id = n.user_id and ls.email_notifications
  where n.announcement_id = next_announcement_id
  on conflict do nothing;

  return next_announcement_id;
end;
$$;

create or replace function public.claim_notification_email_deliveries(target_batch_size integer default 25)
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
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if target_batch_size is null or target_batch_size not between 1 and 50 then
    raise exception 'INVALID_BATCH_SIZE' using errcode = '22023';
  end if;

  return query
  with candidates as (
    select nd.id
    from public.notification_deliveries as nd
    where nd.channel = 'email'
      and (
        nd.status = 'pending'
        or (
          nd.status = 'failed'
          and nd.attempts < 5
          and (
            nd.last_attempt_at is null
            or nd.last_attempt_at <= now() - (interval '5 minutes' * power(2, least(nd.attempts, 4)))
          )
        )
        or (
          nd.status = 'processing'
          and nd.locked_at is not null
          and nd.locked_at <= now() - interval '15 minutes'
        )
      )
    order by nd.created_at
    limit target_batch_size
    for update skip locked
  ), marked as (
    update public.notification_deliveries as nd
    set
      status = case when coalesce(ls.email_notifications, false) then 'processing' else 'skipped' end,
      attempts = case when coalesce(ls.email_notifications, false) then least(nd.attempts + 1, 5) else nd.attempts end,
      locked_at = case when coalesce(ls.email_notifications, false) then now() else null end,
      last_attempt_at = case when coalesce(ls.email_notifications, false) then now() else nd.last_attempt_at end,
      last_error = case when coalesce(ls.email_notifications, false) then null else 'EMAIL_NOT_ENABLED' end
    from candidates as c
    join public.notifications as n on n.id = nd.notification_id
    left join public.learner_settings as ls on ls.user_id = n.user_id
    where nd.id = c.id
    returning nd.id, nd.notification_id, nd.status, nd.attempts
  )
  select
    m.id,
    m.notification_id,
    n.user_id,
    n.title,
    n.body,
    n.action_url,
    m.status,
    m.attempts
  from marked as m
  join public.notifications as n on n.id = m.notification_id;
end;
$$;

create or replace function public.complete_notification_email_delivery(
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
  if auth.role() <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED' using errcode = '42501';
  end if;
  if target_status not in ('sent', 'failed', 'skipped') then
    raise exception 'INVALID_DELIVERY_STATUS' using errcode = '22023';
  end if;

  update public.notification_deliveries
  set
    status = target_status,
    last_error = case when target_status = 'sent' then null else left(coalesce(target_error, 'DELIVERY_FAILED'), 2000) end,
    sent_at = case when target_status = 'sent' then now() else sent_at end,
    locked_at = null
  where id = target_delivery_id and status = 'processing';
end;
$$;

revoke all on function public.create_announcement(text, text, text, text, text) from public;
revoke all on function public.claim_notification_email_deliveries(integer) from public;
revoke all on function public.complete_notification_email_delivery(uuid, text, text) from public;
grant execute on function public.create_announcement(text, text, text, text, text) to authenticated;
grant execute on function public.claim_notification_email_deliveries(integer) to service_role;
grant execute on function public.complete_notification_email_delivery(uuid, text, text) to service_role;

commit;

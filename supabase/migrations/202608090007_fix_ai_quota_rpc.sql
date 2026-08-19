begin;

create or replace function public.consume_ai_quota(target_feature text)
returns table (
  period_start date,
  feature text,
  request_count integer,
  monthly_quota integer
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  current_period date := date_trunc('month', now())::date;
  current_count integer;
  quota integer;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;
  if target_feature not in ('chat', 'writing') then
    raise exception 'INVALID_AI_FEATURE' using errcode = '22023';
  end if;

  select coalesce(max(p.ai_monthly_quota), 20) into quota
  from public.enrollments as e
  left join public.packages as p on p.id = e.package_id
  where e.user_id = auth.uid() and e.status in ('active', 'completed');
  if not exists (select 1 from public.enrollments as e where e.user_id = auth.uid() and e.status in ('active', 'completed')) then
    raise exception 'ENROLLMENT_REQUIRED' using errcode = '42501';
  end if;

  insert into public.ai_usage (user_id, period_start, feature, request_count)
  values (auth.uid(), current_period, target_feature, 1)
  on conflict on constraint ai_usage_pkey do update
    set request_count = public.ai_usage.request_count + 1,
        updated_at = now()
  returning ai_usage.request_count into current_count;
  if current_count > quota then
    raise exception 'AI_QUOTA_EXCEEDED' using errcode = 'P0001';
  end if;

  return query select current_period, target_feature, current_count, quota;
end;
$$;

revoke all on function public.consume_ai_quota(text) from public;
grant execute on function public.consume_ai_quota(text) to authenticated;

commit;

begin;

-- Failed provider calls must not consume monthly quota. Rate limiting remains
-- conservative; quota is reserved before provider work and released on failure.
create or replace function public.refund_ai_quota(target_feature text)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  current_period date := date_trunc('month', now())::date;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if target_feature not in ('chat', 'writing', 'speaking') then raise exception 'INVALID_AI_FEATURE' using errcode = '22023'; end if;
  update public.ai_usage
  set request_count = greatest(request_count - 1, 0), updated_at = now()
  where user_id = auth.uid() and period_start = current_period and feature = target_feature;
end;
$$;
revoke all on function public.refund_ai_quota(text) from public;
grant execute on function public.refund_ai_quota(text) to authenticated;

commit;

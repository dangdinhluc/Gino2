begin;

-- ai_rate_limits is mutated only through guarded SECURITY DEFINER RPCs.
drop policy if exists ai_rate_limits_no_client_access on public.ai_rate_limits;
create policy ai_rate_limits_no_client_access
on public.ai_rate_limits
for all
to authenticated
using (false)
with check (false);

commit;

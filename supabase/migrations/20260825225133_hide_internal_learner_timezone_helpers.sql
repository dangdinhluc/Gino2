begin;

-- Internal helpers accept an arbitrary user id and are used only from guarded
-- SECURITY DEFINER learner RPCs. Do not expose them as direct client RPCs.
revoke all on function public.learner_timezone(uuid) from public, anon, authenticated;
grant execute on function public.learner_timezone(uuid) to service_role;

revoke all on function public.learner_local_date(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.learner_local_date(uuid, timestamptz) to service_role;

commit;

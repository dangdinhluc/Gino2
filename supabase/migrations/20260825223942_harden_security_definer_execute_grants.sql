begin;

-- SECURITY DEFINER functions must never inherit PostgreSQL's default PUBLIC
-- execute privilege. Keep signed-in/client access explicit and remove anon.
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon', r.fn);
    execute format('grant execute on function %s to authenticated, service_role', r.fn);
  end loop;
end
$$;

-- Background notification RPCs are server-only.
revoke all on function public.queue_due_reminders() from public, anon, authenticated;
grant execute on function public.queue_due_reminders() to service_role;

revoke all on function public.claim_notification_email_deliveries(integer) from public, anon, authenticated;
grant execute on function public.claim_notification_email_deliveries(integer) to service_role;

revoke all on function public.claim_notification_push_deliveries(integer) from public, anon, authenticated;
grant execute on function public.claim_notification_push_deliveries(integer) to service_role;

revoke all on function public.complete_notification_email_delivery(uuid, text, text) from public, anon, authenticated;
grant execute on function public.complete_notification_email_delivery(uuid, text, text) to service_role;

revoke all on function public.complete_notification_push_delivery(uuid, text, text) from public, anon, authenticated;
grant execute on function public.complete_notification_push_delivery(uuid, text, text) to service_role;

-- Fixed search_path for the generic timestamp trigger helper.
alter function public.set_updated_at() set search_path = public;

commit;

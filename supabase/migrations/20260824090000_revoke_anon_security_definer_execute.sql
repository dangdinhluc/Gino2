begin;

-- Revoke anonymous execute from public SECURITY DEFINER functions.
-- Re-grant authenticated + service_role so existing learner/staff RPCs keep working.
-- Do not grant anon back. Do not drop authenticated access in this pass.

do $$
declare
  target record;
begin
  for target in
    select p.oid::regprocedure as fn
    from pg_proc as p
    join pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
      and has_function_privilege('anon', p.oid, 'EXECUTE')
  loop
    execute format('revoke all on function %s from public, anon', target.fn);
    execute format('grant execute on function %s to authenticated, service_role', target.fn);
  end loop;
end
$$;

commit;

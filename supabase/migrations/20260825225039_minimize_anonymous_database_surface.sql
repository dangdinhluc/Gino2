begin;

-- site_pages is the only intentionally anonymous public-schema relation.
do $$
declare
  r record;
begin
  for r in
    select format('%I.%I', n.nspname, c.relname) as fqname
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm', 'f')
      and c.relname <> 'site_pages'
  loop
    execute 'revoke all on table ' || r.fqname || ' from anon';
  end loop;
end
$$;

revoke all on table public.site_pages from anon;
grant select on table public.site_pages to anon;

do $$
declare
  r record;
begin
  for r in
    select format('%I.%I', n.nspname, c.relname) as fqname
    from pg_class as c
    join pg_namespace as n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'S'
  loop
    execute 'revoke all on sequence ' || r.fqname || ' from anon';
  end loop;
end
$$;

alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon;

commit;

begin;

-- Rewrite auth.uid() in RLS expressions as a scalar initplan so PostgreSQL
-- evaluates it once per statement instead of once per candidate row.
do $$
declare
  r record;
  roles_sql text;
  stmt text;
  next_qual text;
  next_check text;
begin
  for r in
    select schemaname, tablename, policyname, roles, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (
        coalesce(qual, '') like '%auth.uid()%'
        or coalesce(with_check, '') like '%auth.uid()%'
      )
  loop
    select string_agg(quote_ident(role_name), ', ')
      into roles_sql
    from unnest(r.roles) as role_name;

    next_qual := case when r.qual is null then null else replace(r.qual, 'auth.uid()', '(select auth.uid())') end;
    next_check := case when r.with_check is null then null else replace(r.with_check, 'auth.uid()', '(select auth.uid())') end;

    stmt := format(
      'alter policy %I on %I.%I to %s',
      r.policyname,
      r.schemaname,
      r.tablename,
      roles_sql
    );

    if next_qual is not null then
      stmt := stmt || ' using (' || next_qual || ')';
    end if;
    if next_check is not null then
      stmt := stmt || ' with check (' || next_check || ')';
    end if;

    execute stmt;
  end loop;
end
$$;

commit;

-- Avoid SQL NULL making PL/pgSQL owner checks evaluate as "not false".
-- Empty role still means no staff access; is_admin keeps the null semantics.
create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select coalesce((
    select ar.role
    from public.admin_roles as ar
    where ar.user_id = auth.uid()
    limit 1
  ), '');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select nullif(public.staff_role(), '') is not null;
$$;

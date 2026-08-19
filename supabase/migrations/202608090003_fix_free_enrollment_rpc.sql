begin;

create or replace function public.enroll_in_free_package(target_package_id text)
returns table (
  id text,
  package_id text,
  course_id text,
  status text,
  progress_percent numeric
)
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
declare
  target_package public.packages%rowtype;
  target_course public.courses%rowtype;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  select p.* into target_package
  from public.packages as p
  where p.id = target_package_id
    and p.status = 'active';

  if target_package.id is null then
    raise exception 'PACKAGE_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if target_package.price_cents <> 0 then
    raise exception 'PAYMENT_REQUIRED' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.package_courses as pc where pc.package_id = target_package_id) then
    raise exception 'PACKAGE_EMPTY' using errcode = 'P0001';
  end if;

  for target_course in
    select c.*
    from public.package_courses as pc
    join public.courses as c on c.id = pc.course_id
    where pc.package_id = target_package_id
      and c.status = 'published'
  loop
    insert into public.enrollments (id, user_id, package_id, course_id, status, progress_percent)
    values (extensions.gen_random_uuid()::text, auth.uid(), target_package_id, target_course.id, 'active', 0)
    on conflict (user_id, course_id) do update
      set package_id = coalesce(public.enrollments.package_id, excluded.package_id),
          status = case when public.enrollments.status = 'completed' then 'completed' else 'active' end;
  end loop;

  return query
  select e.id, e.package_id, e.course_id, e.status, e.progress_percent
  from public.enrollments as e
  where e.user_id = auth.uid()
    and e.package_id = target_package_id
  order by e.course_id;
end;
$$;

revoke all on function public.enroll_in_free_package(text) from public;
grant execute on function public.enroll_in_free_package(text) to authenticated;

commit;

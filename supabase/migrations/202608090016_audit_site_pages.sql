-- Public legal pages are owner-managed, so retain the same append-only audit
-- trail as the rest of the CMS. Site pages use `slug` rather than `id`.
create or replace function public.audit_admin_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
set row_security = off
as $$
begin
  if public.is_admin() then
    insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata)
    values (
      extensions.gen_random_uuid()::text,
      auth.uid(),
      lower(tg_op),
      tg_table_name,
      coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id'), (to_jsonb(new) ->> 'slug'), (to_jsonb(old) ->> 'slug')),
      jsonb_build_object(
        'new', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
        'old', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end
      )
    );
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists audit_admin_mutation on public.site_pages;
create trigger audit_admin_mutation
after insert or update or delete on public.site_pages
for each row execute function public.audit_admin_mutation();

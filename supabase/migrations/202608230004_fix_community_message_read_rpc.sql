begin;

create or replace function public.get_community_messages(target_user_id uuid, target_limit integer default 100)
returns table (id text, sender_id uuid, recipient_id uuid, body text, read_at timestamptz, created_at timestamptz)
language sql
security invoker
set search_path = public
as $$
  select m.id, m.sender_id, m.recipient_id, m.body, m.read_at, m.created_at
  from public.community_messages m
  where (m.sender_id = auth.uid() and m.recipient_id = target_user_id) or (m.sender_id = target_user_id and m.recipient_id = auth.uid())
  order by m.created_at asc
  limit greatest(1, least(coalesce(target_limit, 100), 200));
$$;

create or replace function public.mark_community_messages_read(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED' using errcode = '42501';
  end if;

  update public.community_messages
  set read_at = now()
  where sender_id = target_user_id
    and recipient_id = auth.uid()
    and read_at is null;
end;
$$;

revoke all on function public.get_community_messages(uuid, integer) from public;
revoke all on function public.mark_community_messages_read(uuid) from public;
grant execute on function public.get_community_messages(uuid, integer) to authenticated;
grant execute on function public.mark_community_messages_read(uuid) to authenticated;

commit;

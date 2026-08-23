begin;

revoke all on function public.get_community_messages(uuid, integer) from public, anon;
revoke all on function public.mark_community_messages_read(uuid) from public, anon;
grant execute on function public.get_community_messages(uuid, integer) to authenticated;
grant execute on function public.mark_community_messages_read(uuid) to authenticated;

commit;

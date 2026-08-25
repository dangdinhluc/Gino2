begin;

revoke all on function public.audit_admin_mutation() from public, anon, authenticated;
revoke all on function public.ensure_community_profile() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.prevent_profile_role_self_update() from public, anon, authenticated;
revoke all on function public.record_content_revision() from public, anon, authenticated;

commit;

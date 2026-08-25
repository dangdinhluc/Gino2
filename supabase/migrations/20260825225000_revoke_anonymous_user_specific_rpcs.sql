begin;

revoke all on function public.get_community_me() from public, anon;
grant execute on function public.get_community_me() to authenticated, service_role;

revoke all on function public.list_learner_achievements() from public, anon;
grant execute on function public.list_learner_achievements() to authenticated, service_role;

revoke all on function public.list_learner_certificates() from public, anon;
grant execute on function public.list_learner_certificates() to authenticated, service_role;

commit;

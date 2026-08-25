begin;

revoke all on function public.community_profile_touch_updated_at() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.validate_learner_settings_timezone() from public, anon, authenticated;

commit;

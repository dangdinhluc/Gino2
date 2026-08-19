begin;

create or replace function public.complete_learner_onboarding(
  target_display_name text,
  target_level text,
  target_timezone text,
  target_daily_goal_minutes integer
)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode = '42501'; end if;
  if length(trim(target_display_name)) not between 1 and 100 then raise exception 'INVALID_DISPLAY_NAME' using errcode = '22023'; end if;
  if target_daily_goal_minutes not between 5 and 240 then raise exception 'INVALID_DAILY_GOAL' using errcode = '22023'; end if;
  update public.profiles set display_name = trim(target_display_name) where user_id = auth.uid();
  update public.learner_profiles
  set display_name = trim(target_display_name),
      target_level = coalesce(nullif(trim($2), ''), 'Tokutei Gino')
  where user_id = auth.uid();
  update public.learner_settings
  set timezone = coalesce(nullif(trim(target_timezone), ''), 'Asia/Tokyo'),
      daily_goal_minutes = target_daily_goal_minutes,
      onboarding_completed_at = now()
  where user_id = auth.uid();
  perform public.activate_default_starter_enrollment();
end;
$$;

commit;

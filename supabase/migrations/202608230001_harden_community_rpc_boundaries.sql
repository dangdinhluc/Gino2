begin;

-- Community writes are RPC-only. Existing RPCs derive actor from auth.uid().
alter function public.upsert_community_profile(text, text, boolean) security definer;
alter function public.follow_community_user(uuid) security definer;
alter function public.unfollow_community_user(uuid) security definer;
alter function public.create_community_post(text) security definer;
alter function public.create_progress_post() security definer;
alter function public.send_community_message(uuid, text) security definer;
alter function public.block_community_user(uuid) security definer;
alter function public.unblock_community_user(uuid) security definer;
alter function public.report_community_content(text, text, text) security definer;
alter function public.join_community_group(text) security definer;
alter function public.leave_community_group(text) security definer;

alter function public.upsert_community_profile(text, text, boolean) set search_path = public;
alter function public.follow_community_user(uuid) set search_path = public;
alter function public.unfollow_community_user(uuid) set search_path = public;
alter function public.create_community_post(text) set search_path = public;
alter function public.create_progress_post() set search_path = public;
alter function public.send_community_message(uuid, text) set search_path = public;
alter function public.block_community_user(uuid) set search_path = public;
alter function public.unblock_community_user(uuid) set search_path = public;
alter function public.report_community_content(text, text, text) set search_path = public;
alter function public.join_community_group(text) set search_path = public;
alter function public.leave_community_group(text) set search_path = public;

revoke insert, update, delete on public.community_profiles, public.community_follows, public.community_posts, public.community_messages, public.community_blocks, public.community_reports, public.community_groups, public.community_group_members from anon, authenticated;

-- Keep direct reads under existing RLS; write authorization lives in RPCs above.
grant select on public.community_profiles, public.community_follows, public.community_posts, public.community_messages, public.community_blocks, public.community_groups, public.community_group_members to authenticated;

commit;

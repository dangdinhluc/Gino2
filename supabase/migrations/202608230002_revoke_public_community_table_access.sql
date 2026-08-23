begin;

-- PostgreSQL grants table privileges to PUBLIC by default in this project.
-- Revoke PUBLIC explicitly; revoking anon/authenticated alone does not remove inherited access.
revoke all on public.community_profiles, public.community_follows, public.community_posts, public.community_messages, public.community_blocks, public.community_reports, public.community_groups, public.community_group_members from public;

grant select on public.community_profiles, public.community_follows, public.community_posts, public.community_messages, public.community_blocks, public.community_groups, public.community_group_members to authenticated;

commit;

import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

export interface CommunityMe { userId: string; displayName: string; email: string; handle: string; bio: string; isPublic: boolean }
export interface CommunityMember { userId: string; displayName: string; handle: string; bio: string; followerCount: number; following: boolean }
export interface CommunityPost { postId: string; userId: string; displayName: string; handle: string; body: string; postType: string; metadata: Record<string, unknown>; createdAt: string }
export interface CommunityMessage { id: string; senderId: string; recipientId: string; body: string; readAt: string | null; createdAt: string }
export interface CommunityThread { otherUserId: string; displayName: string; handle: string; lastBody: string; lastAt: string; unreadCount: number }

const mapMe = (row: { user_id: string; display_name: string; email: string; handle: string; bio: string; is_public: boolean }): CommunityMe => ({ userId: row.user_id, displayName: row.display_name, email: row.email, handle: row.handle, bio: row.bio, isPublic: row.is_public });
const mapMember = (row: { user_id: string; display_name: string; handle: string; bio: string; follower_count: number; following: boolean }): CommunityMember => ({ userId: row.user_id, displayName: row.display_name, handle: row.handle, bio: row.bio, followerCount: Number(row.follower_count), following: row.following });

export async function getCommunityMe(): Promise<CommunityMe | null> {
  const { data, error } = await requireSupabase().rpc('get_community_me');
  if (error) throw new Error(error.message);
  return data?.[0] ? mapMe(data[0]) : null;
}

export async function saveCommunityProfile(input: { handle: string; bio: string; isPublic: boolean }): Promise<CommunityMe> {
  const { data, error } = await requireSupabase().rpc('upsert_community_profile', { target_handle: input.handle.trim().toLowerCase(), target_bio: input.bio.trim(), target_public: input.isPublic });
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) throw new Error('Không lưu được hồ sơ cộng đồng.');
  const me = await getCommunityMe();
  if (!me) throw new Error('Không tải lại được hồ sơ cộng đồng.');
  return me;
}

export async function searchCommunityMembers(query = ''): Promise<CommunityMember[]> {
  const { data, error } = await requireSupabase().rpc('search_community_members', { target_query: query.trim(), target_limit: 30 });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMember);
}

export async function followCommunityUser(userId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('follow_community_user', { target_user_id: userId });
  if (error) throw new Error(error.message);
}

export async function unfollowCommunityUser(userId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('unfollow_community_user', { target_user_id: userId });
  if (error) throw new Error(error.message);
}

export async function getCommunityFeed(): Promise<CommunityPost[]> {
  const { data, error } = await requireSupabase().rpc('get_community_feed', { target_limit: 50 });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ postId: row.post_id, userId: row.user_id, displayName: row.display_name, handle: row.handle, body: row.body, postType: row.post_type, metadata: (row.metadata ?? {}) as Record<string, unknown>, createdAt: row.created_at }));
}

export async function createCommunityPost(body: string): Promise<void> {
  const { error } = await requireSupabase().rpc('create_community_post', { target_body: body.trim() });
  if (error) throw new Error(error.message);
}

export async function createProgressPost(): Promise<{ dailyXp: number; currentStreak: number }> {
  const { data, error } = await requireSupabase().rpc('create_progress_post');
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) throw new Error('Không chia sẻ được tiến độ.');
  return { dailyXp: row.daily_xp, currentStreak: row.current_streak };
}

export async function listCommunityThreads(): Promise<CommunityThread[]> {
  const { data, error } = await requireSupabase().rpc('list_community_threads');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ otherUserId: row.other_user_id, displayName: row.display_name, handle: row.handle, lastBody: row.last_body, lastAt: row.last_at, unreadCount: Number(row.unread_count) }));
}

export async function getCommunityMessages(userId: string): Promise<CommunityMessage[]> {
  const { data, error } = await requireSupabase().rpc('get_community_messages', { target_user_id: userId, target_limit: 100 });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ id: row.id, senderId: row.sender_id, recipientId: row.recipient_id, body: row.body, readAt: row.read_at, createdAt: row.created_at }));
}

export async function sendCommunityMessage(userId: string, body: string): Promise<void> {
  const { error } = await requireSupabase().rpc('send_community_message', { target_user_id: userId, target_body: body.trim() });
  if (error) throw new Error(error.message);
}

export function formatCommunityDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
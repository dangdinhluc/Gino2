import { supabase } from '@/src/features/supabase/lib/supabaseClient';

export interface LearnerNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  actionUrl: string | null;
  createdAt: string;
  readAt: string | null;
}

export async function listLearnerNotifications(): Promise<LearnerNotification[]> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, body, notification_type, action_url, created_at, read_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ id: row.id, title: row.title, body: row.body, type: row.notification_type, actionUrl: row.action_url, createdAt: row.created_at, readAt: row.read_at }));
}

export async function markLearnerNotificationRead(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { error } = await supabase.rpc('mark_notification_read', { target_notification_id: id });
  if (error) throw new Error(error.message);
}

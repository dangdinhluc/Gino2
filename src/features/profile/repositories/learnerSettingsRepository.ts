import { supabase } from '@/src/features/supabase/lib/supabaseClient';

export interface LearnerSettings {
  dailyGoalMinutes: number;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  newCardsPerDay: number;
  reminderTime: string | null;
  timezone: string;
  ttsEnabled: boolean;
  aiConcise: boolean;
  onboardingCompletedAt: string | null;
}

async function requireUserId(): Promise<string> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Vui lòng đăng nhập để cập nhật cài đặt.');
  return data.user.id;
}

function mapSettings(row: {
  daily_goal_minutes: number;
  email_notifications: boolean;
  in_app_notifications: boolean;
  new_cards_per_day: number;
  reminder_time: string | null;
  timezone: string;
  tts_enabled: boolean;
  ai_concise: boolean;
  onboarding_completed_at: string | null;
}): LearnerSettings {
  return {
    dailyGoalMinutes: row.daily_goal_minutes,
    emailNotifications: row.email_notifications,
    inAppNotifications: row.in_app_notifications,
    newCardsPerDay: row.new_cards_per_day,
    reminderTime: row.reminder_time,
    timezone: row.timezone,
    ttsEnabled: row.tts_enabled,
    aiConcise: row.ai_concise,
    onboardingCompletedAt: row.onboarding_completed_at,
  };
}

export async function getLearnerSettings(): Promise<LearnerSettings> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('learner_settings')
    .select('daily_goal_minutes, email_notifications, in_app_notifications, new_cards_per_day, reminder_time, timezone, tts_enabled, ai_concise, onboarding_completed_at')
    .eq('user_id', userId)
    .single();
  if (error) throw new Error(error.message);
  return mapSettings(data);
}

export async function updateLearnerSettings(update: Partial<LearnerSettings>): Promise<LearnerSettings> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('learner_settings')
    .update({
      ...(update.dailyGoalMinutes === undefined ? {} : { daily_goal_minutes: Math.min(Math.max(Math.round(update.dailyGoalMinutes), 5), 240) }),
      ...(update.emailNotifications === undefined ? {} : { email_notifications: update.emailNotifications }),
      ...(update.inAppNotifications === undefined ? {} : { in_app_notifications: update.inAppNotifications }),
      ...(update.newCardsPerDay === undefined ? {} : { new_cards_per_day: Math.min(Math.max(Math.round(update.newCardsPerDay), 1), 50) }),
      ...(update.reminderTime === undefined ? {} : { reminder_time: update.reminderTime }),
      ...(update.timezone === undefined ? {} : { timezone: update.timezone }),
      ...(update.ttsEnabled === undefined ? {} : { tts_enabled: update.ttsEnabled }),
      ...(update.aiConcise === undefined ? {} : { ai_concise: update.aiConcise }),
    })
    .eq('user_id', userId)
    .select('daily_goal_minutes, email_notifications, in_app_notifications, new_cards_per_day, reminder_time, timezone, tts_enabled, ai_concise, onboarding_completed_at')
    .single();
  if (error) throw new Error(error.message);
  return mapSettings(data);
}

export async function completeLearnerOnboarding(input: {
  displayName: string;
  level: string;
  timezone: string;
  dailyGoalMinutes: number;
}): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  await requireUserId();
  const { error } = await supabase.rpc('complete_learner_onboarding', {
    target_display_name: input.displayName,
    target_level: input.level,
    target_timezone: input.timezone,
    target_daily_goal_minutes: input.dailyGoalMinutes,
  });
  if (error) throw new Error(error.message);
}

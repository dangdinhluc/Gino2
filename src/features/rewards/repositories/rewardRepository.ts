import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

export interface DailyRewardResult {
  claimed: boolean;
  rewardXp: number;
  currentStreak: number;
  newlyEarned: string[];
}

export interface LearnerAchievement {
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  metadata: Record<string, unknown>;
}

export interface LearnerCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: string;
  metadata: Record<string, unknown>;
}

export async function claimDailyReward(): Promise<DailyRewardResult> {
  const { data, error } = await requireSupabase().rpc('claim_daily_reward');
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) throw new Error('Không nhận được phần thưởng hôm nay.');
  return {
    claimed: row.claimed,
    rewardXp: Number(row.reward_xp),
    currentStreak: Number(row.current_streak),
    newlyEarned: Array.isArray(row.newly_earned) ? row.newly_earned.filter((item): item is string => typeof item === 'string') : [],
  };
}

export async function listLearnerAchievements(): Promise<LearnerAchievement[]> {
  const { data, error } = await requireSupabase().rpc('list_learner_achievements');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    achievementId: row.achievement_id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    earnedAt: row.earned_at,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }));
}

export async function listLearnerCertificates(): Promise<LearnerCertificate[]> {
  const { data, error } = await requireSupabase().rpc('list_learner_certificates');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.course_title,
    certificateCode: row.certificate_code,
    issuedAt: row.issued_at,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }));
}

export function rewardDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

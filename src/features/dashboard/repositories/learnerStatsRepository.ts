import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';
import type { Json } from '@/src/features/supabase/lib/database.types';

export interface LearnerWeeklyActivity {
  date: string;
  reviews: number;
  xp: number;
}

export interface LearnerTopicMastery {
  courseId: string;
  courseTitle: string;
  mastered: number;
  total: number;
  percent: number;
}

export interface LearnerStatsSnapshot {
  totalXp: number;
  weeklyXp: number;
  dailyXp: number;
  reviewedToday: number;
  totalReviews: number;
  currentStreak: number;
  masteredVocabulary: number;
  dueVocabulary: number;
  weeklyActivity: LearnerWeeklyActivity[];
  topicMastery: LearnerTopicMastery[];
}

function asArray(value: Json): Json[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: Json): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : {};
}

export async function fetchLearnerStats(): Promise<LearnerStatsSnapshot> {
  const { data, error } = await requireSupabase().rpc('get_learner_stats');
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) {
    return { totalXp: 0, weeklyXp: 0, dailyXp: 0, reviewedToday: 0, totalReviews: 0, currentStreak: 0, masteredVocabulary: 0, dueVocabulary: 0, weeklyActivity: [], topicMastery: [] };
  }

  return {
    totalXp: Number(row.total_xp),
    weeklyXp: Number(row.weekly_xp),
    dailyXp: Number(row.daily_xp),
    reviewedToday: Number(row.reviewed_today),
    totalReviews: Number(row.total_reviews),
    currentStreak: Number(row.current_streak),
    masteredVocabulary: Number(row.mastered_vocabulary),
    dueVocabulary: Number(row.due_vocabulary),
    weeklyActivity: asArray(row.weekly_activity).map((item) => {
      const value = asRecord(item);
      return { date: String(value.date ?? ''), reviews: Number(value.reviews ?? 0), xp: Number(value.xp ?? 0) };
    }),
    topicMastery: asArray(row.topic_mastery).map((item) => {
      const value = asRecord(item);
      return {
        courseId: String(value.courseId ?? ''),
        courseTitle: String(value.courseTitle ?? ''),
        mastered: Number(value.mastered ?? 0),
        total: Number(value.total ?? 0),
        percent: Number(value.percent ?? 0),
      };
    }),
  };
}

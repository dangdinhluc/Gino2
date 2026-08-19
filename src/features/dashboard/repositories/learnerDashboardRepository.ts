import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';
import type { Json, Tables } from '@/src/features/supabase/lib/database.types';

export interface LearnerDashboardSnapshot {
  activeCourses: number;
  completedLessons: number;
  masteredVocabulary: number;
  dueVocabulary: number;
  streakDays: number;
  recentActivity: Json;
}

export interface DailyLearningPlan {
  goalMinutes: number;
  dueVocabulary: number;
  nextLesson: { id: string; title: string; courseId: string; courseTitle: string } | null;
  weakAssessment: { id: string; title: string; score: number; courseId: string } | null;
}

export type DashboardHeroSlot = Pick<Tables<'dashboard_hero_slots'>, 'id' | 'label' | 'start_time' | 'end_time' | 'asset_key' | 'alt_text' | 'is_active' | 'sort_order'> & {
  startTime: string;
  endTime: string;
  assetKey: string;
  altText: string;
  isActive: boolean;
  sortOrder: number;
};

function asRecord(value: Json | null): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : {};
}

function asPlanItem(value: Json | undefined, keys: readonly string[]): Record<string, string | number> | null {
  const item = asRecord(value ?? null);
  if (keys.some((key) => item[key] === undefined || item[key] === null)) return null;
  return Object.fromEntries(keys.map((key) => [key, typeof item[key] === 'number' ? item[key] as number : String(item[key])])) as Record<string, string | number>;
}

export async function fetchLearnerDashboard(): Promise<LearnerDashboardSnapshot> {
  const { data, error } = await requireSupabase().rpc('get_learner_dashboard');
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) {
    return { activeCourses: 0, completedLessons: 0, masteredVocabulary: 0, dueVocabulary: 0, streakDays: 0, recentActivity: [] };
  }
  return {
    activeCourses: Number(row.active_courses),
    completedLessons: Number(row.completed_lessons),
    masteredVocabulary: Number(row.mastered_vocabulary),
    dueVocabulary: Number(row.due_vocabulary),
    streakDays: Number(row.streak_days),
    recentActivity: row.recent_activity,
  };
}

export async function fetchDailyLearningPlan(): Promise<DailyLearningPlan> {
  const { data, error } = await requireSupabase().rpc('get_daily_learning_plan');
  if (error) throw new Error(error.message);
  const plan = asRecord(data);
  const nextLesson = asPlanItem(plan.nextLesson, ['id', 'title', 'courseId', 'courseTitle']);
  const weakAssessment = asPlanItem(plan.weakAssessment, ['id', 'title', 'score', 'courseId']);
  return {
    goalMinutes: Number(plan.goalMinutes ?? 20),
    dueVocabulary: Number(plan.dueVocabulary ?? 0),
    nextLesson: nextLesson ? {
      id: String(nextLesson.id),
      title: String(nextLesson.title),
      courseId: String(nextLesson.courseId),
      courseTitle: String(nextLesson.courseTitle),
    } : null,
    weakAssessment: weakAssessment ? {
      id: String(weakAssessment.id),
      title: String(weakAssessment.title),
      score: Number(weakAssessment.score),
      courseId: String(weakAssessment.courseId),
    } : null,
  };
}

export async function fetchDashboardHeroSlots(): Promise<DashboardHeroSlot[]> {
  try {
    const { data, error } = await requireSupabase()
      .from('dashboard_hero_slots')
      .select('id, label, start_time, end_time, asset_key, alt_text, is_active, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...row,
      startTime: row.start_time,
      endTime: row.end_time,
      assetKey: row.asset_key,
      altText: row.alt_text,
      isActive: row.is_active,
      sortOrder: row.sort_order,
    }));
  } catch {
    // The hero schedule is optional so an older Cloud schema keeps the dashboard usable.
    return [];
  }
}

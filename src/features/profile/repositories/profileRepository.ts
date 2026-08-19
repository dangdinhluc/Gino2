import { fetchLearnerDashboard } from '@/src/features/dashboard/repositories/learnerDashboardRepository';
import { fetchLearnerStats } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';

export interface LearnerProfileSnapshot {
  displayName: string;
  email: string;
  targetLevel: string;
  activeCourses: number;
  completedLessons: number;
  masteredVocabulary: number;
  streakDays: number;
}

export async function fetchLearnerProfile(): Promise<LearnerProfileSnapshot> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const [{ data: profile, error: profileError }, { data: learnerProfile, error: learnerError }, dashboard, stats] = await Promise.all([
    client.from('profiles').select('display_name, email').eq('user_id', userId).maybeSingle(),
    client.from('learner_profiles').select('display_name, target_level').eq('user_id', userId).maybeSingle(),
    fetchLearnerDashboard(),
    fetchLearnerStats(),
  ]);
  if (profileError) throw new Error(profileError.message);
  if (learnerError) throw new Error(learnerError.message);
  return {
    displayName: learnerProfile?.display_name || profile?.display_name || 'Học viên',
    email: profile?.email || '',
    targetLevel: learnerProfile?.target_level || 'Tokutei Gino',
    activeCourses: dashboard.activeCourses,
    completedLessons: dashboard.completedLessons,
    masteredVocabulary: stats.masteredVocabulary,
    streakDays: stats.currentStreak || dashboard.streakDays,
  };
}

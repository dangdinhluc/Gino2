import { fetchDailyLearningPlan, fetchLearnerDashboard } from './learnerDashboardRepository';
import { fetchLearnerStats } from './learnerStatsRepository';
import { fetchLearnerProfile } from '@/src/features/profile/repositories/profileRepository';
import type { RealDashboardData } from '../types';

export async function fetchRealDashboard(userId: string, email?: string | null): Promise<RealDashboardData> {
  const [snapshot, plan, stats, profile] = await Promise.all([
    fetchLearnerDashboard(),
    fetchDailyLearningPlan(),
    fetchLearnerStats(),
    fetchLearnerProfile(userId),
  ]);

  const name = profile?.displayName || email?.split('@')[0] || 'Bạn';

  return {
    profile: {
      name,
      avatar: profile?.avatarUrl ?? null,
    },
    course: plan.nextLesson
      ? {
          id: plan.nextLesson.courseId,
          title: plan.nextLesson.courseTitle,
          progress: 0,
          nextLesson: plan.nextLesson.title,
        }
      : null,
    today: {
      vocabularyDue: plan.dueVocabulary,
      reviewCount: snapshot.completedLessons,
      studyMinutes: plan.goalMinutes,
    },
    stats: {
      streak: stats?.currentStreak ?? snapshot.streakDays,
      xp: stats?.dailyXp ?? 0,
      learnedWords: snapshot.masteredVocabulary,
    },
    weakPoints: plan.weakAssessment
      ? [{ title: plan.weakAssessment.title, score: plan.weakAssessment.score }]
      : [],
  };
}

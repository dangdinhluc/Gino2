import { describe, expect, it } from 'vitest';
import { mapRealDashboardData } from '@/src/features/dashboard/repositories/realDashboardRepository';
import type { LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import type { LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import type { DailyLearningPlan } from '@/src/features/dashboard/repositories/learnerDashboardRepository';

const emptyProfile: LearnerProfileSnapshot = {
  displayName: 'Học viên',
  email: 'learner@example.com',
  targetLevel: null,
};

const emptyStats: LearnerStatsSnapshot = {
  totalXp: 0,
  weeklyXp: 0,
  dailyXp: 0,
  reviewedToday: 0,
  totalReviews: 0,
  currentStreak: 0,
  masteredVocabulary: 0,
  dueVocabulary: 0,
  weeklyActivity: [],
  topicMastery: [],
};

const emptyPlan: DailyLearningPlan = {
  goalMinutes: 20,
  dueVocabulary: 0,
  nextLesson: null,
  weakAssessment: null,
};

describe('mapRealDashboardData', () => {
  it('does not invent mock streak, XP, due words, or course titles for a new learner', () => {
    const data = mapRealDashboardData({
      profile: emptyProfile,
      stats: emptyStats,
      plan: emptyPlan,
      courses: [],
    });

    expect(data.stats.streak).toBe(0);
    expect(data.stats.xp).toBe(0);
    expect(data.stats.learnedWords).toBe(0);
    expect(data.stats.studyMinutes).toBeNull();
    expect(data.today.vocabularyDue).toBe(0);
    expect(data.today.exercises).toBe(0);
    expect(data.activeCourse).toBeNull();
    expect(data.courses).toEqual([]);
    expect(JSON.stringify(data)).not.toMatch(/Minna no Nihongo|Kaiwa Starter|ዄ/24|120/);
  });
});

import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/courses/repositories/coursesRepository', () => ({ fetchPublishedCourses: vi.fn() }));
vi.mock('@/src/features/profile/repositories/profileRepository', () => ({ fetchLearnerProfile: vi.fn() }));
vi.mock('@/src/features/dashboard/repositories/learnerDashboardRepository', () => ({ fetchDailyLearningPlan: vi.fn() }));
vi.mock('@/src/features/dashboard/repositories/learnerStatsRepository', () => ({ fetchLearnerStats: vi.fn() }));

import { mapRealDashboardData } from '@/src/features/dashboard/repositories/realDashboardRepository';

const profile = { displayName: 'Learner', email: 'learner@example.com', targetLevel: 'Tokutei Gino' };
const stats = {
  totalXp: 240,
  weeklyXp: 80,
  dailyXp: 25,
  reviewedToday: 3,
  totalReviews: 12,
  currentStreak: 4,
  masteredVocabulary: 18,
  dueVocabulary: 2,
  weeklyActivity: [],
  topicMastery: [],
};
const plan = {
  goalMinutes: 20,
  dueVocabulary: 2,
  nextLesson: { id: 'lesson-1', title: 'Lesson thật', courseId: 'course-1', courseTitle: 'Khóa học thật' },
  weakAssessment: { id: 'assessment-1', title: 'Nghe hiểu', score: 72, courseId: 'course-1' },
};

describe('mapRealDashboardData', () => {
  it('keeps empty learner data empty instead of creating course or progress values', () => {
    const result = mapRealDashboardData({ profile, stats, plan, courses: [] });

    expect(result.activeCourse).toBeNull();
    expect(result.courses).toEqual([]);
    expect(result.today.lessons).toBe(0);
    expect(result.stats.studyMinutes).toBeNull();
  });

  it('maps enrolled course, plan and learner stats from repository snapshots', () => {
    const result = mapRealDashboardData({
      profile,
      stats,
      plan,
      courses: [{
        id: 'course-1',
        title: 'Khóa học thật',
        level: 'N3',
        description: 'Mô tả',
        progress: 42,
        totalLessons: 10,
        image: '',
        themeColor: null,
        isEnrolled: true,
      }],
    });

    expect(result.activeCourse).toEqual({
      id: 'course-1',
      title: 'Khóa học thật',
      progress: 42,
      nextLesson: { id: 'lesson-1', title: 'Lesson thật' },
    });
    expect(result.today).toEqual({ vocabularyDue: 2, exercises: 3, lessons: 1 });
    expect(result.stats).toMatchObject({ streak: 4, xp: 25, learnedWords: 18, studyMinutes: null });
    expect(result.weakPoints).toEqual([{ title: 'Nghe hiểu', accuracy: 72 }]);
  });
});

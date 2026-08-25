import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchPublishedCourses: vi.fn(),
  fetchLearnerProfile: vi.fn(),
  fetchDailyLearningPlan: vi.fn(),
  fetchLearnerStats: vi.fn(),
}));

vi.mock('@/src/features/courses/repositories/coursesRepository', () => ({ fetchPublishedCourses: mocks.fetchPublishedCourses }));
vi.mock('@/src/features/profile/repositories/profileRepository', () => ({ fetchLearnerProfile: mocks.fetchLearnerProfile }));
vi.mock('@/src/features/dashboard/repositories/learnerDashboardRepository', () => ({ fetchDailyLearningPlan: mocks.fetchDailyLearningPlan }));
vi.mock('@/src/features/dashboard/repositories/learnerStatsRepository', () => ({ fetchLearnerStats: mocks.fetchLearnerStats }));

import {
  clearRealDashboardCache,
  fetchRealDashboardData,
  mapRealDashboardData,
} from '@/src/features/dashboard/repositories/realDashboardRepository';

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

const enrolledCourse = {
  id: 'course-1',
  title: 'Khóa học thật',
  level: 'N3',
  description: 'Mô tả',
  progress: 42,
  totalLessons: 10,
  image: '',
  themeColor: null,
  isEnrolled: true,
};

afterEach(() => {
  clearRealDashboardCache();
  vi.clearAllMocks();
});

describe('mapRealDashboardData', () => {
  it('keeps empty learner data empty instead of creating course or progress values', () => {
    const result = mapRealDashboardData({ profile, stats, plan, courses: [] }, 'course-1');

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
    }, 'course-1');

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

  it('uses the persisted active course instead of picking a course by progress', () => {
    const result = mapRealDashboardData({
      profile,
      stats,
      plan,
      courses: [
        {
          id: 'course-1', title: 'Khóa cũ', level: 'N4', description: '', progress: 92, totalLessons: 10, image: '', themeColor: null, isEnrolled: true,
        },
        {
          id: 'course-2', title: 'Khóa đang học', level: 'Tokutei', description: '', progress: 20, totalLessons: 20, image: '', themeColor: null, isEnrolled: true,
        },
      ],
    }, 'course-2');

    expect(result.activeCourse?.id).toBe('course-2');
    expect(result.courses.map((course) => course.id)).toEqual(['course-2']);
  });

  it('keeps the Home screen usable when optional stats fail', async () => {
    mocks.fetchLearnerProfile.mockResolvedValue(profile);
    mocks.fetchPublishedCourses.mockResolvedValue([enrolledCourse]);
    mocks.fetchLearnerStats.mockRejectedValue(new Error('stats unavailable'));
    mocks.fetchDailyLearningPlan.mockResolvedValue(plan);

    const result = await fetchRealDashboardData('user-1', 'course-1');

    expect(result.activeCourse?.title).toBe('Khóa học thật');
    expect(result.stats).toMatchObject({ streak: 0, xp: 0, learnedWords: 0 });
    expect(result.warnings).toEqual(['stats']);
    expect(mocks.fetchPublishedCourses).toHaveBeenCalledWith('user-1');
  });

  it('reuses fresh user-scoped Dashboard data without refetching', async () => {
    mocks.fetchLearnerProfile.mockResolvedValue(profile);
    mocks.fetchPublishedCourses.mockResolvedValue([enrolledCourse]);
    mocks.fetchLearnerStats.mockResolvedValue(stats);
    mocks.fetchDailyLearningPlan.mockResolvedValue(plan);

    const first = await fetchRealDashboardData('user-1', 'course-1');
    vi.clearAllMocks();
    const second = await fetchRealDashboardData('user-1', 'course-1');

    expect(second).toBe(first);
    expect(mocks.fetchLearnerProfile).not.toHaveBeenCalled();
    expect(mocks.fetchPublishedCourses).not.toHaveBeenCalled();
  });
});

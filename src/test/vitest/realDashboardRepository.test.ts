import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchPublishedCourseForLearner: vi.fn(),
  fetchLearnerProfile: vi.fn(),
  fetchLearnerStats: vi.fn(),
  fetchDailyLearningPlan: vi.fn(),
}));

vi.mock('@/src/features/courses/repositories/coursesRepository', () => ({
  fetchPublishedCourseForLearner: mocks.fetchPublishedCourseForLearner,
}));

vi.mock('@/src/features/profile/repositories/profileRepository', () => ({
  fetchLearnerProfile: mocks.fetchLearnerProfile,
}));

vi.mock('@/src/features/dashboard/repositories/learnerStatsRepository', () => ({
  fetchLearnerStats: mocks.fetchLearnerStats,
}));

vi.mock('@/src/features/dashboard/repositories/learnerDashboardRepository', () => ({
  fetchDailyLearningPlan: mocks.fetchDailyLearningPlan,
}));

import {
  clearRealDashboardCache,
  fetchRealDashboardData,
} from '@/src/features/dashboard/repositories/realDashboardRepository';

const course = {
  id: 'course-1',
  title: 'Tokutei Nhà hàng',
  level: 'N4',
  description: 'Khóa học nhà hàng',
  progress: 42,
  totalLessons: 12,
  image: '',
  themeColor: null,
  isEnrolled: true,
};

const profile = {
  displayName: 'Learner',
  email: 'learner@example.com',
  targetLevel: 'Tokutei Gino',
};

const stats = {
  totalXp: 120,
  weeklyXp: 40,
  dailyXp: 20,
  reviewedToday: 2,
  totalReviews: 8,
  currentStreak: 3,
  masteredVocabulary: 4,
  dueVocabulary: 5,
  weeklyActivity: [],
  topicMastery: [],
};

const plan = {
  dueVocabulary: 5,
  goalMinutes: 20,
  nextLesson: {
    id: 'lesson-2',
    title: 'Bài tiếp theo',
    courseId: 'course-1',
    courseTitle: 'Tokutei Nhà hàng',
  },
  weakAssessment: null,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  clearRealDashboardCache();
  vi.clearAllMocks();
  mocks.fetchPublishedCourseForLearner.mockResolvedValue(course);
  mocks.fetchLearnerProfile.mockResolvedValue(profile);
  mocks.fetchLearnerStats.mockResolvedValue(stats);
  mocks.fetchDailyLearningPlan.mockResolvedValue(plan);
});

describe('real dashboard repository bootstrap', () => {
  it('starts profile, course, stats and plan work in one bootstrap wave', async () => {
    const courseGate = deferred<typeof course>();
    const profileGate = deferred<typeof profile>();
    const statsGate = deferred<typeof stats>();
    const planGate = deferred<typeof plan>();
    mocks.fetchPublishedCourseForLearner.mockReturnValue(courseGate.promise);
    mocks.fetchLearnerProfile.mockReturnValue(profileGate.promise);
    mocks.fetchLearnerStats.mockReturnValue(statsGate.promise);
    mocks.fetchDailyLearningPlan.mockReturnValue(planGate.promise);

    const request = fetchRealDashboardData('learner-1', 'course-1', { force: true });

    expect(mocks.fetchPublishedCourseForLearner).toHaveBeenCalledWith('learner-1', 'course-1');
    expect(mocks.fetchLearnerProfile).toHaveBeenCalledWith('learner-1');
    expect(mocks.fetchLearnerStats).toHaveBeenCalledTimes(1);
    expect(mocks.fetchDailyLearningPlan).toHaveBeenCalledTimes(1);

    courseGate.resolve(course);
    profileGate.resolve(profile);
    statsGate.resolve(stats);
    planGate.resolve(plan);

    const data = await request;
    expect(data.activeCourse).toMatchObject({ id: 'course-1', progress: 42 });
    expect(data.activeCourse?.nextLesson).toMatchObject({ id: 'lesson-2' });
  });

  it('keeps Home usable when profile or secondary metrics fail', async () => {
    mocks.fetchLearnerProfile.mockRejectedValueOnce(new Error('profile unavailable'));
    mocks.fetchLearnerStats.mockRejectedValueOnce(new Error('stats unavailable'));

    const data = await fetchRealDashboardData('learner-1', 'course-1', { force: true });

    expect(data.profile.name).toBe('Học viên');
    expect(data.activeCourse).toMatchObject({ id: 'course-1', progress: 42 });
    expect(data.stats).toMatchObject({ streak: 0, xp: 0, learnedWords: 0 });
    expect(data.today.vocabularyDue).toBe(5);
    expect(data.warnings).toEqual(['profile', 'stats']);
  });

  it('treats a missing active enrollment as a critical Home error', async () => {
    mocks.fetchPublishedCourseForLearner.mockResolvedValueOnce(null);

    await expect(fetchRealDashboardData('learner-1', 'course-1', { force: true }))
      .rejects.toThrow('Khóa học đang học không còn khả dụng');
  });
});

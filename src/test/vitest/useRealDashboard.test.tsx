import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  user: { id: 'user-1' } as { id: string } | null,
  fetchPublishedCourseForLearner: vi.fn(),
  fetchLearnerProfile: vi.fn(),
  fetchDailyLearningPlan: vi.fn(),
  fetchLearnerStats: vi.fn(),
}));

vi.mock('@/src/features/auth/lib/AuthProvider', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('@/src/features/courses/repositories/coursesRepository', () => ({ fetchPublishedCourseForLearner: mocks.fetchPublishedCourseForLearner }));
vi.mock('@/src/features/profile/repositories/profileRepository', () => ({ fetchLearnerProfile: mocks.fetchLearnerProfile }));
vi.mock('@/src/features/dashboard/repositories/learnerDashboardRepository', () => ({ fetchDailyLearningPlan: mocks.fetchDailyLearningPlan }));
vi.mock('@/src/features/dashboard/repositories/learnerStatsRepository', () => ({ fetchLearnerStats: mocks.fetchLearnerStats }));

import { useRealDashboard } from '@/src/features/dashboard/hooks/useRealDashboard';
import { clearRealDashboardCache } from '@/src/features/dashboard/repositories/realDashboardRepository';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

const profile = { displayName: 'Learner', email: 'learner@example.com', targetLevel: 'N3' };
const stats = {
  totalXp: 240, weeklyXp: 80, dailyXp: 25, reviewedToday: 3, totalReviews: 12, currentStreak: 4,
  masteredVocabulary: 18, dueVocabulary: 2, weeklyActivity: [], topicMastery: [],
};
const plan = {
  goalMinutes: 20,
  dueVocabulary: 2,
  nextLesson: null,
  weakAssessment: null,
};
const course = {
  id: 'course-1', title: 'Khóa học thật', level: 'N3', description: '', progress: 42,
  totalLessons: 10, image: '', themeColor: null, isEnrolled: true,
};

beforeEach(() => {
  mocks.user = { id: 'user-1' };
  mocks.fetchLearnerProfile.mockResolvedValue(profile);
  mocks.fetchPublishedCourseForLearner.mockResolvedValue(course);
  mocks.fetchLearnerStats.mockResolvedValue(stats);
  mocks.fetchDailyLearningPlan.mockResolvedValue(plan);
  clearRealDashboardCache();
  useActiveCourseStore.setState({ userId: 'user-1', activeCourseId: 'course-1', enrolledCourseIds: ['course-1'], status: 'ready', error: null });
});

afterEach(() => {
  cleanup();
  clearRealDashboardCache();
  useActiveCourseStore.getState().reset();
  vi.clearAllMocks();
});

describe('useRealDashboard', () => {
  it('keeps fresh cache scoped to the learner and clears it on sign-out', async () => {
    const first = renderHook(() => useRealDashboard());
    await waitFor(() => expect(first.result.current.data?.activeCourse?.id).toBe('course-1'));
    first.unmount();
    vi.clearAllMocks();

    const cached = renderHook(() => useRealDashboard());
    await waitFor(() => expect(cached.result.current.loading).toBe(false));
    expect(cached.result.current.data?.activeCourse?.id).toBe('course-1');
    expect(mocks.fetchLearnerProfile).not.toHaveBeenCalled();
    expect(mocks.fetchPublishedCourseForLearner).not.toHaveBeenCalled();

    mocks.user = null;
    await act(async () => {
      cached.rerender();
    });
    await waitFor(() => expect(cached.result.current.reason).toBe('auth'));

    mocks.user = { id: 'user-1' };
    vi.clearAllMocks();
    cached.rerender();
    await waitFor(() => expect(mocks.fetchLearnerProfile).toHaveBeenCalledWith('user-1'));
    expect(mocks.fetchPublishedCourseForLearner).toHaveBeenCalledWith('user-1', 'course-1');
  });
});

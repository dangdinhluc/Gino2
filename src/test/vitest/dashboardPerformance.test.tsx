import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchDailyLearningPlan: vi.fn(),
  fetchDashboardHeroSlots: vi.fn(),
  fetchLearnerDashboard: vi.fn(),
  fetchLearnerProfile: vi.fn(),
  fetchLearnerStats: vi.fn(),
  listLearnerNotifications: vi.fn(),
  claimDailyReward: vi.fn(),
  pickRandomDashboardAnnouncement: vi.fn(),
  selectDashboardHeroSlot: vi.fn(),
}));

vi.mock('@/src/features/auth/lib/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'learner-1' } }),
}));

vi.mock('@/src/features/dashboard/repositories/learnerDashboardRepository', () => ({
  fetchDailyLearningPlan: mocks.fetchDailyLearningPlan,
  fetchDashboardHeroSlots: mocks.fetchDashboardHeroSlots,
  fetchLearnerDashboard: mocks.fetchLearnerDashboard,
}));

vi.mock('@/src/features/profile/repositories/profileRepository', () => ({
  fetchLearnerProfile: mocks.fetchLearnerProfile,
}));

vi.mock('@/src/features/dashboard/repositories/learnerStatsRepository', () => ({
  fetchLearnerStats: mocks.fetchLearnerStats,
}));

vi.mock('@/src/features/notifications/repositories/notificationRepository', () => ({
  listLearnerNotifications: mocks.listLearnerNotifications,
}));

vi.mock('@/src/features/rewards/repositories/rewardRepository', () => ({
  claimDailyReward: mocks.claimDailyReward,
}));

vi.mock('@/src/features/dashboard/lib/dashboardHero', () => ({
  pickRandomDashboardAnnouncement: mocks.pickRandomDashboardAnnouncement,
  selectDashboardHeroSlot: mocks.selectDashboardHeroSlot,
}));

vi.mock('@/src/shared/components/Reveal', () => ({
  Reveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/src/features/dashboard/components/DashboardHero', () => ({
  DashboardHero: () => <div data-testid="critical-dashboard" />,
}));

vi.mock('@/src/features/dashboard/components/DashboardStatCards', () => ({
  DashboardStatCards: () => <div data-testid="stats-cards" />,
}));

vi.mock('@/src/features/dashboard/components/DailyRewardBanner', () => ({
  DailyRewardBanner: () => null,
}));

vi.mock('@/src/features/dashboard/components/WeeklyActivity', () => ({
  WeeklyActivity: () => null,
}));

vi.mock('@/src/features/dashboard/components/CourseMastery', () => ({
  CourseMastery: () => null,
}));

vi.mock('@/src/features/dashboard/components/DashboardShortcuts', () => ({
  DashboardShortcuts: () => null,
}));

vi.mock('@/src/features/dashboard/components/DashboardQuestsModal', () => ({
  DashboardQuestsModal: () => null,
}));

import Dashboard from '@/src/features/dashboard/pages/DashboardPage';

const dashboardSnapshot = { streakDays: 2, dueVocabulary: 3 };
const profileSnapshot = { displayName: 'Learner', email: 'learner@example.com', targetLevel: 'Tokutei Gino' };
const statsSnapshot = {
  totalXp: 120,
  weeklyXp: 40,
  dailyXp: 20,
  reviewedToday: 2,
  totalReviews: 8,
  currentStreak: 2,
  masteredVocabulary: 4,
  dueVocabulary: 3,
  weeklyActivity: [],
  topicMastery: [],
};
const planSnapshot = { dueVocabulary: 3, goalMinutes: 20, nextLesson: null, weakAssessment: null };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => { resolve = nextResolve; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchLearnerDashboard.mockResolvedValue(dashboardSnapshot);
  mocks.fetchLearnerProfile.mockResolvedValue(profileSnapshot);
  mocks.fetchLearnerStats.mockResolvedValue(statsSnapshot);
  mocks.fetchDailyLearningPlan.mockResolvedValue(planSnapshot);
  mocks.listLearnerNotifications.mockResolvedValue([]);
  mocks.fetchDashboardHeroSlots.mockResolvedValue([]);
  mocks.pickRandomDashboardAnnouncement.mockReturnValue(null);
  mocks.selectDashboardHeroSlot.mockReturnValue(null);
});

afterEach(() => cleanup());

describe('dashboard performance boundaries', () => {
  it('requests each dashboard source exactly once on initial load', async () => {
    render(<Dashboard />);

    await waitFor(() => expect(screen.getByTestId('critical-dashboard')).toBeInTheDocument());

    expect(mocks.fetchLearnerDashboard).toHaveBeenCalledTimes(1);
    expect(mocks.fetchLearnerStats).toHaveBeenCalledTimes(1);
    expect(mocks.fetchLearnerProfile).toHaveBeenCalledTimes(1);
    expect(mocks.fetchLearnerProfile).toHaveBeenCalledWith('learner-1');
    expect(mocks.fetchDailyLearningPlan).toHaveBeenCalledTimes(1);
    expect(mocks.listLearnerNotifications).toHaveBeenCalledTimes(1);
    expect(mocks.fetchDashboardHeroSlots).toHaveBeenCalledTimes(1);
  });

  it('renders critical dashboard content before slow secondary and optional data', async () => {
    const slowProfile = deferred<typeof profileSnapshot>();
    const slowPlan = deferred<typeof planSnapshot>();
    const slowStats = deferred<typeof statsSnapshot>();
    const slowNotifications = deferred<never[]>();
    const slowHeroSlots = deferred<never[]>();
    mocks.fetchLearnerProfile.mockReturnValue(slowProfile.promise);
    mocks.fetchDailyLearningPlan.mockReturnValue(slowPlan.promise);
    mocks.fetchLearnerStats.mockReturnValue(slowStats.promise);
    mocks.listLearnerNotifications.mockReturnValue(slowNotifications.promise);
    mocks.fetchDashboardHeroSlots.mockReturnValue(slowHeroSlots.promise);

    render(<Dashboard />);

    await waitFor(() => expect(screen.getByTestId('critical-dashboard')).toBeInTheDocument());
    const root = document.querySelector('[data-dashboard-status]');
    expect(root).toHaveAttribute('data-dashboard-status', 'ready');
    expect(root).toHaveAttribute('data-profile-status', 'loading');
    expect(root).toHaveAttribute('data-plan-status', 'loading');
    expect(root).toHaveAttribute('data-stats-status', 'loading');
    expect(root).toHaveAttribute('data-notifications-status', 'loading');
    expect(root).toHaveAttribute('data-hero-status', 'loading');
    expect(screen.queryByTestId('stats-cards')).not.toBeInTheDocument();

    slowProfile.resolve(profileSnapshot);
    slowPlan.resolve(planSnapshot);
    slowStats.resolve(statsSnapshot);
    slowNotifications.resolve([]);
    slowHeroSlots.resolve([]);
    await waitFor(() => expect(screen.getByTestId('stats-cards')).toBeInTheDocument());
  });
});

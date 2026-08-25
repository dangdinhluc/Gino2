import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RealDashboardData } from '@/src/features/dashboard/repositories/realDashboardRepository';

const mocks = vi.hoisted(() => ({
  useRealDashboard: vi.fn(),
  claimDailyReward: vi.fn(),
}));

vi.mock('@/src/features/dashboard/hooks/useRealDashboard', () => ({
  useRealDashboard: mocks.useRealDashboard,
}));

vi.mock('@/src/features/rewards/repositories/rewardRepository', () => ({
  claimDailyReward: mocks.claimDailyReward,
}));

vi.mock('@/src/shared/lib/assets', () => ({
  assets: {
    courses: {
      workspace: {
        vocabulary: 'vocabulary.png',
        documents: 'documents.png',
        practice: 'practice.png',
        games: 'games.png',
        exam: 'exam.png',
      },
    },
    shared: {
      backgrounds: { fujiLandscape: 'fuji.png', fujiScene: 'fuji2.png' },
      mascots: {
        headerWaving: 'wave.png',
        vocabWriting: 'vocab.png',
        practicePencil: 'practice.png',
        nextLessonN5: 'next.png',
        faceWinking: 'wink.png',
      },
      dashboard: {
        openBook: 'book.png',
        chestGold: 'chest.png',
        bookStack: 'stack.png',
        checklist: 'check.png',
        studyTimer: 'timer.png',
        xpStar: 'xp.png',
      },
    },
  },
}));

import TodayPage from '@/src/features/dashboard/pages/TodayPage';

const emptyDashboard: RealDashboardData = {
  profile: { name: 'Học viên' },
  activeCourse: null,
  courses: [],
  today: { vocabularyDue: 0, exercises: 0, lessons: 0 },
  stats: { streak: 0, xp: 0, learnedWords: 0, studyMinutes: null },
  weakPoints: [],
};

function renderToday() {
  return render(
    <MemoryRouter>
      <TodayPage />
    </MemoryRouter>,
  );
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useRealDashboard.mockReturnValue({
    data: emptyDashboard,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
});

afterEach(() => cleanup());

describe('TodayPage', () => {
  it('renders real empty-state numbers instead of mock course titles or fake stats', () => {
    renderToday();

    expect(screen.getByText('Xin chào, Học viên!')).toBeInTheDocument();
    expect(screen.getByText('Bạn chưa có khóa học')).toBeInTheDocument();
    expect(screen.getByText('Hôm nay chưa có từ cần ôn')).toBeInTheDocument();
    expect(screen.getByText('0 XP')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.queryByText(/Minna no Nihongo/)).not.toBeInTheDocument();
    expect(screen.queryByText('12/24')).not.toBeInTheDocument();
  });

  it('does not toast success when claiming the daily reward fails', async () => {
    mocks.claimDailyReward.mockRejectedValue(new Error('RPC failed'));
    renderToday();

    fireEvent.click(screen.getByRole('button', { name: 'Nhận XP' }));

    await waitFor(() => expect(screen.getByText('RPC failed')).toBeInTheDocument());
    expect(screen.queryByText(/nhận thưởng thành công/i)).not.toBeInTheDocument();
    expect(mocks.claimDailyReward).toHaveBeenCalledTimes(1);
  });

  it('opens the active learning workspace directly', () => {
    mocks.useRealDashboard.mockReturnValue({
      data: {
        ...emptyDashboard,
        activeCourse: {
          id: 'course-1',
          title: 'Tokutei Nhà hàng',
          progress: 40,
          nextLesson: { id: 'lesson-1', title: 'Bài tiếp theo' },
        },
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderToday();

    expect(screen.getByRole('link', { name: 'Tiếp tục học' })).toHaveAttribute(
      'href',
      '/app/courses/course-1/workspace?tab=vocabulary',
    );
  });

  it('keeps stale Dashboard content visible while a refresh is failing', () => {
    const refetch = vi.fn();
    mocks.useRealDashboard.mockReturnValue({
      data: {
        ...emptyDashboard,
        activeCourse: { id: 'course-1', title: 'Khóa học thật', progress: 40, nextLesson: null },
      },
      loading: false,
      refreshing: false,
      error: new Error('Tạm thời mất kết nối'),
      reason: 'dashboard',
      refetch,
    });

    renderToday();

    expect(screen.getByText('Khóa học thật')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Dữ liệu đang được giữ lại');
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('redirects only when the hook positively reports no course', async () => {
    mocks.useRealDashboard.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      reason: 'no-course',
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <TodayPage />
        <LocationProbe />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/app/courses'));
  });
});

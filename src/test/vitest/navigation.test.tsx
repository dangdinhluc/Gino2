import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomNav } from '@/src/app/layouts/BottomNav';
import { LearningLauncherSheet } from '@/src/features/courses/components/LearningLauncherSheet';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

vi.mock('@/src/features/courses/repositories/courseLearningRepository', () => ({
  fetchCourseLearningWorkspace: vi.fn().mockResolvedValue({
    course: {
      id: 'course-1',
      title: 'Tokutei Nhà hàng',
      level: 'N4',
      description: 'Khóa học nhà hàng',
      currentModule: 'Bài 8: てあります',
      progress: 62,
    },
    vocabulary: [{ id: 'vocab-1', status: 'new' }],
    reviewQuestions: [{ id: 'question-1' }],
    documents: [{ id: 'document-1' }],
    games: [],
    exams: [{ id: 'exam-1' }],
    podcasts: [],
    featureConfig: {
      vocabulary: true,
      documents: true,
      practice: true,
      games: true,
      exams: true,
    },
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}{location.hash}</output>;
}

afterEach(() => {
  cleanup();
  useActiveCourseStore.getState().reset();
});

describe('BottomNav component', () => {
  it('renders all 5 tabs and center mascot button', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <BottomNav />
      </MemoryRouter>
    );

    expect(screen.getByText('Hôm nay')).toBeDefined();
    expect(screen.getByText('Khóa học')).toBeDefined();
    expect(screen.getByText('Luyện tập')).toBeDefined();
    expect(screen.getByText('Cá nhân')).toBeDefined();
    expect(screen.getByRole('button', { name: /mở học ngay/i })).toBeDefined();
  });
});

describe('LearningLauncherSheet component', () => {
  it('loads the active course and deep-links each learning module', async () => {
    useActiveCourseStore.getState().setLocalCourse('course-1');
    const handleClose = vi.fn();

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <LearningLauncherSheet isOpen={true} onClose={handleClose} />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /học ngay/i })).toBeDefined();
    expect(await screen.findByText('Tokutei Nhà hàng')).toBeDefined();
    expect(screen.getAllByText('Bài 8: てあります')).toHaveLength(2);
    expect(screen.getByText('62%')).toBeDefined();
    expect(screen.getByText('Từ vựng')).toBeDefined();
    expect(screen.getByText('Tài liệu')).toBeDefined();
    expect(screen.getByText('Luyện tập')).toBeDefined();
    expect(screen.getByText('Game')).toBeDefined();
    expect(screen.getByText('Thi thử')).toBeDefined();

    const sheet = screen.getByRole('dialog');
    expect(sheet.className).toContain('max-h-[90dvh]');
    expect(sheet.className).toContain('overflow-hidden');
    expect(screen.getByLabelText('Nội dung học trong khóa').parentElement?.className).toContain('overflow-y-auto');
    expect(document.body.style.overflow).toBe('hidden');

    const routes = [
      ['Tiếp tục bài đang học', 'vocabulary'],
      ['Từ vựng', 'vocabulary'],
      ['Tài liệu', 'documents'],
      ['Luyện tập', 'practice'],
      ['Game', 'games'],
      ['Thi thử', 'exams'],
    ] as const;

    for (const [label, tab] of routes) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(label, 'i') }));
      await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(`/app/courses/course-1/workspace?tab=${tab}`));
    }

    expect(handleClose).toHaveBeenCalled();
  });

  it('offers course selection when there is no active course', async () => {
    useActiveCourseStore.setState({ status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <LearningLauncherSheet isOpen={true} onClose={vi.fn()} />
        <LocationProbe />
      </MemoryRouter>
    );

    expect(await screen.findByText('Bạn chưa chọn khóa học')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /chọn khóa học/i }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/app/courses'));
  });
});

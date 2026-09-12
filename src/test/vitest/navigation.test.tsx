import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomNav } from '@/src/app/layouts/BottomNav';
import { MainLayout } from '@/src/app/layouts/MainLayout';
import { CourseEntryRedirect } from '@/src/features/courses/components/CourseEntryRedirect';
import { CourseLearningMenuSheet } from '@/src/features/courses/components/CourseLearningMenuSheet';
import { LearningLauncherSheet } from '@/src/features/courses/components/LearningLauncherSheet';
import { courseWorkspaceTabs } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

const mockUseActiveCourse = vi.hoisted(() => vi.fn());

vi.mock('@/src/features/courses/hooks/useActiveCourse', () => ({
  useActiveCourse: mockUseActiveCourse,
}));

vi.mock('@/src/features/courses/repositories/courseLearningRepository', () => ({
  fetchCourseLearningMeta: vi.fn().mockResolvedValue({
    course: {
      id: 'course-1',
      title: 'Tokutei Nhà hàng',
      level: 'N4',
      description: 'Khóa học nhà hàng',
      currentModule: 'Bài 8: てあります',
      progress: 62,
    },
    featureConfig: {
      vocabulary: true,
      documents: true,
      practice: true,
      games: true,
      exams: true,
    },
    podcastCount: 0,
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}{location.hash}</output>;
}

// jsdom has no Element.prototype.scrollTo, which MainLayout calls on route change.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

afterEach(() => {
  cleanup();
  useActiveCourseStore.getState().reset();
});

describe('BottomNav component', () => {
  it('renders four destinations plus the center learning launcher', () => {
    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <BottomNav />
      </MemoryRouter>
    );

    expect(screen.getByText('Hôm nay')).toBeDefined();
    expect(screen.getByText('Khóa học')).toBeDefined();
    expect(screen.getByText('Thi thử')).toBeDefined();
    expect(screen.getByText('Cá nhân')).toBeDefined();
    expect(screen.queryByText('Luyện tập')).toBeNull();
    expect(screen.getByRole('button', { name: /mở học ngay/i })).toBeDefined();

    // Guard the label -> destination pairing, not just the labels: the third tab
    // briefly read "Luyện tập" while its href was still the exam route.
    const destinations = [
      ['Hôm nay', '/app/dashboard'],
      ['Khóa học', '/app/courses'],
      ['Thi thử', '/app/exams'],
      ['Cá nhân', '/app/profile'],
    ] as const;

    for (const [label, href] of destinations) {
      expect(screen.getByText(label).closest('a')?.getAttribute('href')).toBe(href);
    }
  });
});

describe('MainLayout bottom-nav visibility', () => {
  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="*" element={<div>nội dung</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

  it('keeps the bottom nav on the exam workspace tab (Thi thử destination)', () => {
    renderAt('/app/courses/course-1/workspace?tab=exams');
    expect(screen.getByRole('navigation', { name: 'Thanh điều hướng chính' })).toBeDefined();
  });

  it('still hides the bottom nav inside the exam runner', () => {
    renderAt('/app/exams/exam-1/start');
    expect(screen.queryByRole('navigation', { name: 'Thanh điều hướng chính' })).toBeNull();
  });

  it('Hides the bottom nav on other course workspace tabs', () => {
    renderAt('/app/courses/course-1/workspace?tab=vocabulary');
    expect(screen.queryByRole('navigation', { name: 'Thanh điều hướng chính' })).toBeNull();
  });
});

// Comment: "đã chuyển qua tab thi thử nhưng thanh menu vẫn báo đang chọn khóa học này".
// Exam is a tab of the course workspace, so a naive prefix match lit BOTH
// "Khóa học" and "Thi thử" at once. Exactly one tab may ever be current.
// BottomNav is rendered directly here because MainLayout hides it on some of
// these routes — the activation rule must hold regardless of visibility.
describe('BottomNav active tab', () => {
  const activeLabelsAt = (path: string) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <BottomNav />
      </MemoryRouter>,
    );
    return Array.from(document.querySelectorAll('nav.gino-bottom-nav a[aria-current="page"]'))
      .map((el) => el.textContent?.trim());
  };

  it('marks only "Thi thử" as current on the exam workspace tab', () => {
    expect(activeLabelsAt('/app/courses/course-1/workspace?tab=exams')).toEqual(['Thi thử']);
  });

  it('marks only "Khóa học" as current on a non-exam course workspace tab', () => {
    expect(activeLabelsAt('/app/courses/course-1/workspace?tab=vocabulary')).toEqual(['Khóa học']);
  });

  it('marks only "Khóa học" as current on the course list', () => {
    expect(activeLabelsAt('/app/courses')).toEqual(['Khóa học']);
  });

  it('marks only "Thi thử" as current on the shared exams entry route', () => {
    expect(activeLabelsAt('/app/exams')).toEqual(['Thi thử']);
  });

  it('marks only "Hôm nay" as current on the dashboard', () => {
    expect(activeLabelsAt('/app/dashboard')).toEqual(['Hôm nay']);
  });

  it('marks exactly one tab current on every app route', () => {
    for (const path of [
      '/app/dashboard',
      '/app/courses',
      '/app/courses/course-1/workspace?tab=exams',
      '/app/courses/course-1/workspace?tab=vocabulary',
      '/app/exams',
      '/app/profile',
    ]) {
      cleanup();
      expect(activeLabelsAt(path)).toHaveLength(1);
    }
  });
});

describe('CourseEntryRedirect component', () => {
  it('opens the active course exam tab from the shared exam entry route', () => {
    mockUseActiveCourse.mockReturnValue({ activeCourseId: 'course-1', status: 'ready' });

    render(
      <MemoryRouter initialEntries={['/app/exams']}>
        <CourseEntryRedirect destination="exams" />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/app/courses/course-1/workspace?tab=exams');
  });

  it('does not redirect when active-course loading fails and exposes retry', () => {
    const retry = vi.fn();
    mockUseActiveCourse.mockReturnValue({
      activeCourseId: 'course-1',
      status: 'error',
      error: 'Tạm thời không kết nối được.',
      retry,
    });

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <CourseEntryRedirect />
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Tạm thời không kết nối được.');
    expect(screen.getByTestId('location')).toHaveTextContent('/app/dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(retry).toHaveBeenCalledTimes(1);
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
    // "Thi thử" is a bottom-nav destination now; the launcher must not duplicate it.
    expect(screen.queryByText('Thi thử')).toBeNull();

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
    ] as const;

    for (const [label, tab] of routes) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(label, 'i') }));
      await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(`/app/courses/course-1/workspace?tab=${tab}`));
    }

    expect(handleClose).toHaveBeenCalled();
  });

  it('closes on Escape for keyboard users', () => {
    useActiveCourseStore.setState({ status: 'ready' });
    const handleClose = vi.fn();

    render(
      <MemoryRouter initialEntries={['/app/dashboard']}>
        <LearningLauncherSheet isOpen={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
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

describe('CourseLearningMenuSheet component', () => {
  it('switches directly between focus modes without overview', () => {
    const onClose = vi.fn();
    const onSelectSection = vi.fn();

    render(
      <CourseLearningMenuSheet
        activeSection="vocabulary"
        courseTitle="Tokutei Nhà hàng"
        isOpen
        onClose={onClose}
        onSelectSection={onSelectSection}
        tabs={courseWorkspaceTabs}
      />,
    );

    const dialog = screen.getByRole('dialog', { name: /đổi chế độ học/i });
    expect(screen.queryByText('Tổng quan')).toBeNull();
    expect(dialog.className).toContain('max-h-[90dvh]');
    expect(screen.getByLabelText('Các chế độ học').className).toContain('overflow-y-auto');

    fireEvent.click(screen.getByRole('button', { name: /luyện tập/i }));
    expect(onSelectSection).toHaveBeenCalledWith('practice');
    expect(onClose).toHaveBeenCalled();
  });
});

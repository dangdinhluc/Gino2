import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BottomNav } from '@/src/app/layouts/BottomNav';
import { QuickLearnSheet } from '@/src/app/layouts/QuickLearnSheet';

vi.mock('@/src/features/courses/repositories/learningProgressRepository', () => ({
  getDueVocabularyCards: vi.fn().mockResolvedValue([{ id: '1', status: 'learning' }]),
}));

vi.mock('@/src/features/courses/repositories/coursesRepository', () => ({
  fetchPublishedCourses: vi.fn().mockResolvedValue([
    { id: 'course-1', title: 'Demo • Tokutei A1', isEnrolled: true, progress: 35 },
  ]),
}));

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
    expect(screen.getByRole('button', { name: /mở học nhanh/i })).toBeDefined();
  });
});

describe('QuickLearnSheet component', () => {
  it('renders correctly when open', () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();

    render(
      <QuickLearnSheet
        isOpen={true}
        dueCount={8}
        currentCourse={{ id: 'course-1', title: 'Demo • Tokutei A1' }}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />
    );

    expect(screen.getByRole('heading', { name: /học nhanh/i })).toBeDefined();
    expect(screen.getByText('Ôn từ vựng')).toBeDefined();
    expect(screen.getByText('8 từ đang chờ ôn')).toBeDefined();
    expect(screen.getByText('Tiếp tục bài đang học')).toBeDefined();
    expect(screen.getByText('Demo • Tokutei A1')).toBeDefined();
    expect(screen.getByText('Luyện nhanh')).toBeDefined();
    expect(screen.getByText('Chơi game')).toBeDefined();
    expect(screen.getByText('Thi thử')).toBeDefined();
    expect(screen.getByText(/Mẹo nhỏ từ Tanuki:/i)).toBeDefined();

    // Clicking quick action
    fireEvent.click(screen.getByText('Luyện nhanh'));
    expect(handleNavigate).toHaveBeenCalledWith('/app/practice');
  });
});

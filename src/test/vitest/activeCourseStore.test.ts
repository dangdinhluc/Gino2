import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchActiveCourseContext: vi.fn(),
  persistActiveCourse: vi.fn(),
}));

vi.mock('@/src/features/courses/repositories/activeCourseRepository', () => mocks);

import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

afterEach(() => {
  useActiveCourseStore.getState().reset();
  vi.clearAllMocks();
});

describe('active course store', () => {
  it('keeps the last known course and exposes a retryable error', async () => {
    useActiveCourseStore.setState({
      userId: 'user-1',
      activeCourseId: 'course-1',
      enrolledCourseIds: ['course-1'],
      status: 'error',
      error: null,
    });
    mocks.fetchActiveCourseContext.mockRejectedValueOnce(new Error('Tạm thời mất kết nối'));

    await useActiveCourseStore.getState().load('user-1');

    expect(useActiveCourseStore.getState()).toMatchObject({
      activeCourseId: 'course-1',
      enrolledCourseIds: ['course-1'],
      status: 'error',
      error: 'Tạm thời mất kết nối',
    });

    mocks.fetchActiveCourseContext.mockResolvedValueOnce({
      activeCourseId: 'course-1',
      enrollments: [{ courseId: 'course-1', status: 'active', progressPercent: 20, enrolledAt: null }],
      usedPersistedSelection: true,
    });
    await useActiveCourseStore.getState().retry();

    expect(useActiveCourseStore.getState()).toMatchObject({ status: 'ready', activeCourseId: 'course-1' });
  });

  it('does not turn a failed first load into a no-course state', async () => {
    mocks.fetchActiveCourseContext.mockRejectedValueOnce(new Error('Không thể đọc khóa học'));

    await useActiveCourseStore.getState().load('user-1');

    expect(useActiveCourseStore.getState()).toMatchObject({
      activeCourseId: null,
      enrolledCourseIds: [],
      status: 'error',
      error: 'Không thể đọc khóa học',
    });
  });
});

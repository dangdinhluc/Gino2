import { create } from 'zustand';
import {
  fetchActiveCourseContext,
  persistActiveCourse,
} from '@/src/features/courses/repositories/activeCourseRepository';

export type ActiveCourseStatus = 'idle' | 'loading' | 'ready' | 'saving' | 'error';

interface ActiveCourseState {
  userId: string | null;
  activeCourseId: string | null;
  enrolledCourseIds: string[];
  status: ActiveCourseStatus;
  error: string | null;
  load: (userId: string) => Promise<void>;
  retry: () => Promise<void>;
  selectCourse: (courseId: string) => Promise<void>;
  setLocalCourse: (courseId: string) => void;
  reset: () => void;
}

let activeCourseRequestId = 0;

export const useActiveCourseStore = create<ActiveCourseState>((set, get) => ({
  userId: null,
  activeCourseId: null,
  enrolledCourseIds: [],
  status: 'idle',
  error: null,

  load: async (userId) => {
    const current = get();
    if (current.userId === userId && (current.status === 'loading' || current.status === 'ready' || current.status === 'saving')) return;
    const requestId = ++activeCourseRequestId;

    set((state) => ({
      userId,
      status: 'loading',
      error: null,
      activeCourseId: state.userId === userId ? state.activeCourseId : null,
      enrolledCourseIds: state.userId === userId ? state.enrolledCourseIds : [],
    }));
    try {
      const context = await fetchActiveCourseContext(userId);
      if (requestId !== activeCourseRequestId || get().userId !== userId) return;
      if (!context.usedPersistedSelection && context.activeCourseId) {
        try {
          await persistActiveCourse(context.activeCourseId);
        } catch {
          // The in-memory fallback still keeps existing learners moving if
          // the preference write is temporarily unavailable.
        }
      }
      if (requestId !== activeCourseRequestId || get().userId !== userId) return;
      set({
        activeCourseId: context.activeCourseId,
        enrolledCourseIds: context.enrollments.map((enrollment) => enrollment.courseId),
        status: 'ready',
        error: null,
      });
    } catch (error: unknown) {
      if (requestId !== activeCourseRequestId || get().userId !== userId) return;
      set((state) => ({
        // Keep the last known selection visible while the learner retries.
        activeCourseId: state.activeCourseId,
        enrolledCourseIds: state.enrolledCourseIds,
        status: 'error',
        error: error instanceof Error ? error.message : 'Không tải được khóa học đang học.',
      }));
    }
  },

  retry: async () => {
    const userId = get().userId;
    if (userId) await get().load(userId);
  },

  selectCourse: async (courseId) => {
    const current = get();
    if (!current.userId || !current.enrolledCourseIds.includes(courseId)) {
      throw new Error('Khóa học chưa được đăng ký.');
    }
    if (current.activeCourseId === courseId) return;

    set({ status: 'saving', error: null });
    try {
      await persistActiveCourse(courseId);
      set({ activeCourseId: courseId, status: 'ready', error: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Không thể chuyển khóa học.';
      set({ status: 'ready', error: message });
      throw error;
    }
  },

  setLocalCourse: (courseId) => set((state) => ({
    activeCourseId: courseId,
    enrolledCourseIds: state.enrolledCourseIds.includes(courseId)
      ? state.enrolledCourseIds
      : [...state.enrolledCourseIds, courseId],
    status: 'ready',
    error: null,
  })),

  reset: () => {
    activeCourseRequestId += 1;
    set({
      userId: null,
      activeCourseId: null,
      enrolledCourseIds: [],
      status: 'idle',
      error: null,
    });
  },
}));

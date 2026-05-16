import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProgressState {
  courseProgress: Record<string, {
    completedLessons: string[];
  }>;
  markLessonComplete: (courseId: string, lessonId: string) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      courseProgress: {},

      markLessonComplete: (courseId, lessonId) =>
        set((state) => {
          const course = state.courseProgress[courseId] || { completedLessons: [] };
          const completedSet = new Set(course.completedLessons || []);
          completedSet.add(lessonId);

          return {
            courseProgress: {
              ...state.courseProgress,
              [courseId]: {
                ...course,
                completedLessons: Array.from(completedSet),
              },
            },
          };
        }),
    }),
    {
      name: 'tokutei-gino-progress',
    }
  )
);

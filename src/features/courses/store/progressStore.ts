import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId } from '@/src/features/games/types';

interface SrsItem {
  id: string;
  gameId: GameId;
  addedAt: string;
}

interface ProgressState {
  courseProgress: Record<string, { completedLessons: string[] }>;
  srsQueue: SrsItem[];
  streak: number;
  lastPlayedDate: string | null;
  weeklyXp: number;

  markLessonComplete: (courseId: string, lessonId: string) => void;
  addToSrs: (items: { id: string; gameId: GameId }[]) => void;
  removeFromSrs: (id: string) => void;
  recordGameComplete: (xp: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      courseProgress: {},
      srsQueue: [],
      streak: 0,
      lastPlayedDate: null,
      weeklyXp: 0,

      markLessonComplete: (courseId, lessonId) =>
        set((state) => {
          const course = state.courseProgress[courseId] || { completedLessons: [] };
          const completedSet = new Set(course.completedLessons || []);
          completedSet.add(lessonId);
          return {
            courseProgress: {
              ...state.courseProgress,
              [courseId]: { ...course, completedLessons: Array.from(completedSet) },
            },
          };
        }),

      addToSrs: (items) =>
        set((state) => {
          const existing = new Set(state.srsQueue.map((i) => i.id));
          const newItems: SrsItem[] = items
            .filter((i) => !existing.has(i.id))
            .map((i) => ({ id: i.id, gameId: i.gameId, addedAt: new Date().toISOString() }));
          return { srsQueue: [...state.srsQueue, ...newItems] };
        }),

      removeFromSrs: (id) =>
        set((state) => ({ srsQueue: state.srsQueue.filter((i) => i.id !== id) })),

      recordGameComplete: (xp) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          let streak = state.streak;
          if (state.lastPlayedDate === yesterday) streak += 1;
          else if (state.lastPlayedDate !== today) streak = 1;
          return { streak, lastPlayedDate: today, weeklyXp: state.weeklyXp + xp };
        }),
    }),
    { name: 'tokutei-gino-progress' }
  )
);

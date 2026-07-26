import { create } from 'zustand';
import type { CourseReviewQuestion, CourseVocabularyItem } from '@/src/features/courses/mock/courseLearningMock';
import type { CourseGameType } from '@/src/features/games/types';

export interface CourseGameContext {
  courseId: string;
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
  reviewQuestions: CourseReviewQuestion[];
  returnPath: string;
  selectedGameType?: CourseGameType;
}

interface CourseGameStore {
  context: CourseGameContext | null;
  setCourseGameContext: (context: CourseGameContext) => void;
  clearCourseGameContext: () => void;
}

export const useCourseGameStore = create<CourseGameStore>()((set) => ({
  context: null,
  setCourseGameContext: (context) => set({ context }),
  clearCourseGameContext: () => set({ context: null }),
}));

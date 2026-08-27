import type { Tables } from '@/src/features/supabase/lib/database.types';
import {
  listAdminLessonAssets,
  listAdminLessonExercises,
  listAdminLessonVocabulary,
} from './adminContentRepository';
import { listAdminReviewOptions, listAdminReviewQuestions } from './adminAssessmentRepository';
import type { AdminLessonExercise, AdminReviewOption } from './adminRepositoryCore';

export interface AdminLessonContent {
  vocabularyLinks: Tables<'lesson_vocabulary'>[];
  exercises: AdminLessonExercise[];
  reviewQuestions: Tables<'review_questions'>[];
  reviewOptions: AdminReviewOption[];
  assets: Tables<'lesson_assets'>[];
}

export async function fetchAdminLessonContent(lessonId: string): Promise<AdminLessonContent> {
  const [vocabularyLinks, exercises, reviewQuestions, assets] = await Promise.all([
    listAdminLessonVocabulary(lessonId),
    listAdminLessonExercises(lessonId),
    listAdminReviewQuestions(lessonId),
    listAdminLessonAssets(lessonId),
  ]);
  const reviewOptions = await listAdminReviewOptions(reviewQuestions.map((question) => question.id));
  return { vocabularyLinks, exercises, reviewQuestions, reviewOptions, assets };
}

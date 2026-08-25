import { useCallback, useEffect, useState } from 'react';
import {
  fetchCourseDocuments,
  fetchCourseExams,
  fetchCourseGames,
  fetchCourseLearningMeta,
  fetchCoursePodcasts,
  fetchCoursePractice,
  fetchCourseVocabulary,
} from '@/src/features/courses/repositories/courseLearningRepository';
import type {
  CourseDocumentsData,
  CourseExamsData,
  CourseGamesData,
  CourseLearningMeta,
  CoursePodcastsData,
  CoursePracticeData,
  CourseVocabularyData,
} from '@/src/features/courses/courseLearning.types';
import {
  fetchCourseLearningCached,
  invalidateCourseLearningCache,
  readCourseLearningCache,
  type CourseLearningModuleKey,
} from '@/src/features/courses/lib/courseLearningCache';

export interface CourseLearningModuleState<T> {
  data: T | null;
  isLoading: boolean;
  loadError: string | null;
  retry: () => void;
}

function useCourseLearningModule<T>(
  courseId: string | undefined,
  enabled: boolean,
  module: CourseLearningModuleKey,
  loader: (courseId: string) => Promise<T | null>,
  fallbackError: string,
): CourseLearningModuleState<T> {
  const [retryToken, setRetryToken] = useState(0);
  const [state, setState] = useState<CourseLearningModuleState<T>>(() => {
    const cached = courseId && enabled ? readCourseLearningCache<T>(courseId, module) : undefined;
    return {
      data: cached === undefined || cached === null ? null : cached,
      isLoading: Boolean(courseId && enabled && cached === undefined),
      loadError: null,
      retry: () => undefined,
    };
  });

  useEffect(() => {
    let cancelled = false;
    if (!courseId || !enabled) {
      setState((current) => ({ ...current, data: null, isLoading: false, loadError: null }));
      return () => { cancelled = true; };
    }

    const cached = readCourseLearningCache<T>(courseId, module);
    if (cached !== undefined) {
      setState({ data: cached, isLoading: false, loadError: cached === null ? fallbackError : null, retry: () => undefined });
      return () => { cancelled = true; };
    }

    setState((current) => ({ ...current, data: null, isLoading: true, loadError: null }));
    fetchCourseLearningCached(courseId, module, () => loader(courseId))
      .then((data) => {
        if (cancelled) return;
        setState({
          data,
          isLoading: false,
          loadError: data === null ? fallbackError : null,
          retry: () => undefined,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          isLoading: false,
          loadError: error instanceof Error ? error.message : fallbackError,
          retry: () => undefined,
        });
      });

    return () => { cancelled = true; };
  }, [courseId, enabled, fallbackError, loader, module, retryToken]);

  const retry = useCallback(() => {
    if (courseId) invalidateCourseLearningCache(courseId, module);
    setRetryToken((value) => value + 1);
  }, [courseId, module]);

  return { ...state, retry };
}

export function useCourseLearningMeta(courseId: string | undefined, enabled = true) {
  return useCourseLearningModule<CourseLearningMeta>(courseId, enabled, 'meta', fetchCourseLearningMeta, 'Không tải được thông tin khóa học.');
}

export function useCourseVocabulary(courseId: string | undefined, enabled: boolean) {
  return useCourseLearningModule<CourseVocabularyData>(courseId, enabled, 'vocabulary', fetchCourseVocabulary, 'Không tải được từ vựng khóa học.');
}

export function useCourseDocuments(courseId: string | undefined, enabled: boolean) {
  return useCourseLearningModule<CourseDocumentsData>(courseId, enabled, 'documents', fetchCourseDocuments, 'Không tải được tài liệu khóa học.');
}

export function useCoursePractice(courseId: string | undefined, enabled: boolean) {
  return useCourseLearningModule<CoursePracticeData>(courseId, enabled, 'practice', fetchCoursePractice, 'Không tải được dữ liệu luyện tập.');
}

export function useCourseGames(courseId: string | undefined, enabled: boolean) {
  return useCourseLearningModule<CourseGamesData>(courseId, enabled, 'games', fetchCourseGames, 'Không tải được dữ liệu game.');
}

export function useCourseExams(courseId: string | undefined, enabled: boolean) {
  return useCourseLearningModule<CourseExamsData>(courseId, enabled, 'exams', fetchCourseExams, 'Không tải được đề thi khóa học.');
}

export function useCoursePodcasts(courseId: string | undefined, enabled: boolean) {
  return useCourseLearningModule<CoursePodcastsData>(courseId, enabled, 'podcasts', fetchCoursePodcasts, 'Không tải được audio khóa học.');
}

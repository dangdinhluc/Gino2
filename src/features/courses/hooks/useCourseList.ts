import { useEffect, useState } from 'react';
import {
  fetchPublishedCourses,
  isSupabaseCoursesEnabled,
  type CourseListEntry,
} from '@/src/features/courses/repositories/coursesRepository';
import { COURSES } from '@/src/features/courses/mock/courses';

export type CourseListSource = 'supabase' | 'mock';

export type CourseListStatus = 'loading' | 'ready' | 'error';

export interface CourseListResult {
  status: CourseListStatus;
  source: CourseListSource;
  data: CourseListEntry[];
  error: string | null;
  isFallback: boolean;
}

const MOCK_ENTRIES: CourseListEntry[] = COURSES.map((course) => ({
  ...course,
  themeColor: null,
}));

const MOCK_RESULT: CourseListResult = {
  status: 'ready',
  source: 'mock',
  data: MOCK_ENTRIES,
  error: null,
  isFallback: false,
};

/**
 * Orchestrates the learner course list. When Supabase is configured we read
 * from the published catalog, otherwise we fall back to the curated mock so
 * the page keeps rendering during local dev without a Supabase project.
 */
export function useCourseList(): CourseListResult {
  const supabaseEnabled = isSupabaseCoursesEnabled();
  const [state, setState] = useState<CourseListResult>(() =>
    supabaseEnabled
      ? { status: 'loading', source: 'supabase', data: [], error: null, isFallback: false }
      : MOCK_RESULT,
  );

  useEffect(() => {
    if (!supabaseEnabled) {
      setState(MOCK_RESULT);
      return;
    }

    let cancelled = false;
    setState({ status: 'loading', source: 'supabase', data: [], error: null, isFallback: false });

    fetchPublishedCourses()
      .then((courses) => {
        if (cancelled) {
          return;
        }
        if (!courses || courses.length === 0) {
          setState({
            status: 'ready',
            source: 'mock',
            data: MOCK_ENTRIES,
            error: null,
            isFallback: true,
          });
          return;
        }
        setState({ status: 'ready', source: 'supabase', data: courses, error: null, isFallback: false });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách khóa học từ Supabase.';
        setState({ status: 'error', source: 'mock', data: MOCK_ENTRIES, error: message, isFallback: true });
      });

    return () => {
      cancelled = true;
    };
  }, [supabaseEnabled]);

  return state;
}

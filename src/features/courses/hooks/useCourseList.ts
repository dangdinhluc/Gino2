import { useEffect, useState } from 'react';
import { fetchPublishedCourses, type CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';

export type CourseListStatus = 'loading' | 'ready' | 'error';

export interface CourseListResult {
  status: CourseListStatus;
  data: CourseListEntry[];
  error: string | null;
}

export function useCourseList(): CourseListResult {
  const [state, setState] = useState<CourseListResult>({ status: 'loading', data: [], error: null });

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCourses()
      .then((courses) => { if (!cancelled) setState({ status: 'ready', data: courses, error: null }); })
      .catch((error: unknown) => { if (!cancelled) setState({ status: 'error', data: [], error: error instanceof Error ? error.message : 'Không thể tải danh sách khóa học.' }); });
    return () => { cancelled = true; };
  }, []);

  return state;
}

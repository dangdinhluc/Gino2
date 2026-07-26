import { useEffect, useState } from 'react';
import { getCourseLearningWorkspace, type CourseLearningWorkspaceData } from '@/src/features/courses/mock/courseLearningMock';
import { fetchCourseLearningWorkspace } from '@/src/features/courses/repositories/courseLearningRepository';

export function useCourseLearningWorkspace(courseId: string | undefined): CourseLearningWorkspaceData {
  const fallback = getCourseLearningWorkspace(courseId);
  const [workspace, setWorkspace] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    setWorkspace(fallback);

    if (!courseId) return () => { cancelled = true; };

    fetchCourseLearningWorkspace(courseId, fallback)
      .then((data) => {
        if (!cancelled && data) setWorkspace(data);
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) console.error('[course-workspace] Supabase fetch failed', error);
      });

    return () => { cancelled = true; };
  }, [courseId]);

  return workspace;
}

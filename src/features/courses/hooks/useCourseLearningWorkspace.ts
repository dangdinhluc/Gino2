import { useEffect, useState } from 'react';
import type { CourseLearningWorkspaceData } from '@/src/features/courses/courseLearning.types';
import { fetchCourseLearningWorkspace } from '@/src/features/courses/repositories/courseLearningRepository';
import { supabase } from '@/src/features/supabase/lib/supabaseClient';

export interface CourseLearningWorkspaceState {
  data: CourseLearningWorkspaceData | null;
  isLoading: boolean;
  loadError: string | null;
}

export function useCourseLearningWorkspace(courseId: string | undefined): CourseLearningWorkspaceState {
  const hasBackend = Boolean(supabase);
  const [state, setState] = useState<CourseLearningWorkspaceState>({ data: null, isLoading: hasBackend, loadError: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, isLoading: hasBackend, loadError: null });

    if (!courseId) {
      setState({ data: null, isLoading: false, loadError: 'Thiếu mã khóa học.' });
      return () => { cancelled = true; };
    }
    if (!supabase) {
      setState({ data: null, isLoading: false, loadError: 'Supabase chưa được cấu hình.' });
      return () => { cancelled = true; };
    }

    fetchCourseLearningWorkspace(courseId)
      .then((data) => {
        if (cancelled) return;
        if (data) setState({ data, isLoading: false, loadError: null });
        else setState({ data: null, isLoading: false, loadError: 'Không tìm thấy khóa học hoặc tài khoản chưa được ghi danh.' });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: null, isLoading: false, loadError: error instanceof Error ? error.message : 'Không tải được workspace.' });
        if (import.meta.env.DEV) console.error('[course-workspace] Supabase fetch failed', error);
      });

    return () => { cancelled = true; };
  }, [courseId, hasBackend]);

  return state;
}

import { useEffect, useState } from 'react';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';

interface CourseStatsState {
  loading: boolean;
  data: LearnerStatsSnapshot | null;
  error: string | null;
}

export function useCourseStats(): CourseStatsState {
  const [state, setState] = useState<CourseStatsState>({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    fetchLearnerStats()
      .then((data) => {
        if (!cancelled) setState({ loading: false, data, error: null });
      })
      .catch((reason: unknown) => {
        if (!cancelled) setState({ loading: false, data: null, error: reason instanceof Error ? reason.message : 'Không thể tải thống kê học tập.' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

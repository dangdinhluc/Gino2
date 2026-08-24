import { useEffect } from 'react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

export function useActiveCourse() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const state = useActiveCourseStore();
  const load = useActiveCourseStore((current) => current.load);
  const reset = useActiveCourseStore((current) => current.reset);

  useEffect(() => {
    if (!userId) {
      reset();
      return;
    }
    void load(userId);
  }, [load, reset, userId]);

  return state;
}

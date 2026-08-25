import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';
import { ActiveCourseErrorState } from './ActiveCourseErrorState';

export function ActiveCourseGuard({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const { activeCourseId, status, error, retry } = useActiveCourse();

  if (status === 'error') {
    return <ActiveCourseErrorState message={error} onRetry={() => void retry()} />;
  }

  if (status !== 'ready') {
    return <main className="grid min-h-[55vh] place-items-center text-sm font-bold text-[#5F6B7C]">Đang mở khóa học…</main>;
  }

  if (!activeCourseId) return <Navigate to="/app/courses" replace />;
  if (id !== activeCourseId) return <Navigate to="/app/courses" replace />;
  return <>{children}</>;
}

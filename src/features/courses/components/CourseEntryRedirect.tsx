import { Navigate } from 'react-router-dom';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';

export function CourseEntryRedirect() {
  const { activeCourseId, status } = useActiveCourse();

  if (status !== 'ready') {
    return <main className="grid min-h-[55vh] place-items-center text-sm font-bold text-[#5F6B7C]">Đang mở lộ trình học…</main>;
  }

  return <Navigate to={activeCourseId ? '/app/dashboard' : '/app/courses?mode=select'} replace />;
}

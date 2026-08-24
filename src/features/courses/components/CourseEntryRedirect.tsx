import { Navigate } from 'react-router-dom';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';

interface CourseEntryRedirectProps {
  destination?: 'dashboard' | 'exams';
}

export function CourseEntryRedirect({ destination = 'dashboard' }: CourseEntryRedirectProps) {
  const { activeCourseId, status } = useActiveCourse();

  if (status !== 'ready') {
    return <main className="grid min-h-[55vh] place-items-center text-sm font-bold text-[#5F6B7C]">Đang mở lộ trình học…</main>;
  }

  const target = activeCourseId && destination === 'exams'
    ? `/app/courses/${activeCourseId}/workspace?tab=exams`
    : activeCourseId
      ? '/app/dashboard'
      : '/app/courses';

  return <Navigate to={target} replace />;
}

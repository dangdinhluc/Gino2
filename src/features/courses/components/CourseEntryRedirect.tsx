import { Navigate } from 'react-router-dom';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';
import { DashboardLoading } from '@/src/features/dashboard/components/DashboardLoading';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';
import { ActiveCourseErrorState } from './ActiveCourseErrorState';

interface CourseEntryRedirectProps {
  destination?: 'dashboard' | 'exams';
}

export function CourseEntryRedirect({ destination = 'dashboard' }: CourseEntryRedirectProps) {
  const { activeCourseId, status, error, retry } = useActiveCourse();

  if (status === 'error') {
    return <ActiveCourseErrorState message={error} onRetry={() => void retry()} />;
  }

  if (status !== 'ready') {
    return destination === 'dashboard'
      ? <DashboardLoading />
      : <PageLoading />;
  }

  const target = activeCourseId && destination === 'exams'
    ? `/app/courses/${activeCourseId}/workspace?tab=exams`
    : activeCourseId
      ? '/app/dashboard'
      : '/app/courses';

  return <Navigate to={target} replace />;
}

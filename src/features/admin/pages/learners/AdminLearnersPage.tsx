import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { listAdminCourses, listAdminEnrollments, listAdminStudents } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Learner = Tables<'profiles'>;
type Enrollment = Tables<'enrollments'>;
type Course = Tables<'courses'>;

interface LearnersData {
  learners: Learner[];
  enrollments: Enrollment[];
  courses: Course[];
}

export default function AdminLearnersPage() {
  const [query, setQuery] = useState('');
  const [courseId, setCourseId] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState('');
  const load = useCallback(async (): Promise<LearnersData> => {
    const [learners, enrollments, courses] = await Promise.all([listAdminStudents(), listAdminEnrollments(), listAdminCourses()]);
    return { learners, enrollments, courses };
  }, []);
  const { data, loading, error, refresh } = useAdminQuery<LearnersData>(load);
  const enrollmentsByLearner = useMemo(() => {
    const result = new Map<string, Enrollment[]>();
    for (const enrollment of data?.enrollments ?? []) {
      result.set(enrollment.user_id, [...(result.get(enrollment.user_id) ?? []), enrollment]);
    }
    return result;
  }, [data?.enrollments]);
  const coursesById = useMemo(() => new Map((data?.courses ?? []).map((course) => [course.id, course])), [data?.courses]);
  const enrollmentStatuses = useMemo(() => [...new Set((data?.enrollments ?? []).map((item) => item.status).filter(Boolean))].sort(), [data?.enrollments]);
  const rows = useMemo(() => (data?.learners ?? []).filter((learner) => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    const learnerEnrollments = enrollmentsByLearner.get(learner.user_id) ?? [];
    const matchesQuery = !needle || [learner.display_name, learner.email].join(' ').toLocaleLowerCase('vi-VN').includes(needle);
    const matchesCourse = !courseId || learnerEnrollments.some((enrollment) => enrollment.course_id === courseId);
    const matchesStatus = !enrollmentStatus || learnerEnrollments.some((enrollment) => enrollment.status === enrollmentStatus);
    return matchesQuery && matchesCourse && matchesStatus;
  }), [courseId, data?.learners, enrollmentStatus, enrollmentsByLearner, query]);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Học viên" title="Học viên" description="Tìm học viên, xem enrollment và mở hồ sơ hỗ trợ theo đúng người được chọn." />
      <SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tên hoặc email học viên…" filters={<><select value={courseId} onChange={(event) => setCourseId(event.target.value)} aria-label="Lọc theo khóa học" className="min-h-11 max-w-60 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả khóa học</option>{data?.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><select value={enrollmentStatus} onChange={(event) => setEnrollmentStatus(event.target.value)} aria-label="Lọc theo trạng thái enrollment" className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả trạng thái</option>{enrollmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></>} />
      {loading && !data ? <AdminPageSkeleton rows={6} /> : error || !data ? <AdminErrorState title="Không tải được học viên" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Không có học viên phù hợp" description="Thử thay đổi tìm kiếm hoặc bộ lọc." /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((learner) => {
        const learnerEnrollments = enrollmentsByLearner.get(learner.user_id) ?? [];
        return <article key={learner.user_id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h2 className="truncate font-bold text-[#172033]">{learner.display_name || 'Chưa đặt tên'}</h2><p className="mt-1 truncate text-sm text-[#5F6B7C]">{learner.email}</p><div className="mt-3 flex flex-wrap gap-1.5">{learnerEnrollments.length ? learnerEnrollments.slice(0, 3).map((enrollment) => <span key={enrollment.id} className="inline-flex items-center gap-1.5 rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-xs text-[#5F6B7C]"><GraduationCap aria-hidden="true" size={13} />{coursesById.get(enrollment.course_id)?.title ?? 'Khóa học'} · {enrollment.progress_percent}%<StatusBadge status={enrollment.status} /></span>) : <span className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-xs text-[#5F6B7C]">Chưa có enrollment</span>}{learnerEnrollments.length > 3 && <span className="rounded-full bg-[#F0E8DC] px-2 py-1 text-xs font-semibold text-[#315C73]">+{learnerEnrollments.length - 3} khóa</span>}</div></div><Link to={'/admin/learners/' + learner.user_id} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Xem học viên<ArrowRight aria-hidden="true" size={16} /></Link></article>;
      })}</div></section>}
    </div>
  );
}

import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { CourseEditorDrawer } from '@/src/features/admin/components/course/CourseEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { listAdminCourseSummaries, type AdminCourseSummary } from '@/src/features/admin/repositories/adminRepository';

export default function AdminCoursesPage() {
  const load = useCallback(() => listAdminCourseSummaries(), []);
  const { data, loading, error, refresh } = useAdminQuery<AdminCourseSummary[]>(load);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [isEditorOpen, setEditorOpen] = useState(false);
  const courses = useMemo(() => (data ?? []).filter(({ course }) => {
    const search = query.trim().toLocaleLowerCase('vi-VN');
    if (status !== 'all' && course.status !== status) return false;
    return !search || [course.title, course.slug, course.level, course.description].join(' ').toLocaleLowerCase('vi-VN').includes(search);
  }), [data, query, status]);

  return <div className="space-y-6"><AdminPageHeader eyebrow="Nội dung" title="Khóa học" description="Mỗi khóa học là nơi quản lý curriculum, lesson và tài nguyên liên quan." actions={<button type="button" onClick={() => setEditorOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white hover:bg-[#274D61]"><Plus aria-hidden="true" size={17} />Thêm khóa học</button>} /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm theo tên, slug, cấp độ…" filters={<label className="sr-only" htmlFor="course-status-filter">Trạng thái khóa học</label>} actions={<select id="course-status-filter" value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#315C73]"><option value="all">Tất cả trạng thái</option><option value="draft">Nháp</option><option value="in_review">Chờ duyệt</option><option value="published">Đã xuất bản</option><option value="archived">Đã lưu trữ</option></select>} />{loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được danh sách khóa học" onRetry={() => void refresh()} /> : courses.length === 0 ? <AdminEmptyState title="Chưa có khóa học phù hợp" description={query || status !== 'all' ? 'Thử thay đổi tìm kiếm hoặc bộ lọc.' : 'Tạo khóa học đầu tiên để bắt đầu xây dựng curriculum.'} action={!query && status === 'all' ? <button type="button" onClick={() => setEditorOpen(true)} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white">Thêm khóa học</button> : undefined} /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{courses.map((summary) => <article key={summary.course.id} className="p-4 sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-bold text-[#172033]">{summary.course.title}</h2><StatusBadge status={summary.course.status} /></div><p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5F6B7C]">{summary.course.description}</p><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#7B8796]"><span>{summary.moduleCount} module</span><span>{summary.lessonCount} bài học</span><span>{summary.vocabularyLinkCount} liên kết từ</span><span>{summary.assessmentCount} đề thi</span><span>{summary.documentCount + summary.audioCount} tài liệu & media</span></div></div><div className="flex items-center gap-3 lg:text-right"><div className="min-w-20"><p className="text-xs font-semibold text-[#7B8796]">Content readiness</p><p className="mt-1 text-lg font-bold text-[#315C73]">{summary.readinessPercent}%</p>{summary.pendingContentCount > 0 && <p className="text-xs text-[#8A5C13]">{summary.pendingContentCount} mục chưa xuất bản</p>}</div><Link to={`/admin/content/courses/${summary.course.id}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]">Quản lý<ArrowRight aria-hidden="true" size={16} /></Link></div></div></article>)}</div></section>}<CourseEditorDrawer open={isEditorOpen} course={null} onClose={() => setEditorOpen(false)} onSaved={refresh} /></div>;
}

import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Clock3, FileText, GraduationCap, History, NotebookPen, Plus, Trophy, UserRound, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { createAdminInterventionNote, fetchAdminLearnerDetail, fetchAdminLearnerProfile, grantAdminEnrollment, listAdminCourses, listAdminPackages, revokeAdminEnrollment, type AdminLearnerDetail } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Learner = Tables<'profiles'>;
type Course = Tables<'courses'>;
type Package = Tables<'packages'>;

interface LearnerDetailData {
  learner: Learner;
  detail: AdminLearnerDetail;
  courses: Course[];
  packages: Package[];
}

function formatDate(value: string): string {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return <article className="rounded-2xl border border-[#E4D8C9] bg-white p-4"><span className="grid size-9 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><Icon aria-hidden="true" size={17} /></span><p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-[#7B8796]">{label}</p><strong className="mt-1 block text-2xl text-[#172033]">{value}</strong></article>;
}

export default function AdminLearnerDetailPage() {
  const { userId = '' } = useParams();
  const [grantCourseId, setGrantCourseId] = useState('');
  const [grantPackageId, setGrantPackageId] = useState('');
  const [note, setNote] = useState('');
  const [revokeCourseId, setRevokeCourseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(async (): Promise<LearnerDetailData> => {
    if (!userId) throw new Error('Thiếu học viên cần xem.');
    const [learner, detail, courses, packages] = await Promise.all([fetchAdminLearnerProfile(userId), fetchAdminLearnerDetail(userId), listAdminCourses(), listAdminPackages()]);
    return { learner, detail, courses, packages };
  }, [userId]);
  const { data, loading, error, refresh } = useAdminQuery<LearnerDetailData>(load);
  const activeEnrollmentCourseIds = useMemo(() => new Set(data?.detail.enrollments.filter((item) => item.status !== 'revoked').map((item) => item.courseId) ?? []), [data?.detail.enrollments]);
  const availableCourses = useMemo(() => (data?.courses ?? []).filter((course) => !activeEnrollmentCourseIds.has(course.id)), [activeEnrollmentCourseIds, data?.courses]);
  const selectedCourse = availableCourses.find((course) => course.id === grantCourseId) ?? null;

  async function grantEnrollment(): Promise<void> {
    if (!userId || !grantCourseId || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await grantAdminEnrollment(userId, grantCourseId, grantPackageId || undefined);
      setGrantCourseId('');
      setGrantPackageId('');
      await refresh();
      setNotice('Đã cấp enrollment cho học viên.');
    } catch {
      setActionError('Không cấp được enrollment. Vui lòng kiểm tra khóa học và gói liên quan.');
    } finally {
      setSaving(false);
    }
  }

  async function revokeEnrollment(): Promise<void> {
    if (!userId || !revokeCourseId || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await revokeAdminEnrollment(userId, revokeCourseId);
      setRevokeCourseId(null);
      await refresh();
      setNotice('Đã thu hồi enrollment.');
    } catch {
      setActionError('Không thu hồi được enrollment.');
    } finally {
      setSaving(false);
    }
  }

  async function saveNote(): Promise<void> {
    if (!userId || !note.trim() || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await createAdminInterventionNote(userId, note.trim());
      setNote('');
      await refresh();
      setNotice('Đã lưu ghi chú hỗ trợ.');
    } catch {
      setActionError('Không lưu được ghi chú hỗ trợ.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Học viên" title={data?.learner.display_name || 'Chi tiết học viên'} description={data?.learner.email || 'Xem enrollment, tiến độ và lịch sử hỗ trợ theo học viên.'} actions={<Link to="/admin/learners" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]"><ArrowLeft aria-hidden="true" size={17} />Danh sách học viên</Link>} />
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}
      {loading && !data ? <AdminPageSkeleton rows={6} /> : error || !data ? <AdminErrorState title="Không tải được hồ sơ học viên" onRetry={() => void refresh()} /> : <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={GraduationCap} label="Enrollment" value={data.detail.enrollments.length} /><Metric icon={BookOpen} label="Bài đã hoàn thành" value={data.detail.lessonProgress.completed + '/' + data.detail.lessonProgress.total} /><Metric icon={Trophy} label="Từ đã thành thạo" value={data.detail.vocabulary.mastered} /><Metric icon={FileText} label="Lần thi" value={data.detail.assessments.attempts} /></section>
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-[#172033]">Enrollment</h2><p className="mt-1 text-sm text-[#5F6B7C]">Khóa học mà {data.learner.display_name || 'học viên'} đang được cấp.</p></div></div><div className="mt-4 space-y-3">{data.detail.enrollments.map((enrollment) => <article key={enrollment.courseId} className="rounded-xl border border-[#E4D8C9] bg-white p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{enrollment.courseTitle}</h3><StatusBadge status={enrollment.status} /></div><p className="mt-1 text-sm text-[#5F6B7C]">Tiến độ {enrollment.progressPercent}% · Cấp ngày {formatDate(enrollment.enrolledAt)}</p></div><button type="button" onClick={() => setRevokeCourseId(enrollment.courseId)} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 disabled:opacity-50"><X aria-hidden="true" size={15} />Thu hồi</button></div></article>)}{data.detail.enrollments.length === 0 && <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">Học viên chưa có enrollment nào.</p>}</div></section>
            <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5"><h2 className="font-bold text-[#172033]">Tiến độ & SRS</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric icon={BookOpen} label="Đã ôn" value={data.detail.vocabulary.reviewed} /><Metric icon={Trophy} label="Thành thạo" value={data.detail.vocabulary.mastered} /><Metric icon={Clock3} label="Đến hạn ôn" value={data.detail.vocabulary.due} /></div><div className="mt-4 space-y-2">{data.detail.lessonProgress.recent.map((lesson) => <div key={lesson.lessonId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm"><span className="font-semibold">{lesson.title}</span><span className="text-[#5F6B7C]">{lesson.score === null ? lesson.status : lesson.score + ' điểm'} · {formatDate(lesson.updatedAt)}</span></div>)}{data.detail.lessonProgress.recent.length === 0 && <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">Chưa có bài học gần đây.</p>}</div></section>
            <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5"><h2 className="font-bold text-[#172033]">Thi thử & hoạt động</h2><div className="mt-4 space-y-2">{data.detail.assessments.recent.map((assessment) => <div key={assessment.assessmentId + assessment.attemptedAt} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm"><span className="font-semibold">{assessment.title}</span><span className={assessment.passed ? 'font-semibold text-emerald-700' : 'font-semibold text-[#A84F33]'}>{assessment.score}% · {assessment.passed ? 'Đạt' : 'Chưa đạt'}</span></div>)}{data.detail.assessments.recent.length === 0 && <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">Chưa có lần thi nào.</p>}</div><div className="mt-4 border-t border-[#EDE4D8] pt-4">{data.detail.activity.slice(0, 8).map((item) => <div key={item.eventType + item.occurredAt} className="flex gap-3 py-2 text-sm"><History aria-hidden="true" className="mt-0.5 shrink-0 text-[#315C73]" size={15} /><div><p>{item.eventLabel || item.eventType}</p><p className="mt-1 text-xs text-[#7B8796]">{formatDate(item.occurredAt)}</p></div></div>)}{data.detail.activity.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có lịch sử hoạt động.</p>}</div></section>
          </div>
          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5"><div className="flex items-center gap-2"><UserRound aria-hidden="true" className="text-[#315C73]" size={18} /><h2 className="font-bold text-[#172033]">Hồ sơ & cài đặt</h2></div><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-[#5F6B7C]">Mục tiêu mỗi ngày</dt><dd className="font-semibold">{data.detail.settings.dailyGoalMinutes} phút</dd></div><div className="flex justify-between gap-4"><dt className="text-[#5F6B7C]">Múi giờ</dt><dd className="font-semibold">{data.detail.settings.timezone}</dd></div><div className="flex justify-between gap-4"><dt className="text-[#5F6B7C]">Nhắc học</dt><dd className="font-semibold">{data.detail.settings.reminderTime || 'Tắt'}</dd></div></dl></section>
            <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5"><div className="flex items-center gap-2"><Plus aria-hidden="true" className="text-[#315C73]" size={18} /><h2 className="font-bold text-[#172033]">Cấp enrollment</h2></div><div className="mt-4 space-y-3"><label className="block text-sm font-semibold">Khóa học<select value={grantCourseId} onChange={(event) => setGrantCourseId(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Chọn khóa học…</option>{availableCourses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label className="block text-sm font-semibold">Gói học (nếu có)<select value={grantPackageId} onChange={(event) => setGrantPackageId(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Không gắn gói</option>{data.packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{selectedCourse && <p className="text-xs leading-5 text-[#5F6B7C]">Sẽ cấp: {selectedCourse.title}</p>}<button type="button" onClick={() => void grantEnrollment()} disabled={!grantCourseId || saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50"><Plus aria-hidden="true" size={16} />Cấp enrollment</button></div></section>
            <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5"><div className="flex items-center gap-2"><NotebookPen aria-hidden="true" className="text-[#315C73]" size={18} /><h2 className="font-bold text-[#172033]">Ghi chú hỗ trợ</h2></div><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Ghi chú nội bộ cho lần hỗ trợ này…" className="mt-4 w-full rounded-xl border border-[#D9CBB9] bg-white p-3 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15" /><button type="button" onClick={() => void saveNote()} disabled={!note.trim() || saving} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] disabled:opacity-50">Lưu ghi chú</button><div className="mt-4 space-y-2">{data.detail.notes.map((item) => <article key={item.id} className="rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm"><p>{item.body}</p><p className="mt-2 text-xs text-[#7B8796]">{formatDate(item.createdAt)}</p></article>)}{data.detail.notes.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có ghi chú hỗ trợ.</p>}</div></section>
          </aside>
        </section>
      </>}
      <ConfirmDialog open={Boolean(revokeCourseId)} title="Thu hồi enrollment?" description="Học viên sẽ không còn quyền truy cập khóa học này." confirmLabel="Thu hồi enrollment" pending={saving} onCancel={() => setRevokeCourseId(null)} onConfirm={() => void revokeEnrollment()} />
    </div>
  );
}

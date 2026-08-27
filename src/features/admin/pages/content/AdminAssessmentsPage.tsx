import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { AssessmentEditorDrawer } from '@/src/features/admin/components/exams/AssessmentEditorDrawer';
import { AssessmentQuestionsPanel } from '@/src/features/admin/components/exams/AssessmentQuestionsPanel';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';
import { deleteAdminAssessment, listAdminAssessmentQuestions, listAdminAssessments, listAdminCourses, publishAdminContent, saveAdminAssessment } from '@/src/features/admin/repositories/adminRepository';
import type { Database, Tables } from '@/src/features/supabase/lib/database.types';

type Assessment = Tables<'assessments'>;
type AssessmentQuestion = Database['public']['Functions']['get_admin_assessment_questions']['Returns'][number];

export default function AdminAssessmentsPage() {
  const { role } = useAdminLayoutContext();
  const [searchParams] = useSearchParams();
  const [courseId, setCourseId] = useState(() => searchParams.get('course') ?? '');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorAssessment, setEditorAssessment] = useState<Assessment | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteAssessment, setDeleteAssessment] = useState<Assessment | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const [courses, assessments] = await Promise.all([listAdminCourses(), listAdminAssessments(courseId || undefined)]);
    return { courses, assessments };
  }, [courseId]);
  const { data, loading, error, refresh } = useAdminQuery<{ courses: Tables<'courses'>[]; assessments: Assessment[] }>(load);
  const filteredAssessments = useMemo(() => (data?.assessments ?? []).filter((assessment) => !query.trim() || assessment.title.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data?.assessments, query]);
  useEffect(() => { if (!selectedId || !filteredAssessments.some((assessment) => assessment.id === selectedId)) setSelectedId(filteredAssessments[0]?.id ?? null); }, [filteredAssessments, selectedId]);
  const selected = filteredAssessments.find((assessment) => assessment.id === selectedId) ?? null;
  const questionLoad = useCallback(() => selected ? listAdminAssessmentQuestions(selected.id) : Promise.resolve([] as AssessmentQuestion[]), [selected]);
  const { data: questions, loading: questionsLoading, error: questionsError, refresh: refreshQuestions } = useAdminQuery<AssessmentQuestion[]>(questionLoad);
  function create(): void { setEditorAssessment(null); setEditorOpen(true); }
  function edit(assessment: Assessment): void { setEditorAssessment(assessment); setEditorOpen(true); }
  async function deleteSelected(): Promise<void> {
    if (!deleteAssessment || saving) return;
    setSaving(true); setActionError(null);
    try { await deleteAdminAssessment(deleteAssessment.id); setDeleteAssessment(null); setSelectedId(null); await refresh(); } catch { setActionError('Không xóa được đề thi. Vui lòng kiểm tra nội dung liên quan rồi thử lại.'); } finally { setSaving(false); }
  }
  async function changeWorkflow(): Promise<void> {
    if (!selected || saving) return;
    setSaving(true); setActionError(null);
    try {
      if (role === 'owner') { await publishAdminContent('assessment', selected.id, 'published'); setNotice('Đề thi đã được xuất bản.'); }
      else { await saveAdminAssessment({ id: selected.id, status: 'in_review' }); setNotice('Đề thi đã được gửi để Owner duyệt.'); }
      await refresh();
    } catch { setActionError('Không cập nhật được trạng thái đề thi.'); } finally { setSaving(false); }
  }
  async function refreshAll(): Promise<void> { await Promise.all([refresh(), refreshQuestions()]); }

  return <div className="space-y-6"><AdminPageHeader eyebrow="Nội dung" title="Thi thử" description="Đề thi và câu hỏi được quản lý chung, không còn là hai bảng điều hướng độc lập." actions={<button type="button" onClick={create} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Tạo đề thi</button>} /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tên đề thi…" actions={<select value={courseId} onChange={(event) => { setCourseId(event.target.value); setSelectedId(null); }} aria-label="Lọc đề thi theo khóa học" className="min-h-11 max-w-60 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả khóa học</option>{data?.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>} />{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}{actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}{loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được đề thi" onRetry={() => void refresh()} /> : <section className="grid gap-5 xl:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)]"><div className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{filteredAssessments.map((assessment) => <button key={assessment.id} type="button" onClick={() => setSelectedId(assessment.id)} className={`w-full p-4 text-left transition ${assessment.id === selectedId ? 'bg-[#F0E8DC]' : 'hover:bg-white'}`}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block truncate text-sm">{assessment.title}</strong><p className="mt-1 text-xs text-[#7B8796]">{assessment.assessment_type} · đạt {assessment.passing_score}%</p></div><StatusBadge status={assessment.status} /></div></button>)}{filteredAssessments.length === 0 && <div className="p-4"><AdminEmptyState title="Chưa có đề thi phù hợp" description="Tạo đề đầu tiên hoặc thay đổi bộ lọc." action={<button type="button" onClick={create} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white">Tạo đề thi</button>} /></div>}</div></div><section className="min-w-0 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5">{selected ? <><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EDE4D8] pb-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{selected.title}</h2><StatusBadge status={selected.status} /></div><p className="mt-1 text-sm text-[#5F6B7C]">{selected.assessment_type} · điểm đạt {selected.passing_score}%</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => edit(selected)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button>{selected.status !== 'published' && <button type="button" onClick={() => void changeWorkflow()} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#315C73] px-3 text-sm font-semibold text-white disabled:opacity-50"><Send aria-hidden="true" size={15} />{role === 'owner' ? 'Xuất bản' : 'Gửi duyệt'}</button>}{role === 'owner' && <button type="button" onClick={() => setDeleteAssessment(selected)} aria-label={`Xóa ${selected.title}`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button>}</div></div>{questionsLoading ? <div className="mt-4"><AdminPageSkeleton rows={3} /></div> : questionsError || !questions ? <div className="mt-4"><AdminErrorState title="Không tải được câu hỏi" onRetry={() => void refreshQuestions()} /></div> : <div className="mt-5"><AssessmentQuestionsPanel assessmentId={selected.id} questions={questions} onUpdated={refreshAll} /></div>}</> : <AdminEmptyState title="Chọn một đề thi" description="Chọn đề ở cột bên trái để quản lý câu hỏi." />}</section></section>}<AssessmentEditorDrawer open={editorOpen} assessment={editorAssessment} courses={data?.courses ?? []} defaultCourseId={courseId} onClose={() => setEditorOpen(false)} onSaved={refreshAll} /><ConfirmDialog open={Boolean(deleteAssessment)} title={`Xóa “${deleteAssessment?.title ?? ''}”?`} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa đề thi" pending={saving} onCancel={() => setDeleteAssessment(null)} onConfirm={() => void deleteSelected()} /></div>;
}

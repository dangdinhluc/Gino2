import { useEffect, useState } from 'react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { saveAdminAssessment } from '@/src/features/admin/repositories/adminRepository';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { EditorField, EditorSelect, editorControlClass } from '@/src/features/admin/components/course/EditorFields';

type Assessment = Tables<'assessments'>;
type Course = Tables<'courses'>;
interface AssessmentDraft { courseId: string; title: string; type: string; passingScore: string; orderIndex: string; status: string; }
function draftFor(assessment: Assessment | null, defaultCourseId: string): AssessmentDraft {
  return assessment ? { courseId: assessment.course_id, title: assessment.title, type: assessment.assessment_type, passingScore: String(assessment.passing_score), orderIndex: String(assessment.order_index), status: assessment.status } : { courseId: defaultCourseId, title: '', type: 'quiz', passingScore: '60', orderIndex: '0', status: 'draft' };
}

export function AssessmentEditorDrawer({ open, assessment, courses, defaultCourseId, onClose, onSaved }: { open: boolean; assessment: Assessment | null; courses: Course[]; defaultCourseId: string; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<AssessmentDraft>(() => draftFor(assessment, defaultCourseId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setDraft(draftFor(assessment, defaultCourseId)); setError(null); } }, [assessment, defaultCourseId, open]);
  const set = (key: keyof AssessmentDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  async function save(): Promise<void> {
    const title = draft.title.trim(); const passingScore = Number(draft.passingScore); const orderIndex = Number(draft.orderIndex);
    if (!draft.courseId || !title) { setError('Hãy chọn khóa học và nhập tên đề.'); return; }
    if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100 || !Number.isFinite(orderIndex) || orderIndex < 0) { setError('Điểm đạt phải từ 0–100; thứ tự là số không âm.'); return; }
    setSaving(true); setError(null);
    try {
      await saveAdminAssessment({ id: assessment?.id ?? crypto.randomUUID(), isNew: !assessment, course_id: draft.courseId, title, assessment_type: draft.type, passing_score: Math.round(passingScore), order_index: Math.round(orderIndex), status: draft.status || 'draft' });
      await onSaved(); onClose();
    } catch { setError('Không lưu được đề thi. Vui lòng thử lại.'); } finally { setSaving(false); }
  }
  return <EditorDrawer open={open} title={assessment ? 'Chỉnh sửa đề thi' : 'Tạo đề thi'} description="Câu hỏi được quản lý ngay bên trong đề sau khi đề được tạo." onRequestClose={onClose} footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu đề thi'}</button></div>}><div className="space-y-4"><EditorField id="assessment-course" label="Khóa học" required><EditorSelect id="assessment-course" value={draft.courseId} onChange={(value) => set('courseId', value)}><option value="">Chọn khóa học</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</EditorSelect></EditorField><EditorField id="assessment-title" label="Tên đề" required><input id="assessment-title" value={draft.title} onChange={(event) => set('title', event.target.value)} className={editorControlClass} /></EditorField><div className="grid gap-4 sm:grid-cols-3"><EditorField id="assessment-type" label="Loại đề"><EditorSelect id="assessment-type" value={draft.type} onChange={(value) => set('type', value)}>{['quiz', 'mock-exam', 'listening', 'vocabulary'].map((item) => <option key={item} value={item}>{item}</option>)}</EditorSelect></EditorField><EditorField id="assessment-score" label="Điểm đạt (%)"><input id="assessment-score" type="number" min="0" max="100" value={draft.passingScore} onChange={(event) => set('passingScore', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="assessment-order" label="Thứ tự"><input id="assessment-order" type="number" min="0" value={draft.orderIndex} onChange={(event) => set('orderIndex', event.target.value)} className={editorControlClass} /></EditorField></div><EditorField id="assessment-status" label="Luồng duyệt"><EditorSelect id="assessment-status" value={draft.status} onChange={(value) => set('status', value)}><option value="draft">Nháp</option><option value="in_review">Chờ duyệt</option></EditorSelect></EditorField>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}</div></EditorDrawer>;
}

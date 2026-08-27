import { useCallback, useEffect, useState } from 'react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { MarkdownViewer } from '@/src/features/documents/components/MarkdownViewer';
import { fetchAdminLessonContent, saveAdminLesson, type AdminLessonContent } from '@/src/features/admin/repositories/adminRepository';
import { AdminEmptyState } from '@/src/features/admin/components/AdminState';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { LessonAssetsPanel } from './LessonAssetsPanel';
import { LessonExercisesPanel } from './LessonExercisesPanel';
import { LessonReviewPanel } from './LessonReviewPanel';
import { LessonVocabularyPicker } from './LessonVocabularyPicker';
import { EditorField, EditorSelect, editorControlClass } from './EditorFields';

type Lesson = Tables<'lessons'>;
type Module = Tables<'course_modules'>;
type LessonEditorTab = 'general' | 'content' | 'vocabulary' | 'exercises' | 'review' | 'files';

interface LessonDraft {
  moduleId: string;
  title: string;
  description: string;
  lessonType: string;
  duration: string;
  objectives: string;
  orderIndex: string;
  status: string;
  content: string;
}

function draftFor(lesson: Lesson | null, defaultModuleId: string): LessonDraft {
  return lesson
    ? { moduleId: lesson.module_id, title: lesson.title, description: lesson.description, lessonType: lesson.lesson_type, duration: String(lesson.duration_minutes), objectives: lesson.objectives.join('\n'), orderIndex: String(lesson.order_index), status: lesson.status, content: lesson.content_markdown }
    : { moduleId: defaultModuleId, title: '', description: '', lessonType: 'vocabulary', duration: '0', objectives: '', orderIndex: '0', status: 'draft', content: '' };
}

const tabs: Array<{ id: LessonEditorTab; label: string }> = [
  { id: 'general', label: 'Thông tin' },
  { id: 'content', label: 'Nội dung' },
  { id: 'vocabulary', label: 'Từ vựng' },
  { id: 'exercises', label: 'Bài tập' },
  { id: 'review', label: 'Ôn tập' },
  { id: 'files', label: 'Files' },
];

export function LessonEditorDrawer({ open, courseId, modules, lesson, defaultModuleId, onClose, onSaved }: { open: boolean; courseId: string; modules: Module[]; lesson: Lesson | null; defaultModuleId: string; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<LessonDraft>(() => draftFor(lesson, defaultModuleId));
  const [activeTab, setActiveTab] = useState<LessonEditorTab>('general');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<AdminLessonContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(false);

  const reloadLessonContent = useCallback(async (): Promise<void> => {
    if (!lesson) return;
    setContentLoading(true);
    setContentError(false);
    try { setLessonContent(await fetchAdminLessonContent(lesson.id)); } catch { setContentError(true); } finally { setContentLoading(false); }
  }, [lesson]);

  useEffect(() => {
    if (open) {
      setDraft(draftFor(lesson, defaultModuleId));
      setActiveTab('general');
      setPreview(false);
      setError(null);
    }
  }, [defaultModuleId, lesson, open]);

  useEffect(() => {
    if (!open || !lesson) {
      setLessonContent(null);
      setContentError(false);
      setContentLoading(false);
      return;
    }
    void reloadLessonContent();
  }, [lesson, open, reloadLessonContent]);

  const set = (key: keyof LessonDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const refreshNestedContent = useCallback(async (): Promise<void> => {
    await Promise.all([reloadLessonContent(), onSaved()]);
  }, [onSaved, reloadLessonContent]);

  async function save(): Promise<void> {
    const title = draft.title.trim();
    const description = draft.description.trim();
    const duration = Number(draft.duration);
    const orderIndex = Number(draft.orderIndex);
    if (!draft.moduleId || !title || !description || !draft.lessonType) { setError('Hãy chọn module và nhập thông tin cơ bản của bài học.'); return; }
    if (!Number.isFinite(duration) || duration < 0 || !Number.isFinite(orderIndex) || orderIndex < 0) { setError('Thời lượng và thứ tự cần là số không âm.'); return; }
    setSaving(true); setError(null);
    try {
      await saveAdminLesson({ id: lesson?.id ?? crypto.randomUUID(), isNew: !lesson, course_id: courseId, module_id: draft.moduleId, title, description, lesson_type: draft.lessonType, duration_minutes: Math.round(duration), objectives: draft.objectives.split('\n').map((item) => item.trim()).filter(Boolean), content_markdown: draft.content, order_index: Math.round(orderIndex), status: draft.status || 'draft' });
      await onSaved(); onClose();
    } catch { setError('Không lưu được bài học. Vui lòng thử lại.'); } finally { setSaving(false); }
  }

  const tabClass = (tab: LessonEditorTab) => `min-h-10 shrink-0 rounded-lg px-3 text-sm font-semibold ${activeTab === tab ? 'bg-[#315C73] text-white' : 'text-[#5F6B7C] hover:bg-[#F0E8DC]'}`;
  const nestedTab = activeTab === 'vocabulary' || activeTab === 'exercises' || activeTab === 'review' || activeTab === 'files';

  return <EditorDrawer open={open} title={lesson ? `Bài học: ${lesson.title}` : 'Thêm bài học'} description="Tổ chức nội dung theo phần để không cần chuyển sang bảng dữ liệu khác." onRequestClose={onClose} footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] disabled:opacity-50">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : lesson ? 'Lưu bài học' : 'Tạo bài học'}</button></div>}><div><div role="tablist" aria-label="Nội dung bài học" className="mb-5 -mx-1 flex gap-1 overflow-x-auto rounded-xl bg-[#F0E8DC] p-1 no-scrollbar">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={tabClass(tab.id)}>{tab.label}</button>)}</div>{activeTab === 'general' && <div className="space-y-4"><EditorField id="lesson-module" label="Module" required><EditorSelect id="lesson-module" value={draft.moduleId} onChange={(value) => set('moduleId', value)}><option value="">Chọn module</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</EditorSelect></EditorField><EditorField id="lesson-title" label="Tên bài học" required><input id="lesson-title" value={draft.title} onChange={(event) => set('title', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="lesson-description" label="Mô tả" required><textarea id="lesson-description" value={draft.description} onChange={(event) => set('description', event.target.value)} className={`${editorControlClass} min-h-28 resize-y`} /></EditorField><div className="grid gap-4 sm:grid-cols-2"><EditorField id="lesson-type" label="Loại bài" required><EditorSelect id="lesson-type" value={draft.lessonType} onChange={(value) => set('lessonType', value)}>{['grammar', 'vocabulary', 'listening', 'speaking', 'exam-prep'].map((item) => <option key={item} value={item}>{item}</option>)}</EditorSelect></EditorField><EditorField id="lesson-duration" label="Thời lượng (phút)"><input id="lesson-duration" type="number" min="0" value={draft.duration} onChange={(event) => set('duration', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="lesson-order" label="Thứ tự"><input id="lesson-order" type="number" min="0" value={draft.orderIndex} onChange={(event) => set('orderIndex', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="lesson-status" label="Luồng duyệt"><EditorSelect id="lesson-status" value={draft.status} onChange={(value) => set('status', value)}><option value="draft">Nháp</option><option value="in_review">Chờ duyệt</option></EditorSelect></EditorField></div><EditorField id="lesson-objectives" label="Mục tiêu học tập" hint="Mỗi dòng là một mục tiêu."><textarea id="lesson-objectives" value={draft.objectives} onChange={(event) => set('objectives', event.target.value)} className={`${editorControlClass} min-h-28 resize-y`} /></EditorField></div>}{activeTab === 'content' && <section><div className="mb-3 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#334155]">Markdown bài học</p><div className="inline-flex rounded-lg border border-[#D9CBB9] bg-white p-0.5"><button type="button" onClick={() => setPreview(false)} aria-pressed={!preview} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${!preview ? 'bg-[#F0E8DC] text-[#315C73]' : 'text-[#5F6B7C]'}`}>Soạn thảo</button><button type="button" onClick={() => setPreview(true)} aria-pressed={preview} className={`min-h-9 rounded-md px-3 text-xs font-semibold ${preview ? 'bg-[#F0E8DC] text-[#315C73]' : 'text-[#5F6B7C]'}`}>Xem trước</button></div></div>{preview ? <div className="min-h-80 rounded-xl border border-[#E4D8C9] bg-white p-5">{draft.content.trim() ? <MarkdownViewer source={draft.content} /> : <p className="text-sm text-[#7B8796]">Chưa có nội dung để xem trước.</p>}</div> : <textarea id="lesson-content" aria-label="Nội dung Markdown" value={draft.content} onChange={(event) => set('content', event.target.value)} className={`${editorControlClass} min-h-[24rem] resize-y font-mono leading-6`} placeholder="# Tiêu đề bài học\n\nNội dung hiển thị cho học viên..." />}</section>}{nestedTab && !lesson && <AdminEmptyState title="Lưu bài học trước" description="Hãy tạo bài học trước khi gắn từ vựng, tạo bài tập, câu hỏi ôn tập hoặc file." />}{nestedTab && lesson && contentLoading && <p aria-busy="true" className="rounded-xl border border-[#E4D8C9] bg-white p-4 text-sm text-[#5F6B7C]">Đang tải nội dung bài học…</p>}{nestedTab && lesson && contentError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-semibold">Không tải được nội dung bài học.</p><button type="button" onClick={() => void reloadLessonContent()} className="mt-3 min-h-10 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold">Thử lại</button></div>}{nestedTab && lesson && lessonContent && !contentLoading && !contentError && <>{activeTab === 'vocabulary' && <LessonVocabularyPicker lessonId={lesson.id} links={lessonContent.vocabularyLinks} onUpdated={refreshNestedContent} />}{activeTab === 'exercises' && <LessonExercisesPanel lessonId={lesson.id} exercises={lessonContent.exercises} onUpdated={refreshNestedContent} />}{activeTab === 'review' && <LessonReviewPanel lessonId={lesson.id} questions={lessonContent.reviewQuestions} options={lessonContent.reviewOptions} onUpdated={refreshNestedContent} />}{activeTab === 'files' && <LessonAssetsPanel courseId={courseId} lessonId={lesson.id} assets={lessonContent.assets} onUpdated={refreshNestedContent} />}</>}{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}</div></EditorDrawer>;
}

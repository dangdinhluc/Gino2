import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Json } from '@/src/features/supabase/lib/database.types';
import { deleteAdminLessonExercise, saveAdminLessonExercise, type AdminLessonExercise } from '@/src/features/admin/repositories/adminRepository';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { EditorField, EditorSelect, editorControlClass } from './EditorFields';

interface ExerciseDraft { type: string; prompt: string; choices: string; answer: string; orderIndex: string; }
function asChoices(value: Json): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []; }
function draftFor(item: AdminLessonExercise | null): ExerciseDraft { return item ? { type: item.exercise_type, prompt: item.prompt, choices: asChoices(item.choices).join('\n'), answer: item.answer, orderIndex: String(item.order_index) } : { type: 'multiple_choice', prompt: '', choices: '', answer: '', orderIndex: '0' }; }

export function LessonExercisesPanel({ lessonId, exercises, onUpdated }: { lessonId: string; exercises: AdminLessonExercise[]; onUpdated: () => Promise<void> | void }) {
  const [editing, setEditing] = useState<AdminLessonExercise | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<ExerciseDraft>(() => draftFor(null));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!editorOpen) setError(null); }, [editorOpen]);
  const set = (key: keyof ExerciseDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  function create(): void { setEditing(null); setDraft(draftFor(null)); setEditorOpen(true); }
  function edit(item: AdminLessonExercise): void { setEditing(item); setDraft(draftFor(item)); setEditorOpen(true); }
  async function save(): Promise<void> {
    const prompt = draft.prompt.trim(); const answer = draft.answer.trim(); const orderIndex = Number(draft.orderIndex); const choices = draft.choices.split('\n').map((item) => item.trim()).filter(Boolean);
    if (!prompt || !answer) { setError('Hãy nhập đề bài và đáp án.'); return; }
    if (!Number.isFinite(orderIndex) || orderIndex < 0) { setError('Thứ tự cần là số không âm.'); return; }
    setSaving(true); setError(null);
    try {
      await saveAdminLessonExercise({ id: editing?.id ?? crypto.randomUUID(), isNew: !editing, lesson_id: lessonId, exercise_type: draft.type, prompt, choices, answer, order_index: Math.round(orderIndex) });
      await onUpdated(); setEditorOpen(false);
    } catch { setError('Không lưu được bài tập. Vui lòng thử lại.'); } finally { setSaving(false); }
  }
  async function remove(): Promise<void> {
    if (!deleteId || saving) return;
    setSaving(true); setError(null);
    try { await deleteAdminLessonExercise(deleteId); await onUpdated(); setDeleteId(null); } catch { setError('Không xóa được bài tập. Vui lòng thử lại.'); } finally { setSaving(false); }
  }

  return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Bài tập</h3><p className="mt-1 text-sm text-[#5F6B7C]">Tạo bài tập riêng cho bài học này.</p></div><button type="button" onClick={create} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={16} />Thêm bài tập</button></div>{editorOpen && <section className="rounded-2xl border border-[#D9CBB9] bg-[#FFFCF7] p-4"><div className="flex items-center justify-between gap-3"><h4 className="font-bold">{editing ? 'Chỉnh sửa bài tập' : 'Bài tập mới'}</h4><button type="button" onClick={() => setEditorOpen(false)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C] hover:bg-[#F0E8DC]">Đóng</button></div><div className="mt-4 space-y-4"><EditorField id="exercise-type" label="Dạng bài"><EditorSelect id="exercise-type" value={draft.type} onChange={(value) => set('type', value)}>{['multiple_choice', 'short_answer', 'matching'].map((item) => <option key={item} value={item}>{item}</option>)}</EditorSelect></EditorField><EditorField id="exercise-prompt" label="Đề bài" required><textarea id="exercise-prompt" value={draft.prompt} onChange={(event) => set('prompt', event.target.value)} className={`${editorControlClass} min-h-24 resize-y`} /></EditorField><EditorField id="exercise-choices" label="Các lựa chọn" hint="Mỗi dòng là một lựa chọn; để trống với câu trả lời ngắn."><textarea id="exercise-choices" value={draft.choices} onChange={(event) => set('choices', event.target.value)} className={`${editorControlClass} min-h-24 resize-y`} /></EditorField><div className="grid gap-4 sm:grid-cols-2"><EditorField id="exercise-answer" label="Đáp án" required><input id="exercise-answer" value={draft.answer} onChange={(event) => set('answer', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="exercise-order" label="Thứ tự"><input id="exercise-order" type="number" min="0" value={draft.orderIndex} onChange={(event) => set('orderIndex', event.target.value)} className={editorControlClass} /></EditorField></div>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditorOpen(false)} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu bài tập'}</button></div></div></section>}<div className="space-y-2">{exercises.map((exercise) => <article key={exercise.id} className="rounded-xl border border-[#E4D8C9] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><strong className="block text-sm">{exercise.prompt}</strong><p className="mt-1 text-xs text-[#7B8796]">{exercise.exercise_type} · {asChoices(exercise.choices).length} lựa chọn · thứ tự {exercise.order_index}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(exercise)} className="min-h-10 rounded-lg border border-[#D9CBB9] px-3 text-sm font-semibold text-[#315C73]">Sửa</button><button type="button" onClick={() => setDeleteId(exercise.id)} aria-label={`Xóa bài tập ${exercise.prompt}`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div></div></article>)}{exercises.length === 0 && <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">Chưa có bài tập.</p>}</div><ConfirmDialog open={Boolean(deleteId)} title="Xóa bài tập?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa bài tập" pending={saving} onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} /></section>;
}

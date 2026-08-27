import { useEffect, useMemo, useState } from 'react';
import { CircleMinus, Plus, Trash2 } from 'lucide-react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { deleteAdminReviewQuestion, saveAdminReviewQuestion, type AdminReviewOption } from '@/src/features/admin/repositories/adminRepository';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { EditorField, editorControlClass } from './EditorFields';

type ReviewQuestion = Tables<'review_questions'>;
interface QuestionDraft { prompt: string; explanation: string; orderIndex: string; answers: string[]; correctIndex: number; }
function draftFor(question: ReviewQuestion | null, options: AdminReviewOption[]): QuestionDraft {
  const ordered = options.filter((option) => option.question_id === question?.id).sort((left, right) => left.order_index - right.order_index);
  const answers = ordered.map((option) => option.label);
  const correctIndex = Math.max(0, ordered.findIndex((option) => option.is_correct));
  return question ? { prompt: question.prompt, explanation: question.explanation ?? '', orderIndex: String(question.order_index), answers: answers.length >= 2 ? answers : ['', ''], correctIndex } : { prompt: '', explanation: '', orderIndex: '0', answers: ['', ''], correctIndex: 0 };
}

export function LessonReviewPanel({ lessonId, questions, options, onUpdated }: { lessonId: string; questions: ReviewQuestion[]; options: AdminReviewOption[]; onUpdated: () => Promise<void> | void }) {
  const [editing, setEditing] = useState<ReviewQuestion | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<QuestionDraft>(() => draftFor(null, []));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const optionsByQuestion = useMemo(() => new Map(questions.map((question) => [question.id, options.filter((option) => option.question_id === question.id).sort((left, right) => left.order_index - right.order_index)])), [options, questions]);

  useEffect(() => { if (!editorOpen) setError(null); }, [editorOpen]);
  function create(): void { setEditing(null); setDraft(draftFor(null, [])); setEditorOpen(true); }
  function edit(question: ReviewQuestion): void { setEditing(question); setDraft(draftFor(question, options)); setEditorOpen(true); }
  function updateAnswer(index: number, value: string): void { setDraft((current) => ({ ...current, answers: current.answers.map((answer, itemIndex) => itemIndex === index ? value : answer) })); }
  function addAnswer(): void { setDraft((current) => current.answers.length >= 4 ? current : { ...current, answers: [...current.answers, ''] }); }
  function removeAnswer(index: number): void { setDraft((current) => current.answers.length <= 2 ? current : { ...current, answers: current.answers.filter((_, itemIndex) => itemIndex !== index), correctIndex: current.correctIndex === index ? 0 : current.correctIndex > index ? current.correctIndex - 1 : current.correctIndex }); }
  async function save(): Promise<void> {
    const prompt = draft.prompt.trim(); const orderIndex = Number(draft.orderIndex); const answers = draft.answers.map((answer) => answer.trim());
    if (!prompt || answers.some((answer) => !answer)) { setError('Hãy nhập câu hỏi và tất cả lựa chọn.'); return; }
    if (!Number.isFinite(orderIndex) || orderIndex < 0) { setError('Thứ tự cần là số không âm.'); return; }
    setSaving(true); setError(null);
    try {
      await saveAdminReviewQuestion({ id: editing?.id, lessonId, prompt, explanation: draft.explanation.trim() || null, orderIndex: Math.round(orderIndex), options: answers, correctIndex: draft.correctIndex });
      await onUpdated(); setEditorOpen(false);
    } catch { setError('Không lưu được câu hỏi ôn tập. Vui lòng thử lại.'); } finally { setSaving(false); }
  }
  async function remove(): Promise<void> {
    if (!deleteId || saving) return;
    setSaving(true); setError(null);
    try { await deleteAdminReviewQuestion(deleteId); await onUpdated(); setDeleteId(null); } catch { setError('Không xóa được câu hỏi ôn tập. Vui lòng thử lại.'); } finally { setSaving(false); }
  }

  return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Câu hỏi ôn tập</h3><p className="mt-1 text-sm text-[#5F6B7C]">Chọn đáp án đúng trực tiếp; backend hiện hỗ trợ tối đa 4 lựa chọn.</p></div><button type="button" onClick={create} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={16} />Thêm câu hỏi</button></div>{editorOpen && <section className="rounded-2xl border border-[#D9CBB9] bg-[#FFFCF7] p-4"><div className="flex items-center justify-between gap-3"><h4 className="font-bold">{editing ? 'Chỉnh sửa câu hỏi' : 'Câu hỏi mới'}</h4><button type="button" onClick={() => setEditorOpen(false)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C] hover:bg-[#F0E8DC]">Đóng</button></div><div className="mt-4 space-y-4"><EditorField id="review-prompt" label="Câu hỏi" required><textarea id="review-prompt" value={draft.prompt} onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))} className={`${editorControlClass} min-h-24 resize-y`} /></EditorField><fieldset><legend className="text-sm font-semibold text-[#334155]">Lựa chọn và đáp án đúng *</legend><div className="mt-2 space-y-2">{draft.answers.map((answer, index) => <div key={index} className="flex items-center gap-2"><input type="radio" name="review-correct-answer" checked={draft.correctIndex === index} onChange={() => setDraft((current) => ({ ...current, correctIndex: index }))} aria-label={`Đặt lựa chọn ${index + 1} là đáp án đúng`} className="size-4 accent-[#315C73]" /><input value={answer} onChange={(event) => updateAnswer(index, event.target.value)} placeholder={`Lựa chọn ${index + 1}`} className={`${editorControlClass} mt-0 flex-1`} /><button type="button" onClick={() => removeAnswer(index)} disabled={draft.answers.length <= 2} aria-label={`Xóa lựa chọn ${index + 1}`} className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#D9CBB9] text-[#5F6B7C] disabled:opacity-40"><CircleMinus aria-hidden="true" size={16} /></button></div>)}</div><button type="button" onClick={addAnswer} disabled={draft.answers.length >= 4} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-[#B7A891] bg-white px-3 text-sm font-semibold text-[#315C73] disabled:opacity-50"><Plus aria-hidden="true" size={15} />Thêm lựa chọn</button></fieldset><div className="grid gap-4 sm:grid-cols-2"><EditorField id="review-order" label="Thứ tự"><input id="review-order" type="number" min="0" value={draft.orderIndex} onChange={(event) => setDraft((current) => ({ ...current, orderIndex: event.target.value }))} className={editorControlClass} /></EditorField><EditorField id="review-explanation" label="Giải thích"><input id="review-explanation" value={draft.explanation} onChange={(event) => setDraft((current) => ({ ...current, explanation: event.target.value }))} className={editorControlClass} /></EditorField></div>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditorOpen(false)} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu câu hỏi'}</button></div></div></section>}<div className="space-y-2">{questions.map((question) => { const questionOptions = optionsByQuestion.get(question.id) ?? []; const correct = questionOptions.find((option) => option.is_correct); return <article key={question.id} className="rounded-xl border border-[#E4D8C9] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><strong className="block text-sm">{question.prompt}</strong><p className="mt-1 text-xs text-[#7B8796]">{questionOptions.length} lựa chọn · đáp án: {correct?.label ?? 'Chưa chọn'}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(question)} className="min-h-10 rounded-lg border border-[#D9CBB9] px-3 text-sm font-semibold text-[#315C73]">Sửa</button><button type="button" onClick={() => setDeleteId(question.id)} aria-label={`Xóa câu hỏi ${question.prompt}`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div></div></article>; })}{questions.length === 0 && <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">Chưa có câu hỏi ôn tập.</p>}</div><ConfirmDialog open={Boolean(deleteId)} title="Xóa câu hỏi ôn tập?" description="Thao tác này không thể hoàn tác." confirmLabel="Xóa câu hỏi" pending={saving} onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} /></section>;
}

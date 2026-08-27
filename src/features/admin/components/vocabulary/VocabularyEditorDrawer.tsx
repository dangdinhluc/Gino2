import { useEffect, useState } from 'react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { saveAdminVocabulary } from '@/src/features/admin/repositories/adminRepository';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { EditorField, editorControlClass } from '@/src/features/admin/components/course/EditorFields';

type Vocabulary = Tables<'vocabulary_items'>;
interface VocabularyDraft { term: string; reading: string; pronunciation: string; translation: string; level: string; tags: string; example: string; audioUrl: string; }
function draftFor(item: Vocabulary | null): VocabularyDraft {
  return item ? { term: item.term, reading: item.reading ?? '', pronunciation: item.pronunciation ?? '', translation: item.translation, level: item.level ?? '', tags: item.tags.join(', '), example: item.example_sentence ?? '', audioUrl: item.audio_url ?? '' } : { term: '', reading: '', pronunciation: '', translation: '', level: '', tags: '', example: '', audioUrl: '' };
}

export function VocabularyEditorDrawer({ open, vocabulary, onClose, onSaved }: { open: boolean; vocabulary: Vocabulary | null; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<VocabularyDraft>(() => draftFor(vocabulary));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setDraft(draftFor(vocabulary)); setError(null); } }, [open, vocabulary]);
  const set = (key: keyof VocabularyDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  async function save(): Promise<void> {
    const term = draft.term.trim(); const translation = draft.translation.trim();
    if (!term || !translation) { setError('Hãy nhập từ tiếng Nhật và nghĩa tiếng Việt.'); return; }
    setSaving(true); setError(null);
    try {
      await saveAdminVocabulary({ id: vocabulary?.id ?? crypto.randomUUID(), isNew: !vocabulary, term, translation, reading: draft.reading.trim() || null, pronunciation: draft.pronunciation.trim() || null, level: draft.level.trim() || null, tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean), example_sentence: draft.example.trim() || null, audio_url: draft.audioUrl.trim() || null });
      await onSaved(); onClose();
    } catch { setError('Không lưu được từ vựng. Vui lòng thử lại.'); } finally { setSaving(false); }
  }

  return <EditorDrawer open={open} title={vocabulary ? `Chỉnh sửa: ${vocabulary.term}` : 'Thêm từ vựng'} description="Không cần nhập ID kỹ thuật. Từ vựng có thể được gắn vào bài học sau khi lưu." onRequestClose={onClose} footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu từ vựng'}</button></div>}><div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><EditorField id="vocabulary-term" label="Từ tiếng Nhật" required><input id="vocabulary-term" value={draft.term} onChange={(event) => set('term', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="vocabulary-reading" label="Cách đọc"><input id="vocabulary-reading" value={draft.reading} onChange={(event) => set('reading', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="vocabulary-pronunciation" label="Romaji"><input id="vocabulary-pronunciation" value={draft.pronunciation} onChange={(event) => set('pronunciation', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="vocabulary-level" label="Cấp độ"><input id="vocabulary-level" value={draft.level} onChange={(event) => set('level', event.target.value)} className={editorControlClass} /></EditorField></div><EditorField id="vocabulary-translation" label="Nghĩa tiếng Việt" required><input id="vocabulary-translation" value={draft.translation} onChange={(event) => set('translation', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="vocabulary-tags" label="Nhãn" hint="Phân cách bằng dấu phẩy."><input id="vocabulary-tags" value={draft.tags} onChange={(event) => set('tags', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="vocabulary-example" label="Ví dụ"><textarea id="vocabulary-example" value={draft.example} onChange={(event) => set('example', event.target.value)} className={`${editorControlClass} min-h-28 resize-y`} /></EditorField><EditorField id="vocabulary-audio" label="URL phát âm"><input id="vocabulary-audio" type="url" value={draft.audioUrl} onChange={(event) => set('audioUrl', event.target.value)} className={editorControlClass} /></EditorField>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}</div></EditorDrawer>;
}

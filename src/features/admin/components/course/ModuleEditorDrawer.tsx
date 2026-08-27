import { useEffect, useState } from 'react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { saveAdminModule } from '@/src/features/admin/repositories/adminRepository';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { EditorField, EditorSelect, editorControlClass } from './EditorFields';

type Module = Tables<'course_modules'>;

interface ModuleDraft { title: string; description: string; level: string; orderIndex: string; status: string; }

function draftFor(module: Module | null): ModuleDraft {
  return module ? { title: module.title, description: module.description, level: module.level, orderIndex: String(module.order_index), status: module.status } : { title: '', description: '', level: '', orderIndex: '0', status: 'draft' };
}

export function ModuleEditorDrawer({ open, courseId, module, onClose, onSaved }: { open: boolean; courseId: string; module: Module | null; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<ModuleDraft>(() => draftFor(module));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (open) { setDraft(draftFor(module)); setError(null); } }, [module, open]);
  const set = (key: keyof ModuleDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  async function save(): Promise<void> {
    const title = draft.title.trim();
    const description = draft.description.trim();
    const level = draft.level.trim();
    const orderIndex = Number(draft.orderIndex);
    if (!title || !description || !level) { setError('Hãy nhập tên, mô tả và cấp độ của module.'); return; }
    if (!Number.isFinite(orderIndex) || orderIndex < 0) { setError('Thứ tự cần là số không âm.'); return; }
    setSaving(true); setError(null);
    try {
      await saveAdminModule({ id: module?.id ?? crypto.randomUUID(), isNew: !module, course_id: courseId, title, description, level, order_index: Math.round(orderIndex), status: draft.status || 'draft' });
      await onSaved(); onClose();
    } catch { setError('Không lưu được module. Vui lòng thử lại.'); } finally { setSaving(false); }
  }

  return <EditorDrawer open={open} title={module ? 'Chỉnh sửa module' : 'Thêm module'} description="Module thuộc khóa học hiện tại; không cần chọn hoặc nhập ID khóa học." onRequestClose={onClose} footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu module'}</button></div>}><div className="space-y-4"><EditorField id="module-title" label="Tên module" required><input id="module-title" value={draft.title} onChange={(event) => set('title', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="module-description" label="Mô tả" required><textarea id="module-description" value={draft.description} onChange={(event) => set('description', event.target.value)} className={`${editorControlClass} min-h-28 resize-y`} /></EditorField><div className="grid gap-4 sm:grid-cols-3"><EditorField id="module-level" label="Cấp độ" required><input id="module-level" value={draft.level} onChange={(event) => set('level', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="module-order" label="Thứ tự"><input id="module-order" type="number" min="0" value={draft.orderIndex} onChange={(event) => set('orderIndex', event.target.value)} className={editorControlClass} /></EditorField><EditorField id="module-status" label="Luồng duyệt"><EditorSelect id="module-status" value={draft.status} onChange={(value) => set('status', value)}><option value="draft">Nháp</option><option value="in_review">Chờ duyệt</option></EditorSelect></EditorField></div></div>{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}</EditorDrawer>;
}

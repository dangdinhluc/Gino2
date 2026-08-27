import { useEffect, useState } from 'react';
import { FileUp, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { deleteAdminLessonAsset, saveAdminLessonAsset, uploadAdminCourseAsset } from '@/src/features/admin/repositories/adminRepository';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { EditorField, EditorSelect, editorControlClass } from './EditorFields';

type Asset = Tables<'lesson_assets'>;
interface AssetDraft { title: string; type: string; description: string; externalUrl: string; }
function draftFor(asset: Asset | null): AssetDraft { return asset ? { title: asset.title, type: asset.asset_type, description: asset.description ?? '', externalUrl: asset.external_url ?? '' } : { title: '', type: 'pdf', description: '', externalUrl: '' }; }

export function LessonAssetsPanel({ courseId, lessonId, assets, onUpdated }: { courseId: string; lessonId: string; assets: Asset[]; onUpdated: () => Promise<void> | void }) {
  const [editing, setEditing] = useState<Asset | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<AssetDraft>(() => draftFor(null));
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!editorOpen) setError(null); }, [editorOpen]);
  const set = (key: keyof AssetDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  function create(): void { setEditing(null); setDraft(draftFor(null)); setFile(null); setEditorOpen(true); }
  function edit(asset: Asset): void { setEditing(asset); setDraft(draftFor(asset)); setFile(null); setEditorOpen(true); }
  async function save(): Promise<void> {
    const title = draft.title.trim();
    if (!title) { setError('Hãy nhập tên tệp.'); return; }
    setSaving(true); setError(null);
    try {
      const saved = await saveAdminLessonAsset({ id: editing?.id ?? crypto.randomUUID(), isNew: !editing, lesson_id: lessonId, title, asset_type: draft.type, description: draft.description.trim() || null, external_url: draft.externalUrl.trim() || null, metadata: {} });
      if (file) {
        const storagePath = await uploadAdminCourseAsset(courseId, saved.id, file);
        await saveAdminLessonAsset({ id: saved.id, storage_path: storagePath });
      }
      await onUpdated(); setEditorOpen(false);
    } catch { setError('Không lưu được tệp bài học. Vui lòng thử lại.'); } finally { setSaving(false); }
  }
  async function remove(): Promise<void> {
    if (!deleteId || saving) return;
    setSaving(true); setError(null);
    try { await deleteAdminLessonAsset(deleteId); await onUpdated(); setDeleteId(null); } catch { setError('Không xóa được tệp bài học. Vui lòng thử lại.'); } finally { setSaving(false); }
  }

  return <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Files</h3><p className="mt-1 text-sm text-[#5F6B7C]">Tệp tải lên được giữ trong private Supabase Storage; đường dẫn nội bộ không hiển thị công khai.</p></div><button type="button" onClick={create} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={16} />Thêm file</button></div>{editorOpen && <section className="rounded-2xl border border-[#D9CBB9] bg-[#FFFCF7] p-4"><div className="flex items-center justify-between gap-3"><h4 className="font-bold">{editing ? 'Chỉnh sửa file' : 'File mới'}</h4><button type="button" onClick={() => setEditorOpen(false)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C] hover:bg-[#F0E8DC]">Đóng</button></div><div className="mt-4 space-y-4"><EditorField id="asset-title" label="Tên file" required><input id="asset-title" value={draft.title} onChange={(event) => set('title', event.target.value)} className={editorControlClass} /></EditorField><div className="grid gap-4 sm:grid-cols-2"><EditorField id="asset-type" label="Loại file"><EditorSelect id="asset-type" value={draft.type} onChange={(value) => set('type', value)}>{['pdf', 'audio', 'image', 'worksheet'].map((item) => <option key={item} value={item}>{item}</option>)}</EditorSelect></EditorField><EditorField id="asset-upload" label="Tải tệp riêng tư" hint="Tối đa 50 MB."><input id="asset-upload" type="file" onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)} className={`${editorControlClass} cursor-pointer pt-2`} /></EditorField></div><EditorField id="asset-description" label="Mô tả"><textarea id="asset-description" value={draft.description} onChange={(event) => set('description', event.target.value)} className={`${editorControlClass} min-h-24 resize-y`} /></EditorField><EditorField id="asset-url" label="URL ngoài" hint="Tùy chọn; dùng khi tài nguyên nằm ngoài Storage."><input id="asset-url" type="url" value={draft.externalUrl} onChange={(event) => set('externalUrl', event.target.value)} className={editorControlClass} /></EditorField>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditorOpen(false)} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu file'}</button></div></div></section>}<div className="space-y-2">{assets.map((asset) => <article key={asset.id} className="rounded-xl border border-[#E4D8C9] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><FileUp aria-hidden="true" className="text-[#315C73]" size={17} /><strong className="truncate text-sm">{asset.title}</strong></div><p className="mt-1 text-xs text-[#7B8796]">{asset.asset_type}{asset.storage_path ? ' · Tệp riêng tư đã tải lên' : ''}{asset.external_url ? ' · Có URL ngoài' : ''}</p>{asset.description && <p className="mt-2 text-sm text-[#5F6B7C]">{asset.description}</p>}</div><div className="flex gap-2"><button type="button" onClick={() => edit(asset)} className="min-h-10 rounded-lg border border-[#D9CBB9] px-3 text-sm font-semibold text-[#315C73]">Sửa</button><button type="button" onClick={() => setDeleteId(asset.id)} aria-label={`Xóa file ${asset.title}`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div></div></article>)}{assets.length === 0 && <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">Chưa có file bài học. <span className="inline-flex items-center gap-1 font-semibold text-[#315C73]"><ShieldCheck aria-hidden="true" size={14} />Tệp private vẫn được bảo vệ.</span></p>}</div><ConfirmDialog open={Boolean(deleteId)} title="Xóa file bài học?" description="Thao tác này xóa bản ghi file. Tệp lưu trữ có thể cần xử lý riêng theo chính sách Storage hiện có." confirmLabel="Xóa file" pending={saving} onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} /></section>;
}

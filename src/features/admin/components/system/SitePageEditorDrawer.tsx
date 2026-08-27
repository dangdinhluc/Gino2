import { useEffect, useState } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { MarkdownViewer } from '@/src/features/documents/components/MarkdownViewer';
import { saveAdminSitePage } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type SitePage = Tables<'site_pages'>;
type EditorTab = 'edit' | 'preview';

interface SitePageEditorDrawerProps {
  open: boolean;
  page: SitePage | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

function normalizeSlug(value: string): string {
  return value.toLocaleLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96);
}

export function SitePageEditorDrawer({ open, page, onClose, onSaved }: SitePageEditorDrawerProps) {
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('draft');
  const [tab, setTab] = useState<EditorTab>('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSlug(page?.slug ?? '');
    setTitle(page?.title ?? '');
    setBody(page?.body_markdown ?? '');
    setStatus(page?.status ?? 'draft');
    setTab('edit');
    setError(null);
  }, [open, page]);

  async function save(): Promise<void> {
    if (saving) return;
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug || !title.trim() || !body.trim()) { setError('Hãy nhập slug, tiêu đề và nội dung Markdown.'); return; }
    setSaving(true);
    setError(null);
    try {
      await saveAdminSitePage({ id: page?.slug, isNew: !page, slug: normalizedSlug, title: title.trim(), body_markdown: body, status });
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được trang công khai.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return <EditorDrawer open={open} title={page ? 'Chỉnh sửa trang công khai' : 'Tạo trang công khai'} description="Markdown được xem trước bằng đúng renderer an toàn đang dùng cho nội dung học." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu trang'}</button></div>}><div className="space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#172033]">Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="about-gino2" className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}><option value="draft">Nháp</option><option value="published">Đã công bố</option><option value="archived">Lưu trữ</option></select></label></div><label className="block text-sm font-semibold text-[#172033]">Tiêu đề<input value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} /></label><div><div className="flex gap-1 border-b border-[#E4D8C9] pb-2"><button type="button" onClick={() => setTab('edit')} aria-current={tab === 'edit' ? 'page' : undefined} className={tab === 'edit' ? 'inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#F0E8DC] px-3 text-sm font-semibold text-[#315C73]' : 'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C]'}><PencilLine aria-hidden="true" size={15} />Markdown</button><button type="button" onClick={() => setTab('preview')} aria-current={tab === 'preview' ? 'page' : undefined} className={tab === 'preview' ? 'inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#F0E8DC] px-3 text-sm font-semibold text-[#315C73]' : 'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C]'}><Eye aria-hidden="true" size={15} />Xem trước</button></div>{tab === 'edit' ? <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={18} className={fieldClass + ' font-mono leading-6'} /> : <div className="min-h-72 rounded-xl border border-[#E4D8C9] bg-white p-4"><MarkdownViewer source={body || 'Chưa có nội dung để xem trước.'} /></div>}</div></div></EditorDrawer>;
}

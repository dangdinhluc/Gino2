import { useEffect, useState } from 'react';
import { Eye, FileUp, PencilLine } from 'lucide-react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { MarkdownViewer } from '@/src/features/documents/components/MarkdownViewer';
import { saveAdminDocument, uploadAdminCourseAsset } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Document = Tables<'documents'>;
type Course = Tables<'courses'>;
type EditorTab = 'edit' | 'preview';

interface DocumentEditorDrawerProps {
  open: boolean;
  document: Document | null;
  courses: Course[];
  documentTypes: string[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

interface DocumentForm {
  courseId: string;
  title: string;
  summary: string;
  documentType: string;
  readTime: string;
  externalUrl: string;
  contentMarkdown: string;
}

function optionalHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const url = new URL(trimmed);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Liên kết ngoài phải bắt đầu bằng http:// hoặc https://.');
  return url.toString();
}

export function DocumentEditorDrawer({ open, document, courses, documentTypes, onClose, onSaved }: DocumentEditorDrawerProps) {
  const defaultCourseId = courses[0]?.id ?? '';
  const [form, setForm] = useState<DocumentForm>({ courseId: '', title: '', summary: '', documentType: 'post', readTime: '5', externalUrl: '', contentMarkdown: '' });
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [tab, setTab] = useState<EditorTab>('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      courseId: document?.course_id ?? defaultCourseId,
      title: document?.title ?? '',
      summary: document?.summary ?? '',
      documentType: document?.document_type ?? documentTypes[0] ?? 'post',
      readTime: String(document?.read_time_minutes ?? 5),
      externalUrl: document?.external_url ?? '',
      contentMarkdown: document?.content_markdown ?? '',
    });
    setAssetFile(null);
    setTab('edit');
    setError(null);
  }, [defaultCourseId, document, documentTypes, open]);

  function update<K extends keyof DocumentForm>(key: K, value: DocumentForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(): Promise<void> {
    if (saving) return;
    const title = form.title.trim();
    const summary = form.summary.trim();
    const documentType = form.documentType.trim();
    const readTime = Number(form.readTime);
    if (!form.courseId) { setError('Hãy chọn khóa học.'); return; }
    if (!title || !summary || !documentType) { setError('Hãy nhập tên, tóm tắt và loại tài liệu.'); return; }
    if (!Number.isFinite(readTime) || readTime < 0) { setError('Thời gian đọc phải là số không âm.'); return; }

    setSaving(true);
    setError(null);
    try {
      const saved = await saveAdminDocument({
        id: document?.id ?? crypto.randomUUID(),
        isNew: !document,
        course_id: form.courseId,
        title,
        summary,
        document_type: documentType,
        read_time_minutes: readTime,
        external_url: optionalHttpUrl(form.externalUrl),
        content_markdown: form.contentMarkdown,
        status: document?.status ?? 'draft',
      });
      if (assetFile) {
        const storagePath = await uploadAdminCourseAsset(saved.course_id, saved.id, assetFile);
        await saveAdminDocument({ id: saved.id, storage_path: storagePath });
      }
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được tài liệu.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';

  return (
    <EditorDrawer
      open={open}
      title={document ? 'Chỉnh sửa tài liệu' : 'Tạo tài liệu'}
      description="Thông tin tệp riêng tư được giữ trong Supabase Storage và không hiển thị cho người học."
      onRequestClose={onClose}
      footer={<div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu tài liệu'}</button></div>}
    >
      <div className="space-y-5">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        <label className="block text-sm font-semibold text-[#172033]">Khóa học<select value={form.courseId} onChange={(event) => update('courseId', event.target.value)} className={fieldClass}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
        <label className="block text-sm font-semibold text-[#172033]">Tên tài liệu<input value={form.title} onChange={(event) => update('title', event.target.value)} className={fieldClass} /></label>
        <label className="block text-sm font-semibold text-[#172033]">Tóm tắt<textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} rows={3} className={fieldClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#172033]">Loại tài liệu<input value={form.documentType} onChange={(event) => update('documentType', event.target.value)} list="admin-document-types" className={fieldClass} /><datalist id="admin-document-types">{documentTypes.map((type) => <option key={type} value={type} />)}</datalist></label>
          <label className="block text-sm font-semibold text-[#172033]">Thời gian đọc (phút)<input value={form.readTime} onChange={(event) => update('readTime', event.target.value)} inputMode="numeric" className={fieldClass} /></label>
        </div>
        <label className="block text-sm font-semibold text-[#172033]">Liên kết ngoài (nếu có)<input value={form.externalUrl} onChange={(event) => update('externalUrl', event.target.value)} placeholder="https://…" inputMode="url" className={fieldClass} /></label>
        <div className="rounded-xl border border-[#E4D8C9] bg-[#F8F2EA] p-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><FileUp aria-hidden="true" size={16} />{assetFile ? assetFile.name : document?.storage_path ? 'Thay tệp riêng tư' : 'Tải tệp riêng tư'}<input type="file" className="sr-only" onChange={(event) => setAssetFile(event.target.files?.[0] ?? null)} /></label>
          <p className="mt-2 text-xs leading-5 text-[#5F6B7C]">{assetFile ? 'Tệp mới sẽ thay thế tệp đính kèm sau khi lưu.' : document?.storage_path ? 'Đã có tệp riêng tư đính kèm.' : 'Không bắt buộc nếu tài liệu dùng nội dung Markdown hoặc liên kết ngoài.'}</p>
        </div>
        <div>
          <div className="flex gap-1 border-b border-[#E4D8C9] pb-2">
            <button type="button" onClick={() => setTab('edit')} aria-current={tab === 'edit' ? 'page' : undefined} className={tab === 'edit' ? 'inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#F0E8DC] px-3 text-sm font-semibold text-[#315C73]' : 'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C]'}><PencilLine aria-hidden="true" size={15} />Markdown</button>
            <button type="button" onClick={() => setTab('preview')} aria-current={tab === 'preview' ? 'page' : undefined} className={tab === 'preview' ? 'inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#F0E8DC] px-3 text-sm font-semibold text-[#315C73]' : 'inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#5F6B7C]'}><Eye aria-hidden="true" size={15} />Xem trước</button>
          </div>
          {tab === 'edit' ? <textarea value={form.contentMarkdown} onChange={(event) => update('contentMarkdown', event.target.value)} rows={16} placeholder="Viết nội dung Markdown hiển thị cho người học…" className={fieldClass + ' font-mono leading-6'} /> : <div className="min-h-72 rounded-xl border border-[#E4D8C9] bg-white p-4"><MarkdownViewer source={form.contentMarkdown || 'Chưa có nội dung Markdown để xem trước.'} /></div>}
        </div>
      </div>
    </EditorDrawer>
  );
}

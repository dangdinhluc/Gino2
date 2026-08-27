import { useCallback, useMemo, useState } from 'react';
import { ExternalLink, FileAudio, FileText, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { AudioEditorDrawer } from '@/src/features/admin/components/media/AudioEditorDrawer';
import { DocumentEditorDrawer } from '@/src/features/admin/components/media/DocumentEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';
import { deleteAdminAudio, deleteAdminDocument, listAdminAudio, listAdminCourses, listAdminDocuments, publishAdminContent, saveAdminAudio, saveAdminDocument } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Document = Tables<'documents'>;
type Audio = Tables<'podcast_episodes'>;
type Course = Tables<'courses'>;
type MediaTab = 'documents' | 'audio';

interface MediaData {
  courses: Course[];
  documents: Document[];
  audio: Audio[];
}

export default function AdminMediaPage() {
  const { role } = useAdminLayoutContext();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<MediaTab>('documents');
  const [courseId, setCourseId] = useState(() => searchParams.get('course') ?? '');
  const [query, setQuery] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [editorDocument, setEditorDocument] = useState<Document | null>(null);
  const [editorAudio, setEditorAudio] = useState<Audio | null>(null);
  const [documentEditorOpen, setDocumentEditorOpen] = useState(false);
  const [audioEditorOpen, setAudioEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: MediaTab; item: Document | Audio } | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<MediaData> => {
    const coursesPromise = listAdminCourses();
    if (tab === 'documents') {
      const [courses, documents] = await Promise.all([coursesPromise, listAdminDocuments(courseId || undefined)]);
      return { courses, documents, audio: [] };
    }
    const [courses, audio] = await Promise.all([coursesPromise, listAdminAudio(courseId || undefined)]);
    return { courses, documents: [], audio };
  }, [courseId, tab]);
  const { data, loading, error, refresh } = useAdminQuery<MediaData>(load);

  const documentTypes = useMemo(() => [...new Set((data?.documents ?? []).map((item) => item.document_type).filter(Boolean))].sort(), [data?.documents]);
  const filteredDocuments = useMemo(() => (data?.documents ?? []).filter((item) => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    const matchesQuery = !needle || [item.title, item.summary, item.document_type].join(' ').toLocaleLowerCase('vi-VN').includes(needle);
    return matchesQuery && (!documentType || item.document_type === documentType);
  }), [data?.documents, documentType, query]);
  const filteredAudio = useMemo(() => (data?.audio ?? []).filter((item) => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return !needle || [item.title, item.summary].join(' ').toLocaleLowerCase('vi-VN').includes(needle);
  }), [data?.audio, query]);

  function create(): void {
    if (tab === 'documents') { setEditorDocument(null); setDocumentEditorOpen(true); }
    else { setEditorAudio(null); setAudioEditorOpen(true); }
  }
  function editDocument(document: Document): void { setEditorDocument(document); setDocumentEditorOpen(true); }
  function editAudio(audio: Audio): void { setEditorAudio(audio); setAudioEditorOpen(true); }

  async function changeWorkflow(item: Document | Audio, kind: MediaTab): Promise<void> {
    if (saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (role === 'owner') {
        await publishAdminContent(kind === 'documents' ? 'document' : 'podcast', item.id, 'published');
        setNotice(kind === 'documents' ? 'Tài liệu đã được xuất bản.' : 'Audio đã được xuất bản.');
      } else if (kind === 'documents') {
        await saveAdminDocument({ id: item.id, status: 'in_review' });
        setNotice('Tài liệu đã được gửi Owner duyệt.');
      } else {
        await saveAdminAudio({ id: item.id, status: 'in_review' });
        setNotice('Audio đã được gửi Owner duyệt.');
      }
      await refresh();
    } catch {
      setActionError('Không cập nhật được trạng thái nội dung.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(): Promise<void> {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (deleteTarget.kind === 'documents') await deleteAdminDocument(deleteTarget.item.id);
      else await deleteAdminAudio(deleteTarget.item.id);
      setDeleteTarget(null);
      await refresh();
      setNotice('Đã xóa nội dung.');
    } catch {
      setActionError('Không xóa được nội dung. Vui lòng kiểm tra dữ liệu liên quan rồi thử lại.');
    } finally {
      setSaving(false);
    }
  }

  const tabs: Array<{ id: MediaTab; label: string; icon: typeof FileText }> = [{ id: 'documents', label: 'Tài liệu', icon: FileText }, { id: 'audio', label: 'Audio', icon: FileAudio }];
  const rows = tab === 'documents' ? filteredDocuments : filteredAudio;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Nội dung" title="Tài liệu & media" description="Quản lý tài liệu và audio theo khóa học. File gắn trực tiếp vào bài học vẫn nằm trong trình sửa bài học để giữ đúng ngữ cảnh." actions={<button type="button" onClick={create} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />{tab === 'documents' ? 'Tạo tài liệu' : 'Tạo audio'}</button>} />
      <nav aria-label="Loại media" className="flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => { setTab(item.id); setQuery(''); setDocumentType(''); setNotice(null); }} aria-current={tab === item.id ? 'page' : undefined} className={tab === item.id ? 'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white' : 'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]'}><Icon aria-hidden="true" size={16} />{item.label}</button>; })}
      </nav>
      <SearchFilterBar value={query} onChange={setQuery} placeholder={tab === 'documents' ? 'Tìm tên, tóm tắt hoặc loại tài liệu…' : 'Tìm tên hoặc tóm tắt audio…'} filters={tab === 'documents' ? <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} aria-label="Lọc loại tài liệu" className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả loại</option>{documentTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select> : undefined} actions={<select value={courseId} onChange={(event) => setCourseId(event.target.value)} aria-label="Lọc media theo khóa học" className="min-h-11 max-w-60 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả khóa học</option>{data?.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>} />
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}
      {loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được media" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title={tab === 'documents' ? 'Chưa có tài liệu phù hợp' : 'Chưa có audio phù hợp'} description="Thay đổi tìm kiếm, bộ lọc hoặc tạo nội dung mới." action={<button type="button" onClick={create} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white">{tab === 'documents' ? 'Tạo tài liệu' : 'Tạo audio'}</button>} /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{tab === 'documents' ? filteredDocuments.map((item) => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><FileText aria-hidden="true" size={19} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-[#172033]">{item.title}</h2><StatusBadge status={item.status} /></div><p className="mt-1 line-clamp-2 text-sm text-[#5F6B7C]">{item.summary}</p><div className="mt-2 flex flex-wrap gap-1.5 text-xs"><span className="rounded-full bg-[#F0E8DC] px-2 py-1 font-semibold text-[#315C73]">{item.document_type}</span><span className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-[#5F6B7C]">{item.read_time_minutes} phút đọc</span>{item.storage_path && <span className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-[#5F6B7C]">Tệp riêng tư</span>}</div></div></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => editDocument(item)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button>{item.external_url && <a href={item.external_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><ExternalLink aria-hidden="true" size={15} />Mở</a>}{item.status !== 'published' && <button type="button" onClick={() => void changeWorkflow(item, 'documents')} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#315C73] px-3 text-sm font-semibold text-white disabled:opacity-50"><Send aria-hidden="true" size={15} />{role === 'owner' ? 'Xuất bản' : 'Gửi duyệt'}</button>}{role === 'owner' && <button type="button" onClick={() => setDeleteTarget({ kind: 'documents', item })} aria-label={'Xóa ' + item.title} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button>}</div></article>) : filteredAudio.map((item) => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><FileAudio aria-hidden="true" size={19} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-[#172033]">{item.title}</h2><StatusBadge status={item.status} /></div><p className="mt-1 line-clamp-2 text-sm text-[#5F6B7C]">{item.summary}</p><div className="mt-2 flex flex-wrap gap-1.5 text-xs"><span className="rounded-full bg-[#F0E8DC] px-2 py-1 font-semibold text-[#315C73]">{item.duration_minutes} phút</span>{item.lesson_id && <span className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-[#5F6B7C]">Gắn bài học</span>}{item.storage_path && <span className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-[#5F6B7C]">Tệp riêng tư</span>}</div></div></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => editAudio(item)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button>{item.external_url && <a href={item.external_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><ExternalLink aria-hidden="true" size={15} />Mở</a>}{item.status !== 'published' && <button type="button" onClick={() => void changeWorkflow(item, 'audio')} disabled={saving} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#315C73] px-3 text-sm font-semibold text-white disabled:opacity-50"><Send aria-hidden="true" size={15} />{role === 'owner' ? 'Xuất bản' : 'Gửi duyệt'}</button>}{role === 'owner' && <button type="button" onClick={() => setDeleteTarget({ kind: 'audio', item })} aria-label={'Xóa ' + item.title} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button>}</div></article>)}</div></section>}
      <DocumentEditorDrawer open={documentEditorOpen} document={editorDocument} courses={data?.courses ?? []} documentTypes={documentTypes} onClose={() => setDocumentEditorOpen(false)} onSaved={refresh} />
      <AudioEditorDrawer open={audioEditorOpen} audio={editorAudio} courses={data?.courses ?? []} onClose={() => setAudioEditorOpen(false)} onSaved={refresh} />
      <ConfirmDialog open={Boolean(deleteTarget)} title={'Xóa “' + (deleteTarget?.item.title ?? '') + '”?'} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa nội dung" pending={saving} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
    </div>
  );
}

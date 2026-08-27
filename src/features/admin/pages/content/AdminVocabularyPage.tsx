import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { VocabularyEditorDrawer } from '@/src/features/admin/components/vocabulary/VocabularyEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { useDebouncedValue } from '@/src/features/admin/hooks/useDebouncedValue';
import { useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';
import { deleteAdminVocabulary, listAdminCourses, listAdminVocabularyFilterOptions, listAdminVocabularyPage, type AdminVocabularyPage } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

const PAGE_SIZE = 20;

export default function AdminVocabularyPage() {
  const { role } = useAdminLayoutContext();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('');
  const [tag, setTag] = useState('');
  const [courseId, setCourseId] = useState('');
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 300);
  const filtersLoad = useCallback(async () => {
    const [courses, filters] = await Promise.all([listAdminCourses(), listAdminVocabularyFilterOptions()]);
    return { courses, filters };
  }, []);
  const { data: filterData, loading: filtersLoading, error: filtersError, refresh: refreshFilters } = useAdminQuery<{ courses: Tables<'courses'>[]; filters: { levels: string[]; tags: string[] } }>(filtersLoad);
  const pageLoad = useCallback(() => listAdminVocabularyPage({ page, pageSize: PAGE_SIZE, search: debouncedQuery, level, tag, courseId }), [courseId, debouncedQuery, level, page, tag]);
  const { data, loading, error, refresh } = useAdminQuery<AdminVocabularyPage>(pageLoad);
  const [editorVocabulary, setEditorVocabulary] = useState<Tables<'vocabulary_items'> | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteVocabulary, setDeleteVocabulary] = useState<Tables<'vocabulary_items'> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  useEffect(() => { if (page >= totalPages) setPage(Math.max(0, totalPages - 1)); }, [page, totalPages]);
  const resetPage = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(0); };
  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);
  function create(): void { setEditorVocabulary(null); setEditorOpen(true); }
  function edit(item: Tables<'vocabulary_items'>): void { setEditorVocabulary(item); setEditorOpen(true); }
  async function remove(): Promise<void> {
    if (!deleteVocabulary || deleting) return;
    setDeleting(true); setDeleteError(null);
    try { await deleteAdminVocabulary(deleteVocabulary.id); await refresh(); setDeleteVocabulary(null); } catch { setDeleteError('Không xóa được từ vựng. Có thể từ này đang được sử dụng trong nội dung khác.'); } finally { setDeleting(false); }
  }
  async function refreshAll(): Promise<void> { await Promise.all([refresh(), refreshFilters()]); }

  return <div className="space-y-6"><AdminPageHeader eyebrow="Nội dung" title="Từ vựng" description="Tìm, lọc và chỉnh sửa từ vựng mà không cần rời khỏi workflow nội dung." actions={<button type="button" onClick={create} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Thêm từ vựng</button>} /><SearchFilterBar value={query} onChange={resetPage(setQuery)} placeholder="Tìm tiếng Nhật, cách đọc, nghĩa Việt…" filters={<><select value={level} onChange={(event) => resetPage(setLevel)(event.target.value)} aria-label="Lọc theo cấp độ" className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả cấp độ</option>{filterData?.filters.levels.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={tag} onChange={(event) => resetPage(setTag)(event.target.value)} aria-label="Lọc theo nhãn" className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả nhãn</option>{filterData?.filters.tags.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={courseId} onChange={(event) => resetPage(setCourseId)(event.target.value)} aria-label="Lọc theo khóa học" className="min-h-11 max-w-52 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả khóa học</option>{filterData?.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></>} />{(filtersError || (!filtersLoading && !filterData)) && <AdminErrorState title="Không tải được bộ lọc từ vựng" onRetry={() => void refreshFilters()} />}{loading && !data ? <AdminPageSkeleton rows={6} /> : error || !data ? <AdminErrorState title="Không tải được từ vựng" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Không có từ vựng phù hợp" description="Thử thay đổi tìm kiếm hoặc bộ lọc; bạn cũng có thể thêm từ mới." action={<button type="button" onClick={create} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white">Thêm từ vựng</button>} /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><h2 className="text-lg font-bold text-[#172033]">{item.term}</h2>{item.reading && <span className="text-sm text-[#5F6B7C]">{item.reading}</span>}</div><p className="mt-1 text-sm text-[#5F6B7C]">{item.translation}</p><div className="mt-2 flex flex-wrap gap-1.5">{item.level && <span className="rounded-full bg-[#F0E8DC] px-2 py-0.5 text-xs font-semibold text-[#315C73]">{item.level}</span>}{item.tags.map((itemTag) => <span key={itemTag} className="rounded-full border border-[#E4D8C9] bg-white px-2 py-0.5 text-xs text-[#5F6B7C]">{itemTag}</span>)}</div></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => edit(item)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button>{role === 'owner' && <button type="button" onClick={() => setDeleteVocabulary(item)} aria-label={`Xóa ${item.term}`} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button>}</div></article>)}</div><footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EDE4D8] px-4 py-3 text-sm text-[#5F6B7C]"><span>{data.total} từ vựng</span><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || loading} aria-label="Trang trước" className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-[#D9CBB9] bg-white disabled:opacity-40"><ChevronLeft aria-hidden="true" size={17} /></button><span>Trang {page + 1}/{totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1 || loading} aria-label="Trang sau" className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-[#D9CBB9] bg-white disabled:opacity-40"><ChevronRight aria-hidden="true" size={17} /></button></div></footer></section>}<VocabularyEditorDrawer open={editorOpen} vocabulary={editorVocabulary} onClose={() => setEditorOpen(false)} onSaved={refreshAll} /><ConfirmDialog open={Boolean(deleteVocabulary)} title={`Xóa “${deleteVocabulary?.term ?? ''}”?`} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa từ vựng" pending={deleting} onCancel={() => setDeleteVocabulary(null)} onConfirm={() => void remove()} />{deleteError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{deleteError}</p>}</div>;
}

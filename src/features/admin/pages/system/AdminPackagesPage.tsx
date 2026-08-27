import { useCallback, useMemo, useState } from 'react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { PackageEditorDrawer } from '@/src/features/admin/components/system/PackageEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { deleteAdminPackage, listAdminCourses, listAdminPackageCourses, listAdminPackages } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type PackageItem = Tables<'packages'>;
type Course = Tables<'courses'>;
type PackageCourse = Tables<'package_courses'>;

interface PackageData {
  packages: PackageItem[];
  courses: Course[];
  links: PackageCourse[];
}

export default function AdminPackagesPage() {
  const [query, setQuery] = useState('');
  const [editorItem, setEditorItem] = useState<PackageItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PackageItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(async (): Promise<PackageData> => {
    const [packages, courses, links] = await Promise.all([listAdminPackages(), listAdminCourses(), listAdminPackageCourses()]);
    return { packages, courses, links };
  }, []);
  const { data, loading, error, refresh } = useAdminQuery<PackageData>(load);
  const courseById = useMemo(() => new Map((data?.courses ?? []).map((course) => [course.id, course])), [data?.courses]);
  const linkedCourseIds = useMemo(() => new Map((data?.packages ?? []).map((item) => [item.id, (data?.links ?? []).filter((link) => link.package_id === item.id).map((link) => link.course_id)])), [data?.links, data?.packages]);
  const rows = useMemo(() => (data?.packages ?? []).filter((item) => !query.trim() || [item.name, item.description, item.status].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data?.packages, query]);

  async function remove(): Promise<void> {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await deleteAdminPackage(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      setNotice('Đã xóa gói học.');
    } catch {
      setActionError('Không xóa được gói học. Vui lòng kiểm tra liên kết liên quan.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-6"><AdminPageHeader eyebrow="Hệ thống" title="Gói học" description="Quản lý giá, quota AI và các khóa học có trong từng gói." actions={<button type="button" onClick={() => { setEditorItem(null); setEditorOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Tạo gói học</button>} /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tên hoặc mô tả gói học…" />{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}{actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}{loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được gói học" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có gói học" description="Tạo gói để kết hợp khóa học và quota AI." /> : <section className="grid gap-4 lg:grid-cols-2">{rows.map((item) => { const courseIds = linkedCourseIds.get(item.id) ?? []; return <article key={item.id} className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><Package aria-hidden="true" size={19} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-[#172033]">{item.name}</h2><StatusBadge status={item.status} /></div><p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5F6B7C]">{item.description}</p></div></div><div className="flex gap-2"><button type="button" onClick={() => { setEditorItem(item); setEditorOpen(true); }} aria-label={'Sửa ' + item.name} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-[#D9CBB9] bg-white text-[#315C73]"><Pencil aria-hidden="true" size={15} /></button><button type="button" onClick={() => setDeleteTarget(item)} aria-label={'Xóa ' + item.name} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div></div><dl className="mt-4 grid grid-cols-3 gap-2 text-sm"><div className="rounded-xl border border-[#E4D8C9] bg-white p-3"><dt className="text-xs text-[#7B8796]">Giá</dt><dd className="mt-1 font-bold">{item.price_cents.toLocaleString('vi-VN')} {item.currency}</dd></div><div className="rounded-xl border border-[#E4D8C9] bg-white p-3"><dt className="text-xs text-[#7B8796]">Quota AI</dt><dd className="mt-1 font-bold">{item.ai_monthly_quota}</dd></div><div className="rounded-xl border border-[#E4D8C9] bg-white p-3"><dt className="text-xs text-[#7B8796]">Khóa học</dt><dd className="mt-1 font-bold">{courseIds.length}</dd></div></dl><div className="mt-3 flex flex-wrap gap-1.5">{courseIds.map((courseId) => <span key={courseId} className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-xs text-[#5F6B7C]">{courseById.get(courseId)?.title ?? 'Khóa học'}</span>)}{courseIds.length === 0 && <span className="text-xs text-[#7B8796]">Chưa có khóa học trong gói.</span>}</div></article>; })}</section>}<PackageEditorDrawer open={editorOpen} packageItem={editorItem} courses={data?.courses ?? []} linkedCourseIds={editorItem ? linkedCourseIds.get(editorItem.id) ?? [] : []} onClose={() => setEditorOpen(false)} onSaved={refresh} /><ConfirmDialog open={Boolean(deleteTarget)} title={'Xóa “' + (deleteTarget?.name ?? '') + '”?'} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa gói học" pending={saving} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} /></div>;
}

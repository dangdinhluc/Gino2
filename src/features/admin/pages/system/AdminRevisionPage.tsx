import { useCallback, useMemo, useState } from 'react';
import { History, RotateCcw } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';
import { listAdminContentRevisions, rollbackAdminContentRevision } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Revision = Tables<'content_revisions'>;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminRevisionPage() {
  const { role } = useAdminLayoutContext();
  const [query, setQuery] = useState('');
  const [rollbackTarget, setRollbackTarget] = useState<Revision | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(() => listAdminContentRevisions(), []);
  const { data, loading, error, refresh } = useAdminQuery<Revision[]>(load);
  const rows = useMemo(() => (data ?? []).filter((item) => !query.trim() || [item.entity_type, item.action, String(item.version)].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data, query]);

  async function rollback(): Promise<void> {
    if (!rollbackTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await rollbackAdminContentRevision(rollbackTarget.id);
      setRollbackTarget(null);
      await refresh();
      setNotice('Đã khôi phục phiên bản nội dung.');
    } catch {
      setActionError('Không khôi phục được phiên bản nội dung.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-6"><AdminPageHeader eyebrow="Hệ thống" title="Lịch sử nội dung" description={role === 'owner' ? 'Xem phiên bản đã lưu và khôi phục khi cần.' : 'Chế độ chỉ đọc lịch sử thay đổi nội dung.'} /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm loại nội dung, thao tác hoặc phiên bản…" />{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}{actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}{loading && !data ? <AdminPageSkeleton rows={6} /> : error || !data ? <AdminErrorState title="Không tải được lịch sử nội dung" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có phiên bản nội dung" description="Các phiên bản sẽ xuất hiện khi workflow nội dung tạo bản ghi lịch sử." /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><History aria-hidden="true" size={19} /></span><div className="min-w-0"><h2 className="font-bold text-[#172033]">{item.entity_type} · phiên bản {item.version}</h2><p className="mt-1 text-sm text-[#5F6B7C]">{item.action} · {formatDate(item.created_at)}</p><details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-[#315C73]">Xem snapshot kỹ thuật</summary><pre className="mt-2 max-h-56 overflow-auto rounded-xl border border-[#E4D8C9] bg-white p-3 text-xs text-[#5F6B7C]">{JSON.stringify(item.snapshot, null, 2)}</pre></details></div></div>{role === 'owner' && <button type="button" onClick={() => setRollbackTarget(item)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><RotateCcw aria-hidden="true" size={15} />Khôi phục</button>}</article>)}</div></section>}<ConfirmDialog open={Boolean(rollbackTarget)} title={'Khôi phục ' + (rollbackTarget?.entity_type ?? '') + ' về phiên bản ' + (rollbackTarget?.version ?? '') + '?'} description="Nội dung hiện tại sẽ được thay bằng snapshot của phiên bản này." confirmLabel="Khôi phục phiên bản" pending={saving} onCancel={() => setRollbackTarget(null)} onConfirm={() => void rollback()} /></div>;
}

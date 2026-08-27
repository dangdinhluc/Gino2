import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { AlertEditorDrawer } from '@/src/features/admin/components/communication/AlertEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';
import { deleteAdminAlert, listAdminAlerts, saveAdminAlert } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Alert = Tables<'admin_alerts'>;

export default function AdminAlertsPage() {
  const { role } = useAdminLayoutContext();
  const canManage = role === 'owner';
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [editorAlert, setEditorAlert] = useState<Alert | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Alert | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(() => listAdminAlerts(), []);
  const { data, loading, error, refresh } = useAdminQuery<Alert[]>(load);
  const statuses = useMemo(() => [...new Set((data ?? []).map((item) => item.status).filter(Boolean))].sort(), [data]);
  const severities = useMemo(() => [...new Set((data ?? []).map((item) => item.severity).filter(Boolean))].sort(), [data]);
  const rows = useMemo(() => (data ?? []).filter((item) => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    return (!needle || [item.title, item.body, item.severity].join(' ').toLocaleLowerCase('vi-VN').includes(needle)) && (!status || item.status === status);
  }), [data, query, status]);

  async function resolve(item: Alert): Promise<void> {
    if (saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await saveAdminAlert({ id: item.id, status: item.status === 'resolved' ? 'open' : 'resolved' });
      await refresh();
      setNotice(item.status === 'resolved' ? 'Đã mở lại cảnh báo.' : 'Đã đánh dấu cảnh báo đã xử lý.');
    } catch {
      setActionError('Không cập nhật được cảnh báo.');
    } finally {
      setSaving(false);
    }
  }
  async function remove(): Promise<void> {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await deleteAdminAlert(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      setNotice('Đã xóa cảnh báo.');
    } catch {
      setActionError('Không xóa được cảnh báo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Giao tiếp" title="Cảnh báo" description={canManage ? 'Theo dõi và xử lý cảnh báo vận hành.' : 'Chế độ chỉ đọc cho dữ liệu cảnh báo vận hành.'} actions={canManage ? <button type="button" onClick={() => { setEditorAlert(null); setEditorOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Tạo cảnh báo</button> : undefined} />
      <SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tiêu đề hoặc nội dung cảnh báo…" filters={<select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Lọc theo trạng thái" className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm outline-none focus:border-[#315C73]"><option value="">Tất cả trạng thái</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>} />
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}
      {loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được cảnh báo" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có cảnh báo phù hợp" description={canManage ? 'Tạo cảnh báo mới khi cần theo dõi một vấn đề vận hành.' : 'Hiện không có cảnh báo để xem.'} /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#A84F33]"><AlertTriangle aria-hidden="true" size={19} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#172033]">{item.title}</h2><StatusBadge status={item.status} /><span className="rounded-full border border-[#E4D8C9] bg-white px-2 py-1 text-xs font-semibold text-[#5F6B7C]">{item.severity}</span></div><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#5F6B7C]">{item.body}</p></div></div>{canManage && <div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => { setEditorAlert(item); setEditorOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button><button type="button" onClick={() => void resolve(item)} disabled={saving} className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73] disabled:opacity-50">{item.status === 'resolved' ? 'Mở lại' : 'Đánh dấu xử lý'}</button><button type="button" onClick={() => setDeleteTarget(item)} aria-label={'Xóa ' + item.title} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div>}</article>)}</div></section>}
      <AlertEditorDrawer open={editorOpen} alert={editorAlert} severityOptions={severities} onClose={() => setEditorOpen(false)} onSaved={refresh} />
      <ConfirmDialog open={Boolean(deleteTarget)} title={'Xóa “' + (deleteTarget?.title ?? '') + '”?'} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa cảnh báo" pending={saving} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
    </div>
  );
}

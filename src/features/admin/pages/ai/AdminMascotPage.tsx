import { useCallback, useState } from 'react';
import { Clock3, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { DashboardHeroEditorDrawer } from '@/src/features/admin/components/ai/DashboardHeroEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { resolveDashboardHeroAsset } from '@/src/features/dashboard/lib/dashboardHero';
import { deleteAdminDashboardHeroSlot, listAdminDashboardHeroSlots } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type HeroSlot = Tables<'dashboard_hero_slots'>;

export default function AdminMascotPage() {
  const [editorSlot, setEditorSlot] = useState<HeroSlot | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(() => listAdminDashboardHeroSlots(), []);
  const { data, loading, error, refresh } = useAdminQuery<HeroSlot[]>(load);

  async function remove(): Promise<void> {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await deleteAdminDashboardHeroSlot(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      setNotice('Đã xóa khung mascot.');
    } catch {
      setActionError('Không xóa được khung mascot.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-6"><AdminPageHeader eyebrow="AI & công cụ" title="Mascot dashboard" description="Lập lịch các mascot thật đang hiển thị trên dashboard của người học." actions={<button type="button" onClick={() => { setEditorSlot(null); setEditorOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Thêm khung giờ</button>} />{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}{actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}{loading && !data ? <AdminPageSkeleton rows={4} /> : error || !data ? <AdminErrorState title="Không tải được lịch mascot" onRetry={() => void refresh()} /> : data.length === 0 ? <AdminEmptyState title="Chưa có lịch mascot" description="Thêm khung giờ khi cần thay đổi mascot dashboard." /> : <section className="grid gap-4 md:grid-cols-2">{data.map((slot) => { const asset = resolveDashboardHeroAsset(slot.asset_key); return <article key={slot.id} className="flex gap-4 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4"><img src={asset.src} alt={slot.alt_text} className="size-20 shrink-0 object-contain" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#172033]">{slot.label}</h2><StatusBadge status={slot.is_active ? 'active' : 'archived'} /></div><p className="mt-2 flex items-center gap-1.5 text-sm text-[#5F6B7C]"><Clock3 aria-hidden="true" size={15} />{slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)} · Ưu tiên {slot.sort_order}</p><p className="mt-1 text-xs text-[#7B8796]">{asset.label}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => { setEditorSlot(slot); setEditorOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button><button type="button" onClick={() => setDeleteTarget(slot)} aria-label={'Xóa ' + slot.label} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div></div></article>; })}</section>}<DashboardHeroEditorDrawer open={editorOpen} slot={editorSlot} onClose={() => setEditorOpen(false)} onSaved={refresh} /><ConfirmDialog open={Boolean(deleteTarget)} title={'Xóa “' + (deleteTarget?.label ?? '') + '”?'} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa khung mascot" pending={saving} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} /></div>;
}

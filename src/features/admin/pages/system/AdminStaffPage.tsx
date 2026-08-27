import { useCallback, useMemo, useState } from 'react';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { InviteStaffDrawer } from '@/src/features/admin/components/system/InviteStaffDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { listAdminStaff, removeAdminStaffRole, setAdminStaffRole, type AdminStaffMember, type AdminStaffRole } from '@/src/features/admin/repositories/adminRepository';

const roleLabels: Record<AdminStaffRole, string> = {
  owner: 'Owner',
  content_editor: 'Content editor',
  instructor_support: 'Instructor support',
  analyst: 'Analyst',
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

export default function AdminStaffPage() {
  const [query, setQuery] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleChange, setRoleChange] = useState<{ member: AdminStaffMember; role: AdminStaffRole } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminStaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(() => listAdminStaff(), []);
  const { data, loading, error, refresh } = useAdminQuery<AdminStaffMember[]>(load);
  const rows = useMemo(() => (data ?? []).filter((item) => !query.trim() || [item.displayName, item.email, item.role].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data, query]);
  const ownerCount = (data ?? []).filter((item) => item.role === 'owner').length;

  async function changeRole(): Promise<void> {
    if (!roleChange || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await setAdminStaffRole(roleChange.member.user_id, roleChange.role);
      setRoleChange(null);
      await refresh();
      setNotice('Đã cập nhật vai trò nhân sự.');
    } catch {
      setActionError('Không cập nhật được vai trò nhân sự.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(): Promise<void> {
    if (!removeTarget || saving) return;
    if (removeTarget.role === 'owner' && ownerCount <= 1) { setActionError('Không thể xóa Owner cuối cùng.'); setRemoveTarget(null); return; }
    setSaving(true);
    setActionError(null);
    try {
      await removeAdminStaffRole(removeTarget.user_id);
      setRemoveTarget(null);
      await refresh();
      setNotice('Đã gỡ quyền nhân sự.');
    } catch {
      setActionError('Không gỡ được quyền nhân sự.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Hệ thống" title="Nhân sự" description="Mời nhân sự bằng email và quản lý vai trò của tài khoản đã có." actions={<button type="button" onClick={() => setInviteOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Mời nhân sự</button>} />
      <SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tên, email hoặc vai trò…" />
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}
      {loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được nhân sự" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có nhân sự" description="Mời nhân sự bằng email để cấp quyền làm việc trong Admin." /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((member) => <article key={member.user_id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><UserCog aria-hidden="true" size={19} /></span><div className="min-w-0"><h2 className="truncate font-bold text-[#172033]">{member.displayName}</h2><p className="mt-1 truncate text-sm text-[#5F6B7C]">{member.email}</p><p className="mt-2 text-xs text-[#7B8796]">Cấp quyền {formatDate(member.granted_at)}</p></div></div><div className="flex shrink-0 flex-wrap items-center gap-2"><StatusBadge status={member.role} /><label className="sr-only" htmlFor={'staff-role-' + member.user_id}>Vai trò của {member.displayName}</label><select id={'staff-role-' + member.user_id} value={member.role} onChange={(event) => { const nextRole = event.target.value as AdminStaffRole; if (nextRole === member.role) return; if (member.role === 'owner' && ownerCount <= 1) { setActionError('Không thể hạ quyền Owner cuối cùng.'); return; } setRoleChange({ member, role: nextRole }); }} className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]">{(Object.keys(roleLabels) as AdminStaffRole[]).map((item) => <option key={item} value={item}>{roleLabels[item]}</option>)}</select><button type="button" onClick={() => setRemoveTarget(member)} disabled={member.role === 'owner' && ownerCount <= 1} aria-label={'Gỡ quyền ' + member.displayName} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700 disabled:opacity-40"><Trash2 aria-hidden="true" size={15} /></button></div></article>)}</div></section>}
      <InviteStaffDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} onSaved={refresh} />
      <ConfirmDialog open={Boolean(roleChange)} title={'Đổi vai trò của ' + (roleChange?.member.displayName ?? '') + '?'} description={'Vai trò mới: ' + (roleChange ? roleLabels[roleChange.role] : '') + '.'} confirmLabel="Cập nhật vai trò" pending={saving} onCancel={() => setRoleChange(null)} onConfirm={() => void changeRole()} />
      <ConfirmDialog open={Boolean(removeTarget)} title={'Gỡ quyền của ' + (removeTarget?.displayName ?? '') + '?'} description="Tài khoản sẽ không còn quyền truy cập Admin." confirmLabel="Gỡ quyền" pending={saving} onCancel={() => setRemoveTarget(null)} onConfirm={() => void remove()} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { inviteAdminStaff, type AdminStaffRole } from '@/src/features/admin/repositories/adminRepository';

type InviteRole = Exclude<AdminStaffRole, 'owner'>;

interface InviteStaffDrawerProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function InviteStaffDrawer({ open, onClose, onSaved }: InviteStaffDrawerProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('content_editor');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail('');
    setRole('content_editor');
    setError(null);
  }, [open]);

  async function save(): Promise<void> {
    if (saving) return;
    const normalizedEmail = email.trim().toLocaleLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setError('Hãy nhập một địa chỉ email hợp lệ.'); return; }
    setSaving(true);
    setError(null);
    try {
      await inviteAdminStaff(normalizedEmail, role);
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không gửi được lời mời.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return <EditorDrawer open={open} title="Mời nhân sự" description="Lời mời luôn bắt đầu bằng vai trò không phải Owner." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang gửi…' : 'Gửi lời mời'}</button></div>}><div className="space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<label className="block text-sm font-semibold text-[#172033]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Vai trò<select value={role} onChange={(event) => setRole(event.target.value as InviteRole)} className={fieldClass}><option value="content_editor">Content editor</option><option value="instructor_support">Instructor support</option><option value="analyst">Analyst</option></select></label></div></EditorDrawer>;
}

import { useEffect, useState } from 'react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { saveAdminAlert } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Alert = Tables<'admin_alerts'>;

interface AlertEditorDrawerProps {
  open: boolean;
  alert: Alert | null;
  severityOptions: string[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function AlertEditorDrawer({ open, alert, severityOptions, onClose, onSaved }: AlertEditorDrawerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [status, setStatus] = useState('open');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(alert?.title ?? '');
    setBody(alert?.body ?? '');
    setSeverity(alert?.severity ?? severityOptions[0] ?? 'warning');
    setStatus(alert?.status ?? 'open');
    setError(null);
  }, [alert, open, severityOptions]);

  async function save(): Promise<void> {
    if (saving) return;
    if (!title.trim() || !body.trim() || !severity.trim()) { setError('Hãy nhập tiêu đề, nội dung và mức độ.'); return; }
    setSaving(true);
    setError(null);
    try {
      await saveAdminAlert({ id: alert?.id ?? crypto.randomUUID(), isNew: !alert, title: title.trim(), body: body.trim(), severity: severity.trim(), status });
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được cảnh báo.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return (
    <EditorDrawer open={open} title={alert ? 'Chỉnh sửa cảnh báo' : 'Tạo cảnh báo'} description="Chỉ Owner có thể thay đổi cảnh báo vận hành." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu cảnh báo'}</button></div>}>
      <div className="space-y-5">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        <label className="block text-sm font-semibold text-[#172033]">Tiêu đề<input value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} /></label>
        <label className="block text-sm font-semibold text-[#172033]">Nội dung<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={6} className={fieldClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#172033]">Mức độ<input value={severity} onChange={(event) => setSeverity(event.target.value)} list="admin-alert-severity" className={fieldClass} /><datalist id="admin-alert-severity">{severityOptions.map((item) => <option key={item} value={item} />)}</datalist></label><label className="block text-sm font-semibold text-[#172033]">Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}><option value="open">Đang mở</option><option value="resolved">Đã xử lý</option></select></label></div>
      </div>
    </EditorDrawer>
  );
}

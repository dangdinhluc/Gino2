import { useEffect, useState } from 'react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { saveAdminPrompt } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Prompt = Tables<'ai_prompts'>;

interface PromptEditorDrawerProps {
  open: boolean;
  prompt: Prompt | null;
  providers: string[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function PromptEditorDrawer({ open, prompt, providers, onClose, onSaved }: PromptEditorDrawerProps) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('');
  const [purpose, setPurpose] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(prompt?.name ?? '');
    setProvider(prompt?.provider ?? providers[0] ?? '');
    setPurpose(prompt?.purpose ?? '');
    setBody(prompt?.prompt_body ?? '');
    setStatus(prompt?.status ?? 'draft');
    setError(null);
  }, [open, prompt, providers]);

  async function save(): Promise<void> {
    if (saving) return;
    if (!name.trim() || !provider.trim() || !purpose.trim() || !body.trim()) { setError('Hãy nhập tên, provider, mục đích và nội dung prompt.'); return; }
    setSaving(true);
    setError(null);
    try {
      await saveAdminPrompt({ id: prompt?.id ?? crypto.randomUUID(), isNew: !prompt, name: name.trim(), provider: provider.trim(), purpose: purpose.trim(), prompt_body: body, status });
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được AI prompt.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return <EditorDrawer open={open} title={prompt ? 'Chỉnh sửa AI prompt' : 'Tạo AI prompt'} description="Prompt là cấu hình vận hành nội bộ; kiểm tra kỹ provider và trạng thái trước khi bật." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu prompt'}</button></div>}><div className="space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<label className="block text-sm font-semibold text-[#172033]">Tên prompt<input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#172033]">Provider<input value={provider} onChange={(event) => setProvider(event.target.value)} list="admin-prompt-providers" className={fieldClass} /><datalist id="admin-prompt-providers">{providers.map((item) => <option key={item} value={item} />)}</datalist></label><label className="block text-sm font-semibold text-[#172033]">Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}><option value="draft">Nháp</option><option value="active">Đang dùng</option><option value="archived">Lưu trữ</option></select></label></div><label className="block text-sm font-semibold text-[#172033]">Mục đích<input value={purpose} onChange={(event) => setPurpose(event.target.value)} className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Nội dung prompt<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={16} spellCheck={false} className={fieldClass + ' font-mono leading-6'} /></label></div></EditorDrawer>;
}

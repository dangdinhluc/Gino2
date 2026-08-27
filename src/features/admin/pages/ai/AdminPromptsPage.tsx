import { useCallback, useMemo, useState } from 'react';
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { PromptEditorDrawer } from '@/src/features/admin/components/ai/PromptEditorDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { deleteAdminPrompt, listAdminPrompts } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Prompt = Tables<'ai_prompts'>;

export default function AdminPromptsPage() {
  const [query, setQuery] = useState('');
  const [editorPrompt, setEditorPrompt] = useState<Prompt | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(() => listAdminPrompts(), []);
  const { data, loading, error, refresh } = useAdminQuery<Prompt[]>(load);
  const providers = useMemo(() => [...new Set((data ?? []).map((item) => item.provider).filter(Boolean))].sort(), [data]);
  const rows = useMemo(() => (data ?? []).filter((item) => !query.trim() || [item.name, item.provider, item.purpose, item.status].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data, query]);

  async function remove(): Promise<void> {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await deleteAdminPrompt(deleteTarget.id);
      setDeleteTarget(null);
      await refresh();
      setNotice('Đã xóa AI prompt.');
    } catch {
      setActionError('Không xóa được AI prompt.');
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-6"><AdminPageHeader eyebrow="AI & công cụ" title="AI prompts" description="Quản lý cấu hình prompt theo provider và mục đích sử dụng." actions={<button type="button" onClick={() => { setEditorPrompt(null); setEditorOpen(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Tạo prompt</button>} /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tên, provider hoặc mục đích…" />{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}{actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}{loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được AI prompts" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có AI prompt" description="Tạo prompt mới khi có một cấu hình AI cần quản lý." /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><Sparkles aria-hidden="true" size={19} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-[#172033]">{item.name}</h2><StatusBadge status={item.status} /></div><p className="mt-1 text-sm text-[#5F6B7C]">{item.provider} · {item.purpose}</p><p className="mt-2 line-clamp-2 font-mono text-xs leading-5 text-[#7B8796]">{item.prompt_body}</p></div></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditorPrompt(item); setEditorOpen(true); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Pencil aria-hidden="true" size={15} />Sửa</button><button type="button" onClick={() => setDeleteTarget(item)} aria-label={'Xóa ' + item.name} className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"><Trash2 aria-hidden="true" size={15} /></button></div></article>)}</div></section>}<PromptEditorDrawer open={editorOpen} prompt={editorPrompt} providers={providers} onClose={() => setEditorOpen(false)} onSaved={refresh} /><ConfirmDialog open={Boolean(deleteTarget)} title={'Xóa “' + (deleteTarget?.name ?? '') + '”?'} description="Thao tác này không thể hoàn tác." confirmLabel="Xóa prompt" pending={saving} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} /></div>;
}

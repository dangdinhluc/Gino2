import { useCallback, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { listAdminActivityLogs } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Activity = Tables<'admin_activity_logs'>;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminAuditPage() {
  const [query, setQuery] = useState('');
  const load = useCallback(() => listAdminActivityLogs(), []);
  const { data, loading, error, refresh } = useAdminQuery<Activity[]>(load);
  const rows = useMemo(() => (data ?? []).filter((item) => !query.trim() || [item.entity_type, item.action].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data, query]);
  return <div className="space-y-6"><AdminPageHeader eyebrow="Hệ thống" title="Audit" description="Nhật ký hoạt động quản trị ở chế độ chỉ đọc." /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm loại nội dung hoặc thao tác…" />{loading && !data ? <AdminPageSkeleton rows={6} /> : error || !data ? <AdminErrorState title="Không tải được audit" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có hoạt động quản trị" description="Nhật ký sẽ xuất hiện khi có thao tác quản trị được hệ thống ghi nhận." /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex gap-3 p-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><ShieldCheck aria-hidden="true" size={19} /></span><div className="min-w-0"><h2 className="font-bold text-[#172033]">{item.action}</h2><p className="mt-1 text-sm text-[#5F6B7C]">{item.entity_type} · {formatDate(item.occurred_at)}</p>{item.metadata && Object.keys(item.metadata).length > 0 && <details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-[#315C73]">Metadata kỹ thuật</summary><pre className="mt-2 max-h-44 overflow-auto rounded-xl border border-[#E4D8C9] bg-white p-3 text-xs text-[#5F6B7C]">{JSON.stringify(item.metadata, null, 2)}</pre></details>}</div></article>)}</div></section>}</div>;
}

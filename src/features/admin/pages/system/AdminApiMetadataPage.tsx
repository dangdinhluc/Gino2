import { useCallback, useMemo, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { listAdminApiKeyMetadata } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type ApiKeyMetadata = Tables<'api_key_metadata'>;

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

export default function AdminApiMetadataPage() {
  const [query, setQuery] = useState('');
  const load = useCallback(() => listAdminApiKeyMetadata(), []);
  const { data, loading, error, refresh } = useAdminQuery<ApiKeyMetadata[]>(load);
  const rows = useMemo(() => (data ?? []).filter((item) => !query.trim() || [item.provider, item.owner_name, item.status].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data, query]);
  return <div className="space-y-6"><AdminPageHeader eyebrow="Hệ thống" title="API metadata" description="Chỉ hiển thị thông tin đã được che; không có secret hoặc khóa thô trong giao diện này." /><SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm provider, chủ sở hữu hoặc trạng thái…" />{loading && !data ? <AdminPageSkeleton rows={4} /> : error || !data ? <AdminErrorState title="Không tải được API metadata" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có API metadata" description="Không có khóa API nào được liệt kê cho tài khoản này." /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><KeyRound aria-hidden="true" size={19} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#172033]">{item.provider}</h2><StatusBadge status={item.status} /></div><p className="mt-1 text-sm text-[#5F6B7C]">{item.owner_name}</p><p className="mt-2 font-mono text-xs text-[#7B8796]">{item.masked_key}</p></div></div><p className="text-xs text-[#7B8796]">Cập nhật {formatDate(item.updated_at)}</p></article>)}</div></section>}</div>;
}

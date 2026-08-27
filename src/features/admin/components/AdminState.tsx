import type { ReactNode } from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function AdminPageSkeleton({ rows = 4 }: { rows?: number }) {
  return <div aria-busy="true" aria-label="Đang tải nội dung quản trị" className="space-y-3">{Array.from({ length: rows }, (_, index) => <div key={index} aria-hidden="true" className="h-20 animate-pulse rounded-2xl border border-[#E4D8C9] bg-[#F8F2EA]" />)}</div>;
}

export function AdminErrorState({ title = 'Không tải được dữ liệu', onRetry }: { title?: string; onRetry?: () => void }) {
  return <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"><div className="flex items-start gap-3"><AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={20} /><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-red-800">Dữ liệu không thay đổi. Hãy thử lại; nếu lỗi tiếp diễn, kiểm tra quyền quản trị hoặc kết nối Supabase.</p>{onRetry && <button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-800"><RefreshCw aria-hidden="true" size={15} />Thử lại</button>}</div></div></section>;
}

export function AdminEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <section className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-[#D9CBB9] bg-[#FFFCF7] p-6 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#F0E8DC] text-[#315C73]"><Inbox aria-hidden="true" size={20} /></span><h2 className="mt-3 font-bold text-[#172033]">{title}</h2><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#5F6B7C]">{description}</p>{action && <div className="mt-4">{action}</div>}</div></section>;
}

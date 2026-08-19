import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Loader2, PenTool } from 'lucide-react';
import { fetchAiWritingHistory, type AiWritingHistoryItem } from '@/src/features/ai/repositories/aiRepository';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));
}

export default function WritingHistory() {
  const [items, setItems] = useState<AiWritingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAiWritingHistory()
      .then((history) => { if (!cancelled) setItems(history); })
      .catch((nextError: unknown) => { if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Không tải được lịch sử AI Writing.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500"><PenTool size={14} /> Writing history</div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Lịch sử AI chấm viết</h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">Các bài viết đã được lưu trong Supabase Cloud của tài khoản này.</p>
          </div>
          <Link to="/app/ai-lab" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Viết bài mới <ChevronRight size={16} /></Link>
        </div>
      </section>

      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading && <div className="flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-[#fffaf3] px-5 py-6 text-sm font-bold text-gray-500"><Loader2 size={18} className="animate-spin" /> Đang tải lịch sử…</div>}
      {!loading && !error && items.length === 0 && <div className="rounded-[2rem] border border-dashed border-[#e6ddd1] bg-[#fffaf3] px-5 py-12 text-center text-sm font-semibold text-gray-500">Chưa có bài viết nào được chấm.</div>}
      {!loading && !error && items.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)]">
              <div className="flex items-start justify-between gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500"><FileText size={22} /></div><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-500">{formatDate(item.createdAt)}</span></div>
              <h2 className="mt-5 line-clamp-2 text-lg font-black tracking-tight text-gray-900">{item.inputText}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.summary}</p>
              <div className="mt-5 space-y-2"><div className="flex items-center justify-between text-xs font-bold text-gray-500"><span>{item.status}</span><span>{item.score}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-[#efe7dc]"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }} /></div></div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

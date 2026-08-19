import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mic, Trash2 } from 'lucide-react';
import { deleteSpeakingSubmission, fetchSpeakingHistory, type SpeakingSubmission } from '@/src/features/ai/repositories/speakingRepository';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function SpeakingHistoryPage() {
  const [items, setItems] = useState<SpeakingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    fetchSpeakingHistory().then(setItems).catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Không tải được lịch sử Speaking.')).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  async function remove(id: string): Promise<void> {
    if (!window.confirm('Xóa audio và bài nộp Speaking này?')) return;
    setDeletingId(id);
    setError(null);
    try { await deleteSpeakingSubmission(id); setItems((current) => current.filter((item) => item.id !== id)); }
    catch (nextError: unknown) { setError(nextError instanceof Error ? nextError.message : 'Không xóa được bài nộp.'); }
    finally { setDeletingId(null); }
  }

  return <div className="mx-auto max-w-5xl space-y-5 pb-16"><section className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Speaking history</p><h1 className="mt-1 text-2xl font-black text-[#172033]">Lịch sử ghi âm thật</h1><p className="mt-2 text-sm text-[#5f6b7c]">Chỉ tài khoản của anh mới đọc hoặc xóa các bài nộp này.</p></div><Link to="/app/ai-speak" className="rounded-xl bg-orange-700 px-4 py-2.5 text-sm font-bold text-white">Luyện mới</Link></div></section>{error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{loading ? <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5f6b7c]"><Loader2 size={17} className="animate-spin" /> Đang tải lịch sử…</p> : items.length === 0 ? <p className="rounded-2xl border border-dashed border-[#e8dccb] bg-[#fffaf3] py-12 text-center text-sm font-semibold text-[#5f6b7c]">Chưa có bài Speaking nào.</p> : <section className="grid gap-4 md:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5"><div className="flex items-start justify-between gap-3"><span className="rounded-2xl bg-orange-50 p-3 text-orange-700"><Mic size={22} /></span><button type="button" onClick={() => void remove(item.id)} disabled={deletingId === item.id} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700"><Trash2 size={14} /> Xóa</button></div><p className="mt-4 text-xs font-bold text-[#7b8796]">{formatDate(item.createdAt)} · {item.status}</p><p className="mt-2 text-2xl font-black text-[#172033]">{item.feedback ? `${item.feedback.score}/100` : 'Đang xử lý'}</p>{item.transcript && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5f6b7c]">{item.transcript}</p>}{item.feedback?.summary && <p className="mt-3 text-sm leading-6 text-[#5f6b7c]">{item.feedback.summary}</p>}</article>)}</section>}</div>;
}

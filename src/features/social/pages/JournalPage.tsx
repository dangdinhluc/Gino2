import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Flame, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import {
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
  updateJournalEntry,
  type JournalEntry,
} from '@/src/features/social/repositories/journalRepository';

const prompts = [
  'Hôm nay anh học được từ nào đáng nhớ nhất? Vì sao?',
  'Viết 3 câu tự giới thiệu bằng tiếng Nhật cho buổi phỏng vấn.',
  'Mô tả cách anh sẽ bắt đầu một ca làm lý tưởng.',
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function journalStreak(entries: JournalEntry[]): number {
  const days = new Set(entries.map((entry) => new Date(entry.updatedAt).toDateString()));
  let count = 0;
  const cursor = new Date();
  while (days.has(cursor.toDateString())) { count += 1; cursor.setDate(cursor.getDate() - 1); }
  return count;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSavedSignature = useRef('');

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setEntries(await listJournalEntries()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được nhật ký.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const tags = useMemo(() => tagsInput.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 5), [tagsInput]);
  const signature = JSON.stringify({ title: title.trim(), content: content.trim(), tags, prompt: activePrompt });
  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);
  const totalWords = useMemo(() => entries.reduce((total, entry) => total + entry.content.split(/\s+/).filter(Boolean).length, 0), [entries]);

  const persist = useCallback(async () => {
    if (!content.trim() || isSaving || signature === lastSavedSignature.current) return;
    setIsSaving(true); setError(null);
    const payload = { title: title.trim() || 'Ghi chú không tiêu đề', content: content.trim(), tags, prompt: activePrompt };
    try {
      const saved = editingId ? await updateJournalEntry(editingId, payload) : await createJournalEntry(payload);
      setEditingId(saved.id);
      lastSavedSignature.current = signature;
      setEntries((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được nhật ký.'); }
    finally { setIsSaving(false); }
  }, [activePrompt, content, editingId, isSaving, signature, tags, title]);

  useEffect(() => {
    if (!content.trim() || signature === lastSavedSignature.current) return;
    const timeout = window.setTimeout(() => void persist(), 900);
    return () => window.clearTimeout(timeout);
  }, [content, persist, signature]);

  const resetForm = () => { setTitle(''); setContent(''); setTagsInput(''); setActivePrompt(null); setEditingId(null); lastSavedSignature.current = ''; };
  const edit = (entry: JournalEntry) => { setEditingId(entry.id); setTitle(entry.title); setContent(entry.content); setTagsInput(entry.tags.join(', ')); setActivePrompt(entry.prompt); lastSavedSignature.current = JSON.stringify({ title: entry.title, content: entry.content, tags: entry.tags, prompt: entry.prompt }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (id: string) => { if (!window.confirm('Xóa bài nhật ký này?')) return; try { await deleteJournalEntry(id); setEntries((current) => current.filter((entry) => entry.id !== id)); if (editingId === id) resetForm(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không xóa được bài viết.'); } };

  return <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-4 pb-20 md:px-8"><section className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700"><FileText size={14} /> Nhật ký riêng tư</p><h1 className="mt-2 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Nhật ký luyện viết</h1><p className="mt-2 text-sm text-[#5f6b7c]">Lưu riêng theo tài khoản của anh. Nội dung tự lưu khi anh ngừng gõ.</p></div><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white px-3 py-2"><p className="text-[10px] font-black uppercase text-[#8c97a8]">Chuỗi</p><strong className="mt-1 flex justify-center gap-1 text-xl text-[#172033]"><Flame size={16} className="text-orange-600" />{journalStreak(entries)}</strong></div><div className="rounded-xl bg-white px-3 py-2"><p className="text-[10px] font-black uppercase text-[#8c97a8]">Bài</p><strong className="mt-1 text-xl text-[#172033]">{entries.length}</strong></div><div className="rounded-xl bg-white px-3 py-2"><p className="text-[10px] font-black uppercase text-[#8c97a8]">Từ</p><strong className="mt-1 text-xl text-[#172033]">{totalWords}</strong></div></div></div></section>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}<section className="grid gap-5 xl:grid-cols-[1fr_1fr]"><article className="rounded-3xl border border-[#e8dccb] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">{editingId ? 'Đang sửa bài viết' : 'Viết hôm nay'}</h2>{editingId && <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm font-bold text-[#5f6b7c]"><X size={15} /> Bài mới</button>}</div><div className="mt-4 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => setActivePrompt((current) => current === prompt ? null : prompt)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${activePrompt === prompt ? 'bg-orange-700 text-white' : 'bg-orange-50 text-orange-700'}`}><Sparkles className="mr-1 inline" size={12} />{prompt.length > 38 ? `${prompt.slice(0, 38)}…` : prompt}</button>)}</div>{activePrompt && <p className="mt-3 rounded-xl bg-orange-50 p-3 text-xs leading-5 text-orange-800">{activePrompt}</p>}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề" className="mt-4 w-full rounded-xl border border-[#e8dccb] px-3 py-3 text-sm font-bold outline-none focus:border-orange-400" /><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Viết vài dòng về buổi học hôm nay…" className="mt-3 h-56 w-full resize-none rounded-xl border border-[#e8dccb] px-3 py-3 text-sm leading-7 outline-none focus:border-orange-400" /><input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="Tag, cách nhau bằng dấu phẩy" className="mt-3 w-full rounded-xl border border-[#e8dccb] px-3 py-3 text-xs outline-none focus:border-orange-400" /><div className="mt-4 flex items-center justify-between"><span className="text-xs font-bold text-[#95a0af]">{wordCount} từ · {isSaving ? 'đang tự lưu…' : editingId ? 'đã lưu' : 'sẽ tự lưu'}</span><div className="flex gap-2"><Link to="/app/ai-lab" className="rounded-xl border border-[#e8dccb] px-3 py-2 text-xs font-bold text-[#5f6b7c]">Gửi AI Writing</Link><button type="button" onClick={() => void persist()} disabled={!content.trim() || isSaving} className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"><Plus size={15} /> Lưu ngay</button></div></div></article><div className="space-y-3">{isLoading ? <div className="h-56 animate-pulse rounded-3xl border border-[#e8dccb] bg-[#fffaf3]" /> : entries.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8ccbb] bg-[#fffdf8] px-5 py-16 text-center"><CalendarDays size={28} className="mx-auto text-[#c9bca8]" /><p className="mt-3 font-bold text-[#5f6b7c]">Chưa có bài viết nào</p></div> : entries.map((entry) => <article key={entry.id} className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-black text-[#172033]">{entry.title}</h3><p className="mt-1 text-[10px] font-bold text-[#95a0af]">{formatDate(entry.updatedAt)}{entry.updatedAt !== entry.createdAt ? ' · đã sửa' : ''}</p></div><div className="flex gap-1"><button type="button" onClick={() => edit(entry)} className="rounded-lg bg-white p-2 text-[#5f6b7c]"><Pencil size={14} /></button><button type="button" onClick={() => void remove(entry.id)} className="rounded-lg bg-white p-2 text-red-600"><Trash2 size={14} /></button></div></div>{entry.prompt && <p className="mt-3 text-xs font-bold text-orange-700">{entry.prompt}</p>}<p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#5f6b7c]">{entry.content}</p>{entry.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{entry.tags.map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">#{tag}</span>)}</div>}</article>)}</div></section></div>;
}

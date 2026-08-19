import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, FileText, Languages, Search, X } from 'lucide-react';
import { searchLearningContent, type GlobalSearchResult } from '@/src/features/search/repositories/globalSearchRepository';

function ResultIcon({ type }: { type: string }) {
  if (type === 'vocabulary' || type === 'grammar') return <Languages size={18} />;
  if (type === 'document') return <FileText size={18} />;
  return <BookOpen size={18} />;
}

function typeLabel(type: string): string {
  return { course: 'Khóa học', lesson: 'Bài học', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', document: 'Tài liệu' }[type] ?? 'Nội dung học';
}

export default function GlobalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q')?.trim() ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term: string) => {
    const normalized = term.trim();
    if (!normalized) { setResults([]); setError(null); setIsLoading(false); return; }
    setIsLoading(true); setError(null);
    try { setResults(await searchLearningContent(normalized)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tìm kiếm được nội dung.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { setQuery(initialQuery); void load(initialQuery); }, [initialQuery, load]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextQuery = query.trim();
    setSearchParams(nextQuery ? { q: nextQuery } : {});
  };

  return <div className="mx-auto w-full max-w-4xl space-y-5 pb-16"><header className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">Tìm trong nội dung anh được phép học</p><h1 className="mt-2 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Tìm kiếm học tập</h1><p className="mt-2 text-sm leading-6 text-[#5f6b7c]">Khóa học, bài học, từ vựng, ngữ pháp và tài liệu đã publish.</p><form onSubmit={submit} className="mt-5 flex gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 focus-within:border-orange-400"><Search size={18} className="shrink-0 text-[#8c97a8]" /><span className="sr-only">Từ khóa tìm kiếm</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: vệ sinh, 〜ながら, 介護" className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#95a0af]" />{query && <button type="button" onClick={() => { setQuery(''); setSearchParams({}); }} aria-label="Xóa tìm kiếm" className="rounded-lg p-1 text-[#8c97a8] hover:bg-slate-100"><X size={16} /></button>}</label><button type="submit" disabled={!query.trim()} className="rounded-xl bg-orange-700 px-4 text-sm font-black text-white disabled:opacity-50">Tìm</button></form></header>{error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}{isLoading ? <div className="h-48 animate-pulse rounded-3xl border border-[#e8dccb] bg-[#fffaf3]" /> : initialQuery ? <section className="rounded-3xl border border-[#e8dccb] bg-white p-5"><p className="text-sm font-bold text-[#5f6b7c]">{results.length ? `${results.length} kết quả cho “${initialQuery}”` : `Không tìm thấy nội dung phù hợp với “${initialQuery}”.`}</p>{results.length > 0 && <div className="mt-4 divide-y divide-[#efe5d7]">{results.map((result) => <Link key={`${result.result_type}-${result.id}`} to={result.route} className="flex items-start gap-3 py-4 transition-colors hover:text-orange-700"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><ResultIcon type={result.result_type} /></span><span className="min-w-0 flex-1"><span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">{typeLabel(result.result_type)}</span><strong className="mt-1 block text-sm text-[#172033]">{result.title}</strong><span className="mt-1 block line-clamp-2 text-sm leading-6 text-[#5f6b7c]">{result.subtitle}</span></span></Link>)}</div>}</section> : <section className="rounded-3xl border border-dashed border-[#d8ccbb] bg-[#fffdf8] px-5 py-14 text-center"><Search className="mx-auto text-[#c9bca8]" size={30} /><h2 className="mt-3 font-black text-[#172033]">Nhập nội dung cần tìm</h2><p className="mt-1 text-sm text-[#5f6b7c]">Kết quả chỉ gồm nội dung đã công bố thuộc khóa học của anh.</p></section>}</div>;
}

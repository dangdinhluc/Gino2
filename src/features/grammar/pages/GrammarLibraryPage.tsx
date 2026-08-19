import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import { getGrammarTopics, type GrammarTopic } from '@/src/features/grammar/repositories/grammarRepository';
import { cn } from '@/src/lib/utils';

export default function GrammarLibrary() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState('Tất cả');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    getGrammarTopics().then((data) => {
      if (!cancelled) { setTopics(data); setError(null); setIsLoading(false); }
    }).catch((reason) => {
      if (!cancelled) { setError(reason instanceof Error ? reason.message : 'Không tải được ngữ pháp.'); setIsLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const levels = useMemo(() => ['Tất cả', ...Array.from(new Set(topics.map((item) => item.level)))], [topics]);
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return topics.filter((item) => (activeLevel === 'Tất cả' || item.level === activeLevel) && (!needle || [item.title, item.summary, item.category, item.level].join(' ').toLowerCase().includes(needle)));
  }, [activeLevel, query, topics]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-16">
      <header><h1 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.02em] text-[#172033]">Thư viện ngữ pháp</h1><p className="mt-1 text-sm text-[#5f6b7c]">{isLoading ? 'Đang tải nội dung được publish…' : `${filteredItems.length} chủ điểm được phép học`}</p></header>
      <div className="space-y-3"><label className="relative block"><Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, chủ điểm hoặc cấp độ" className="w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400" /></label><div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">{levels.map((level) => <button key={level} type="button" onClick={() => setActiveLevel(level)} className={cn('shrink-0 rounded-xl border px-3 py-1.5 text-sm', activeLevel === level ? 'border-orange-300 bg-orange-50 font-bold text-orange-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]')}>{level === 'Tất cả' ? level : `Cấp độ ${level}`}</button>)}</div></div>
      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm font-semibold text-red-700">{error}</p> : isLoading ? <div className="h-40 animate-pulse rounded-2xl border border-[#e8dccb] bg-[#fffaf3]" /> : filteredItems.length === 0 ? <p className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] px-4 py-10 text-center text-sm text-[#5f6b7c]">Chưa có chủ điểm ngữ pháp được publish cho các khóa anh đang học.</p> : <ul className="divide-y divide-[#efe5d7] overflow-hidden rounded-2xl border border-[#e8dccb] bg-[#fffaf3]">{filteredItems.map((item) => <li key={item.id}><Link to={`/app/grammar/${item.id}`} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-[#fffdf8]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><BookOpen size={17} /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">{item.title}</span><span className="mt-0.5 block line-clamp-2 text-xs text-[#7b8796]">{item.category} · {item.level} · {item.summary}</span></span><ChevronRight size={17} className="shrink-0 text-[#95a0af] group-hover:text-orange-700" /></Link></li>)}</ul>}
    </div>
  );
}

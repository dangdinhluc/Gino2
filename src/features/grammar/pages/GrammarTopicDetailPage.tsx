import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { getGrammarTopic, type GrammarTopicDetail } from '@/src/features/grammar/repositories/grammarRepository';

export default function GrammarTopicDetailPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState<GrammarTopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('Thiếu mã chủ điểm ngữ pháp.'); setIsLoading(false); return; }
    let cancelled = false;
    getGrammarTopic(id).then((data) => { if (!cancelled) { setTopic(data); setIsLoading(false); } }).catch((reason) => { if (!cancelled) { setError(reason instanceof Error ? reason.message : 'Không tải được chủ điểm.'); setIsLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) return <div className="mx-auto flex min-h-[55vh] max-w-3xl items-center justify-center text-sm font-bold text-[#5f6b7c]">Đang tải bài ngữ pháp…</div>;
  if (error || !topic) return <section className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><h1 className="text-xl font-black text-red-800">Không mở được chủ điểm</h1><p className="mt-2 text-sm text-red-700">{error ?? 'Chủ điểm không tồn tại hoặc chưa được publish.'}</p><Link to="/app/grammar" className="mt-5 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Về thư viện</Link></section>;

  return <div className="mx-auto max-w-3xl space-y-5 pb-16"><section className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 sm:p-7"><Link to="/app/grammar" className="inline-flex items-center gap-2 text-sm font-bold text-orange-700"><ArrowLeft size={15} /> Thư viện ngữ pháp</Link><div className="mt-5 flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><BookOpen size={23} /></span><div><p className="text-xs font-black uppercase tracking-[0.13em] text-orange-700">{topic.category} · {topic.level}</p><h1 className="mt-1 font-[var(--font-heading)] text-3xl font-black text-[#172033]">{topic.title}</h1><p className="mt-2 text-sm leading-6 text-[#5f6b7c]">{topic.summary}</p></div></div></section>{topic.rules.length > 0 && <section className="space-y-3">{topic.rules.map((rule) => <article key={rule.id} className="rounded-2xl border border-[#e8dccb] bg-white p-5"><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">{rule.title}</h2><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#4d5a6b]">{rule.bodyMarkdown}</div></article>)}</section>}{topic.examples.length > 0 && <section className="rounded-2xl border border-[#e8dccb] bg-white p-5"><h2 className="flex items-center gap-2 font-[var(--font-heading)] text-lg font-black text-[#172033]"><Sparkles size={17} className="text-orange-700" /> Ví dụ</h2><div className="mt-4 space-y-3">{topic.examples.map((example) => <article key={example.id} className="rounded-xl bg-[#fffaf3] p-4"><p lang="ja" className="text-lg font-bold text-[#172033]">{example.japaneseText}</p><p className="mt-1 text-sm text-[#5f6b7c]">{example.vietnameseText}</p>{example.explanation && <p className="mt-2 text-xs leading-5 text-orange-700">{example.explanation}</p>}</article>)}</div></section>}{topic.rules.length === 0 && topic.examples.length === 0 && <p className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 text-sm text-[#5f6b7c]">Nội dung chi tiết đang được đội nội dung bổ sung.</p>}</div>;
}

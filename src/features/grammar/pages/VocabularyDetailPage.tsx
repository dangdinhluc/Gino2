import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock3, RotateCcw, Volume2 } from 'lucide-react';
import { getVocabularyDetail, type VocabularyDetailRecord } from '@/src/features/grammar/repositories/grammarRepository';
import { isTtsSupported, speakJapanese } from '@/src/shared/lib/tts';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';

function dueLabel(value: string | null): string {
  if (!value) return 'Chưa vào lịch SRS';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Đã cập nhật';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function statusLabel(status: string): string {
  if (status === 'mastered') return 'Đã nhớ';
  if (status === 'learning') return 'Đang học';
  return 'Chưa học';
}

export default function VocabularyDetailPage() {
  const { wordId } = useParams();
  const [word, setWord] = useState<VocabularyDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wordId) { setError('Thiếu mã từ vựng.'); setIsLoading(false); return; }
    let cancelled = false;
    getVocabularyDetail(wordId).then((data) => { if (!cancelled) { setWord(data); setIsLoading(false); } }).catch((reason) => { if (!cancelled) { setError(reason instanceof Error ? reason.message : 'Không tải được từ vựng.'); setIsLoading(false); } });
    return () => { cancelled = true; };
  }, [wordId]);

  if (isLoading) return <PageLoading />;
  if (error || !word) return <section className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><h1 className="text-xl font-black text-red-800">Không mở được từ vựng</h1><p className="mt-2 text-sm text-red-700">{error ?? 'Từ này không nằm trong nội dung anh được phép học.'}</p><Link to="/app/courses" className="mt-5 inline-flex rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Về khóa học</Link></section>;

  return <div className="mx-auto max-w-4xl space-y-5 pb-16"><section className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 sm:p-7"><Link to="/app/courses" className="inline-flex items-center gap-2 text-sm font-bold text-orange-700"><ArrowLeft size={15} /> Khóa học của tôi</Link><div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">{statusLabel(word.status)}</span>{word.tags.map((tag) => <span key={tag} className="rounded-full border border-[#e8dccb] bg-white px-3 py-1 text-xs font-bold text-[#5f6b7c]">{tag}</span>)}</div><h1 lang="ja" className="mt-4 font-[var(--font-heading)] text-5xl font-black tracking-[-0.03em] text-[#172033]">{word.term}</h1>{word.reading && word.reading !== word.term && <p lang="ja" className="mt-1 text-xl font-bold text-orange-700">{word.reading}</p>}<p className="mt-2 text-sm italic text-[#7b8796]">/{word.pronunciation}/</p><p className="mt-4 text-2xl font-black text-[#172033]">{word.translation}</p></div><button type="button" disabled={!isTtsSupported()} onClick={() => speakJapanese(word.reading || word.term)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-orange-700 disabled:opacity-50"><Volume2 size={17} /> Nghe phát âm</button></div></section><section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><article className="rounded-2xl border border-[#e8dccb] bg-white p-5"><h2 className="flex items-center gap-2 font-[var(--font-heading)] text-lg font-black text-[#172033]"><BookOpen size={17} className="text-orange-700" /> Câu ví dụ</h2><p lang="ja" className="mt-4 text-xl font-bold leading-relaxed text-[#172033]">{word.exampleSentence || 'Chưa có câu ví dụ.'}</p>{word.exampleSentence && <button type="button" disabled={!isTtsSupported()} onClick={() => speakJapanese(word.exampleSentence, 0.8)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-700 disabled:opacity-50"><Volume2 size={15} /> Nghe câu ví dụ</button>}</article><aside className="space-y-4"><article className="rounded-2xl border border-[#e8dccb] bg-white p-5"><h2 className="flex items-center gap-2 font-[var(--font-heading)] text-lg font-black text-[#172033]"><Clock3 size={17} className="text-orange-700" /> Tiến độ SRS</h2><dl className="mt-4 grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-[#fffaf3] p-3"><dt className="text-[10px] font-black uppercase text-[#8c97a8]">Ôn tới</dt><dd className="mt-1 text-sm font-black text-[#172033]">{dueLabel(word.dueAt)}</dd></div><div className="rounded-xl bg-[#fffaf3] p-3"><dt className="text-[10px] font-black uppercase text-[#8c97a8]">Khoảng cách</dt><dd className="mt-1 text-sm font-black text-[#172033]">{word.intervalDays ? `${word.intervalDays} ngày` : '—'}</dd></div><div className="rounded-xl bg-[#fffaf3] p-3"><dt className="text-[10px] font-black uppercase text-[#8c97a8]">Lần nhớ</dt><dd className="mt-1 text-sm font-black text-emerald-700">{word.repetitions}</dd></div><div className="rounded-xl bg-[#fffaf3] p-3"><dt className="text-[10px] font-black uppercase text-[#8c97a8]">Lần quên</dt><dd className="mt-1 text-sm font-black text-red-600">{word.lapses}</dd></div></dl><Link to="/app/review/flashcards?mode=due" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d83a00] px-4 py-3 text-sm font-black text-white"><RotateCcw size={15} /> Vào phiên ôn</Link></article>{word.grammarTopics.length > 0 && <article className="rounded-2xl border border-[#e8dccb] bg-white p-5"><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Liên kết ngữ pháp</h2><div className="mt-3 space-y-2">{word.grammarTopics.map((topic) => <Link key={topic.id} to={`/app/grammar/${topic.id}`} className="block rounded-xl bg-[#fffaf3] p-3 hover:bg-orange-50"><p className="font-bold text-[#172033]">{topic.title}</p><p className="mt-1 text-xs text-[#5f6b7c]">{topic.summary}</p></Link>)}</div></article>}</aside></section></div>;
}

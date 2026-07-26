import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronRight,
  Clock3,
  Flame,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getTopic, getVocabCard, relatedCards } from '@/src/data/tokutei/vocabDeck';
import { cardStrength } from '@/src/features/review/lib/srs';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { isTtsSupported, speakJapanese } from '@/src/shared/lib/tts';

const phaseInfo: Record<string, { label: string; className: string; hint: string }> = {
  new: { label: 'Chưa học', className: 'bg-gray-100 text-gray-500', hint: 'Từ này chưa vào lịch SRS. Bắt đầu học để hệ thống xếp lịch ôn cho anh.' },
  learning: { label: 'Đang học', className: 'bg-amber-100 text-amber-700', hint: 'Từ đang trong các bước học đầu tiên, sẽ lặp lại nhanh trong phiên.' },
  relearning: { label: 'Học lại', className: 'bg-rose-100 text-rose-600', hint: 'Anh vừa quên từ này — hệ thống đã rút ngắn lịch để củng cố lại.' },
  review: { label: 'Ôn định kỳ', className: 'bg-emerald-100 text-emerald-700', hint: 'Từ đã vào nhịp ôn dài hạn. Interval càng dài, trí nhớ càng chắc.' },
};

function formatDue(due: number, now: number): string {
  const diffDays = Math.ceil((due - now) / 86_400_000);
  if (diffDays <= 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  const date = new Date(due);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function VocabularyDetail() {
  const { wordId } = useParams();
  const card = wordId ? getVocabCard(wordId) : undefined;
  const state = useReviewStore((store) => (wordId ? store.states[wordId] : undefined));
  const resetCard = useReviewStore((store) => store.resetCard);
  const related = useMemo(() => (wordId ? relatedCards(wordId) : []), [wordId]);

  if (!card) {
    return (
      <div className="space-y-6 pb-16">
        <section className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-7 text-center shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-orange-50 text-orange-500">
            <BookOpen size={28} />
          </div>
          <h2 className="mt-4 text-2xl font-black text-gray-900">Chưa có từ vựng này</h2>
          <p className="mt-2 text-sm font-medium text-gray-500">Từ anh tìm chưa nằm trong bộ thẻ Tokutei. Thử duyệt bộ thẻ trong Review Center.</p>
          <Link to="/app/review" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">
            <ArrowLeft size={16} /> Về Review Center
          </Link>
        </section>
      </div>
    );
  }

  const topic = getTopic(card.topicId);
  const phase = state?.phase ?? 'new';
  const info = phaseInfo[phase];
  const strength = cardStrength(state);
  const now = Date.now();

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/app/review" className="inline-flex items-center gap-2 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-2 text-xs font-black text-gray-600 transition-colors hover:bg-orange-50">
                <ArrowLeft size={14} /> Bộ thẻ
              </Link>
              <span className="rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">{card.level}</span>
              <span className="rounded-full bg-orange-100/70 px-3 py-1 text-[10px] font-black text-orange-600">{topic.label}</span>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <h1 lang="ja" className="text-5xl font-black tracking-tight text-gray-900 md:text-6xl">{card.word}</h1>
              <div className="pb-1">
                {card.reading !== card.word && <div lang="ja" className="text-lg font-bold text-gray-500">{card.reading}</div>}
                <div className="text-sm font-bold italic text-orange-500">{card.romaji}</div>
              </div>
            </div>
            <p className="text-xl font-black text-gray-700 md:text-2xl">{card.meaning}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => speakJapanese(card.reading === card.word ? card.word : card.reading)}
              disabled={!isTtsSupported()}
              className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-40"
            >
              <Volume2 size={17} /> Nghe từ
            </button>
            <Link
              to={`/app/review/flashcards?mode=topic:${card.topicId}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200"
            >
              Ôn chủ đề này <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                <Sparkles size={14} /> Câu ví dụ ngữ cảnh công việc
              </div>
              <button
                type="button"
                onClick={() => speakJapanese(card.exampleJp, 0.8)}
                disabled={!isTtsSupported()}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 transition-transform hover:scale-105 disabled:opacity-40"
                aria-label="Nghe câu ví dụ"
              >
                <Volume2 size={17} />
              </button>
            </div>
            <p lang="ja" className="mt-4 text-xl font-black leading-relaxed text-gray-900 md:text-2xl">{card.exampleJp}</p>
            <p className="mt-2 text-sm font-medium italic text-gray-400">{card.exampleRomaji}</p>
            <p className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold leading-relaxed text-[#4d5a6b]">{card.exampleVi}</p>
          </motion.article>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
              <BookOpen size={14} /> Từ cùng chủ đề "{topic.label}"
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/app/vocabulary/${item.id}`}
                  className="group flex items-center gap-3 rounded-[1.5rem] border border-[#eee5d8] bg-white/70 px-4 py-3 transition-all hover:border-orange-200 hover:bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span lang="ja" className="truncate text-base font-black text-gray-900">{item.word}</span>
                      <span className="truncate text-[11px] font-bold italic text-gray-400">{item.romaji}</span>
                    </div>
                    <div className="truncate text-xs font-bold text-gray-500">{item.meaning}</div>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                <Brain size={14} /> Trạng thái SRS
              </div>
              <span className={cn('rounded-full px-3 py-1 text-[10px] font-black', info.className)}>{info.label}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>Độ chắc trí nhớ</span>
                <span className="text-gray-900">{strength}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#efe7dc]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength}%` }}
                  className={cn('h-full rounded-full', strength >= 70 ? 'bg-emerald-500' : strength >= 35 ? 'bg-amber-400' : 'bg-gray-300')}
                />
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-xs font-medium leading-relaxed text-gray-500">{info.hint}</p>

            {state && phase !== 'new' && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-3">
                  <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    <Clock3 size={11} /> Lần ôn tới
                  </div>
                  <div className="mt-1 text-sm font-black text-gray-900">{formatDue(state.due, now)}</div>
                </div>
                <div className="rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Interval</div>
                  <div className="mt-1 text-sm font-black text-gray-900">{phase === 'review' ? `${state.intervalDays} ngày` : 'Đang học'}</div>
                </div>
                <div className="rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Lần nhớ đúng</div>
                  <div className="mt-1 text-sm font-black text-emerald-600">{state.reps}</div>
                </div>
                <div className="rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Lần quên</div>
                  <div className="mt-1 text-sm font-black text-rose-500">{state.lapses}</div>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/app/review/flashcards?mode=due"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200"
              >
                <Flame size={15} /> Vào phiên ôn hôm nay
              </Link>
              {state && phase !== 'new' && (
                <button
                  type="button"
                  onClick={() => resetCard(card.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-xs font-black text-gray-500 transition-colors hover:border-rose-200 hover:text-rose-500"
                >
                  <RotateCcw size={14} /> Đặt lại tiến độ từ này
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)]">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Chủ đề</div>
            <h3 className="mt-2 text-lg font-black text-gray-900">{topic.label}</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500">{topic.description}</p>
            <Link
              to={`/app/review/flashcards?mode=topic:${card.topicId}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50"
            >
              Luyện cả chủ đề <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

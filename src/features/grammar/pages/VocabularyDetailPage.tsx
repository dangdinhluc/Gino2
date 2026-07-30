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

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

const phaseInfo: Record<string, { label: string; className: string; hint: string }> = {
  new: { label: 'Chưa học', className: 'bg-[#f0f2f5] text-[#5f6b7c]', hint: 'Từ này chưa vào lịch SRS. Bắt đầu học để hệ thống xếp lịch ôn cho anh.' },
  learning: { label: 'Đang học', className: 'bg-amber-100 text-amber-700', hint: 'Từ đang trong các bước học đầu tiên, sẽ lặp lại nhanh trong phiên.' },
  relearning: { label: 'Học lại', className: 'bg-red-100 text-red-600', hint: 'Anh vừa quên từ này — hệ thống đã rút ngắn lịch để củng cố lại.' },
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
      <div className="mx-auto max-w-2xl pb-16">
        <section className={`${panelClass} text-center`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
            <BookOpen size={28} strokeWidth={1.8} />
          </div>
          <h1 className="mt-4 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033]">Chưa có từ vựng này</h1>
          <p className="mt-2 text-sm text-[#5f6b7c]">Từ anh tìm chưa nằm trong bộ thẻ Tokutei. Thử duyệt bộ thẻ trong Review Center.</p>
          <Link to="/app/review" className={`mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}>
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
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      <section className={panelClass}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/app/review" className={`inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
                <ArrowLeft size={14} /> Bộ thẻ
              </Link>
              <span className="rounded-md border border-[#e8dccb] bg-[#fffdf8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b8796]">{card.level}</span>
              <span className="rounded-md bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-700">{topic.label}</span>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <h1 lang="ja" className="font-[var(--font-heading)] text-5xl font-bold tracking-[-0.02em] text-[#172033] md:text-6xl">{card.word}</h1>
              <div className="pb-1">
                {card.reading !== card.word && <div lang="ja" className="text-lg font-bold text-[#5f6b7c]">{card.reading}</div>}
                <div className="text-sm font-bold italic text-orange-700">{card.romaji}</div>
              </div>
            </div>
            <p className="text-xl font-bold text-[#4d5a6b] md:text-2xl">{card.meaning}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => speakJapanese(card.reading === card.word ? card.word : card.reading)}
              disabled={!isTtsSupported()}
              className={`inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3 text-sm font-bold text-orange-700 transition-colors hover:bg-[#f6efe6] disabled:opacity-40 ${focusRing}`}
            >
              <Volume2 size={17} strokeWidth={1.8} /> Nghe từ
            </button>
            <Link
              to={`/app/review/flashcards?mode=topic:${card.topicId}`}
              className={`inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
            >
              Ôn chủ đề này <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={panelClass}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                <Sparkles size={14} /> Câu ví dụ ngữ cảnh công việc
              </div>
              <button
                type="button"
                onClick={() => speakJapanese(card.exampleJp, 0.8)}
                disabled={!isTtsSupported()}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8dccb] bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-40"
                aria-label="Nghe câu ví dụ"
              >
                <Volume2 size={17} strokeWidth={1.8} />
              </button>
            </div>
            <p lang="ja" className="mt-4 text-xl font-bold leading-relaxed text-[#172033] md:text-2xl">{card.exampleJp}</p>
            <p className="mt-2 text-sm italic text-[#95a0af]">{card.exampleRomaji}</p>
            <p className="mt-3 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-medium leading-relaxed text-[#4d5a6b]">{card.exampleVi}</p>
          </motion.article>

          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <BookOpen size={14} /> Từ cùng chủ đề "{topic.label}"
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/app/vocabulary/${item.id}`}
                  className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 transition-colors hover:bg-[#fffaf3] ${focusRing}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span lang="ja" className="truncate text-base font-bold text-[#172033]">{item.word}</span>
                      <span className="truncate text-[11px] font-bold italic text-[#95a0af]">{item.romaji}</span>
                    </div>
                    <div className="truncate text-xs font-medium text-[#5f6b7c]">{item.meaning}</div>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={panelClass}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                <Brain size={14} /> Trạng thái SRS
              </div>
              <span className={cn('rounded-md px-3 py-1 text-[10px] font-bold', info.className)}>{info.label}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#5f6b7c]">
                <span>Độ chắc trí nhớ</span>
                <span className="text-[#172033]">{strength}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#efe5d7]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${strength}%` }}
                  className={cn('h-full rounded-full', strength >= 70 ? 'bg-emerald-500' : strength >= 35 ? 'bg-amber-400' : 'bg-[#d8ccbb]')}
                />
              </div>
            </div>

            <p className="mt-4 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-xs font-medium leading-relaxed text-[#5f6b7c]">{info.hint}</p>

            {state && phase !== 'new' && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-3">
                  <div className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-[#95a0af]">
                    <Clock3 size={11} /> Lần ôn tới
                  </div>
                  <div className="mt-1 font-bold text-[#172033]">{formatDue(state.due, now)}</div>
                </div>
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-[#95a0af]">Interval</div>
                  <div className="mt-1 font-bold text-[#172033]">{phase === 'review' ? `${state.intervalDays} ngày` : 'Đang học'}</div>
                </div>
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-[#95a0af]">Lần nhớ đúng</div>
                  <div className="mt-1 font-bold text-emerald-600">{state.reps}</div>
                </div>
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-[#95a0af]">Lần quên</div>
                  <div className="mt-1 font-bold text-red-500">{state.lapses}</div>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <Link
                to="/app/review/flashcards?mode=due"
                className={`inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
              >
                <Flame size={15} /> Vào phiên ôn hôm nay
              </Link>
              {state && phase !== 'new' && (
                <button
                  type="button"
                  onClick={() => resetCard(card.id)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-red-600 ${focusRing}`}
                >
                  <RotateCcw size={14} /> Đặt lại tiến độ từ này
                </button>
              )}
            </div>
          </div>

          <div className={panelClass}>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">Chủ đề</div>
            <h2 className="mt-2 font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">{topic.label}</h2>
            <p className="mt-1 text-sm text-[#5f6b7c]">{topic.description}</p>
            <Link
              to={`/app/review/flashcards?mode=topic:${card.topicId}`}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-bold text-orange-700 transition-colors hover:bg-[#f6efe6] ${focusRing}`}
            >
              Luyện cả chủ đề <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

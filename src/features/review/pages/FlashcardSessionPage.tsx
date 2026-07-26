import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
  Undo2,
  Volume2,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { TokuteiVocabCard } from '@/src/data/tokutei/vocabDeck';
import { getTopic, getVocabCard } from '@/src/data/tokutei/vocabDeck';
import type { SrsCardState, SrsRating } from '@/src/features/review/lib/srs';
import { createNewCardState, previewIntervals, xpForRating } from '@/src/features/review/lib/srs';
import type { SessionMode } from '@/src/features/review/lib/reviewSelectors';
import { buildSessionQueue, newRemainingToday } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { isTtsSupported, speakJapanese, stopSpeaking } from '@/src/shared/lib/tts';

const MINUTE_MS = 60_000;

interface RatingOption {
  rating: SrsRating;
  label: string;
  key: string;
  className: string;
}

const ratingOptions: RatingOption[] = [
  { rating: 'again', label: 'Quên', key: '1', className: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' },
  { rating: 'hard', label: 'Khó', key: '2', className: 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { rating: 'good', label: 'Nhớ', key: '3', className: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { rating: 'easy', label: 'Rất nhớ', key: '4', className: 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
];

type RatingCounts = Record<SrsRating, number>;

interface UndoSnapshot {
  cardId: string;
  prevState: SrsCardState | undefined;
  logLength: number;
  queue: string[];
  index: number;
  counts: RatingCounts;
  sessionXp: number;
  removedCount: number;
}

function parseMode(raw: string | null): SessionMode {
  if (!raw) return 'due';
  if (raw === 'due' || raw === 'new' || raw === 'cram') return raw;
  if (raw.startsWith('topic:')) return raw as SessionMode;
  return 'due';
}

function modeTitle(mode: SessionMode): string {
  if (mode === 'due') return 'Thẻ nhớ tới hạn';
  if (mode === 'new') return 'Học từ mới';
  if (mode === 'cram') return 'Luyện nhanh 20 thẻ';
  return `Chủ đề: ${getTopic(mode.slice('topic:'.length) as never).label}`;
}

const emptyCounts: RatingCounts = { again: 0, hard: 0, good: 0, easy: 0 };

export default function FlashcardSession() {
  const [searchParams] = useSearchParams();
  const mode = parseMode(searchParams.get('mode'));

  const rate = useReviewStore((state) => state.rate);
  const restoreCardState = useReviewStore((state) => state.restoreCardState);
  const markSessionComplete = useReviewStore((state) => state.markSessionComplete);
  const recordGameComplete = useProgressStore((state) => state.recordGameComplete);
  const streak = useProgressStore((state) => state.streak);

  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [counts, setCounts] = useState<RatingCounts>(emptyCounts);
  const [sessionXp, setSessionXp] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const xpAwardedRef = useRef(false);

  const resetSession = useCallback((sessionMode: SessionMode) => {
    const { states, settings, newDay, newIntroducedToday } = useReviewStore.getState();
    const now = Date.now();
    const remaining = newRemainingToday(settings.newPerDay, newDay, newIntroducedToday, now);
    const cards = buildSessionQueue(sessionMode, states, now, remaining);
    setQueue(cards.map((card) => card.id));
    setIndex(0);
    setIsRevealed(false);
    setCounts(emptyCounts);
    setSessionXp(0);
    setRemovedCount(0);
    setUndoSnapshot(null);
    xpAwardedRef.current = false;
    setInitialised(true);
  }, []);

  useEffect(() => {
    resetSession(mode);
  }, [mode, resetSession]);

  const remaining = queue.length - index;
  const isComplete = initialised && remaining <= 0 && removedCount > 0;
  const isEmpty = initialised && remaining <= 0 && removedCount === 0;

  const currentCardId = remaining > 0 ? queue[index] : null;
  const card: TokuteiVocabCard | null = currentCardId ? getVocabCard(currentCardId) ?? null : null;
  const currentState = useReviewStore((state) => (currentCardId ? state.states[currentCardId] : undefined));
  const intervals = useMemo(
    () => previewIntervals(currentState ?? createNewCardState()),
    [currentState],
  );
  const topic = card ? getTopic(card.topicId) : null;

  const totalRated = counts.again + counts.hard + counts.good + counts.easy;
  const progress = removedCount + remaining > 0 ? Math.round((removedCount / (removedCount + remaining)) * 100) : 0;

  const handleRate = useCallback(
    (rating: SrsRating) => {
      if (!currentCardId || !isRevealed) return;
      const now = Date.now();
      const storeState = useReviewStore.getState();
      const snapshot: UndoSnapshot = {
        cardId: currentCardId,
        prevState: storeState.states[currentCardId],
        logLength: storeState.log.length,
        queue: [...queue],
        index,
        counts: { ...counts },
        sessionXp,
        removedCount,
      };

      rate(currentCardId, rating, now);
      const nextState = useReviewStore.getState().states[currentCardId];
      const dueInMs = nextState.due - now;

      const nextQueue = [...queue];
      nextQueue.splice(index, 1);
      let removed = false;
      if (dueInMs <= 2.5 * MINUTE_MS) {
        nextQueue.splice(Math.min(index + 2, nextQueue.length), 0, currentCardId);
      } else if (dueInMs <= 15 * MINUTE_MS) {
        nextQueue.push(currentCardId);
      } else {
        removed = true;
      }

      stopSpeaking();
      setUndoSnapshot(snapshot);
      setQueue(nextQueue);
      setCounts((current) => ({ ...current, [rating]: current[rating] + 1 }));
      setSessionXp((current) => current + xpForRating(rating));
      if (removed) setRemovedCount((current) => current + 1);
      setIsRevealed(false);
    },
    [counts, currentCardId, index, isRevealed, queue, rate, removedCount, sessionXp],
  );

  const handleUndo = useCallback(() => {
    if (!undoSnapshot) return;
    restoreCardState(undoSnapshot.cardId, undoSnapshot.prevState, undoSnapshot.logLength);
    setQueue(undoSnapshot.queue);
    setIndex(undoSnapshot.index);
    setCounts(undoSnapshot.counts);
    setSessionXp(undoSnapshot.sessionXp);
    setRemovedCount(undoSnapshot.removedCount);
    setIsRevealed(true);
    setUndoSnapshot(null);
  }, [restoreCardState, undoSnapshot]);

  // Phím tắt: Space lật thẻ, 1-4 chấm, U hoàn tác
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (isComplete || isEmpty) return;

      if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        setIsRevealed((current) => !current);
        return;
      }
      if (event.key === 'u' || event.key === 'U') {
        event.preventDefault();
        handleUndo();
        return;
      }
      const option = ratingOptions.find((item) => item.key === event.key);
      if (option) {
        event.preventDefault();
        handleRate(option.rating);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRate, handleUndo, isComplete, isEmpty]);

  // Tự đọc từ khi hiện thẻ mới (nếu bật)
  useEffect(() => {
    if (autoSpeak && card && !isRevealed) {
      speakJapanese(card.word === card.reading ? card.word : card.reading);
    }
  }, [autoSpeak, card, isRevealed]);

  // Cộng XP + streak đúng một lần khi xong phiên
  useEffect(() => {
    if (isComplete && !xpAwardedRef.current) {
      xpAwardedRef.current = true;
      if (sessionXp > 0) recordGameComplete(sessionXp);
      markSessionComplete();
    }
  }, [isComplete, markSessionComplete, recordGameComplete, sessionXp]);

  useEffect(() => () => stopSpeaking(), []);

  if (!initialised) return null;

  if (isEmpty) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center justify-center pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-7 text-center shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-10"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-100">
            <CheckCircle2 size={44} />
          </div>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500">Sạch hàng đợi</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            {mode === 'new' ? 'Hôm nay đã đủ thẻ mới' : 'Không còn thẻ tới hạn'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-gray-500">
            {mode === 'new'
              ? 'Anh đã học đủ số thẻ mới cho hôm nay. Muốn học thêm thì tăng giới hạn trong Review Center.'
              : 'Bộ nhớ đang được nghỉ đúng lịch. Anh có thể luyện nhanh hoặc học thêm từ mới.'}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/app/review/flashcards?mode=cram" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50">
              <Zap size={16} /> Luyện nhanh 20 thẻ
            </Link>
            <Link to="/app/review/flashcards?mode=new" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3 text-sm font-black text-blue-600 transition-all hover:bg-blue-50">
              <BookOpen size={16} /> Học từ mới
            </Link>
            <Link to="/app/review" className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Về Review Center
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  if (isComplete) {
    const sessionRetention = totalRated > 0 ? Math.round(((totalRated - counts.again) / totalRated) * 100) : 0;
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center justify-center pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-7 text-center shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-10"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-100">
            <Trophy size={44} />
          </div>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500">Hoàn thành phiên ôn</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">Tuyệt vời!</h1>
          <p className="mt-2 text-sm font-bold text-gray-500">
            {totalRated} lượt chấm · nhớ {sessionRetention}% · lịch ôn từng thẻ đã được cập nhật
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ratingOptions.map((option) => (
              <div key={option.rating} className={cn('rounded-[1.5rem] border px-4 py-4', option.className.split(' hover:')[0])}>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">{option.label}</div>
                <div className="mt-2 text-2xl font-black text-gray-900">{counts[option.rating]}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">XP nhận được</div>
              <div className="mt-2 text-2xl font-black text-orange-600">+{sessionXp}</div>
            </div>
            <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/70 px-4 py-4">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">
                <Flame size={12} className="fill-amber-500 text-amber-500" /> Streak
              </div>
              <div className="mt-2 text-2xl font-black text-gray-900">{streak} ngày</div>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Đã ôn</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{removedCount} thẻ</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => resetSession(mode)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50"
            >
              <RotateCcw size={16} /> Ôn tiếp
            </button>
            <Link to="/app/review/flashcards?mode=new" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3 text-sm font-black text-blue-600 transition-all hover:bg-blue-50">
              <BookOpen size={16} /> Học từ mới
            </Link>
            <Link to="/app/review" className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Về Review Center
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <section className="sticky top-0 z-40 -mx-4 border-b border-[#e6ddd1] bg-[#f8f4ee]/92 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:rounded-[2rem] md:border md:bg-[#fffaf3]/92 md:p-4 md:shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <Link to="/app/review" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-[#fffaf3] text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Flashcard SRS</p>
            <h1 className="truncate text-base font-black text-gray-900 md:text-xl">{modeTitle(mode)}</h1>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!undoSnapshot}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-[#fffaf3] text-gray-600 transition-colors hover:text-orange-600 disabled:opacity-35"
            title="Hoàn tác lần chấm trước (U)"
            aria-label="Hoàn tác lần chấm trước"
          >
            <Undo2 size={18} />
          </button>
          <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-blue-600">
            Còn {remaining}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" animate={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="mx-auto max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => speakJapanese(card.word === card.reading ? card.word : card.reading)}
              disabled={!isTtsSupported()}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-600 transition-transform hover:scale-105 disabled:opacity-40"
              aria-label={`Nghe phát âm ${card.romaji}`}
              title="Nghe phát âm (giọng Nhật)"
            >
              <Volume2 size={22} />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoSpeak((current) => !current)}
                aria-pressed={autoSpeak}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black shadow-sm transition-colors',
                  autoSpeak ? 'border-orange-200 bg-orange-500 text-white' : 'border-orange-200 bg-white text-orange-600 hover:bg-orange-50',
                )}
                title="Tự động đọc từ khi hiện thẻ"
              >
                <Sparkles size={15} />
                Tự đọc
              </button>
              <div className="hidden rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-2 text-[10px] font-bold text-gray-400 md:block">
                Space lật · 1-4 chấm · U hoàn tác
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRevealed((current) => !current)}
            className="group block w-full rounded-[2.25rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f8f4ee]"
            aria-pressed={isRevealed}
            aria-label={isRevealed ? 'Ẩn nghĩa và quay lại mặt trước' : 'Lật thẻ để xem nghĩa'}
          >
            <motion.div
              key={`${card.id}-${isRevealed ? 'back' : 'front'}`}
              initial={{ opacity: 0, rotateY: isRevealed ? -10 : 10, y: 10 }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'min-h-[24rem] rounded-[2.25rem] border p-6 shadow-[0_32px_80px_-54px_rgba(96,70,42,0.42)] transition-transform group-hover:-translate-y-0.5 md:min-h-[27rem] md:p-8',
                isRevealed ? 'border-emerald-200 bg-emerald-50/80' : 'border-[#e6ddd1] bg-[#fffaf3]',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate rounded-full border border-[#eadfd2] bg-white/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8796]">{card.level}</span>
                  {topic && (
                    <span className="hidden truncate rounded-full bg-orange-100/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 sm:block">
                      {topic.label}
                    </span>
                  )}
                </div>
                <span className={cn('shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]', isRevealed ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700')}>
                  {isRevealed ? 'Mặt sau' : 'Mặt trước'}
                </span>
              </div>

              {!isRevealed ? (
                <div className="flex min-h-[17rem] flex-col items-center justify-center text-center md:min-h-[19rem]">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Tự nhớ nghĩa trước</p>
                  <h2 lang="ja" className="mt-5 max-w-full break-words text-center text-5xl font-black tracking-tight text-gray-900 md:text-7xl">
                    {card.word}
                  </h2>
                  {card.reading !== card.word && (
                    <p lang="ja" className="mt-3 text-xl font-bold text-gray-500 md:text-2xl">{card.reading}</p>
                  )}
                  <p className="mt-2 text-base font-bold italic text-orange-500/90 md:text-lg">{card.romaji}</p>
                  <p className="mt-6 text-sm font-bold text-[#5f6b7c]">Bấm vào thẻ để xem đáp án</p>
                </div>
              ) : (
                <div className="flex min-h-[17rem] flex-col justify-center text-center md:min-h-[19rem]">
                  <div className="flex items-center justify-center gap-3">
                    <span lang="ja" className="text-2xl font-black text-gray-800 md:text-3xl">{card.word}</span>
                    <span className="text-sm font-bold italic text-gray-400">{card.romaji}</span>
                  </div>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Nghĩa</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">{card.meaning}</h2>
                  <div className="mx-auto mt-6 w-full max-w-lg rounded-[1.5rem] border border-emerald-100 bg-white/72 p-4 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Ví dụ</p>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          speakJapanese(card.exampleJp, 0.8);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.stopPropagation();
                            speakJapanese(card.exampleJp, 0.8);
                          }
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 transition-transform hover:scale-105"
                        aria-label="Nghe câu ví dụ"
                      >
                        <Volume2 size={15} />
                      </span>
                    </div>
                    <p lang="ja" className="mt-2 text-base font-bold leading-relaxed text-gray-800 md:text-lg">{card.exampleJp}</p>
                    <p className="mt-1 text-xs font-medium italic text-gray-400">{card.exampleRomaji}</p>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[#4d5a6b]">{card.exampleVi}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </button>

          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3]/92 p-3 shadow-[0_18px_44px_-36px_rgba(96,70,42,0.22)]"
              >
                <p className="px-1 pb-3 text-center text-xs font-black text-[#5f6b7c]">Anh nhớ từ này ở mức nào?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.rating}
                      onClick={() => handleRate(option.rating)}
                      className={cn('min-h-14 rounded-2xl border px-3 py-2 text-sm font-black transition-transform hover:scale-[1.02]', option.className)}
                    >
                      <span className="block">{option.label}</span>
                      <span className="mt-0.5 block text-[10px] font-bold opacity-70">{intervals[option.rating]}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

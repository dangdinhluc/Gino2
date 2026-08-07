import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

interface RatingOption {
  rating: SrsRating;
  label: string;
  key: string;
  className: string;
}

const ratingOptions: RatingOption[] = [
  { rating: 'again', label: 'Quên', key: '1', className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' },
  { rating: 'hard', label: 'Khó', key: '2', className: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' },
  { rating: 'good', label: 'Nhớ', key: '3', className: 'border-orange-200 bg-orange-50 text-[#d83a00] hover:bg-orange-100' },
  { rating: 'easy', label: 'Rất nhớ', key: '4', className: 'border-emerald-200 bg-emerald-50 text-[#059669] hover:bg-emerald-100' },
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

  const remaining = queue.length;
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
      setIndex((current) => Math.min(current, Math.max(0, nextQueue.length - 1)));
      setCounts((current) => ({ ...current, [rating]: current[rating] + 1 }));
      setSessionXp((current) => current + xpForRating(rating));
      if (removed) setRemovedCount((current) => current + 1);
      setIsRevealed(false);
    },
    [counts, currentCardId, index, isRevealed, queue, rate, removedCount, sessionXp],
  );

  const moveToCard = useCallback((direction: -1 | 1) => {
    const next = Math.min(Math.max(index + direction, 0), queue.length - 1);
    if (next === index) return;
    stopSpeaking();
    setIndex(next);
    setIsRevealed(false);
  }, [index, queue.length]);

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
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-center justify-center p-4 pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full rounded-[28px] border border-[#fde6d2] bg-white p-6 sm:p-8 text-center shadow-2xl space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669] border border-emerald-200">
            <CheckCircle2 size={36} />
          </div>
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-[#059669] border border-emerald-200">
            SẠCH HÀNG ĐỢI
          </span>
          <h1 className="font-[var(--font-heading)] text-2xl font-black text-[#0f172a] sm:text-3xl">
            {mode === 'new' ? 'Hôm nay đã đủ thẻ mới 🎉' : 'Không còn thẻ tới hạn 🎉'}
          </h1>
          <p className="mx-auto max-w-md text-xs font-semibold leading-relaxed text-[#5f6b7c]">
            {mode === 'new'
              ? 'Anh đã học đủ số thẻ mới cho hôm nay. Muốn học thêm thì tăng giới hạn trong Review Center.'
              : 'Bộ nhớ đang được nghỉ đúng lịch SRS. Anh có thể luyện nhanh hoặc học thêm từ mới.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/app/review/flashcards?mode=cram" className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 text-xs font-black text-[#d83a00]">
              <Zap size={15} /> Luyện nhanh 20 thẻ
            </Link>
            <Link to="/app/practice" className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-6 text-xs font-black text-white shadow-xs">
              Về Trang Ôn Tập
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  if (isComplete) {
    const sessionRetention = totalRated > 0 ? Math.round(((totalRated - counts.again) / totalRated) * 100) : 0;
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-center justify-center p-4 pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full rounded-[28px] border border-[#fde6d2] bg-white p-6 sm:p-8 text-center shadow-2xl space-y-5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00] border border-orange-200">
            <Trophy size={36} />
          </div>
          <div>
            <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase text-[#d83a00] border border-orange-200">
              HOÀN THÀNH PHIÊN ÔN
            </span>
            <h1 className="mt-1.5 font-[var(--font-heading)] text-2xl font-black text-[#0f172a] sm:text-3xl">Tuyệt vời! 🎉</h1>
            <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">
              {totalRated} lượt chấm · Nhớ {sessionRetention}% · Lịch SRS từng thẻ đã cập nhật
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {ratingOptions.map((option) => (
              <div key={option.rating} className={cn('rounded-2xl border p-2.5 text-center', option.className.split(' hover:')[0])}>
                <div className="text-[10px] font-black uppercase">{option.label}</div>
                <div className="mt-1 font-[var(--font-heading)] text-lg font-black">{counts[option.rating]}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-orange-200/80 bg-orange-50/60 p-3 text-center">
              <div className="text-[10px] font-black uppercase text-[#d83a00]">XP nhận được</div>
              <div className="mt-1 font-[var(--font-heading)] text-lg font-black text-[#d83a00]">+{sessionXp}</div>
            </div>
            <div className="rounded-2xl border border-[#f5ece1] bg-white p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase text-[#717d8f]">
                <Flame size={12} className="text-[#d83a00]" /> Streak
              </div>
              <div className="mt-1 font-[var(--font-heading)] text-lg font-black text-[#0f172a]">{streak} ngày</div>
            </div>
            <div className="rounded-2xl border border-[#f5ece1] bg-white p-3 text-center">
              <div className="text-[10px] font-black uppercase text-[#717d8f]">Đã ôn</div>
              <div className="mt-1 font-[var(--font-heading)] text-lg font-black text-[#0f172a]">{removedCount} thẻ</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => resetSession(mode)}
              className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 text-xs font-black text-[#d83a00]"
            >
              <RotateCcw size={15} /> Ôn tiếp
            </button>
            <Link to="/app/practice" className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-6 text-xs font-black text-white shadow-xs">
              Về Trang Ôn Tập
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto max-w-xl space-y-4 px-3.5 pb-28 sm:px-4">
      {/* 1. Top Header Control Bar */}
      <header className="sticky top-0 z-40 rounded-[24px] border border-[#f5ece1] bg-white/95 p-3.5 backdrop-blur-md shadow-2xs space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/app/practice"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#eee3d5] bg-slate-50 text-[#5f6b7c] hover:bg-slate-100 hover:text-[#0f172a] active:scale-95 transition-all"
            aria-label="Thoát phiên học"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#d83a00]">FLASHCARD SRS</div>
            <h1 className="font-[var(--font-heading)] text-sm font-black text-[#0f172a] truncate">
              {modeTitle(mode)}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!undoSnapshot}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[#eee3d5] bg-slate-50 text-[#5f6b7c] hover:bg-slate-100 hover:text-[#0f172a] disabled:opacity-30 active:scale-95 transition-all"
              title="Hoàn tác lần lật trước (U)"
            >
              <Undo2 size={16} />
            </button>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#d83a00] border border-orange-200/60">
              {remaining} thẻ còn lại
            </span>
          </div>
        </div>

        {/* Progress Scrubber */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee3d5] p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#d83a00] via-[#f26522] to-[#ff8c42]"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* 2. Top Controls (TTS Speak & Auto-speak Toggle) */}
      <div className="flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={() => speakJapanese(card.word === card.reading ? card.word : card.reading)}
          disabled={!isTtsSupported()}
          className="flex h-9 items-center gap-1.5 rounded-2xl border border-orange-200/60 bg-orange-50 px-3.5 text-xs font-extrabold text-[#d83a00] shadow-2xs hover:bg-orange-100 active:scale-95 transition-all disabled:opacity-40"
        >
          <Volume2 size={16} />
          <span>Nghe phát âm</span>
        </button>

        <button
          type="button"
          onClick={() => setAutoSpeak((current) => !current)}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-2xl border px-3.5 text-xs font-extrabold shadow-2xs transition-all active:scale-95',
            autoSpeak
              ? 'border-[#d83a00] bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white'
              : 'border-[#eee3d5] bg-white text-[#5f6b7c] hover:bg-slate-50'
          )}
        >
          <Sparkles size={14} className={autoSpeak ? 'text-amber-300 fill-amber-200' : 'text-[#717d8f]'} />
          <span>Tự đọc</span>
        </button>
      </div>

      {/* 3. Main 3D Flip Card Stage */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsRevealed((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsRevealed((current) => !current);
          }
        }}
        className="group block w-full cursor-pointer rounded-[28px] text-left focus:outline-none"
      >
        <div style={{ perspective: '1200px' }}>
          <motion.div
            animate={{ rotateY: isRevealed ? 180 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative min-h-[22rem] sm:min-h-[24rem]"
          >
            {/* FRONT SIDE (Mặt trước - Câu hỏi) */}
            <div
              aria-hidden={isRevealed}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              className="absolute inset-0 rounded-[28px] border border-[#fde6d2] bg-gradient-to-b from-[#fffbf7] via-[#fff8f2] to-[#ffeedd] p-6 sm:p-8 shadow-[0_10px_30px_rgba(217,74,19,0.06)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-orange-100/80 px-3 py-1 text-[10px] font-black uppercase text-[#c2410c] border border-orange-200/60">
                  {card.level} · {topic ? topic.label : 'Tokutei Core'}
                </span>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase text-[#d83a00] border border-orange-200/60">
                  CÂU HỎI
                </span>
              </div>

              <div className="py-6 text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c2410c]">TỰ NHỚ NGHĨA TRƯỚC</p>
                <h2 lang="ja" className="font-[var(--font-heading)] text-4xl sm:text-6xl font-black text-[#0f172a] break-words">
                  {card.word}
                </h2>
                {card.reading !== card.word && (
                  <p lang="ja" className="text-lg sm:text-xl font-black text-[#d83a00]">
                    {card.reading}
                  </p>
                )}
                <p className="text-xs font-extrabold italic text-[#717d8f]">{card.romaji}</p>
              </div>

              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-4 py-1.5 text-xs font-extrabold text-[#d83a00] shadow-2xs">
                  <span>👆 Lật thẻ để xem đáp án</span>
                  <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-black">Space</span>
                </span>
              </div>
            </div>

            {/* BACK SIDE (Mặt sau - Đáp án) */}
            <div
              aria-hidden={!isRevealed}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              className="absolute inset-0 rounded-[28px] border border-emerald-200 bg-gradient-to-b from-[#f0fdf4] via-[#ecfdf5] to-[#e6f4ea] p-6 sm:p-8 shadow-[0_10px_30px_rgba(5,150,105,0.06)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-[#059669] border border-emerald-200">
                  {card.level}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-[#059669] border border-emerald-200">
                  ĐÁP ÁN
                </span>
              </div>

              <div className="py-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span lang="ja" className="font-[var(--font-heading)] text-xl sm:text-2xl font-black text-[#0f172a]">
                    {card.word}
                  </span>
                  <span className="text-xs font-semibold italic text-[#717d8f]">({card.romaji})</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#059669]">NGHĨA TỪ VỰNG</p>
                <h2 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-black text-[#059669]">
                  {card.meaning}
                </h2>
              </div>

              {/* Example Box */}
              <div className="rounded-2xl border border-emerald-200/80 bg-white p-3.5 text-left space-y-1">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#059669]">
                  <span>Ví dụ sử dụng:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(card.exampleJp);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-[#059669] hover:bg-emerald-100"
                    title="Nghe ví dụ"
                  >
                    <Volume2 size={13} />
                  </button>
                </div>
                <p lang="ja" className="text-sm font-extrabold text-[#0f172a] leading-relaxed">
                  {card.exampleJp}
                </p>
                <p className="text-[11px] font-bold text-[#059669]">
                  {card.exampleVi}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Bottom Rating Dock & Navigation Controls */}
      <div className="space-y-3 pt-1">
        {/* Rating Prompt & Buttons */}
        <AnimatePresence mode="wait">
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-2 rounded-[24px] border border-[#f5ece1] bg-white p-3.5 shadow-2xs"
            >
              <div className="text-center text-xs font-black uppercase tracking-wider text-[#d83a00]">
                🧠 CHẤM MỨC ĐỘ GHI NHỚ
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {ratingOptions.map((option) => (
                  <button
                    key={option.rating}
                    type="button"
                    onClick={() => handleRate(option.rating)}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all duration-200 active:scale-95',
                      option.className
                    )}
                  >
                    <span className="font-black text-xs">{option.label}</span>
                    <span className="text-[10px] font-bold opacity-80 mt-0.5">{intervals[option.rating]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prev / Next Navigation Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => moveToCard(-1)}
            disabled={index === 0}
            className="flex h-10 items-center gap-1 rounded-2xl border border-[#eee3d5] bg-white px-4 text-xs font-black text-[#0f172a] shadow-2xs hover:bg-slate-50 disabled:opacity-30 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
            <span>Thẻ trước</span>
          </button>

          <span className="text-xs font-black text-[#717d8f]">
            {index + 1} / {queue.length}
          </span>

          <button
            type="button"
            onClick={() => moveToCard(1)}
            disabled={index >= queue.length - 1}
            className="flex h-10 items-center gap-1 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-xs font-black text-white shadow-xs hover:brightness-110 disabled:opacity-30 active:scale-95 transition-all"
          >
            <span>Thẻ tiếp</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

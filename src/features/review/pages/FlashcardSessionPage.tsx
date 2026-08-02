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
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

interface RatingOption {
  rating: SrsRating;
  label: string;
  key: string;
  className: string;
}

// Thang danh gia giu semantic (do -> emerald), bo mau blue de dong bo he cam
const ratingOptions: RatingOption[] = [
  { rating: 'again', label: 'Quên', key: '1', className: 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' },
  { rating: 'hard', label: 'Khó', key: '2', className: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { rating: 'good', label: 'Nhớ', key: '3', className: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { rating: 'easy', label: 'Rất nhớ', key: '4', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
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
  const isFocusMode = searchParams.get('focus') === '1';

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
          className="w-full rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-7 text-center md:p-10"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={40} strokeWidth={1.8} />
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">Sạch hàng đợi</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">
            {mode === 'new' ? 'Hôm nay đã đủ thẻ mới' : 'Không còn thẻ tới hạn'}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#5f6b7c]">
            {mode === 'new'
              ? 'Anh đã học đủ số thẻ mới cho hôm nay. Muốn học thêm thì tăng giới hạn trong Review Center.'
              : 'Bộ nhớ đang được nghỉ đúng lịch. Anh có thể luyện nhanh hoặc học thêm từ mới.'}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/app/review/flashcards?mode=cram" className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-6 py-3 text-sm font-bold text-orange-700 transition-colors hover:bg-[#f6efe6] ${focusRing}`}>
            <Zap size={16} /> Luyện nhanh 20 thẻ
            </Link>
            <Link to="/app/review/flashcards?mode=new" className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-6 py-3 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
              <BookOpen size={16} /> Học từ mới
            </Link>
            <Link to="/app/review" className={`rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}>
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
          className="w-full rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-7 text-center md:p-10"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
            <Trophy size={40} strokeWidth={1.8} />
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">Hoàn thành phiên ôn</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-5xl">Tuyệt vời!</h1>
          <p className="mt-2 text-sm font-medium text-[#5f6b7c]">
            {totalRated} lượt chấm · nhớ {sessionRetention}% · lịch ôn từng thẻ đã được cập nhật
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ratingOptions.map((option) => (
              <div key={option.rating} className={cn('rounded-xl border px-4 py-4', option.className.split(' hover:')[0])}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-75">{option.label}</div>
                <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{counts[option.rating]}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">XP nhận được</div>
              <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-orange-700">+{sessionXp}</div>
            </div>
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-4">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b8796]">
                <Flame size={12} className="text-orange-700" strokeWidth={1.8} /> Streak
              </div>
              <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{streak} ngày</div>
            </div>
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b8796]">Đã ôn</div>
              <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{removedCount} thẻ</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => resetSession(mode)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-6 py-3 text-sm font-bold text-orange-700 transition-colors hover:bg-[#f6efe6] ${focusRing}`}
            >
              <RotateCcw size={16} /> Ôn tiếp
            </button>
            <Link to="/app/review/flashcards?mode=new" className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-6 py-3 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
              <BookOpen size={16} /> Học từ mới
            </Link>
            <Link to="/app/review" className={`rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}>
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
      <section className={cn(
        'z-40 border-[#e8dccb] bg-[#f7f1e8]/92 px-4 py-3 backdrop-blur-md',
        isFocusMode ? 'sticky top-0 -mx-4 border-b md:mx-0 md:rounded-2xl md:border md:bg-[#fffaf3] md:p-4' : 'sticky top-0 -mx-4 border-b md:static md:mx-0 md:rounded-2xl md:border md:bg-[#fffaf3] md:p-4',
      )}>
        <div className="flex items-center justify-between gap-3">
          <Link to="/app/review" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Flashcard SRS</p>
            <h1 className="truncate font-[var(--font-heading)] text-base font-bold tracking-[-0.02em] text-[#172033] md:text-xl">{modeTitle(mode)}</h1>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            disabled={!undoSnapshot}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-orange-700 disabled:opacity-35 ${focusRing}`}
            title="Hoàn tác lần chấm trước (U)"
            aria-label="Hoàn tác lần chấm trước"
          >
            <Undo2 size={18} />
          </button>
          <div className="shrink-0 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800" aria-label={`${remaining} thẻ còn lại`}>
            {remaining} thẻ còn lại
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
          <motion.div className="h-full rounded-full bg-orange-700" animate={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="mx-auto max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => speakJapanese(card.word === card.reading ? card.word : card.reading)}
              disabled={!isTtsSupported()}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-40"
              aria-label={`Nghe phát âm ${card.romaji}`}
              title="Nghe phát âm (giọng Nhật)"
            >
              <Volume2 size={22} strokeWidth={1.8} />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoSpeak((current) => !current)}
                aria-pressed={autoSpeak}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-colors',
                  autoSpeak ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffdf8] text-orange-700 hover:bg-[#f6efe6]',
                )}
                title="Tự động đọc từ khi hiện thẻ"
              >
                <Sparkles size={15} />
                Tự đọc
              </button>
              <div className="hidden rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2 text-[10px] font-bold text-[#95a0af] md:block">
                Space lật · 1-4 chấm · U hoàn tác
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRevealed((current) => !current)}
            className={`group block w-full rounded-2xl text-left ${focusRing}`}
            aria-pressed={isRevealed}
            aria-label={isRevealed ? 'Ẩn nghĩa và quay lại mặt trước' : 'Lật thẻ để xem nghĩa'}
          >
            <motion.div
              key={`${card.id}-${isRevealed ? 'back' : 'front'}`}
              initial={{ opacity: 0, rotateY: isRevealed ? -10 : 10, y: 10 }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'min-h-[24rem] rounded-2xl border p-6 transition-transform group-hover:-translate-y-0.5 md:min-h-[27rem] md:p-8',
                isRevealed ? 'border-emerald-200 bg-emerald-50/60' : 'border-[#e8dccb] bg-[#fffaf3]',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate rounded-md border border-[#e8dccb] bg-[#fffdf8] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b8796]">{card.level}</span>
                  {topic && (
                    <span className="hidden truncate rounded-md bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700 sm:block">
                      {topic.label}
                    </span>
                  )}
                </div>
                <span className={cn('shrink-0 rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]', isRevealed ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800')}>
                  {isRevealed ? 'Đáp án' : 'Câu hỏi'}
                </span>
              </div>

              {!isRevealed ? (
                <div className="flex min-h-[17rem] flex-col items-center justify-center text-center md:min-h-[19rem]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">Tự nhớ nghĩa trước</p>
                  <h2 lang="ja" className="mt-5 max-w-full break-words text-center font-[var(--font-heading)] text-5xl font-bold tracking-[-0.02em] text-[#172033] md:text-7xl">
                    {card.word}
                  </h2>
                  {card.reading !== card.word && (
                    <p lang="ja" className="mt-3 text-xl font-bold text-[#5f6b7c] md:text-2xl">{card.reading}</p>
                  )}
                  <p className="mt-2 text-base font-bold italic text-orange-700/90 md:text-lg">{card.romaji}</p>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800 shadow-sm">
                    Xem đáp án <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px]">Space</span>
                  </span>
                </div>
              ) : (
                <div className="flex min-h-[17rem] flex-col justify-center text-center md:min-h-[19rem]">
                  <div className="flex items-center justify-center gap-3">
                    <span lang="ja" className="font-[var(--font-heading)] text-2xl font-bold text-[#172033] md:text-3xl">{card.word}</span>
                    <span className="text-sm font-bold italic text-[#95a0af]">{card.romaji}</span>
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Nghĩa</p>
                  <h2 className="mt-2 font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">{card.meaning}</h2>
                  <div className="mx-auto mt-6 w-full max-w-lg rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Ví dụ</p>
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dccb] bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100"
                        aria-label="Nghe câu ví dụ"
                      >
                        <Volume2 size={15} />
                      </span>
                    </div>
                    <p lang="ja" className="mt-2 text-base font-bold leading-relaxed text-[#172033] md:text-lg">{card.exampleJp}</p>
                    <p className="mt-1 text-xs font-medium italic text-[#95a0af]">{card.exampleRomaji}</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-[#4d5a6b]">{card.exampleVi}</p>
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
                className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-3"
              >
                <p className="px-1 pb-3 text-center text-xs font-bold text-[#5f6b7c]">Anh nhớ từ này ở mức nào?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.rating}
                      onClick={() => handleRate(option.rating)}
                      className={cn('min-h-14 rounded-xl border px-3 py-2 text-sm font-bold transition-transform hover:scale-[1.02]', option.className)}
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

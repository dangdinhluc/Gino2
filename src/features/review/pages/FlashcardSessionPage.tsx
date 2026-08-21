import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Flame, RotateCcw, Timer, Trophy, Volume2 } from 'lucide-react';
import {
  getDueVocabularyCards,
  submitVocabularyRating,
  type DueVocabularyCard,
  type VocabularyRating,
} from '@/src/features/courses/repositories/learningProgressRepository';
import { cn, vibrate } from '@/src/lib/utils';
import { Confetti } from '@/src/shared/components/Confetti';

type SessionMode = 'due' | 'new' | 'cram';
type RatingCounts = Record<VocabularyRating, number>;

const DEFAULT_SESSION_MINUTES = 3;

const ratingOptions: Array<{ rating: VocabularyRating; label: string; className: string; haptic: number[] }> = [
  { rating: 'again', label: 'Quên', className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100', haptic: [30] },
  { rating: 'hard', label: 'Khó', className: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100', haptic: [20, 40, 20] },
  { rating: 'good', label: 'Nhớ', className: 'border-orange-200 bg-orange-50 text-[#d83a00] hover:bg-orange-100', haptic: [20, 40, 60] },
  { rating: 'easy', label: 'Rất nhớ', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100', haptic: [40, 60, 40] },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const emptyCounts: RatingCounts = { again: 0, hard: 0, good: 0, easy: 0 };

function parseMode(raw: string | null): SessionMode {
  return raw === 'new' || raw === 'cram' ? raw : 'due';
}

function modeTitle(mode: SessionMode): string {
  if (mode === 'new') return 'Học từ mới';
  if (mode === 'cram') return 'Luyện nhanh';
  return 'Thẻ tới hạn';
}

function cardsForMode(cards: DueVocabularyCard[], mode: SessionMode): DueVocabularyCard[] {
  if (mode === 'new') return cards.filter((card) => card.status === 'new');
  if (mode === 'cram') return cards.slice(0, 20);
  return cards.filter((card) => card.status !== 'new');
}

function speakJapanese(card: DueVocabularyCard) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(card.reading || card.term);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}

export default function FlashcardSession() {
  const [searchParams] = useSearchParams();
  const mode = parseMode(searchParams.get('mode'));
  const requestedMinutes = Number(searchParams.get('duration'));
  const sessionMinutes = requestedMinutes === 5 ? 5 : DEFAULT_SESSION_MINUTES;
  const sessionSeconds = sessionMinutes * 60;
  const [cards, setCards] = useState<DueVocabularyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [counts, setCounts] = useState<RatingCounts>(emptyCounts);
  const [secondsLeft, setSecondsLeft] = useState(sessionSeconds);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [rewardStats, setRewardStats] = useState<LearnerStatsSnapshot | null>(null);
  const sessionStorageKey = `gino-flashcard-session-${mode}-${sessionMinutes}`;

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setIndex(0);
    setIsRevealed(false);
    setCounts(emptyCounts);
    setSecondsLeft(sessionSeconds);
    setSessionExpired(false);
    setRewardStats(null);
    try {
      const nextCards = cardsForMode(await getDueVocabularyCards(100), mode);
      setCards(nextCards);
      try {
        const saved = JSON.parse(window.sessionStorage.getItem(sessionStorageKey) ?? 'null') as { secondsLeft?: number; counts?: RatingCounts } | null;
        if (saved?.secondsLeft && saved.secondsLeft > 0 && saved.secondsLeft < sessionSeconds) setSecondsLeft(saved.secondsLeft);
        if (saved?.counts) setCounts({ ...emptyCounts, ...saved.counts });
      } catch {
        window.sessionStorage.removeItem(sessionStorageKey);
      }
    } catch (error) {
      setCards([]);
      setLoadError(error instanceof Error ? error.message : 'Không tải được thẻ ôn tập.');
    } finally {
      setIsLoading(false);
    }
  }, [mode, sessionSeconds, sessionStorageKey]);

  useEffect(() => {
    void loadCards();
    return () => window.speechSynthesis?.cancel();
  }, [loadCards]);

  // Micro-session timer: hết giờ thì chốt phiên, không tự submit thẻ chưa đánh giá.
  useEffect(() => {
    if (sessionExpired || secondsLeft <= 0) return undefined;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setSessionExpired(true);
          setCards([]);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [secondsLeft, sessionExpired]);

  const currentCard = cards[index] ?? null;
  const totalRated = counts.again + counts.hard + counts.good + counts.easy;
  const progress = totalRated + cards.length > 0 ? Math.round((totalRated / (totalRated + cards.length)) * 100) : 0;

  useEffect(() => {
    if (isLoading || sessionExpired || totalRated === 0) return;
    window.sessionStorage.setItem(sessionStorageKey, JSON.stringify({ secondsLeft, counts }));
  }, [counts, isLoading, secondsLeft, sessionExpired, sessionStorageKey, totalRated]);

  useEffect(() => {
    if (sessionExpired || (cards.length === 0 && totalRated > 0)) window.sessionStorage.removeItem(sessionStorageKey);
  }, [cards.length, sessionExpired, sessionStorageKey, totalRated]);

  useEffect(() => {
    if (sessionExpired) vibrate([60, 40, 60]);
  }, [sessionExpired]);

  useEffect(() => {
    if (currentCard || totalRated === 0 || rewardStats) return;
    void fetchLearnerStats().then(setRewardStats).catch(() => undefined);
  }, [currentCard, rewardStats, totalRated]);

  const rateCard = async (rating: VocabularyRating) => {
    if (!currentCard || !isRevealed || isSaving) return;
    setIsSaving(true);
    setLoadError(null);
    try {
      vibrate(ratingOptions.find((option) => option.rating === rating)?.haptic ?? [20]);
      await submitVocabularyRating(currentCard.id, rating);
      window.speechSynthesis?.cancel();
      setCounts((current) => ({ ...current, [rating]: current[rating] + 1 }));
      setCards((current) => current.filter((card) => card.id !== currentCard.id));
      setIndex(0);
      setIsRevealed(false);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không thể cập nhật lịch SRS.');
    } finally {
      setIsSaving(false);
    }
  };

  const summary = useMemo(() => `${totalRated} thẻ đã ghi nhận trong phiên này`, [totalRated]);
  const rememberedCount = counts.good + counts.easy;
  const revisitedCount = counts.again + counts.hard;
  const sessionXp = totalRated * 10;

  if (isLoading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 text-sm font-bold text-[#5f6b7c]">Đang tải thẻ từ Supabase Cloud…</div>;
  }

  if (loadError && !currentCard) {
    return (
      <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="font-[var(--font-heading)] text-2xl font-black text-red-800">Không tải được phiên ôn</h1>
        <p className="mt-2 text-sm text-red-700">{loadError}</p>
        <button type="button" onClick={() => void loadCards()} className="mt-5 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Thử lại</button>
      </section>
    );
  }

  if (!currentCard) {
    return (
      <section className="relative mx-auto mt-8 max-w-xl overflow-hidden rounded-3xl border border-[#e8dccb] bg-white p-7 text-center shadow-sm">
        {totalRated > 0 && <Confetti />}
        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={30} /></div>
          <h1 className="mt-4 font-[var(--font-heading)] text-2xl font-black text-[#172033]">{totalRated ? (sessionExpired ? 'Hết giờ — vẫn giữ thành quả 🎉' : 'Hoàn thành phiên ôn 🎉') : 'Chưa có thẻ phù hợp'}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5f6b7c]">{totalRated ? `${summary}${sessionExpired ? ` · Phiên ${sessionMinutes} phút đã kết thúc.` : ''}` : 'Hệ thống chưa có thẻ đến hạn trong các khóa anh được ghi danh.'}</p>
          {totalRated > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
              <div className="grid max-w-sm grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <p className="text-2xl font-black text-emerald-700">{rememberedCount}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-emerald-800">Nhớ</p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5">
                  <p className="text-2xl font-black text-[#c2410c]">{revisitedCount}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-orange-800">Ôn lại</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="text-2xl font-black text-amber-700">+{sessionXp}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-amber-800">XP</p>
                </div>
              </div>
              {rewardStats && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-2 text-xs font-black text-[#c2410c]">
                  {rewardStats.currentStreak > 0 ? <Flame size={15} className="fill-orange-400 text-orange-500" /> : <Trophy size={15} />}
                  Chuỗi hiện tại: {rewardStats.currentStreak} ngày · Tổng XP: {rewardStats.totalXp}
                </div>
              )}
            </motion.div>
          )}
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={() => void loadCards()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-[#d83a00]"><RotateCcw size={15} /> Làm mới</button>
            <Link to="/app/practice" className="inline-flex items-center justify-center rounded-xl bg-[#d83a00] px-4 py-2 text-sm font-bold text-white">Về trung tâm ôn tập</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 px-3.5 pb-28 sm:px-4">
      <header className="sticky top-0 z-30 flex items-center gap-3 rounded-3xl border border-[#f5ece1] bg-white/95 p-3.5 shadow-sm backdrop-blur-md">
        <Link to="/app/practice" aria-label="Thoát phiên ôn" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee3d5] text-[#5f6b7c]"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#d83a00]">SRS · dữ liệu thật</p>
          <h1 className="truncate font-[var(--font-heading)] text-lg font-black text-[#172033]">{modeTitle(mode)}</h1>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#d83a00]">{totalRated + 1}/{totalRated + cards.length}</span>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black tabular-nums',
            secondsLeft === 0
              ? 'bg-emerald-50 text-emerald-700'
              : secondsLeft <= 30
                ? 'animate-pulse bg-red-50 text-red-600'
                : 'bg-[#fff7f0] text-[#c2410c]',
          )}
          role="timer"
          aria-live="off"
          title={`Phiên vi mô ${sessionMinutes} phút`}
        >
          <Timer size={13} />
          {secondsLeft === 0 ? 'Xong phiên' : formatTime(secondsLeft)}
        </span>
      </header>

      <div className="h-2 overflow-hidden rounded-full bg-[#efe5d7]"><div className="h-full rounded-full bg-[#d83a00] transition-all" style={{ width: `${progress}%` }} /></div>

      {secondsLeft === 0 && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          Phiên {sessionMinutes} phút đã xong — thẻ đã đánh giá vẫn giữ nguyên XP thật trong chuỗi! 🔥
        </p>
      )}

      <motion.section
        key={currentCard.id}
        drag={isRevealed && !isSaving ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (!isRevealed || isSaving) return;
          if (info.offset.x <= -80) void rateCard('hard');
          else if (info.offset.x >= 80) void rateCard('good');
        }}
        className="overflow-hidden rounded-[30px] border border-[#e8dccb] bg-white shadow-[0_14px_34px_rgba(217,74,19,0.08)]"
      >
        <div className="min-h-[290px] p-7 text-center sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#8c97a8]">{currentCard.status === 'new' ? 'Từ mới' : 'Ôn đúng lịch'}</p>
          <button type="button" onClick={() => speakJapanese(currentCard)} className="mx-auto mt-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]" aria-label="Nghe phát âm"><Volume2 size={22} /></button>
          <p lang="ja" className="mt-5 font-[var(--font-heading)] text-4xl font-black text-[#172033] sm:text-5xl">{currentCard.term}</p>
          {currentCard.reading && currentCard.reading !== currentCard.term && <p lang="ja" className="mt-2 text-lg font-semibold text-[#d83a00]">{currentCard.reading}</p>}
          {currentCard.pronunciation && <p className="mt-2 text-sm italic text-[#7b8796]">/{currentCard.pronunciation}/</p>}

          {isRevealed ? (
            <div className="mt-7 border-t border-[#f1e7dc] pt-6">
              <p className="text-2xl font-black text-[#172033]">{currentCard.translation}</p>
              {currentCard.exampleSentence && <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#5f6b7c]">{currentCard.exampleSentence}</p>}
              {currentCard.tags.length > 0 && <div className="mt-5 flex flex-wrap justify-center gap-2">{currentCard.tags.map((tag) => <span key={tag} className="rounded-full bg-[#fff7f0] px-2.5 py-1 text-xs font-bold text-[#c2410c]">{tag}</span>)}</div>}
            </div>
          ) : (
            <button type="button" onClick={() => setIsRevealed(true)} className="mt-9 rounded-xl bg-[#d83a00] px-5 py-3 text-sm font-black text-white">Hiện nghĩa và tự đánh giá</button>
          )}
        </div>
      </motion.section>

      {loadError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{loadError}</p>}

      {isRevealed ? (
        <>
          <p className="text-center text-[11px] font-bold text-[#95a0af]">Vuốt thẻ: ← Khó · Nhớ →</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ratingOptions.map((option) => (
              <motion.button
                key={option.rating}
                type="button"
                whileTap={{ scale: 0.94 }}
                disabled={isSaving}
                onClick={() => void rateCard(option.rating)}
                className={cn('min-h-12 rounded-xl border px-3 text-sm font-black disabled:opacity-50', option.className)}
              >
                {isSaving ? 'Đang lưu…' : option.label}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-[11px] font-bold text-[#95a0af]">Bấm thẻ để hiện nghĩa, sau đó vuốt hoặc chọn mức độ nhớ</p>
      )}
    </div>
  );
}

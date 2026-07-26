import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Lock, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GameShell } from '@/src/features/games/GameShell';
import { GameResult } from '@/src/features/games/GameResult';
import { useGameStore } from '@/src/features/games/gameStore';
import { getShuffledBuilderRounds } from '@/src/features/games/data/builderData';
import type { BuilderRound, LetterChip } from '@/src/features/games/types';

interface WordBuilderProps {
  rounds?: BuilderRound[];
  returnTo?: string;
  courseTitle?: string;
}

const ACCENT = '#F59E0B';
const MAX_HINTS_PER_ROUND = 2;
const ADVANCE_DELAY_MS = 700;

interface SlotEntry {
  /** chip đang nằm trong slot */
  chip: LetterChip | null;
  /** slot bị lock do hint reveal — không tap đẩy ra được */
  revealed: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

function makeEmptySlots(length: number): SlotEntry[] {
  return Array.from({ length }, () => ({ chip: null, revealed: false }));
}

export function WordBuilder({ rounds, returnTo, courseTitle }: WordBuilderProps) {
  const sessionRounds = useMemo(
    () => (rounds && rounds.length > 0 ? rounds : getShuffledBuilderRounds(8)),
    [rounds],
  );

  const store = useGameStore();
  const [ready, setReady] = useState(false);

  const round = sessionRounds[store.roundIndex] as BuilderRound | undefined;
  const wordLen = round?.data.word.length ?? 0;

  const [slots, setSlots] = useState<SlotEntry[]>([]);
  const [placedChipIds, setPlacedChipIds] = useState<Set<string>>(new Set());
  const [hintsThisRound, setHintsThisRound] = useState(0);
  const [usedHintInRound, setUsedHintInRound] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const reducedMotion = usePrefersReducedMotion();
  const advancingRef = useRef(false);

  useEffect(() => {
    store.startGame('word-builder', sessionRounds.length);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset board mỗi round
  useEffect(() => {
    if (!round) return;
    setSlots(makeEmptySlots(round.data.word.length));
    setPlacedChipIds(new Set());
    setHintsThisRound(0);
    setUsedHintInRound(false);
    setFeedbackState('idle');
    advancingRef.current = false;
  }, [round?.id]);

  if (!ready || !round) return null;

  if (store.status === 'complete') {
    return (
      <GameResult
        title="Word Builder"
        accent={ACCENT}
        score={store.score}
        maxCombo={store.maxCombo}
        correct={store.correct}
        total={Math.max(store.totalRounds, 1)}
        gameId="word-builder"
        wrongIds={store.wrongIds}
        returnTo={returnTo}
        returnLabel={returnTo && returnTo !== '/app/hub' ? 'Về khóa học' : 'Về Hub'}
        onRestart={() => {
          store.reset();
          setReady(false);
          setTimeout(() => {
            store.startGame('word-builder', sessionRounds.length);
            setReady(true);
          }, 0);
        }}
      />
    );
  }

  const isFull = slots.every((s) => s.chip !== null);
  const canSubmit = isFull && feedbackState !== 'correct';
  const canHint = hintsThisRound < MAX_HINTS_PER_ROUND && feedbackState !== 'correct';

  const handleTapLetter = (chip: LetterChip) => {
    if (feedbackState === 'correct') return;
    if (placedChipIds.has(chip.id)) return;

    // Tìm slot trống đầu tiên
    const targetIdx = slots.findIndex((s) => s.chip === null);
    if (targetIdx === -1) return;

    setSlots((prev) => {
      const next = [...prev];
      next[targetIdx] = { ...next[targetIdx], chip };
      return next;
    });
    setPlacedChipIds((prev) => new Set(prev).add(chip.id));
    if (feedbackState === 'wrong') setFeedbackState('idle');
  };

  const handleTapSlot = (index: number) => {
    if (feedbackState === 'correct') return;
    const slot = slots[index];
    if (!slot?.chip) return;
    if (slot.revealed) return; // hint slot — không cho tháo

    const chipId = slot.chip.id;
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { chip: null, revealed: false };
      return next;
    });
    setPlacedChipIds((prev) => {
      const next = new Set(prev);
      next.delete(chipId);
      return next;
    });
    if (feedbackState === 'wrong') setFeedbackState('idle');
  };

  const handleHint = () => {
    if (!canHint) return;

    const targetWord = round.data.word;
    // Tìm slot trống/sai đầu tiên
    let targetIdx = -1;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const expected = targetWord[i];
      if (!slot.chip || slot.chip.char !== expected) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx === -1) return; // tất cả đã đúng

    const expectedChar = targetWord[targetIdx];
    // Tìm chip đúng trong pool chưa dùng (hoặc đang dùng ở slot khác)
    const correctChip = round.data.letterPool.find(
      (chip) => chip.char === expectedChar && !slots.some((s) => s.revealed && s.chip?.id === chip.id),
    );
    if (!correctChip) return;

    // Build state mới trong 1 lượt
    const newPlaced = new Set(placedChipIds);
    const newSlots = [...slots];

    // Trả chip cũ về pool (nếu có chip sai ở slot)
    const oldChip = newSlots[targetIdx].chip;
    if (oldChip) newPlaced.delete(oldChip.id);
    // Nếu correctChip đang ở slot khác → nhả
    const otherSlotIdx = newSlots.findIndex((s, i) => i !== targetIdx && s.chip?.id === correctChip.id);
    if (otherSlotIdx !== -1) {
      newSlots[otherSlotIdx] = { chip: null, revealed: false };
    }

    newSlots[targetIdx] = { chip: correctChip, revealed: true };
    newPlaced.add(correctChip.id);

    setSlots(newSlots);
    setPlacedChipIds(newPlaced);
    setHintsThisRound((n) => n + 1);
    setUsedHintInRound(true);
    store.registerHint();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const guess = slots.map((s) => s.chip?.char ?? '').join('');
    const isCorrect = guess === round.data.word;

    if (isCorrect) {
      // Push SRS nếu có dùng hint (AC-WB-11) — KHÔNG reset combo
      if (usedHintInRound && round.data.sourceVocabId) {
        store.pushSrs(round.data.sourceVocabId);
      }
      store.answerCorrect();
      setFeedbackState('correct');
      if (!advancingRef.current) {
        advancingRef.current = true;
        window.setTimeout(() => store.nextRound(), ADVANCE_DELAY_MS);
      }
    } else {
      const wrongId = round.data.sourceVocabId || round.id;
      // Tránh push trùng SRS nếu user submit sai nhiều lần
      if (!store.wrongIds.includes(wrongId)) {
        store.answerWrong(wrongId);
      }
      setFeedbackState('wrong');
    }
  };

  const progress = ((store.roundIndex + 1) / Math.max(store.totalRounds, 1)) * 100;

  return (
    <GameShell
      title="Word Builder"
      accent={ACCENT}
      returnTo={returnTo}
      returnLabel={returnTo && returnTo !== '/app/hub' ? 'Khóa học' : 'Hub'}
      score={store.score}
      combo={store.combo}
      progress={progress}
      roundLabel={`${store.roundIndex + 1}/${store.totalRounds}`}
      feedback={store.feedback}
      onFeedbackDismiss={() => store.hideFeedback()}
    >
      <div className="flex flex-col gap-6">
        {/* Prompt */}
        <div className="text-center">
          {courseTitle && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/70">
              {courseTitle}
            </p>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/40">
            Xếp chữ thành cụm tiếng Nhật
          </p>
          <p className="mt-2 text-3xl font-black text-white">{round.data.meaning}</p>
        </div>

        {/* Slots */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2"
          animate={
            feedbackState === 'wrong' && !reducedMotion
              ? { x: [0, -6, 6, -6, 6, 0] }
              : reducedMotion && feedbackState === 'wrong'
                ? { opacity: [1, 0.5, 1] }
                : { x: 0 }
          }
          transition={{ duration: 0.4, ease: 'linear' }}
        >
          {slots.map((slot, idx) => {
            const isFilled = slot.chip !== null;
            const isRevealed = slot.revealed;
            const isCorrect = feedbackState === 'correct';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTapSlot(idx)}
                disabled={!isFilled || isRevealed || isCorrect}
                aria-label={isFilled ? `Slot ${idx + 1}: ${slot.chip?.char}` : `Slot ${idx + 1} trống`}
                className={cn(
                  'relative flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-black transition-all sm:h-16 sm:w-14',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1419]',
                  !isFilled
                    ? 'border-dashed border-[#3F4756] bg-transparent text-white/30'
                    : isRevealed
                      ? 'border-purple-400 bg-purple-500/15 text-purple-100'
                      : isCorrect
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                        : feedbackState === 'wrong'
                          ? 'border-red-500 bg-red-500/15 text-red-100'
                          : 'border-amber-400 bg-amber-500/15 text-amber-100',
                )}
              >
                {slot.chip?.char ?? ''}
                {isRevealed && (
                  <Lock size={10} className="absolute right-1 top-1 text-purple-300" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Letter Pool */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {round.data.letterPool.map((chip) => {
            const used = placedChipIds.has(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleTapLetter(chip)}
                disabled={used || feedbackState === 'correct'}
                aria-label={`Chữ ${chip.char}`}
                className={cn(
                  'relative flex h-12 w-11 items-center justify-center rounded-xl border-2 text-xl font-black transition-all sm:h-14 sm:w-12',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1419]',
                  used
                    ? 'border-white/5 bg-[#1A2332]/40 text-white/20'
                    : 'border-[#3F4756] bg-[#1A2332] text-white hover:border-amber-400/60 hover:bg-amber-500/10 active:scale-[0.95]',
                )}
              >
                {chip.char}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleHint}
            disabled={!canHint}
            aria-disabled={!canHint}
            className={cn(
              'flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-colors',
              canHint
                ? 'border-amber-400/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                : 'border-white/5 bg-[#1A2332]/40 text-white/30',
            )}
          >
            <Lightbulb size={16} />
            <span>Gợi ý</span>
            <span className="text-xs font-black opacity-70">−50pt</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black">
              {hintsThisRound}/{MAX_HINTS_PER_ROUND}
            </span>
          </button>

          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            animate={
              canSubmit && feedbackState === 'idle' && !reducedMotion
                ? { scale: [1, 1.03, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 1.4, repeat: canSubmit && feedbackState === 'idle' ? Infinity : 0 }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-colors',
              canSubmit
                ? 'bg-amber-500 text-gray-900 shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:bg-amber-400'
                : feedbackState === 'correct'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#1A2332] text-white/30',
            )}
          >
            <Check size={16} />
            {feedbackState === 'correct' ? 'Đúng rồi!' : 'Kiểm tra'}
          </motion.button>
        </div>

        <p className="text-center text-[11px] font-semibold text-white/40">
          {feedbackState === 'wrong'
            ? 'Sai rồi — sửa slot bằng cách tap chữ trong slot để trả về pool'
            : feedbackState === 'correct'
              ? 'Tuyệt vời! Đang sang vòng tiếp theo...'
              : 'Tap chữ để xếp vào slot · Tap slot để trả chữ về pool'}
        </p>
      </div>
    </GameShell>
  );
}

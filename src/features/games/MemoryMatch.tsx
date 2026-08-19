import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Timer } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GameShell } from '@/src/features/games/GameShell';
import { GameResult } from '@/src/features/games/GameResult';
import { useGameStore } from '@/src/features/games/gameStore';
import type { MemoryPair, MemoryRound } from '@/src/features/games/types';

interface MemoryMatchProps {
  courseId?: string;
  rounds?: MemoryRound[];
  returnTo?: string;
  courseTitle?: string;
}

interface MemoryCardItem {
  cardId: string;
  pairId: string;
  text: string;
  side: 'word' | 'meaning';
  sourceVocabId?: string;
}

const ACCENT = '#A855F7';
const MATCH_DELAY_MS = 600;
const MISS_DELAY_MS = 800;
const DEFAULT_TIME_LIMIT = 90;

function shuffleCards(pairs: MemoryPair[]): MemoryCardItem[] {
  const cards: MemoryCardItem[] = pairs.flatMap((pair) => [
    { cardId: `${pair.id}-w`, pairId: pair.id, text: pair.word, side: 'word', sourceVocabId: pair.sourceVocabId },
    { cardId: `${pair.id}-m`, pairId: pair.id, text: pair.meaning, side: 'meaning', sourceVocabId: pair.sourceVocabId },
  ]);
  return cards.sort(() => Math.random() - 0.5);
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
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

export function MemoryMatch({ courseId, rounds, returnTo, courseTitle }: MemoryMatchProps) {
  const sessionRounds = useMemo(() => rounds ?? [], [rounds]);
  const totalTimeSec = sessionRounds[0]?.data.timeLimitSec ?? DEFAULT_TIME_LIMIT;

  const store = useGameStore();
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<MemoryCardItem[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [missing, setMissing] = useState<[string, string] | null>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeSec);
  const [timedOut, setTimedOut] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const advancingRef = useRef(false);

  const round = sessionRounds[store.roundIndex] as MemoryRound | undefined;

  // Init session khi mount
  useEffect(() => {
    store.startGame('memory-match', sessionRounds.length);
    setTimeLeft(totalTimeSec);
    setTimedOut(false);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset board mỗi lần round thay đổi (timer KHÔNG reset)
  useEffect(() => {
    if (!round) return;
    setCards(shuffleCards(round.data.pairs));
    setFlipped([]);
    setMatched(new Set());
    setMissing(null);
    setLocked(false);
    advancingRef.current = false;
  }, [round?.id]);

  // Countdown timer (cross-round, pause khi complete/timedOut)
  useEffect(() => {
    if (!ready) return;
    if (store.status === 'complete' || timedOut) return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setTimedOut(true);
          store.completeGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [ready, store.status, timedOut]);

  if (!ready || !round) return null;

  if (store.status === 'complete') {
    return (
      <GameResult
        title={timedOut ? 'Memory Match · ⏰ Hết giờ' : 'Memory Match'}
        accent={ACCENT}
        score={store.score}
        maxCombo={store.maxCombo}
        correct={store.correct}
        total={Math.max(store.totalRounds, 1)}
        courseId={courseId}
        gameId="memory-match"
        returnTo={returnTo}
        returnLabel={returnTo && returnTo !== '/app/hub' ? 'Về khóa học' : 'Về Hub'}
        onRestart={() => {
          store.reset();
          setReady(false);
          setTimeLeft(totalTimeSec);
          setTimedOut(false);
          setTimeout(() => {
            store.startGame('memory-match', sessionRounds.length);
            setReady(true);
          }, 0);
        }}
      />
    );
  }

  const totalPairs = round.data.pairs.length;
  const progress = totalPairs > 0 ? (matched.size / totalPairs) * 100 : 0;
  const timerWarning = timeLeft < 15;

  const handleCardClick = (card: MemoryCardItem) => {
    if (locked) return;
    if (matched.has(card.pairId)) return;
    if (flipped.includes(card.cardId)) return;
    if (flipped.length >= 2) return;

    const nextFlipped = [...flipped, card.cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      const [firstId, secondId] = nextFlipped;
      const first = cards.find((c) => c.cardId === firstId);
      const second = cards.find((c) => c.cardId === secondId);

      if (first && second && first.pairId === second.pairId) {
        // Match
        store.answerCorrect();
        window.setTimeout(() => {
          setMatched((prev) => {
            const next = new Set(prev);
            next.add(first.pairId);
            // Round done?
            if (next.size === totalPairs && !advancingRef.current) {
              advancingRef.current = true;
              window.setTimeout(() => store.nextRound(), 250);
            }
            return next;
          });
          setFlipped([]);
          setLocked(false);
        }, MATCH_DELAY_MS);
      } else if (first && second) {
        // Miss
        const wrongId = first.sourceVocabId || first.pairId;
        store.answerWrong(wrongId);
        setMissing([firstId, secondId]);
        window.setTimeout(() => {
          setMissing(null);
          setFlipped([]);
          setLocked(false);
        }, MISS_DELAY_MS);
      }
    }
  };

  const gridColsClass = round.data.gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <GameShell
      title="Memory Match"
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
      <div className="flex flex-col gap-5">
        {/* Header context */}
        <div className="text-center">
          {courseTitle && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-300/70">
              {courseTitle}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-white/70">{round.prompt}</p>
        </div>

        {/* Timer bar */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-colors',
            timerWarning
              ? 'border-red-500/40 bg-red-500/10 text-red-200'
              : 'border-white/10 bg-[#1A2332] text-white/80',
          )}
          role="timer"
          aria-live="polite"
          aria-label={`Thời gian còn lại ${timeLeft} giây`}
        >
          <Timer size={16} className={timerWarning ? 'text-red-400' : 'text-purple-300'} />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: timerWarning ? '#EF4444' : ACCENT }}
              animate={{ width: `${(timeLeft / totalTimeSec) * 100}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.4, ease: 'linear' }}
            />
          </div>
          <motion.span
            className="text-xs font-black tabular-nums"
            animate={timerWarning && !reducedMotion ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={{ duration: 1, repeat: timerWarning ? Infinity : 0 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
        </div>

        {/* Grid */}
        <div className={cn('grid gap-2.5 sm:gap-3', gridColsClass)}>
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.cardId);
            const isMatched = matched.has(card.pairId);
            const isMissing = missing?.includes(card.cardId) ?? false;
            const showFront = isFlipped || isMatched;

            return (
              <motion.button
                key={card.cardId}
                type="button"
                onClick={() => handleCardClick(card)}
                disabled={isMatched || locked}
                aria-label={showFront ? card.text : 'Lá bài úp, nhấn để lật'}
                className={cn(
                  'relative flex aspect-[3/4] items-center justify-center rounded-2xl border-2 px-2 py-3 text-center text-xs font-black transition-colors sm:text-sm',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1419]',
                  isMatched
                    ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200 opacity-60'
                    : showFront
                      ? card.side === 'word'
                        ? 'border-purple-400/60 bg-[#1F1430] text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        : 'border-purple-300/40 bg-[#2A1B3D] text-purple-100'
                      : 'border-white/10 bg-gradient-to-br from-purple-700/40 to-purple-900/60 text-purple-200/30 hover:border-purple-400/40',
                )}
                animate={
                  reducedMotion
                    ? { opacity: showFront ? 1 : 0.85 }
                    : isMissing
                      ? { x: [0, -8, 8, -8, 8, 0] }
                      : isMatched
                        ? { scale: [1, 1.05, 1] }
                        : { scale: 1 }
                }
                transition={
                  isMissing
                    ? { duration: 0.4, ease: 'linear' }
                    : isMatched
                      ? { duration: 0.5, ease: 'easeOut' }
                      : { type: 'spring', stiffness: 300, damping: 25 }
                }
              >
                {showFront ? (
                  <span className="leading-tight">{card.text}</span>
                ) : (
                  <span className="text-2xl" aria-hidden="true">?</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="text-center text-[11px] font-semibold text-white/40">
          Lật 2 lá cùng cặp · Combo x{store.combo} · Đã ghép {matched.size}/{totalPairs}
        </p>
      </div>
    </GameShell>
  );
}

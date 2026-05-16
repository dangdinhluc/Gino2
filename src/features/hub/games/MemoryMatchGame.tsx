import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Brain, RotateCcw, Sparkles, Timer, Trophy } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { formatElapsed, readBestScore, shuffle, writeBestScore } from './gamePersistence';

interface MatchPair {
  id: string;
  jp: string;
  vi: string;
  hint: string;
}

interface MatchCard {
  id: string;
  pairId: string;
  text: string;
  side: 'jp' | 'vi';
  flipped: boolean;
  matched: boolean;
}

const PAIRS: MatchPair[] = [
  { id: 'p1', jp: 'aisatsu', vi: 'chào hỏi', hint: 'Câu chào đầu ca / đầu buổi.' },
  { id: 'p2', jp: 'anzen', vi: 'an toàn', hint: 'Từ chốt trong nội quy ca làm.' },
  { id: 'p3', jp: 'houkoku', vi: 'báo cáo', hint: 'Báo cáo công việc / sự cố cho quản lý.' },
  { id: 'p4', jp: 'kyukei', vi: 'giờ nghỉ', hint: 'Giờ nghỉ giải lao giữa ca.' },
  { id: 'p5', jp: 'tenchou', vi: 'quản lý cửa hàng', hint: 'Sếp trực tiếp tại cửa hàng.' },
  { id: 'p6', jp: 'zairyu', vi: 'cư trú', hint: 'Liên quan tới zairyu card / tư cách cư trú.' },
];

const FLIP_BACK_MS = 900;
const TICK_MS = 250;
const GAME_ID = 'tokutei-match';

function buildDeck(): MatchCard[] {
  const cards: MatchCard[] = [];
  PAIRS.forEach((pair) => {
    cards.push({ id: `${pair.id}-jp`, pairId: pair.id, text: pair.jp, side: 'jp', flipped: false, matched: false });
    cards.push({ id: `${pair.id}-vi`, pairId: pair.id, text: pair.vi, side: 'vi', flipped: false, matched: false });
  });
  return shuffle(cards);
}

function computeScore(moves: number, elapsedMs: number, matched: number): number {
  if (matched === 0) return 0;
  const base = 1200;
  const movePenalty = moves * 24;
  const timePenalty = Math.floor(elapsedMs / 1000) * 6;
  return Math.max(120, base - movePenalty - timePenalty);
}

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<MatchCard[]>(() => buildDeck());
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [locked, setLocked] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastHint, setLastHint] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(() => readBestScore(GAME_ID));
  const finishedRef = useRef(false);

  const isDone = matched === PAIRS.length;

  useEffect(() => {
    if (startedAt === null) return;
    if (isDone) return;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [startedAt, isDone]);

  useEffect(() => {
    if (!isDone) return;
    if (finishedRef.current) return;
    finishedRef.current = true;
    const score = computeScore(moves, elapsedMs, matched);
    setBestScore((current) => {
      const next = writeBestScore(GAME_ID, score);
      return current === null || next > current ? next : current;
    });
  }, [isDone, moves, elapsedMs, matched]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (locked) return;
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;
      if (card.matched || card.flipped) return;
      if (flippedIds.length === 2) return;

      if (startedAt === null) {
        setStartedAt(Date.now());
      }

      const nextCards = cards.map((c) => (c.id === cardId ? { ...c, flipped: true } : c));
      const nextFlipped = [...flippedIds, cardId];
      setCards(nextCards);
      setFlippedIds(nextFlipped);

      if (nextFlipped.length === 2) {
        setMoves((current) => current + 1);
        const [aId, bId] = nextFlipped;
        const a = nextCards.find((c) => c.id === aId);
        const b = nextCards.find((c) => c.id === bId);
        if (a && b && a.pairId === b.pairId) {
          const pair = PAIRS.find((p) => p.id === a.pairId);
          setLastHint(pair ? `${pair.jp} = ${pair.vi}: ${pair.hint}` : null);
          window.setTimeout(() => {
            setCards((cs) => cs.map((c) => (nextFlipped.includes(c.id) ? { ...c, matched: true } : c)));
            setMatched((current) => current + 1);
            setFlippedIds([]);
          }, 280);
        } else {
          setLocked(true);
          window.setTimeout(() => {
            setCards((cs) => cs.map((c) => (nextFlipped.includes(c.id) ? { ...c, flipped: false } : c)));
            setFlippedIds([]);
            setLocked(false);
          }, FLIP_BACK_MS);
        }
      }
    },
    [cards, flippedIds, locked, startedAt],
  );

  const handleRestart = () => {
    setCards(buildDeck());
    setFlippedIds([]);
    setMoves(0);
    setMatched(0);
    setLocked(false);
    setStartedAt(null);
    setElapsedMs(0);
    setLastHint(null);
    finishedRef.current = false;
  };

  const currentScore = useMemo(
    () => (isDone ? computeScore(moves, elapsedMs, matched) : 0),
    [isDone, moves, elapsedMs, matched],
  );

  if (isDone) {
    return (
      <MatchDoneCard
        score={currentScore}
        bestScore={bestScore}
        moves={moves}
        elapsed={formatElapsed(elapsedMs)}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-600 to-pink-500 p-5 text-white shadow-[0_22px_60px_-38px_rgba(168,85,247,0.55)] md:p-7">
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/app/hub"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ArrowLeft size={14} /> Hub
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-sm">
            <Timer size={12} /> {formatElapsed(elapsedMs)}
          </span>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Brain size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/75">Memory Match · 6 cặp từ</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Tokutei Match</h1>
            <p className="mt-1 text-xs font-medium leading-relaxed text-white/85 md:text-sm">
              Lật thẻ, ghép cụm tiếng Nhật với nghĩa tiếng Việt. Càng ít lượt càng điểm cao.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Cặp</div>
            <div className="mt-1 text-lg font-black">{matched}/{PAIRS.length}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Lượt</div>
            <div className="mt-1 text-lg font-black">{moves}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Còn lại</div>
            <div className="mt-1 text-lg font-black">{PAIRS.length - matched}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_22px_50px_-42px_rgba(148,123,82,0.32)] md:p-6">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {cards.map((card) => {
            const showFront = card.flipped || card.matched;
            return (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={card.matched || locked || (flippedIds.length === 2 && !flippedIds.includes(card.id))}
                whileTap={!showFront && !locked ? { scale: 0.96 } : undefined}
                animate={{ rotateY: showFront ? 0 : 180 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className={cn(
                  'relative aspect-[3/4] rounded-2xl border-2 px-2 py-3 text-center text-[11px] font-black leading-tight transition-shadow sm:text-sm',
                  card.matched
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-inner'
                    : card.flipped
                      ? card.side === 'jp'
                        ? 'border-purple-300 bg-white text-purple-700'
                        : 'border-pink-300 bg-white text-pink-700'
                      : 'border-[#e6ddd1] bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_100%)] text-transparent',
                )}
              >
                {showFront ? (
                  <span className="flex h-full w-full items-center justify-center break-words">{card.text}</span>
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-orange-300">
                    <Sparkles size={20} />
                  </span>
                )}
                {card.matched && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-white">
                    OK
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {lastHint && (
          <motion.div
            key={lastHint}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500">
              <Sparkles size={18} />
            </div>
            <p className="min-w-0 text-xs font-bold leading-relaxed text-gray-700">{lastHint}</p>
          </motion.div>
        )}
      </section>
    </div>
  );
}

interface MatchDoneCardProps {
  score: number;
  bestScore: number | null;
  moves: number;
  elapsed: string;
  onRestart: () => void;
}

function MatchDoneCard({ score, bestScore, moves, elapsed, onRestart }: MatchDoneCardProps) {
  const isNewBest = bestScore !== null && score >= bestScore && score > 0;
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-center justify-center pb-16">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fce7f3_100%)] p-6 text-center shadow-[0_28px_72px_-44px_rgba(168,85,247,0.34)] md:p-10"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-xl">
          <Trophy size={36} />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-purple-500">Hoàn tất phiên</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Tokutei Match hoàn tất</h1>
        <div className="mt-5 inline-flex items-baseline gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Điểm</span>
          <span className="text-3xl font-black text-purple-600">{score}</span>
        </div>
        {bestScore !== null && (
          <p className={cn('mt-2 text-[11px] font-black uppercase tracking-[0.18em]', isNewBest ? 'text-emerald-500' : 'text-gray-400')}>
            {isNewBest ? 'Kỷ lục mới của anh!' : `Kỷ lục hiện tại: ${bestScore}`}
          </p>
        )}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ece4d4] bg-white/70 px-3 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Số lượt</div>
            <div className="mt-1.5 text-lg font-black text-gray-900">{moves}</div>
          </div>
          <div className="rounded-2xl border border-[#ece4d4] bg-white/70 px-3 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Thời gian</div>
            <div className="mt-1.5 text-lg font-black text-gray-900">{elapsed}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-purple-200 bg-white px-5 py-3 text-sm font-black text-purple-600 transition-all hover:bg-purple-50"
          >
            <RotateCcw size={16} /> Chơi lại
          </button>
          <Link
            to="/app/hub"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-22px_rgba(168,85,247,0.65)]"
          >
            Về Hub
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

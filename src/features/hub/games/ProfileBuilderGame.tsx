import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookText, CheckCircle2, Eraser, RotateCcw, Send, Sparkles, Trophy, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { readBestScore, shuffle, writeBestScore } from './gamePersistence';

interface BuilderToken {
  id: string;
  text: string;
}

interface BuilderRound {
  id: string;
  vi: string;
  jp: string;
  tokens: string[];
  hint: string;
}

const ROUNDS: BuilderRound[] = [
  {
    id: 'b1',
    vi: 'Em tên là Minh.',
    jp: 'Watashi wa Minh to moushimasu.',
    tokens: ['Watashi', 'wa', 'Minh', 'to', 'moushimasu.'],
    hint: '“to moushimasu” lịch sự hơn “desu” trong phỏng vấn.',
  },
  {
    id: 'b2',
    vi: 'Em đến từ Việt Nam.',
    jp: 'Betonamu kara kimashita.',
    tokens: ['Betonamu', 'kara', 'kimashita.'],
    hint: '“kara” đi sau địa điểm xuất phát.',
  },
  {
    id: 'b3',
    vi: 'Em muốn làm việc ở Nhật 3 năm.',
    jp: 'Nihon de sannen hatarakitai desu.',
    tokens: ['Nihon', 'de', 'sannen', 'hatarakitai', 'desu.'],
    hint: 'Mục tiêu rõ thời lượng giúp HR dễ chấm.',
  },
  {
    id: 'b4',
    vi: 'Em sẽ tuân thủ an toàn và cố gắng.',
    jp: 'Anzen wo mamori, ganbarimasu.',
    tokens: ['Anzen', 'wo', 'mamori,', 'ganbarimasu.'],
    hint: '“mamori” = giữ / tuân thủ; câu cuối phỏng vấn rất ổn.',
  },
  {
    id: 'b5',
    vi: 'Rất mong được giúp đỡ.',
    jp: 'Yoroshiku onegai itashimasu.',
    tokens: ['Yoroshiku', 'onegai', 'itashimasu.'],
    hint: 'Câu chốt cố định khi vào team mới.',
  },
];

const GAME_ID = 'profile-builder';

type Phase = 'building' | 'feedback' | 'done';

function withIds(tokens: string[], roundId: string): BuilderToken[] {
  return tokens.map((text, idx) => ({ id: `${roundId}-${idx}`, text }));
}

export default function ProfileBuilderGame() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('building');
  const [pool, setPool] = useState<BuilderToken[]>([]);
  const [built, setBuilt] = useState<BuilderToken[]>([]);
  const [score, setScore] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(() => readBestScore(GAME_ID));

  const round = ROUNDS[roundIndex];
  const answerIds = useMemo(() => withIds(round?.tokens ?? [], round?.id ?? '').map((t) => t.id), [round]);

  useEffect(() => {
    if (!round) return;
    if (phase !== 'building') return;
    const ids = withIds(round.tokens, round.id);
    setPool(shuffle(ids));
    setBuilt([]);
  }, [roundIndex, phase, round]);

  useEffect(() => {
    if (phase !== 'done') return;
    setBestScore((current) => {
      const next = writeBestScore(GAME_ID, score);
      return current === null || next > current ? next : current;
    });
  }, [phase, score]);

  if (!round) return null;

  const isPerfect =
    built.length === answerIds.length &&
    built.every((token, idx) => token.id === answerIds[idx]);

  const handlePickToken = (token: BuilderToken) => {
    if (phase !== 'building') return;
    setPool((current) => current.filter((t) => t.id !== token.id));
    setBuilt((current) => [...current, token]);
  };

  const handleRemoveToken = (token: BuilderToken) => {
    if (phase !== 'building') return;
    setBuilt((current) => current.filter((t) => t.id !== token.id));
    setPool((current) => [...current, token]);
  };

  const handleClear = () => {
    if (phase !== 'building' || built.length === 0) return;
    setPool((current) => [...current, ...built]);
    setBuilt([]);
  };

  const handleSubmit = () => {
    if (phase !== 'building') return;
    if (built.length !== answerIds.length) return;
    const correct = built.every((token, idx) => token.id === answerIds[idx]);
    setScore((current) => current + (correct ? 140 : 40));
    if (correct) setPerfectCount((current) => current + 1);
    setPhase('feedback');
  };

  const handleNext = () => {
    if (phase !== 'feedback') return;
    if (roundIndex + 1 >= ROUNDS.length) {
      setPhase('done');
      return;
    }
    setRoundIndex((current) => current + 1);
    setPhase('building');
  };

  const handleRestart = () => {
    setRoundIndex(0);
    setScore(0);
    setPerfectCount(0);
    setPool([]);
    setBuilt([]);
    setPhase('building');
  };

  if (phase === 'done') {
    return (
      <BuilderDoneCard
        score={score}
        bestScore={bestScore}
        perfectCount={perfectCount}
        total={ROUNDS.length}
        onRestart={handleRestart}
      />
    );
  }

  const progress = Math.round(((roundIndex + (phase === 'feedback' ? 1 : 0)) / ROUNDS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-[0_22px_60px_-38px_rgba(37,99,235,0.6)] md:p-7">
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/app/hub"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm hover:bg-white/25"
          >
            <ArrowLeft size={14} /> Hub
          </Link>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-sm">
            Câu {roundIndex + 1}/{ROUNDS.length}
          </span>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <BookText size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/75">Tự giới thiệu + hồ sơ</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Hồ sơ Builder</h1>
            <p className="mt-1 text-xs font-medium leading-relaxed text-white/85 md:text-sm">
              Sắp xếp các từ thành câu tiếng Nhật đúng theo nghĩa tiếng Việt.
            </p>
          </div>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
          <span>Điểm: {score}</span>
          <span>Đúng tuyệt đối: {perfectCount}/{ROUNDS.length}</span>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_50px_-42px_rgba(148,123,82,0.32)] md:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">Nghĩa tiếng Việt</p>
        <p className="mt-2 text-lg font-black leading-snug text-gray-900 md:text-xl">{round.vi}</p>

        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Câu đang dựng</p>
          <div
            className={cn(
              'mt-2 flex min-h-[64px] flex-wrap gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors',
              phase === 'feedback'
                ? isPerfect
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-rose-300 bg-rose-50'
                : 'border-blue-200 bg-white',
            )}
          >
            {built.length === 0 ? (
              <span className="self-center text-xs font-bold text-gray-400">Bấm từ bên dưới để xếp câu…</span>
            ) : (
              built.map((token) => (
                <motion.button
                  key={`built-${token.id}`}
                  type="button"
                  onClick={() => handleRemoveToken(token)}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  disabled={phase !== 'building'}
                  className={cn(
                    'rounded-xl border-2 px-3 py-1.5 text-sm font-black transition-colors',
                    phase === 'building' && 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400',
                    phase === 'feedback' && isPerfect && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                    phase === 'feedback' && !isPerfect && 'border-rose-300 bg-rose-50 text-rose-700',
                  )}
                >
                  {token.text}
                </motion.button>
              ))
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Kho từ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {pool.map((token) => (
                <motion.button
                  key={`pool-${token.id}`}
                  type="button"
                  onClick={() => handlePickToken(token)}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  disabled={phase !== 'building'}
                  whileTap={phase === 'building' ? { scale: 0.95 } : undefined}
                  className="rounded-xl border-2 border-[#e6ddd1] bg-white px-3 py-1.5 text-sm font-black text-gray-800 transition-colors hover:border-blue-300"
                >
                  {token.text}
                </motion.button>
              ))}
            </AnimatePresence>
            {pool.length === 0 && phase === 'building' && (
              <span className="text-xs font-bold text-gray-400">Hết từ rồi — kiểm tra lại rồi nộp nhé.</span>
            )}
          </div>
        </div>

        <AnimatePresence>
          {phase === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                'mt-4 flex items-start gap-3 rounded-2xl border p-3.5',
                isPerfect ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white',
                  isPerfect ? 'text-emerald-500' : 'text-rose-500',
                )}
              >
                {isPerfect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </div>
              <div className="min-w-0 text-xs font-bold leading-relaxed text-gray-700">
                <p className="text-sm font-black text-gray-900">
                  {isPerfect ? '+140 điểm — câu đúng nhịp' : 'Sai thứ tự, nhận +40 điểm an ủi'}
                </p>
                <p className="mt-1">
                  Đáp án: <span className="font-black text-gray-900">{round.jp}</span>
                </p>
                <p className="mt-1 text-gray-500">{round.hint}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleClear}
            disabled={phase !== 'building' || built.length === 0}
            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#e6ddd1] bg-white px-3.5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-gray-600 transition-colors hover:border-rose-200 hover:text-rose-500 disabled:opacity-40"
          >
            <Eraser size={14} /> Xóa
          </button>
          {phase === 'building' ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={built.length !== answerIds.length}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_16px_36px_-22px_rgba(37,99,235,0.65)] transition-transform hover:scale-[1.02] disabled:opacity-40"
            >
              <Send size={14} /> Nộp câu
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_16px_36px_-22px_rgba(37,99,235,0.65)] transition-transform hover:scale-[1.02]"
            >
              <Sparkles size={14} /> {roundIndex + 1 >= ROUNDS.length ? 'Xem kết quả' : 'Câu tiếp theo'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

interface BuilderDoneCardProps {
  score: number;
  bestScore: number | null;
  perfectCount: number;
  total: number;
  onRestart: () => void;
}

function BuilderDoneCard({ score, bestScore, perfectCount, total, onRestart }: BuilderDoneCardProps) {
  const isNewBest = bestScore !== null && score >= bestScore && score > 0;
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-center justify-center pb-16">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#eef6ff_100%)] p-6 text-center shadow-[0_28px_72px_-44px_rgba(37,99,235,0.34)] md:p-10"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl">
          <Trophy size={36} />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-blue-500">Hoàn tất phiên</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Hồ sơ Builder hoàn tất</h1>
        <div className="mt-5 inline-flex items-baseline gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Điểm</span>
          <span className="text-3xl font-black text-blue-600">{score}</span>
        </div>
        {bestScore !== null && (
          <p className={cn('mt-2 text-[11px] font-black uppercase tracking-[0.18em]', isNewBest ? 'text-emerald-500' : 'text-gray-400')}>
            {isNewBest ? 'Kỷ lục mới của anh!' : `Kỷ lục hiện tại: ${bestScore}`}
          </p>
        )}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#ece4d4] bg-white/70 px-3 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Đúng tuyệt đối</div>
            <div className="mt-1.5 text-lg font-black text-gray-900">{perfectCount}/{total}</div>
          </div>
          <div className="rounded-2xl border border-[#ece4d4] bg-white/70 px-3 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Câu đã làm</div>
            <div className="mt-1.5 text-lg font-black text-gray-900">{total}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-600 transition-all hover:bg-blue-50"
          >
            <RotateCcw size={16} /> Chơi lại
          </button>
          <Link
            to="/app/hub"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-22px_rgba(37,99,235,0.65)]"
          >
            Về Hub
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

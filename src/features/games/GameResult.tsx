import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { isAwardableGameType, recordGameCompletion, type GameCompletionAward } from '@/src/features/games/repositories/gamesRepository';
import type { CourseGameType } from '@/src/features/games/types';
import { Confetti } from '@/src/shared/components/Confetti';

interface GameResultProps {
  title: string;
  accent: string;
  returnTo?: string;
  returnLabel?: string;
  score: number;
  maxCombo: number;
  correct: number;
  total: number;
  courseId?: string;
  gameId?: CourseGameType;
  onRestart: () => void;
}

export function GameResult({ title, accent, returnTo, returnLabel = 'Về khóa học', score, maxCombo, correct, total, courseId, gameId, onRestart }: GameResultProps) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const recorded = useRef(false);
  const showCourseReturn = Boolean(returnTo && returnTo !== '/app/hub');
  const [award, setAward] = useState<GameCompletionAward | null>(null);
  const [awardError, setAwardError] = useState<string | null>(null);

  useEffect(() => {
    if (recorded.current || !courseId || !isAwardableGameType(gameId)) return;
    recorded.current = true;
    recordGameCompletion(courseId, gameId)
      .then(setAward)
      .catch((error: unknown) => setAwardError(error instanceof Error ? error.message : 'Không xác nhận được điểm thưởng.'));
  }, [courseId, gameId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0F1419] p-4">
      {accuracy >= 80 && <Confetti />}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm rounded-2xl border bg-white p-6 text-center shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)] md:p-8"
        style={{ borderColor: accent }}
      >
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: accent }}
        >
          <Trophy size={32} strokeWidth={1.8} />
        </div>

        <h2 className="mt-4 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">{title}</h2>
        <p className="mt-1 text-sm text-[#5f6b7c]">Hoàn thành!</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#eceff3] bg-[#f7f8fa] px-3 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#95a0af]">Điểm</div>
            <div className="mt-1 font-[var(--font-heading)] text-xl font-bold text-[#172033]">{score}</div>
          </div>
          <div className="rounded-xl border border-[#eceff3] bg-[#f7f8fa] px-3 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#95a0af]">Combo</div>
            <div className="mt-1 font-[var(--font-heading)] text-xl font-bold text-[#172033]">x{maxCombo}</div>
          </div>
          <div className="rounded-xl border border-[#eceff3] bg-[#f7f8fa] px-3 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#95a0af]">Đúng</div>
            <div className="mt-1 font-[var(--font-heading)] text-xl font-bold text-[#172033]">{accuracy}%</div>
          </div>
        </div>

        {courseId && <p role="status" className={awardError ? 'mt-4 text-xs font-semibold text-red-700' : 'mt-4 text-xs font-semibold text-[#5f6b7c]'}>{awardError ?? (award ? (award.awarded ? `Đã cộng ${award.xpAwarded} XP qua máy chủ.` : 'Điểm thưởng hôm nay của game này đã được ghi nhận.') : 'Đang xác nhận điểm thưởng qua máy chủ…')}</p>}

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e5ea] px-5 py-3 text-sm font-semibold text-[#4d5a6b] transition-colors hover:bg-[#f7f8fa]"
          >
            <RotateCcw size={16} strokeWidth={1.8} /> Chơi lại
          </button>
          {showCourseReturn && (
            <Link
              to={returnTo!}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              <ArrowLeft size={16} strokeWidth={1.8} /> {returnLabel}
            </Link>
          )}
          <Link
            to="/app/hub"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={showCourseReturn ? { backgroundColor: '#111827' } : { backgroundColor: accent }}
          >
            <ArrowLeft size={16} strokeWidth={1.8} /> Về Hub
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

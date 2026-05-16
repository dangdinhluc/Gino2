import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Flame, Gamepad2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { gameShells, type GameShell } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';
import AisatsuReflexGame from '../games/AisatsuReflexGame';
import ProfileBuilderGame from '../games/ProfileBuilderGame';
import MemoryMatchGame from '../games/MemoryMatchGame';

function formatGameTitle(gameId: string | undefined): string {
  if (!gameId) {
    return 'Game mock';
  }

  return gameId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function createFallbackGame(gameId: string | undefined): GameShell {
  return {
    id: gameId ?? 'game-mock',
    title: formatGameTitle(gameId),
    sub: 'Khung game mock dùng chung cho các card chưa có mode riêng.',
    level: 'Tokutei',
    color: 'from-orange-500 to-amber-400',
    icon: Gamepad2,
    rounds: [
      { id: 'fallback-1', prompt: '“houkoku” nghĩa là gì?', options: ['báo cáo', 'giờ nghỉ', 'quản lý', 'an toàn'], answer: 'báo cáo' },
      { id: 'fallback-2', prompt: 'Khi vào ca, câu nào đúng nhất?', options: ['Ohayou gozaimasu.', 'Em làm sau cũng được.', 'Em tự đổi vị trí nhé.', 'Checklist để mai xem.'], answer: 'Ohayou gozaimasu.' },
    ],
  };
}

export default function GameDetail() {
  const { gameId } = useParams();

  if (gameId === 'aisatsu-reflex') return <AisatsuReflexGame />;
  if (gameId === 'profile-builder') return <ProfileBuilderGame />;
  if (gameId === 'tokutei-match') return <MemoryMatchGame />;

  return <QuizShellGame gameId={gameId} />;
}

function QuizShellGame({ gameId }: { gameId: string | undefined }) {
  const game = useMemo(() => gameShells.find((item) => item.id === gameId) ?? createFallbackGame(gameId), [gameId]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const round = game.rounds[activeIndex];
  const Icon = game.icon;
  const isCorrect = selectedOption === round.answer;
  const progress = Math.round(((activeIndex + 1) / game.rounds.length) * 100);

  const handleSelect = (option: string) => {
    setSelectedOption(option);

    if (option === round.answer) {
      setScore((currentScore) => currentScore + 100 + combo * 20);
      setCombo((currentCombo) => currentCombo + 1);
      return;
    }

    setCombo(0);
  };

  const handleContinue = () => {
    if (activeIndex === game.rounds.length - 1) {
      setIsComplete(true);
      return;
    }

    setActiveIndex((currentIndex) => currentIndex + 1);
    setSelectedOption(null);
  };

  const handleRestart = () => {
    setActiveIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCombo(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center justify-center pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-7 text-center shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-10"
        >
          <div className={cn('mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br text-white shadow-xl', game.color)}>
            <Trophy size={44} />
          </div>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">Game Complete</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">{game.title} hoàn tất</h1>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Điểm</div>
              <div className="mt-2 text-2xl font-black text-orange-600">{score}</div>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Combo cuối</div>
              <div className="mt-2 text-2xl font-black text-gray-900">x{combo}</div>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">XP mock</div>
              <div className="mt-2 text-2xl font-black text-gray-900">+25</div>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={handleRestart} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50">
              <RotateCcw size={16} /> Chơi lại
            </button>
            <Link to="/app/hub" className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Về Learning Hub
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-24">
      <section className={cn('overflow-hidden rounded-[2.75rem] bg-gradient-to-br p-6 text-white shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-8', game.color)}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link to="/app/hub" className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/20">
              <ArrowLeft size={16} />
              Về Hub
            </Link>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/20 shadow-lg backdrop-blur-sm">
                <Icon size={32} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/75">{game.level} Game Shell</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">{game.title}</h1>
                <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-white/80">{game.sub}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-[1.5rem] bg-white/15 px-4 py-4 backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Điểm</div>
              <div className="mt-2 text-2xl font-black">{score}</div>
            </div>
            <div className="rounded-[1.5rem] bg-white/15 px-4 py-4 backdrop-blur-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Combo</div>
              <div className="mt-2 flex items-center gap-2 text-2xl font-black"><Flame size={20} className="fill-white" /> x{combo}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">
          <motion.div className="h-full rounded-full bg-white" animate={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
            Round {activeIndex + 1}/{game.rounds.length}
          </span>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">{game.id}</span>
        </div>

        <div className="rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_100%)] p-5 md:p-7">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">{round.prompt}</h2>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {round.options.map((option) => {
            const isSelected = selectedOption === option;
            const shouldShowCorrect = selectedOption !== null && option === round.answer;
            const shouldShowWrong = isSelected && !isCorrect;

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={selectedOption !== null}
                className={cn(
                  'rounded-[1.5rem] border px-5 py-4 text-left text-sm font-black transition-all',
                  selectedOption === null && 'border-[#e6ddd1] bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50',
                  shouldShowCorrect && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                  shouldShowWrong && 'border-red-200 bg-red-50 text-red-600',
                  selectedOption !== null && !shouldShowCorrect && !shouldShowWrong && 'border-[#e6ddd1] bg-[#f8f1e6] text-gray-400'
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn('mt-5 rounded-[2rem] border p-5', isCorrect ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50')}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-white', isCorrect ? 'text-emerald-500' : 'text-red-500')}>
                    {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900">{isCorrect ? 'Combo lên rồi anh' : 'Sai nhẹ, chơi tiếp được'}</h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">Đáp án đúng là {round.answer}.</p>
                  </div>
                </div>
                <button onClick={handleContinue} className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
                  {activeIndex === game.rounds.length - 1 ? 'Xem kết quả' : 'Tiếp tục'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

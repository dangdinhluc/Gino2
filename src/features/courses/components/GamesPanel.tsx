import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird, BrainCircuit, CheckCircle2, ClipboardCheck, Gamepad2, Play, Zap, type LucideIcon } from 'lucide-react';
import {
  type CourseVocabularyItem,
} from '@/src/features/courses/courseLearning.types';
import type { CourseGameType } from '@/src/features/games/types';
import { assets } from '@/src/shared/lib/assets';
import { cn } from '@/src/lib/utils';

interface CourseGameCard {
  type: CourseGameType;
  title: string;
  description: string;
  rounds: number;
  duration: string;
  icon: LucideIcon;
  /** Cặp màu riêng từng game (class tĩnh — Tailwind không nhận class động) */
  accent: 'sky' | 'amber' | 'purple' | 'emerald';
}

const gameAccentStyles = {
  sky: { icon: 'bg-sky-50 text-sky-600 border-sky-200', hover: 'hover:border-sky-300', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  amber: { icon: 'bg-amber-50 text-amber-600 border-amber-200', hover: 'hover:border-amber-300', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  purple: { icon: 'bg-purple-50 text-purple-600 border-purple-200', hover: 'hover:border-purple-300', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600 border-emerald-200', hover: 'hover:border-emerald-300', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
} as const;

function getAvailableCourseGames(vocabulary: CourseVocabularyItem[]): CourseGameCard[] {
  if (vocabulary.length < 4) return [];
  return [
    { type: 'flappy-vocab', title: 'Flappy Vocab', description: 'Bay qua thử thách và chọn đúng nghĩa của từ trong khóa học.', rounds: vocabulary.length, duration: '2 phút', icon: Bird, accent: 'sky' },
    { type: 'vocab-sprint', title: 'Vocab Sprint', description: 'Chọn nghĩa đúng thật nhanh để củng cố nhóm từ vừa học.', rounds: vocabulary.length, duration: '1 phút', icon: BrainCircuit, accent: 'amber' },
    { type: 'memory-match', title: 'Memory Match', description: 'Ghép mặt chữ và nghĩa từ vựng đã xuất bản trong khóa học.', rounds: vocabulary.length, duration: '3 phút', icon: CheckCircle2, accent: 'purple' },
    { type: 'word-builder', title: 'Word Builder', description: 'Xếp chữ romaji theo nghĩa từ vựng của khóa học.', rounds: vocabulary.length, duration: '3 phút', icon: ClipboardCheck, accent: 'emerald' },
  ];
}

interface GamesPanelProps {
  courseId: string;
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
}

export function GamesPanel({ courseId, courseTitle, vocabulary }: GamesPanelProps) {
  const navigate = useNavigate();
  const games = useMemo(() => getAvailableCourseGames(vocabulary), [vocabulary]);

  const handlePlayGameType = (gameType: CourseGameType) => {
    navigate(`/app/game/${gameType}?courseId=${encodeURIComponent(courseId)}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-28 sm:pb-32">
      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 shadow-2xs sm:p-6">
        {/* Japanese Watermark Kanji */}
        <div
          className="pointer-events-none absolute left-4 top-1 select-none text-4xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          遊
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="max-w-md space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs">
                <Gamepad2 size={12} /> Minigame khóa học
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/90 px-2 py-0.5 text-[10px] font-black text-amber-800">
                <Zap size={11} className="fill-amber-400 text-amber-500" /> Tích lũy XP
              </span>
            </div>
            <h2 className="font-[var(--font-heading)] text-xl font-black tracking-[-0.02em] text-[#172033] sm:text-2xl">
              Luyện phản xạ: {courseTitle}
            </h2>
            <p className="text-xs font-medium leading-relaxed text-[#5f6b7c]">
              Mỗi minigame sử dụng {vocabulary.length} từ vựng đã xuất bản của khóa học. XP được máy chủ tự động xác nhận sau mỗi ván.
            </p>
          </div>

          <div className="relative shrink-0 hidden sm:block -my-3 -mr-2">
            <img
              src={assets.games.mascot}
              alt="Tokutei Game Tanuki Mascot"
              className="h-20 w-auto object-contain drop-shadow-xs md:h-24"
            />
          </div>
        </div>
      </header>

      {games.length === 0 ? (
        <div className="rounded-[22px] border border-[#f5ece1] bg-white p-8 text-center shadow-2xs">
          <Gamepad2 size={28} className="mx-auto text-[#d83a00]" />
          <h3 className="mt-3 font-[var(--font-heading)] text-base font-black text-[#172033]">Chưa đủ từ vựng để mở minigame</h3>
          <p className="mt-1 text-xs text-[#7b8796]">Khóa học cần ít nhất 4 từ vựng đã xuất bản để hệ thống tạo màn chơi.</p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {games.map((game) => {
            const Icon = game.icon;
            const styles = gameAccentStyles[game.accent];
            return (
              <article
                key={game.type}
                className={cn(
                  'group flex flex-col justify-between rounded-[22px] border border-[#eedecf] bg-white p-5 shadow-2xs transition-all duration-200 hover:border-orange-300 hover:shadow-md gino-hover-lift',
                  styles.hover
                )}
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-2xs transition-transform duration-200 group-hover:scale-105', styles.icon)}>
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-[var(--font-heading)] text-base font-black text-[#172033] group-hover:text-[#d83a00] transition-colors">
                        {game.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-[#5f6b7c]">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider', styles.badge)}>
                      {game.rounds} từ vựng
                    </span>
                    <span className="rounded-full border border-[#eedecf] bg-[#fffaf5] px-2.5 py-0.5 text-[10px] font-bold text-[#7b8796]">
                      ⏱ {game.duration}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayGameType(game.type)}
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d83a00] to-[#ea580c] px-4 text-xs font-black text-white shadow-2xs transition-all hover:brightness-110 active:scale-95"
                >
                  <Play size={14} fill="currentColor" /> Bắt đầu chơi
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

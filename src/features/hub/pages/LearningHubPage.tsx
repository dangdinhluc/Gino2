import { Link } from 'react-router-dom';
import {
  Bird,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Flame,
  Gamepad2,
  Play,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import type { CourseGameType } from '@/src/features/games/types';
import { assets } from '@/src/shared/lib/assets';
import { cn } from '@/src/lib/utils';

interface HubGame {
  type: CourseGameType;
  title: string;
  tagline: string;
  duration: string;
  icon: LucideIcon;
  accent: 'sky' | 'amber' | 'purple' | 'emerald';
  badge: string;
}

const HUB_GAMES: HubGame[] = [
  {
    type: 'flappy-vocab',
    title: 'Flappy Vocab',
    tagline: 'Bay & chọn nghĩa đúng',
    duration: '2 phút',
    icon: Bird,
    accent: 'sky',
    badge: 'Phản xạ né chướng ngại',
  },
  {
    type: 'vocab-sprint',
    title: 'Vocab Sprint',
    tagline: 'Chọn nghĩa thật nhanh',
    duration: '1 phút',
    icon: BrainCircuit,
    accent: 'amber',
    badge: 'Tốc độ 60 giây',
  },
  {
    type: 'memory-match',
    title: 'Memory Match',
    tagline: 'Lật thẻ ghép đôi từ vựng',
    duration: '3 phút',
    icon: CheckCircle2,
    accent: 'purple',
    badge: 'Rèn trí nhớ ngắn hạn',
  },
  {
    type: 'word-builder',
    title: 'Word Builder',
    tagline: 'Xếp chữ Romaji chính xác',
    duration: '3 phút',
    icon: ClipboardCheck,
    accent: 'emerald',
    badge: 'Thuộc mặt chữ & cách đọc',
  },
];

const gameStyles = {
  sky: {
    iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
    hover: 'hover:border-sky-300 hover:bg-sky-50/50',
    badge: 'bg-sky-50 text-sky-700 border-sky-100',
    btn: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    hover: 'hover:border-amber-300 hover:bg-amber-50/50',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    btn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  purple: {
    iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
    hover: 'hover:border-purple-300 hover:bg-purple-50/50',
    badge: 'bg-purple-50 text-purple-700 border-purple-100',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    hover: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
} as const;

export default function LearningHub() {
  const { status, data: courses, error } = useCourseList();

  if (status === 'loading') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 text-sm font-bold text-[#5f6b7c]">
        <Gamepad2 className="mr-2 h-5 w-5 animate-bounce text-[#d83a00]" />
        Đang tải khu trò chơi ôn tập…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      {/* 1. Hero Header Banner */}
      <header className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 shadow-2xs sm:p-6">
        {/* Japanese Watermark Kanji */}
        <div
          className="pointer-events-none absolute left-4 top-1 select-none text-4xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          遊
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs">
                <Gamepad2 size={12} /> Đấu trường từ vựng
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/90 px-2.5 py-0.5 text-[10px] font-black text-amber-800">
                <Zap size={11} className="fill-amber-400 text-amber-500" /> Tích lũy XP
              </span>
            </div>

            <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
              Ôn từ vựng qua Minigame
            </h1>

            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm">
              Chơi game phản xạ với toàn bộ từ vựng đã xuất bản của khóa học. Vừa giải trí, vừa nhớ từ sâu và nhận thưởng XP thật!
            </p>

            {/* Quick Game Mode Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {HUB_GAMES.map((game) => {
                const Icon = game.icon;
                const style = gameStyles[game.accent];
                return (
                  <span
                    key={game.type}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-bold shadow-2xs',
                      style.badge
                    )}
                  >
                    <Icon size={12} /> {game.title}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right Mascot */}
          <div className="relative shrink-0 hidden sm:block -my-3 -mr-1">
            <img
              src={assets.games.mascot}
              alt="Tokutei Game Tanuki Mascot"
              className="h-24 w-auto object-contain drop-shadow-md sm:h-28 md:h-32"
            />
          </div>
        </div>
      </header>

      {/* 2. Content: Course Selection & Launch Cards */}
      {status === 'error' ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : courses.length === 0 ? (
        <div className="rounded-[24px] border border-[#f5ece1] bg-white p-8 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]">
            <Gamepad2 size={28} />
          </div>
          <h2 className="mt-4 font-[var(--font-heading)] text-lg font-black text-[#172033]">
            Chưa có khóa học để chơi game
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs font-semibold text-[#5f6b7c]">
            Ghi danh một khóa học (có ít nhất 4 từ vựng) để mở các trò chơi phản xạ.
          </p>
          <Link
            to="/app/courses"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#d83a00] px-5 py-2.5 text-xs font-black text-white shadow-xs transition-transform hover:brightness-110 active:scale-95"
          >
            Khám phá khóa học <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-base font-black text-[#172033]">
              Chọn khóa học để bắt đầu chơi ({courses.length})
            </h2>
            <span className="text-xs font-semibold text-[#8c97a8]">4 game cho mỗi khóa</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <article
                key={course.id}
                className="flex flex-col justify-between rounded-[22px] border border-[#eedecf] bg-white p-5 shadow-2xs transition-all duration-200 hover:border-orange-300 hover:shadow-md gino-hover-lift"
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="rounded-full bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#c2410c]">
                        {course.level}
                      </span>
                      <h3 className="mt-1.5 truncate font-[var(--font-heading)] text-base font-black text-[#172033]">
                        {course.title}
                      </h3>
                    </div>
                    <Link
                      to={`/app/courses/${course.id}/learn`}
                      className="shrink-0 rounded-xl border border-[#e8dccb] bg-[#fffaf5] px-2.5 py-1 text-[11px] font-black text-[#5f6b7c] transition-colors hover:border-orange-300 hover:text-[#d83a00]"
                    >
                      Vào khóa
                    </Link>
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#7b8796]">
                    {course.description}
                  </p>

                  {/* 4 Mini Game Action Buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {HUB_GAMES.map((game) => {
                      const Icon = game.icon;
                      const style = gameStyles[game.accent];
                      return (
                        <Link
                          key={game.type}
                          to={`/app/game/${game.type}?courseId=${encodeURIComponent(course.id)}`}
                          className={cn(
                            'group/btn flex items-center gap-2 rounded-xl border border-[#efe5d9] bg-[#fffcf9] p-2.5 transition-all duration-200 active:scale-95 shadow-2xs',
                            style.hover
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover/btn:scale-105',
                              style.iconBg
                            )}
                          >
                            <Icon size={16} strokeWidth={2.2} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <strong className="block truncate text-xs font-black text-[#172033] group-hover/btn:text-[#d83a00]">
                              {game.title}
                            </strong>
                            <span className="block truncate text-[10px] font-semibold text-[#8c97a8]">
                              ⏱ {game.duration}
                            </span>
                          </div>
                          <Play size={12} className="shrink-0 text-[#a0aab8] group-hover/btn:text-[#d83a00] group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


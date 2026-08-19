import { Link } from 'react-router-dom';
import { Bird, BrainCircuit, CheckCircle2, ClipboardCheck, Gamepad2, type LucideIcon } from 'lucide-react';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import type { CourseGameType } from '@/src/features/games/types';

interface HubGame {
  type: CourseGameType;
  title: string;
  tagline: string;
  duration: string;
  icon: LucideIcon;
  accent: 'sky' | 'amber' | 'purple' | 'emerald';
}

const HUB_GAMES: HubGame[] = [
  { type: 'flappy-vocab', title: 'Flappy Vocab', tagline: 'Bay + chọn nghĩa', duration: '2 phút', icon: Bird, accent: 'sky' },
  { type: 'vocab-sprint', title: 'Vocab Sprint', tagline: 'Phản xạ nhanh', duration: '1 phút', icon: BrainCircuit, accent: 'amber' },
  { type: 'memory-match', title: 'Memory Match', tagline: 'Ghép cặp từ', duration: '3 phút', icon: CheckCircle2, accent: 'purple' },
  { type: 'word-builder', title: 'Word Builder', tagline: 'Xếp chữ romaji', duration: '3 phút', icon: ClipboardCheck, accent: 'emerald' },
];

const accentStyles = {
  sky: { icon: 'bg-sky-500/15 text-sky-300 border-sky-400/30', hover: 'hover:border-sky-400/60 hover:bg-sky-500/10' },
  amber: { icon: 'bg-amber-500/15 text-amber-300 border-amber-400/30', hover: 'hover:border-amber-400/60 hover:bg-amber-500/10' },
  purple: { icon: 'bg-purple-500/15 text-purple-300 border-purple-400/30', hover: 'hover:border-purple-400/60 hover:bg-purple-500/10' },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30', hover: 'hover:border-emerald-400/60 hover:bg-emerald-500/10' },
} as const;

export default function LearningHub() {
  const { status, data: courses, error } = useCourseList();

  if (status === 'loading') {
    return <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 text-sm font-bold text-[#5f6b7c]">Đang tải khu game…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1a1410] via-[#2a1a12] to-[#3b2119] p-6 text-white shadow-[0_16px_40px_rgba(87,43,37,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-amber-500/15 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/30 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-200">
              <Gamepad2 size={13} /> GAME ZONE
            </span>
            <h1 className="mt-3 font-[var(--font-heading)] text-2xl font-black tracking-tight sm:text-3xl">
              Ôn từ vựng bằng game 🎮
            </h1>
            <p className="mt-2 text-sm leading-6 text-orange-100/70">
              Chọn khóa học rồi chơi 4 game với đúng từ vựng của khóa. Điểm XP được máy chủ xác nhận, không lấy điểm từ trình duyệt.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2">
            {HUB_GAMES.map((game) => {
              const Icon = game.icon;
              return (
                <span key={game.type} className={`flex items-center gap-2 rounded-xl border bg-white/5 px-3 py-2 text-xs font-black text-white/80 ${accentStyles[game.accent].icon}`}>
                  <Icon size={15} /> {game.title}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {status === 'error' ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      ) : courses.length === 0 ? (
        <div className="rounded-[28px] border border-[#f5ece1] bg-white p-8 text-center">
          <Gamepad2 size={28} className="mx-auto text-[#d83a00]" />
          <h2 className="mt-3 font-[var(--font-heading)] text-lg font-black text-[#172033]">Chưa có khóa học để chơi game</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#5f6b7c]">Ghi danh một khóa học (có ít nhất 4 từ vựng) để mở khu game.</p>
          <Link to="/app/courses" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#d83a00] px-5 text-sm font-black text-white">Xem khóa học</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="flex flex-col rounded-[28px] border border-[#f0e5d9] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#c2410c]">{course.level}</span>
                  <h2 className="mt-2 truncate font-[var(--font-heading)] text-lg font-black text-[#172033]">{course.title}</h2>
                </div>
                <Link to={`/app/courses/${course.id}/learn`} className="shrink-0 rounded-xl border border-[#e8dccb] px-3 py-2 text-xs font-bold text-[#5f6b7c] transition-colors hover:border-orange-300 hover:text-[#d83a00]">
                  Vào khóa
                </Link>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7b8796]">{course.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {HUB_GAMES.map((game) => {
                  const Icon = game.icon;
                  const styles = accentStyles[game.accent];
                  return (
                    <Link
                      key={game.type}
                      to={`/app/game/${game.type}?courseId=${encodeURIComponent(course.id)}`}
                      className={`group flex min-h-14 items-center gap-2.5 rounded-xl border border-[#efe5d9] bg-[#fffaf5] px-3 py-2.5 transition-all duration-200 active:scale-95 ${styles.hover}`}
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${styles.icon}`}>
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-xs font-black text-[#172033] group-hover:text-[#d83a00]">{game.title}</strong>
                        <small className="block truncate text-[10px] font-bold text-[#95a0af]">{game.tagline} · {game.duration}</small>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

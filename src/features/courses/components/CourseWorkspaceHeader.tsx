import { ArrowLeft, Check, Flame, Home, Play } from 'lucide-react';
import type { DailyMission } from '@/src/features/courses/lib/dailyMission';
import { cn } from '@/src/lib/utils';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

interface CourseWorkspaceHeaderProps {
  courseTitle: string;
  currentModule: string;
  progress: number;
  streak: number;
  onExit: () => void;
  onGoHome: () => void;
}

/** Thanh trên cùng: điều hướng, tên khóa, tiến độ và chuỗi ngày học. Luôn dính. */
export function CourseWorkspaceHeader({ courseTitle, currentModule, progress, streak, onExit, onGoHome }: CourseWorkspaceHeaderProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <section className="sticky top-0 z-40 -mx-3 border-b border-[#eadfd2]/80 bg-[#fbf6ef]/95 px-4 py-2.5 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3">
        <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-[#eadfd2] bg-white/60 p-1">
          <button onClick={onGoHome} className={cn('flex h-11 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-black text-[#172033] transition-colors hover:bg-[#f1ebe2]', focusRing)} aria-label="Về trang chủ">
            <Home size={18} aria-hidden="true" focusable="false" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button onClick={onExit} className={cn('flex h-11 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-black text-[#5f6b7c] transition-colors hover:bg-[#f1ebe2] hover:text-[#172033]', focusRing)} aria-label="Quay lại danh sách khóa học">
            <ArrowLeft size={18} aria-hidden="true" focusable="false" />
            <span className="hidden sm:inline">Khóa học</span>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-[var(--font-heading)] text-sm font-black tracking-[-0.03em] text-[#172033] md:text-base">{courseTitle}</h1>
          <p className="mt-0.5 truncate text-[10px] font-bold text-[#5f6b7c]">{currentModule}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-orange-100" role="progressbar" aria-valuenow={safeProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ khóa học ${safeProgress}%`}>
              <div className="h-full rounded-full bg-orange-700 transition-[width] duration-300" style={{ width: `${safeProgress}%` }} />
            </div>
            <span className="shrink-0 text-[10px] font-black text-[#8b93a1]">{safeProgress}%</span>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1.5 text-orange-700" title={`Chuỗi ${streak} ngày học liên tiếp`}>
            <Flame size={15} aria-hidden="true" focusable="false" />
            <span className="text-sm font-black leading-none">{streak}</span>
            <span className="sr-only">ngày học liên tiếp</span>
          </div>
        )}
      </div>
    </section>
  );
}

interface DailyMissionCardProps {
  mission: DailyMission;
  onStart: () => void;
}

/**
 * Một việc duy nhất cho hôm nay kèm một nút. Học viên mở app không phải tự
 * chọn giữa 5 tab mới bắt đầu học được.
 */
export function DailyMissionCard({ mission, onStart }: DailyMissionCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[1.75rem] border p-3.5',
        mission.isComplete
          ? 'border-emerald-200/70 bg-[linear-gradient(135deg,rgba(236,253,245,0.95)_0%,rgba(255,250,243,0.95)_100%)]'
          : 'border-[rgba(201,106,27,0.22)] bg-[linear-gradient(135deg,rgba(255,244,232,0.98)_0%,rgba(255,250,243,0.98)_100%)]'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn('text-[10px] font-black uppercase tracking-[0.16em]', mission.isComplete ? 'text-emerald-700' : 'text-orange-700')}>
          Hôm nay
        </p>
        <h2 className="mt-0.5 truncate font-[var(--font-heading)] text-lg font-black tracking-[-0.03em] text-[#172033]">
          {mission.headline}
        </h2>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex gap-1" role="img" aria-label={`Đã ôn ${mission.goalDone} trên ${mission.goalTotal} từ hôm nay`}>
            {Array.from({ length: mission.goalTotal }, (_, index) => (
              <span
                key={index}
                className={cn(
                  'h-1.5 w-4 rounded-full transition-colors',
                  index < mission.goalDone ? (mission.isComplete ? 'bg-emerald-500' : 'bg-orange-600') : 'bg-[#e8ddcd]'
                )}
              />
            ))}
          </div>
          <span className="text-xs font-black text-[#8b93a1]">{mission.goalDone}/{mission.goalTotal}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className={cn(
          'flex min-h-12 shrink-0 items-center gap-1.5 rounded-2xl px-4 text-xs font-black uppercase tracking-[0.1em] text-white shadow-[0_16px_32px_-22px_rgba(201,106,27,0.6)] transition-transform hover:scale-[1.02]',
          mission.isComplete ? 'bg-emerald-600' : 'bg-orange-700',
          focusRing
        )}
      >
        {mission.isComplete ? <Check size={15} aria-hidden="true" focusable="false" /> : <Play size={15} aria-hidden="true" focusable="false" />}
        {mission.actionLabel}
      </button>
    </div>
  );
}

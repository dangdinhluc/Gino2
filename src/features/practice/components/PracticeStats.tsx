import React from 'react';

export interface PracticeStatsData {
  completedCount: number;
  accuracyPercent: number;
  streakDays: number;
}

interface PracticeStatsProps {
  stats?: PracticeStatsData;
}

const defaultStats: PracticeStatsData = {
  completedCount: 12,
  accuracyPercent: 86,
  streakDays: 5,
};

export function PracticeStats({ stats = defaultStats }: PracticeStatsProps) {
  return (
    <section className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
      {/* Card 1: Completed count */}
      <div className="flex items-center gap-2.5 rounded-[20px] border border-[#f3e8da] bg-[#fffdfa] p-3 shadow-2xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 p-2">
          <img
            src="/assets/game-icons/icon_checklist.png"
            alt="Checklist"
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-base font-extrabold leading-none text-[#172033] sm:text-lg">
            {stats.completedCount}
          </div>
          <div className="mt-0.5 text-[10px] text-[#717d8f] truncate">bài đã luyện</div>
        </div>
      </div>

      {/* Card 2: Accuracy */}
      <div className="flex items-center gap-2.5 rounded-[20px] border border-[#f3e8da] bg-[#fffdfa] p-3 shadow-2xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100/70 p-2">
          <img
            src="/assets/game-icons/icon_chart.png"
            alt="Chart"
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-base font-extrabold leading-none text-[#172033] sm:text-lg">
            {stats.accuracyPercent}%
          </div>
          <div className="mt-0.5 text-[10px] text-[#717d8f] truncate">độ chính xác</div>
        </div>
      </div>

      {/* Card 3: Streak */}
      <div className="flex items-center gap-2.5 rounded-[20px] border border-[#f3e8da] bg-[#fffdfa] p-3 shadow-2xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100/70 p-2">
          <img
            src="/assets/game-icons/icon_fire.png"
            alt="Fire"
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-base font-extrabold leading-none text-[#172033] sm:text-lg">
            {stats.streakDays}
          </div>
          <div className="mt-0.5 text-[10px] text-[#717d8f] truncate">ngày liên tiếp</div>
        </div>
      </div>
    </section>
  );
}

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

const statVisuals = [
  { key: 'completedCount' as const, label: 'bài đã luyện', icon: '/assets/practice-icons/completed.webp', tone: 'bg-[#eff9e7] border-[#d8ecc8]' },
  { key: 'accuracyPercent' as const, label: 'độ chính xác', icon: '/assets/practice-icons/progress.webp', tone: 'bg-[#eef5ff] border-[#d4e3f8]', suffix: '%' },
  { key: 'streakDays' as const, label: 'ngày liên tiếp', icon: '/assets/practice-icons/streak.webp', tone: 'bg-[#fff2e5] border-[#f5d6b3]' },
];

export function PracticeStats({ stats = defaultStats }: PracticeStatsProps) {
  return (
    <section className="grid grid-cols-3 gap-2.5 sm:gap-3.5" aria-label="Tiến độ luyện tập">
      {statVisuals.map((stat) => (
        <div key={stat.key} className="min-w-0 rounded-[20px] border border-[#f1e4d5] bg-white p-2.5 shadow-[0_3px_12px_rgba(64,44,21,0.04)] sm:p-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl border p-1 ${stat.tone}`}>
            <img src={stat.icon} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="mt-2 font-[var(--font-heading)] text-lg font-extrabold leading-none text-[#172033] sm:text-xl">
            {stats[stat.key]}{stat.suffix}
          </div>
          <div className="mt-1 truncate text-[10px] font-medium text-[#718096] sm:text-[11px]">{stat.label}</div>
        </div>
      ))}
    </section>
  );
}

import React from 'react';

export interface DocumentStatsData {
  totalDocs: number;
  totalMinutes: number;
  viewedPercent: number;
}

interface DocumentStatsProps {
  stats?: DocumentStatsData;
}

const defaultStats: DocumentStatsData = {
  totalDocs: 3,
  totalMinutes: 22,
  viewedPercent: 100,
};

export function DocumentStats({ stats = defaultStats }: DocumentStatsProps) {
  return (
    <section className="grid grid-cols-3 gap-2.5 rounded-[22px] border border-[#f3e8da] bg-[#fffdfa] p-3.5 shadow-2xs">
      {/* Col 1: Total Docs */}
      <div className="flex items-center gap-2.5 px-1 sm:px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100/80 p-2 text-[#d83a00]">
          <img
            src="/assets/game-icons/icon_doc_orange.png"
            alt="Doc icon"
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-base font-extrabold text-[#172033] sm:text-lg">
            {stats.totalDocs}
          </div>
          <div className="text-[11px] text-[#717d8f] truncate">Tài liệu</div>
        </div>
      </div>

      {/* Col 2: Total Time */}
      <div className="flex items-center gap-2.5 border-l border-[#f3e8da] px-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 p-2 text-amber-700">
          <img
            src="/assets/game-icons/icon_time_clock.png"
            alt="Time icon"
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-base font-extrabold text-[#172033] sm:text-lg">
            ~{stats.totalMinutes} phút
          </div>
          <div className="text-[11px] text-[#717d8f] truncate">Tổng thời gian</div>
        </div>
      </div>

      {/* Col 3: Viewed Percent */}
      <div className="flex items-center gap-2.5 border-l border-[#f3e8da] px-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/80 p-2 text-emerald-700">
          <img
            src="/assets/game-icons/icon_completed_success.png"
            alt="Success icon"
            className="h-6 w-6 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-base font-extrabold text-[#172033] sm:text-lg">
            {stats.viewedPercent}%
          </div>
          <div className="text-[11px] text-[#717d8f] truncate">Đã xem</div>
        </div>
      </div>
    </section>
  );
}

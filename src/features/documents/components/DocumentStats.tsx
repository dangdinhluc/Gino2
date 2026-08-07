import React from 'react';
import { BookOpen, Clock3, CheckCircle2 } from 'lucide-react';

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
    <section className="grid grid-cols-3 gap-1 rounded-[24px] border border-[#f5ece1] bg-white p-3.5 sm:p-4 shadow-[0_6px_20px_rgba(217,74,19,0.05)] divide-x divide-[#f5ece1]">
      {/* Col 1: Total Docs */}
      <div className="flex flex-col items-center justify-center text-center px-2 space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#717d8f]">
          <BookOpen size={13} className="text-[#d83a00]" />
          <span>Tài liệu</span>
        </div>
        <div className="font-[var(--font-heading)] text-lg font-black text-[#0f172a] sm:text-xl">
          {stats.totalDocs}
        </div>
      </div>

      {/* Col 2: Total Time */}
      <div className="flex flex-col items-center justify-center text-center px-2 space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#717d8f]">
          <Clock3 size={13} className="text-[#d83a00]" />
          <span>Thời lượng</span>
        </div>
        <div className="font-[var(--font-heading)] text-lg font-black text-[#0f172a] sm:text-xl">
          ~{stats.totalMinutes} phút
        </div>
      </div>

      {/* Col 3: Viewed Percent */}
      <div className="flex flex-col items-center justify-center text-center px-2 space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#717d8f]">
          <CheckCircle2 size={13} className="text-[#059669]" />
          <span>Đã xem</span>
        </div>
        <div className="font-[var(--font-heading)] text-lg font-black text-[#059669] sm:text-xl">
          {stats.viewedPercent}%
        </div>
      </div>
    </section>
  );
}

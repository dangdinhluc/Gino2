import React from 'react';
import { BookOpen, CheckCircle2, Clock3 } from 'lucide-react';

export interface DocumentStatsData {
  totalDocs: number;
  totalMinutes: number;
  readCount?: number;
}

interface DocumentStatsProps {
  stats: DocumentStatsData;
}

export function DocumentStats({ stats }: DocumentStatsProps) {
  const readCount = stats.readCount ?? 0;

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

      {/* Col 2: Đã đọc */}
      <div className="flex flex-col items-center justify-center text-center px-2 space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#717d8f]">
          <CheckCircle2 size={13} className="text-emerald-600" />
          <span>Đã đọc</span>
        </div>
        <div className="font-[var(--font-heading)] text-lg font-black text-[#0f172a] sm:text-xl">
          {readCount}<span className="text-sm font-bold text-[#95a0af]">/{stats.totalDocs}</span>
        </div>
      </div>

      {/* Col 3: Total Time */}
      <div className="flex flex-col items-center justify-center text-center px-2 space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#717d8f]">
          <Clock3 size={13} className="text-[#d83a00]" />
          <span>Thời lượng</span>
        </div>
        <div className="font-[var(--font-heading)] text-lg font-black text-[#0f172a] sm:text-xl">
          ~{stats.totalMinutes} phút
        </div>
      </div>

    </section>
  );
}

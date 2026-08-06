import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';

export interface RecentPracticeResultData {
  id: string;
  title: string;
  timeAgo: string;
  scorePercent: number;
  correctAnswers: number;
  totalQuestions: number;
  durationMinutes: number;
}

interface RecentPracticeResultsProps {
  result?: RecentPracticeResultData;
  onReplay?: (id: string) => void;
  onViewAll?: () => void;
}

const defaultResult: RecentPracticeResultData = {
  id: 'reaction-interview',
  title: 'Phản xạ phỏng vấn Tokutei',
  timeAgo: 'Hôm nay · 10:23',
  scorePercent: 88,
  correctAnswers: 13,
  totalQuestions: 15,
  durationMinutes: 8,
};

export function RecentPracticeResults({
  result = defaultResult,
  onReplay,
  onViewAll,
}: RecentPracticeResultsProps) {
  return (
    <section className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <img
              src="/assets/game-icons/icon_trophy.png"
              alt="Trophy"
              className="h-4 w-4 object-contain"
            />
          </div>
          <h2 className="font-[var(--font-heading)] text-xs font-extrabold tracking-wider text-[#172033] uppercase">
            KẾT QUẢ GẦN ĐÂY
          </h2>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-orange-600 transition-colors hover:text-orange-700"
        >
          <span>Xem tất cả</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Card */}
      <div className="flex items-center justify-between gap-3.5 rounded-[22px] border border-[#efe5d7] bg-white p-3.5 shadow-2xs">
        {/* Thumbnail */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 p-2 border border-emerald-100">
          <img
            src="/assets/game-icons/icon_chart.png"
            alt="Chart"
            className="h-9 w-9 object-contain"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-[var(--font-heading)] text-base font-extrabold text-[#172033] line-clamp-1">
            {result.title}
          </h3>
          <p className="text-xs text-[#8c97a8]">{result.timeAgo}</p>
          <p className="text-xs font-semibold text-[#5f6b7c]">
            {result.correctAnswers}/{result.totalQuestions} câu đúng · {result.durationMinutes} phút
          </p>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className="font-[var(--font-heading)] text-xl font-extrabold text-emerald-600 sm:text-2xl">
            {result.scorePercent}%
          </div>
        </div>

        {/* Replay Button */}
        <div className="shrink-0 pl-1">
          <button
            type="button"
            onClick={() => onReplay?.(result.id)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-orange-600 shadow-2xs transition-all hover:bg-orange-50 active:scale-95"
          >
            <RotateCcw size={13} />
            <span>Làm lại</span>
          </button>
        </div>
      </div>
    </section>
  );
}

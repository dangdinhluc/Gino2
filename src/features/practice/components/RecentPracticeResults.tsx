import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { assetPath } from '@/src/shared/lib/assets';

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

export function RecentPracticeResults({ result = defaultResult, onReplay, onViewAll }: RecentPracticeResultsProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={assetPath('assets/practice-icons/achievement.webp')} alt="" className="h-7 w-7 object-contain" />
          <h2 className="font-[var(--font-heading)] text-xs font-extrabold uppercase tracking-[0.1em] text-[#172033]">Kết quả gần đây</h2>
        </div>
        <button type="button" onClick={onViewAll} className="inline-flex min-h-8 items-center gap-0.5 text-xs font-bold text-[#c64a16] hover:text-[#a83b0d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
          Xem tất cả <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>

      <article className="flex items-center gap-3 rounded-[22px] border border-[#dbead0] bg-[#fbfff8] p-3.5 shadow-[0_3px_12px_rgba(51,104,41,0.04)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#d6e9c9] bg-[#eff9e7] p-1.5">
          <img src={assetPath('assets/practice-icons/progress.webp')} alt="" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-[var(--font-heading)] text-[15px] font-extrabold text-[#172033] line-clamp-1">{result.title}</h3>
          <p className="mt-0.5 text-xs text-[#8490a0]">{result.timeAgo}</p>
          <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">{result.correctAnswers}/{result.totalQuestions} câu đúng · {result.durationMinutes} phút</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-[var(--font-heading)] text-xl font-extrabold text-emerald-600">{result.scorePercent}%</div>
          <button type="button" onClick={() => onReplay?.(result.id)} className="mt-1 inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#bfe0aa] bg-white px-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <RotateCcw size={12} aria-hidden="true" /> Làm lại
          </button>
        </div>
      </article>
    </section>
  );
}

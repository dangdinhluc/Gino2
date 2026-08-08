import React from 'react';
import { Sparkles } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';

export interface VocabularyOverviewStats {
  learnedCount: number;
  categoryCount: number;
  progressPercent: number;
}

interface VocabularyOverviewCardProps {
  stats?: VocabularyOverviewStats;
}

const defaultStats: VocabularyOverviewStats = {
  learnedCount: 8,
  categoryCount: 6,
  progressPercent: 46,
};

export function VocabularyOverviewCard({ stats = defaultStats }: VocabularyOverviewCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] px-3.5 py-2.5 shadow-2xs">
      {/* Background Japanese Watermark */}
      <div
        className="pointer-events-none absolute left-3 top-0 select-none text-2xl font-extrabold text-[#f7c297]/15"
        aria-hidden="true"
      >
        語
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left Badge & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-xs font-black text-white shadow-2xs">
            あ
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 font-[var(--font-heading)] text-sm font-extrabold tracking-[-0.01em] text-[#172033] sm:text-base">
              <span>Kho từ vựng</span>
              <Sparkles size={13} className="text-amber-500 fill-amber-400" />
            </div>
            <p className="text-[11px] font-medium text-[#717d8f] truncate">
              <strong>{stats.learnedCount}</strong> từ đã học · <strong>{stats.categoryCount}</strong> danh mục · <strong>{stats.progressPercent}%</strong> tiến độ
            </p>
          </div>
        </div>

        {/* Right Large Tanuki Mascot (No Animations, Large Crisp View) */}
        <div className="relative shrink-0 -my-3 -mr-2">
          <img
            src={assets.vocabulary.mascot}
            alt="Tanuki Flashcard Mascot"
            className="h-20 w-auto object-contain drop-shadow-sm sm:h-24 md:h-28"
          />
        </div>
      </div>
    </section>
  );
}

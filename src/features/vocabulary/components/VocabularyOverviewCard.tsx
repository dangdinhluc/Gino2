import React from 'react';
import { BookOpen, Folder, Sparkles } from 'lucide-react';
import { assetPath } from '@/src/shared/lib/assets';

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
    <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-4.5 shadow-2xs sm:p-5">
      {/* Background Japanese Watermark */}
      <div
        className="pointer-events-none absolute left-3 top-1 select-none text-3xl font-extrabold text-[#f7c297]/20"
        aria-hidden="true"
      >
        語
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left Badge Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f26522]/10 p-2 border border-[#f26522]/20">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f26522] text-sm font-black text-white shadow-xs">
            A
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="font-[var(--font-heading)] text-lg font-extrabold tracking-[-0.02em] text-[#172033] sm:text-xl">
              Kho từ vựng
            </h1>
            <Sparkles size={14} className="text-amber-500 fill-amber-400" />
          </div>
          <p className="text-xs text-[#5f6b7c] line-clamp-1">
            Ôn tập từ vựng theo chủ đề và luyện phát âm.
          </p>
        </div>

        {/* Right Illustration */}
        <div className="relative shrink-0">
          <img
            src={assetPath('assets/fuji_torii.png')}
            alt="Japanese Torii & Fuji illustration"
            className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-20"
          />
        </div>
      </div>

      {/* 3 Quick Stat Items */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-2xl border border-orange-100/80 bg-white/80 p-2.5 backdrop-blur-xs">
        {/* Stat 1: Learned */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <BookOpen size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-[var(--font-heading)] text-sm font-extrabold text-[#172033]">
              {stats.learnedCount}
            </div>
            <div className="text-[10px] text-[#717d8f] truncate">từ đã học</div>
          </div>
        </div>

        {/* Stat 2: In Category */}
        <div className="flex items-center gap-2 border-l border-orange-100/70 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Folder size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-[var(--font-heading)] text-sm font-extrabold text-[#172033]">
              {stats.categoryCount}
            </div>
            <div className="text-[10px] text-[#717d8f] truncate">từ trong danh mục</div>
          </div>
        </div>

        {/* Stat 3: Progress */}
        <div className="flex items-center gap-2 border-l border-orange-100/70 px-2">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <span className="text-[10px] font-black text-orange-600">{stats.progressPercent}%</span>
          </div>
          <div className="min-w-0">
            <div className="font-[var(--font-heading)] text-sm font-extrabold text-[#172033]">
              {stats.progressPercent}%
            </div>
            <div className="text-[10px] text-[#717d8f] truncate">tiến độ</div>
          </div>
        </div>
      </div>
    </section>
  );
}

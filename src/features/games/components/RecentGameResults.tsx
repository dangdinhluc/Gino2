import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import type { CourseGameType } from '@/src/features/games/types';
import { assetPath } from '@/src/shared/lib/assets';

export interface RecentResultItem {
  gameType: CourseGameType;
  title: string;
  badge: string;
  timeAgo: string; // e.g. "Hôm nay · 10:23"
  scorePercent: number; // e.g. 92
  thumbnail: string;
}

interface RecentGameResultsProps {
  result?: RecentResultItem;
  onReplay?: (gameType: CourseGameType) => void;
  onViewAll?: () => void;
}

const defaultResult: RecentResultItem = {
  gameType: 'vocab-sprint',
  title: 'Vocab Sprint',
  badge: 'Tốc độ',
  timeAgo: 'Hôm nay · 10:23',
  scorePercent: 92,
  thumbnail: assetPath('assets/thumb_sprint.png'),
};

export function RecentGameResults({
  result = defaultResult,
  onReplay,
  onViewAll,
}: RecentGameResultsProps) {
  return (
    <section className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <img
              src={assetPath('assets/game-icons/icon_trophy.png')}
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

      {/* Result Card */}
      <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[#f5ece1] bg-white p-3 sm:p-4 shadow-[0_6px_20px_rgba(217,74,19,0.05)]">
        {/* Thumbnail */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#fff9f3] border border-orange-200/40 sm:h-18 sm:w-20">
          <img
            src={result.thumbnail}
            alt={result.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-[var(--font-heading)] text-sm font-black text-[#0f172a] sm:text-base truncate">
              {result.title}
            </h3>
            <span className="inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-[#c2410c] border border-orange-200/60">
              {result.badge}
            </span>
          </div>

          <p className="text-[11px] font-semibold text-[#717d8f]">{result.timeAgo}</p>
        </div>

        {/* Score & Replay Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-right">
            <div className="font-[var(--font-heading)] text-lg font-black text-[#059669] sm:text-xl">
              {result.scorePercent}%
            </div>
          </div>

          <button
            type="button"
            onClick={() => onReplay?.(result.gameType)}
            className="flex h-9 items-center justify-center gap-1 rounded-2xl border border-orange-200/90 bg-orange-50/80 px-3 text-xs font-extrabold text-[#d83a00] shadow-2xs transition-all duration-200 hover:bg-orange-100 hover:border-orange-300 active:scale-95"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Chơi lại</span>
          </button>
        </div>
      </div>
    </section>
  );
}

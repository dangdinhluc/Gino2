import React from 'react';
import { assets } from '@/src/shared/lib/assets';

export interface GameStats {
  gamesCount: number;
  totalPlays: number;
  bestScorePercent: number;
}

interface GameStatsGridProps {
  stats?: GameStats;
}

const defaultStats: GameStats = {
  gamesCount: 3,
  totalPlays: 12,
  bestScorePercent: 92,
};

export function GameStatsGrid({ stats = defaultStats }: GameStatsGridProps) {
  return (
    <section className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
      {/* Card 1: Game count */}
      <div className="flex items-center gap-2.5 rounded-[20px] border border-[#f3e8da] bg-[#fffdfa] p-3 shadow-2xs transition-shadow hover:shadow-xs">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100/70 p-2">
          <img
            src={assets.games.icons.gamepad}
            alt="Game icon"
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-lg font-extrabold leading-none text-[#172033] sm:text-xl">
            {stats.gamesCount}
          </div>
          <div className="mt-0.5 text-xs text-[#717d8f]">game</div>
        </div>
      </div>

      {/* Card 2: Total plays */}
      <div className="flex items-center gap-2.5 rounded-[20px] border border-[#f3e8da] bg-[#fffdfa] p-3 shadow-2xs transition-shadow hover:shadow-xs">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100/70 p-2">
          <img
            src={assets.games.icons.chart}
            alt="Chart icon"
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-lg font-extrabold leading-none text-[#172033] sm:text-xl">
            {stats.totalPlays}
          </div>
          <div className="mt-0.5 text-xs text-[#717d8f]">lượt chơi</div>
        </div>
      </div>

      {/* Card 3: Best score */}
      <div className="flex items-center gap-2.5 rounded-[20px] border border-[#f3e8da] bg-[#fffdfa] p-3 shadow-2xs transition-shadow hover:shadow-xs">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/70 p-2">
          <img
            src={assets.games.icons.trophy}
            alt="Trophy icon"
            className="h-7 w-7 object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[var(--font-heading)] text-lg font-extrabold leading-none text-[#172033] sm:text-xl">
            {stats.bestScorePercent}%
          </div>
          <div className="mt-0.5 text-xs text-[#717d8f]">Best</div>
        </div>
      </div>
    </section>
  );
}

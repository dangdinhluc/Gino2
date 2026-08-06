import React from 'react';

export interface DailyChallengeData {
  title: string;
  rewardXp: number;
  progress: number; // percentage, e.g. 70
  target: number;
}

interface DailyChallengeCardProps {
  challenge?: DailyChallengeData;
  onClaimReward?: () => void;
}

const defaultChallenge: DailyChallengeData = {
  title: 'Chơi 1 game bất kỳ',
  rewardXp: 20,
  progress: 70,
  target: 1,
};

export function DailyChallengeCard({ challenge = defaultChallenge, onClaimReward }: DailyChallengeCardProps) {
  const clampedProgress = Math.max(0, Math.min(100, challenge.progress));

  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#fde2cb] bg-gradient-to-r from-[#fffcf8] via-[#fff5eb] to-[#ffebd7] p-4 shadow-sm sm:p-5">
      {/* Background ambient sparkle */}
      <div className="pointer-events-none absolute right-16 top-2 select-none text-xs opacity-60" aria-hidden="true">
        ✦
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Left Calendar 3D Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xs border border-orange-100">
          <img
            src="/assets/game-icons/icon_calendar.png"
            alt="Calendar"
            className="h-9 w-9 object-contain"
          />
        </div>

        {/* Center Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block rounded-full bg-orange-100/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-orange-700 uppercase border border-orange-200/60">
              THỬ THÁCH HÔM NAY
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
              <span>⭐</span> +{challenge.rewardXp} XP
            </span>
          </div>

          <h3 className="font-[var(--font-heading)] text-sm font-extrabold text-[#172033] sm:text-base">
            {challenge.title}
          </h3>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f3e3d3]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold text-[#717d8f]">{clampedProgress}%</span>
          </div>
        </div>

        {/* Right Gift Box */}
        <div 
          onClick={onClaimReward}
          className="relative shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
          title="Nhận phần thưởng"
        >
          <img
            src="/assets/gift_box.png"
            alt="Gift Box"
            className="h-16 w-16 object-contain drop-shadow-md sm:h-18 sm:w-18"
          />
        </div>
      </div>
    </section>
  );
}

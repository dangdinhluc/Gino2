import { Sparkles, Zap } from 'lucide-react';
import type { LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';

const XP_PER_LEVEL = 500;

interface WeeklyActivityProps {
  today: string;
  weeklyActivity: NonNullable<LearnerStatsSnapshot['weeklyActivity']>;
  displayStreak: number;
  xpIntoLevel: number;
  remainingLevelXp: number;
  level: number;
  streakMilestone: number | null;
}

export function WeeklyActivity({ today, weeklyActivity, displayStreak, xpIntoLevel, remainingLevelXp, level, streakMilestone }: WeeklyActivityProps) {
  return (
    <section className="rounded-[28px] border border-[#f5ece1] bg-white p-5 sm:p-6 shadow-2xs space-y-4" aria-label="Nhịp học 7 ngày qua">
      <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#b45309]">
            GIỮ LỬA MỖI NGÀY
          </span>
          <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
            Nhịp học 7 ngày qua
          </h2>
        </div>
        <span className="rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-black text-[#b45309]">
          {weeklyActivity.filter((day) => day.xp > 0).length}/7 ngày
        </span>
      </div>

      <div className="flex items-end justify-between gap-2" role="img" aria-label="Heatmap 7 ngày học gần nhất">
        {weeklyActivity.map((day) => {
          const date = new Date(`${day.date}T00:00:00Z`);
          const isToday = day.date === today;
          const label = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getUTCDay()];
          const xp = day.xp;
          const cellClass = xp <= 0
            ? 'bg-[#f3ead9]'
            : xp < 10
              ? 'bg-orange-100'
              : xp < 25
                ? 'bg-orange-200'
                : xp < 40
                  ? 'bg-orange-300'
                  : 'bg-gradient-to-br from-[#d83a00] to-[#f26522]';
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5" title={`${day.date}: ${day.xp} XP`}>
              <span className={`h-9 w-full max-w-12 rounded-xl border ${isToday ? 'border-[#d83a00] ring-2 ring-orange-200' : 'border-[#efe3d2]'} ${cellClass}`} />
              <span className={`text-[10px] font-black ${isToday ? 'text-[#d83a00]' : 'text-[#95a0af]'}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5 rounded-2xl bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] border border-orange-200/70 p-3.5">
        {remainingLevelXp > 0 ? (
          <p className="text-xs font-black text-[#c2410c]">
            <Zap size={13} className="mr-1 inline text-amber-500 fill-amber-400" />
            Còn {remainingLevelXp} XP nữa lên Cấp {level + 1} — {xpIntoLevel}/{XP_PER_LEVEL} XP
          </p>
        ) : (
          <p className="text-xs font-black text-[#c2410c]">
            <Sparkles size={13} className="mr-1 inline text-amber-500" />
            Đã đạt cấp tối đa hôm nay — giữ phong độ nhé!
          </p>
        )}
        {streakMilestone !== null && (
          <p className="text-xs font-bold text-[#5f6b7c]">
            🔥 Thêm {streakMilestone - displayStreak} ngày nữa đạt mốc {streakMilestone} ngày 🏅
          </p>
        )}
      </div>
    </section>
  );
}

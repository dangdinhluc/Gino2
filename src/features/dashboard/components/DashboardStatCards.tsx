import { Layers, CheckCircle2, Flame, Zap } from 'lucide-react';

interface DashboardStatCardsProps {
  dailyGoalProgress: number;
  displayStreak: number;
  displayDueCount: number;
  displayReviewedToday: number;
  totalXp: number;
  level: number;
  levelProgress: number;
  effectiveDailyXp: number;
}

export function DashboardStatCards({
  dailyGoalProgress,
  displayStreak,
  displayDueCount,
  displayReviewedToday,
  totalXp,
  level,
  levelProgress,
  effectiveDailyXp,
}: DashboardStatCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Chỉ số học tập hôm nay">
      <div className="rounded-[22px] border border-[#f5ece1] bg-white p-4 shadow-2xs transition-all hover:shadow-md sm:p-5 gino-hover-lift">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#717d8f]">Hôm nay</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/70"><Zap size={15} className="fill-current" /></span>
        </div>
        <p className="mt-2 font-[var(--font-heading)] text-3xl font-black tabular-nums text-[#172033] tracking-tight">{effectiveDailyXp}<span className="ml-1 align-middle text-sm font-extrabold tracking-normal text-[#b45309]">XP</span></p>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#efe5d7]" role="progressbar" aria-label="Mục tiêu XP hôm nay" aria-valuemin={0} aria-valuemax={100} aria-valuenow={dailyGoalProgress}>
          <div className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522]" style={{ width: `${dailyGoalProgress}%` }} />
        </div>
        <p className="mt-1.5 text-xs font-semibold text-[#7b8796]">{dailyGoalProgress}% mục tiêu XP hôm nay</p>
      </div>

      <div className="rounded-[22px] border border-[#f5ece1] bg-white p-4 shadow-2xs transition-all hover:shadow-md sm:p-5 gino-hover-lift">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#717d8f]">Chuỗi</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#b45309] border border-amber-200/70"><Flame size={15} className="text-[#d83a00] fill-[#d83a00]" /></span>
        </div>
        <p className="mt-2 font-[var(--font-heading)] text-3xl font-black tabular-nums text-[#172033] tracking-tight">{displayStreak}<span className="ml-1 align-middle text-sm font-extrabold tracking-normal text-[#b45309]">ngày</span></p>
        <p className="mt-2.5 text-xs font-semibold leading-relaxed text-[#7b8796]">Duy trì mỗi ngày để giữ chuỗi và mở khóa thành tích.</p>
      </div>

      <div className="rounded-[22px] border border-[#f5ece1] bg-white p-4 shadow-2xs transition-all hover:shadow-md sm:p-5 gino-hover-lift">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#717d8f]">SRS</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200/70"><Layers size={15} /></span>
        </div>
        <p className="mt-2 font-[var(--font-heading)] text-3xl font-black tabular-nums text-[#172033] tracking-tight">{displayDueCount}<span className="ml-1 align-middle text-sm font-extrabold tracking-normal text-sky-600">thẻ</span></p>
        <p className="mt-2.5 text-xs font-semibold leading-relaxed text-[#7b8796]">
          {displayDueCount > 0 ? 'Đến hạn hôm nay — mở Flashcard để ôn.' : 'Đã hết thẻ cần ôn hôm nay.'}
        </p>
      </div>

      <div className="rounded-[22px] border border-[#f5ece1] bg-white p-4 shadow-2xs transition-all hover:shadow-md sm:p-5 gino-hover-lift">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#717d8f]">Hôm nay</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200/70"><CheckCircle2 size={15} /></span>
        </div>
        <p className="mt-2 font-[var(--font-heading)] text-3xl font-black tabular-nums text-[#172033] tracking-tight">{displayReviewedToday}<span className="ml-1 align-middle text-sm font-extrabold tracking-normal text-[#059669]">từ</span></p>
        <p className="mt-2.5 text-xs font-semibold leading-relaxed text-[#7b8796]">Từ đã ôn hôm nay trên toàn bộ hệ thống SRS.</p>
      </div>
    </section>
  );
}

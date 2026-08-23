import { Gift } from 'lucide-react';

interface DailyRewardBannerProps {
  claiming: boolean;
  rewardState: { claimed: boolean; rewardXp: number } | null;
  rewardError: string | null;
  onClaim: () => void;
}

export function DailyRewardBanner({ claiming, rewardState, rewardError, onClaim }: DailyRewardBannerProps) {
  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" aria-label="Phần thưởng mỗi ngày">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm"><Gift size={20} /></span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">Phần thưởng mỗi ngày</p>
          <p className="mt-1 text-sm font-bold text-[#172033]">Mở app, nhận 15 XP và giữ nhịp học.</p>
          {rewardState && (
            <p className="mt-1 text-xs font-semibold text-emerald-700">{rewardState.claimed ? `Đã nhận +${rewardState.rewardXp} XP hôm nay.` : 'Đã nhận phần thưởng hôm nay.'}</p>
          )}
          {rewardError && (
            <p role="alert" className="mt-1 text-xs font-semibold text-red-700">{rewardError}</p>
          )}
        </div>
      </div>
      <button type="button" onClick={onClaim} disabled={claiming || rewardState?.claimed === false} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#d83a00] px-4 py-2.5 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"><Gift size={16} />{claiming ? 'Đang nhận…' : rewardState?.claimed === false ? 'Đã nhận hôm nay' : 'Nhận phần thưởng'}</button>
    </section>
  );
}

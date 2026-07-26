import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Crown,
  Flame,
  MessageCircle,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getWeeklyLeaderboard } from '@/src/features/social/lib/leaderboard';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { startOfDay } from '@/src/features/review/lib/srs';

const WEEKLY_REVIEW_TARGET = 100;

const rankStyles = [
  'from-amber-400 to-yellow-300 text-amber-900',
  'from-slate-300 to-slate-200 text-slate-700',
  'from-orange-300 to-amber-200 text-orange-800',
];

function weekStart(now: number): number {
  const date = new Date(now);
  const weekday = (date.getDay() + 6) % 7; // T2 = 0
  return startOfDay(now) - weekday * 86_400_000;
}

export default function FriendsPage() {
  const weeklyXp = useProgressStore((state) => state.weeklyXp);
  const streak = useProgressStore((state) => state.streak);
  const totalReviewXp = useReviewStore((state) => state.totalReviewXp);
  const log = useReviewStore((state) => state.log);

  const now = Date.now();
  const rows = useMemo(
    () => getWeeklyLeaderboard({ weeklyXp: weeklyXp + totalReviewXp, streak }, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weeklyXp, totalReviewXp, streak],
  );
  const maxXp = Math.max(1, ...rows.map((row) => row.weeklyXp));
  const userRank = rows.findIndex((row) => row.isUser) + 1;

  const weeklyReviews = useMemo(() => {
    const cutoff = weekStart(now);
    return log.filter((entry) => entry.at >= cutoff).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);
  const challengePct = Math.min(100, Math.round((weeklyReviews / WEEKLY_REVIEW_TARGET) * 100));

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px] md:tracking-[0.2em]">
              <Users size={14} />
              Cộng đồng
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Bạn học Tokutei</h2>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
                Bảng xếp hạng tuần tính bằng XP học thật của anh. Giữ streak, ôn thẻ mỗi ngày để leo hạng cùng nhóm.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-orange-100 bg-orange-50 px-3 py-2.5 text-orange-600 md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Hạng của anh</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">#{userRank}</div>
              <div className="mt-1 text-[10px] font-medium md:text-[11px]">trong {rows.length} bạn học</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-blue-600 md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">XP tuần</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{weeklyXp + totalReviewXp}</div>
              <div className="mt-1 text-[10px] font-medium md:text-[11px]">từ học thật</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-amber-100 bg-amber-50 px-3 py-2.5 text-amber-600 md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Streak</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{streak}d</div>
              <div className="mt-1 text-[10px] font-medium md:text-[11px]">liên tục</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Bảng xếp hạng */}
        <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:rounded-[2.5rem] md:p-6">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="text-lg font-black tracking-tight text-gray-900">Bảng xếp hạng tuần</h3>
            </div>
            <span className="text-xs font-bold text-gray-400">Reset thứ 2 hằng tuần</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {rows.map((row, index) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 rounded-[1.6rem] border px-3.5 py-3 md:gap-4 md:px-4',
                  row.isUser
                    ? 'border-orange-300 bg-[linear-gradient(135deg,#fff7ec_0%,#ffedd5_100%)] shadow-[0_18px_42px_-30px_rgba(249,115,22,0.35)]'
                    : 'border-[#eee5d8] bg-white/65',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black',
                    index < 3 ? cn('bg-gradient-to-br shadow-sm', rankStyles[index]) : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {index === 0 ? <Crown size={18} /> : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-black text-gray-900">{row.name}</span>
                    {row.isUser && <span className="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">Anh</span>}
                    <span className="hidden shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-500 sm:block">{row.level}</span>
                  </div>
                  <div className="mt-1 truncate text-[11px] font-medium text-gray-400">{row.status}</div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#efe7dc]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((row.weeklyXp / maxXp) * 100)}%` }}
                      className={cn('h-full rounded-full', row.isUser ? 'bg-gradient-to-r from-orange-500 to-amber-400' : 'bg-blue-300')}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-black text-gray-900">{row.weeklyXp} XP</div>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold text-orange-500">
                    <Flame size={11} className="fill-orange-500" /> {row.streak}d
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-center text-[11px] font-medium text-gray-400">
            Các bạn học đồng hành giúp anh giữ nhịp thi đua — XP của anh là dữ liệu học thật trên máy này.
          </p>
        </div>

        {/* Cột phải: thử thách + kết nối */}
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              <Target size={14} /> Thử thách tuần này
            </div>
            <h3 className="mt-3 text-xl font-black tracking-tight text-gray-900">Ôn {WEEKLY_REVIEW_TARGET} lượt thẻ nhớ</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500">Cả nhóm đang chạy chung thử thách này. Mỗi lượt chấm thẻ được tính một điểm.</p>
            <div className="mt-4 flex items-end justify-between">
              <div className="text-4xl font-black text-gray-900">{weeklyReviews}</div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-600">{challengePct}%</div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#efe5d7]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${challengePct}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            </div>
            <Link
              to="/app/review/flashcards?mode=due"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100"
            >
              <Zap size={16} /> Cày điểm ngay
            </Link>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-pink-500">
              <MessageCircle size={14} /> Kết nối nhóm
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
              Vào kênh tin nhắn để hỏi mentor, luyện câu phỏng vấn hoặc rủ nhóm cram chung một chủ đề.
            </p>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Nhóm Tokutei Nhà hàng', sub: 'Học nhóm mỗi tối 21h' },
                { label: 'Gino Mentor', sub: 'Hỏi đáp lộ trình 1-1' },
                { label: 'HR Mock Room', sub: 'Mỗi ngày một câu phỏng vấn' },
              ].map((channel) => (
                <Link
                  key={channel.label}
                  to="/app/messages"
                  className="group flex items-center gap-3 rounded-[1.5rem] border border-[#eee5d8] bg-white/70 px-4 py-3 transition-all hover:border-pink-200 hover:bg-white"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                    <MessageCircle size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-gray-900">{channel.label}</div>
                    <div className="truncate text-xs font-medium text-gray-400">{channel.sub}</div>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-pink-500" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
              <Sparkles size={19} />
            </div>
            <p className="text-xs font-bold leading-relaxed text-gray-600">
              Viết nhật ký học mỗi ngày ở mục <Link to="/app/journal" className="text-orange-600 underline decoration-orange-300 underline-offset-2">Journal</Link> để nhớ lâu hơn và có tư liệu trả lời phỏng vấn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

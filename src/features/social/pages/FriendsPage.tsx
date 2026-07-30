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
const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

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

  const heroStats = [
    { label: 'Hạng của anh', value: `#${userRank}`, sub: `trong ${rows.length} bạn học` },
    { label: 'XP tuần', value: weeklyXp + totalReviewXp, sub: 'từ học thật' },
    { label: 'Streak', value: `${streak}d`, sub: 'liên tục' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      <section className={panelClass}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <Users size={14} /> Cộng đồng
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Bạn học Tokutei</h1>
            <p className="max-w-2xl text-sm text-[#5f6b7c]">Bảng xếp hạng tuần tính bằng XP học thật của anh. Giữ streak, ôn thẻ mỗi ngày để leo hạng cùng nhóm.</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {heroStats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 md:min-w-[6rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">{stat.label}</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-xl font-bold leading-none text-[#172033] md:text-2xl">{stat.value}</div>
                <div className="mt-1 text-[11px] text-[#95a0af]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={panelClass}>
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-orange-700" strokeWidth={1.8} />
              <h2 className="font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">Bảng xếp hạng tuần</h2>
            </div>
            <span className="text-xs text-[#95a0af]">Reset thứ 2 hằng tuần</span>
          </div>

          <div className="mt-4 space-y-2">
            {rows.map((row, index) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3.5 py-3 md:gap-4 md:px-4',
                  row.isUser ? 'border-orange-300 bg-orange-50/60' : 'border-[#e8dccb] bg-[#fffdf8]',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                    index === 0 ? 'bg-orange-700 text-white' : index < 3 ? 'bg-orange-100 text-orange-700' : 'bg-[#f0f2f5] text-[#5f6b7c]',
                  )}
                >
                  {index === 0 ? <Crown size={18} /> : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-bold text-[#172033]">{row.name}</span>
                    {row.isUser && <span className="shrink-0 rounded-md bg-orange-700 px-2 py-0.5 text-[9px] font-bold uppercase text-white">Anh</span>}
                    <span className="hidden shrink-0 rounded-md bg-[#f0f2f5] px-2 py-0.5 text-[9px] font-bold text-[#5f6b7c] sm:block">{row.level}</span>
                  </div>
                  <div className="mt-1 truncate text-[11px] text-[#95a0af]">{row.status}</div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((row.weeklyXp / maxXp) * 100)}%` }}
                      className={cn('h-full rounded-full', row.isUser ? 'bg-orange-700' : 'bg-orange-300')}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-[#172033]">{row.weeklyXp} XP</div>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold text-orange-700">
                    <Flame size={11} strokeWidth={1.8} /> {row.streak}d
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-4 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-center text-[11px] text-[#95a0af]">
            Các bạn học đồng hành giúp anh giữ nhịp thi đua — XP của anh là dữ liệu học thật trên máy này.
          </p>
        </div>

        <div className="space-y-4">
          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <Target size={14} /> Thử thách tuần này
            </div>
            <h2 className="mt-3 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Ôn {WEEKLY_REVIEW_TARGET} lượt thẻ nhớ</h2>
            <p className="mt-1 text-sm text-[#5f6b7c]">Cả nhóm đang chạy chung thử thách này. Mỗi lượt chấm thẻ được tính một điểm.</p>
            <div className="mt-4 flex items-end justify-between">
              <div className="font-[var(--font-heading)] text-4xl font-bold text-[#172033]">{weeklyReviews}</div>
              <div className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">{challengePct}%</div>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#efe5d7]">
              <motion.div initial={{ width: 0 }} animate={{ width: `${challengePct}%` }} className="h-full rounded-full bg-orange-700" />
            </div>
            <Link
              to="/app/review/flashcards?mode=due"
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
            >
              <Zap size={16} /> Cày điểm ngay
            </Link>
          </div>

          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <MessageCircle size={14} /> Kết nối nhóm
            </div>
            <p className="mt-3 text-sm text-[#5f6b7c]">Vào kênh tin nhắn để hỏi mentor, luyện câu phỏng vấn hoặc rủ nhóm cram chung một chủ đề.</p>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Nhóm Tokutei Nhà hàng', sub: 'Học nhóm mỗi tối 21h' },
                { label: 'Gino Mentor', sub: 'Hỏi đáp lộ trình 1-1' },
                { label: 'HR Mock Room', sub: 'Mỗi ngày một câu phỏng vấn' },
              ].map((channel) => (
                <Link
                  key={channel.label}
                  to="/app/messages"
                  className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 transition-colors hover:bg-[#fffaf3] ${focusRing}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                    <MessageCircle size={17} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-[#172033]">{channel.label}</div>
                    <div className="truncate text-xs text-[#95a0af]">{channel.sub}</div>
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Sparkles size={19} strokeWidth={1.8} />
            </span>
            <p className="text-xs font-medium leading-relaxed text-[#5f6b7c]">
              Viết nhật ký học mỗi ngày ở mục <Link to="/app/journal" className="font-bold text-orange-700 underline underline-offset-2">Journal</Link> để nhớ lâu hơn và có tư liệu trả lời phỏng vấn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crown,
  Download,
  Flame,
  Headphones,
  Medal,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { dashboardTools, PRIMARY_TOOL_COUNT } from '@/src/data/dashboardMock';
import { buildDailySession } from '@/src/features/dashboard/lib/dailySession';
import {
  DAILY_GOAL_XP,
  XP_PER_LEVEL,
  leaderboardPeers,
  learningTracks,
} from '@/src/features/dashboard/mock/gamifiedDashboardMock';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-800';

const cardClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';

const levelBadgeClass: Record<string, string> = {
  A1: 'bg-emerald-50 text-emerald-700',
  A2: 'bg-orange-50 text-orange-700',
  B1: 'bg-[#efe8f7] text-[#6F4AA8]',
};

export default function Dashboard() {
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(true);
  const [areAllToolsVisible, setAreAllToolsVisible] = useState(false);
  const reviewStates = useReviewStore((state) => state.states);
  const reviewLog = useReviewStore((state) => state.log);
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);

  const dueCount = useMemo(() => collectDueCards(reviewStates, Date.now()).length, [reviewStates]);
  const dailySession = useMemo(() => buildDailySession(dueCount), [dueCount]);
  const reviewedToday = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return reviewLog.filter((entry) => entry.at >= dayStart).length;
  }, [reviewLog]);

  const visibleTools = areAllToolsVisible ? dashboardTools : dashboardTools.slice(0, PRIMARY_TOOL_COUNT);
  const hiddenToolCount = dashboardTools.length - PRIMARY_TOOL_COUNT;
  const completedSteps = reviewedToday >= 8 ? 1 : 0;

  // Cấp độ & XP suy ra từ tiến trình thật trong store.
  const totalXp = weeklyXp;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const levelProgress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);

  // Mục tiêu hôm nay gắn với số thẻ đã ôn trong ngày.
  const earnedTodayXp = Math.min(DAILY_GOAL_XP, reviewedToday * 6);
  const goalProgress = Math.round((earnedTodayXp / DAILY_GOAL_XP) * 100);

  // Bảng xếp hạng: chèn người dùng hiện tại rồi sắp theo XP.
  const leaderboard = useMemo(() => {
    const merged = [
      ...leaderboardPeers,
      { id: 'me', name: 'Bạn', xp: totalXp },
    ];
    return merged
      .slice()
      .sort((a, b) => b.xp - a.xp)
      .map((entry, index) => ({ ...entry, rank: index + 1, isCurrentUser: entry.id === 'me' }));
  }, [totalXp]);

  const podium = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3, 9);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 pb-4">
      {/* Hero: chào mừng + cấp độ/XP + streak */}
      <section className={cardClass}>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">
              <Sparkles size={13} /> Chào mừng trở lại
            </span>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">
              Tiếp tục chuỗi học hôm nay
            </h1>
            <p className="text-sm text-[#4d5a6b]">Chăm chỉ học mỗi ngày để leo hạng và nhận huy hiệu cuối tháng nhé.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-[linear-gradient(125deg,#fff4e8_0%,#fffaf3_70%)] px-3.5 py-2.5">
              <Flame size={22} className="text-orange-600" />
              <div>
                <div className="font-[var(--font-heading)] text-xl font-bold leading-none text-[#172033]">{streak}</div>
                <div className="mt-1 text-[11px] text-[#5f6b7c]">ngày streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-700 text-white">
                <Zap size={20} />
              </span>
              <div>
                <p className="font-[var(--font-heading)] text-base font-bold text-[#172033]">Cấp độ {level}</p>
                <p className="text-xs text-[#5f6b7c]">{totalXp} điểm XP</p>
              </div>
            </div>
            <span className="text-sm font-bold text-orange-800">{levelProgress}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#efe5d7]">
            <div className="h-full rounded-full bg-orange-700 transition-all duration-500" style={{ width: `${levelProgress}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-[#7b8796]">Còn {XP_PER_LEVEL - xpIntoLevel} XP nữa để lên cấp {level + 1}</p>
        </div>
      </section>

      {/* Mục tiêu hôm nay */}
      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-orange-700" />
            <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Mục tiêu hôm nay</h2>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#efe5d7" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#c2410c"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(goalProgress / 100) * 97.4} 97.4`}
                />
              </svg>
              <span className="absolute font-[var(--font-heading)] text-base font-bold text-[#172033]">{goalProgress}%</span>
            </div>
            <div className="min-w-0">
              <p className="font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{earnedTodayXp}<span className="text-base text-[#7b8796]"> / {DAILY_GOAL_XP} XP</span></p>
              <p className="mt-0.5 text-sm text-[#5f6b7c]">{dailySession.totalMinutes} phút học đề xuất hôm nay</p>
              <Link to={dailySession.steps[completedSteps]?.path ?? '/app/review'} className={`mt-2 inline-flex items-center gap-1 text-sm font-bold text-orange-800 hover:underline ${focusRing}`}>
                {earnedTodayXp >= DAILY_GOAL_XP ? 'Hoàn thành mục tiêu!' : 'Học tiếp'} <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        <Link
          to="/app/stats"
          className={`group flex flex-col justify-between rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-5 transition-colors hover:border-orange-200 hover:bg-orange-50/40 ${focusRing}`}
        >
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-700" />
            <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Thống kê & huy hiệu</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#5f6b7c]">Xem readiness theo kỹ năng, chuỗi ngày và thành tích đã đạt.</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-800">Xem chi tiết <ChevronRight size={15} /></span>
        </Link>
      </section>

      {/* Bảng xếp hạng */}
      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-orange-700" />
            <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Bảng xếp hạng</h2>
          </div>
          <span className="text-xs text-[#7b8796]">Top 3 nhận huy hiệu cuối tháng</span>
        </div>

        {/* Bục vàng top 3 */}
        <div className="mt-4 grid grid-cols-3 items-end gap-2">
          {podiumOrder.map((entry) => {
            const isFirst = entry.rank === 1;
            const podiumHeight = isFirst ? 'h-24' : entry.rank === 2 ? 'h-20' : 'h-16';
            const medalColor = isFirst ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : 'text-orange-400';
            return (
              <div key={entry.id} className="flex flex-col items-center">
                <span className={`mb-1 ${medalColor}`}>{isFirst ? <Crown size={22} /> : <Medal size={20} />}</span>
                <p className={`max-w-full truncate text-center text-xs font-bold ${entry.isCurrentUser ? 'text-orange-800' : 'text-[#172033]'}`}>{entry.name}</p>
                <p className="text-[11px] text-[#7b8796]">{entry.xp} XP</p>
                <div className={`mt-1.5 flex w-full items-start justify-center rounded-t-xl border border-b-0 pt-1.5 text-sm font-bold ${podiumHeight} ${entry.isCurrentUser ? 'border-orange-300 bg-orange-100 text-orange-800' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]'}`}>
                  {entry.rank}
                </div>
              </div>
            );
          })}
        </div>

        {/* Danh sách còn lại */}
        <ul className="mt-2 divide-y divide-[#efe5d7]">
          {restOfLeaderboard.map((entry) => (
            <li
              key={entry.id}
              className={`flex items-center gap-3 rounded-lg px-2 py-2.5 ${entry.isCurrentUser ? 'bg-orange-50' : ''}`}
            >
              <span className={`w-6 shrink-0 text-center text-sm font-bold ${entry.isCurrentUser ? 'text-orange-800' : 'text-[#95a0af]'}`}>{entry.rank}</span>
              <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${entry.isCurrentUser ? 'text-orange-800' : 'text-[#172033]'}`}>
                {entry.name}{entry.isCurrentUser ? ' · bạn' : ''}
              </span>
              <span className="shrink-0 text-sm text-[#5f6b7c]">{entry.xp} XP</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bài học nổi bật hôm nay */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-orange-700" />
              <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Bài học nổi bật hôm nay</h2>
            </div>
            <p className="mt-1 text-sm text-[#5f6b7c]">{dailySession.track} · {completedSteps}/{dailySession.steps.length} bước</p>
          </div>
          <Link to={dailySession.steps[completedSteps]?.path ?? '/app/stats'} className={`${primaryButtonClass} ${focusRing}`}>
            <Sparkles size={16} /> {completedSteps === 0 ? 'Bắt đầu phiên' : 'Tiếp tục phiên'}
          </Link>
        </div>
        <ol className="mt-4 grid gap-2.5 md:grid-cols-3">
          {dailySession.steps.map((step, index) => {
            const isDone = index < completedSteps;
            const isCurrent = index === completedSteps;
            const StepIcon = step.id === 'review' ? Headphones : step.id === 'lesson' ? Target : MessageSquareText;
            return (
              <li key={step.id}>
                <Link
                  to={step.path}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`group flex min-h-28 gap-3 rounded-xl border p-3.5 transition-colors ${focusRing} ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : isCurrent
                        ? 'border-orange-300 bg-white shadow-sm'
                        : 'border-[#e8dccb] bg-[#fffdf8] hover:border-orange-200'
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-orange-700 text-white' : 'bg-[#f0f2f5] text-[#5f6b7c]'}`}>
                    {isDone ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f6b7c]">
                      Bước {index + 1}<span>{step.minutes}' · +{step.xp}</span>
                    </span>
                    <span className="mt-1 block text-sm font-bold text-[#172033]">{step.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[#5f6b7c]">{step.detail}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Tiến trình học tập */}
      <section className={cardClass}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-orange-700" />
            <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Tiến trình học tập</h2>
          </div>
          <Link to="/app/courses" className="text-sm font-bold text-orange-800 hover:underline">Tất cả →</Link>
        </div>
        <ul className="mt-3 divide-y divide-[#efe5d7]">
          {learningTracks.map((track) => {
            const percent = track.total > 0 ? Math.round((track.learned / track.total) * 100) : 0;
            const isComplete = percent >= 100;
            return (
              <li key={track.id}>
                <Link to={track.path} className={`group flex items-center gap-3 py-3.5 ${focusRing}`}>
                  <span className={`flex h-8 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-bold ${levelBadgeClass[track.level]}`}>{track.level}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#172033]">{track.title}</span>
                      <span className="shrink-0 text-xs text-[#7b8796]">{track.learned}/{track.total} từ · {percent}%</span>
                    </span>
                    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#efe5d7]">
                      <span className={`block h-full rounded-full ${isComplete ? 'bg-emerald-600' : 'bg-orange-700'}`} style={{ width: `${percent}%` }} />
                    </span>
                  </span>
                  {isComplete ? (
                    <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Tìm kiếm */}
      <Link
        to="/app/search"
        className={`group flex items-center gap-3 rounded-2xl border border-[#e0d2bf] bg-[#fffaf3] px-4 py-3.5 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
      >
        <Search size={18} className="shrink-0 text-[#5f6b7c] transition-colors group-hover:text-orange-700" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate text-sm text-[#4d5a6b]">Tìm lộ trình, hồ sơ hoặc mock test</span>
        <ChevronRight size={17} className="shrink-0 text-[#5f6b7c] transition-colors group-hover:text-orange-700" />
      </Link>

      {/* Công cụ bổ trợ */}
      <section className="space-y-2.5">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Công cụ bổ trợ</h2>
            <p className="mt-0.5 text-xs text-[#5f6b7c]">Dùng khi cần luyện sâu hơn ngoài phiên hôm nay.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <Link key={tool.label} to={tool.path} className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-3.5 transition-colors hover:border-orange-200 hover:bg-[#fffdf8] ${focusRing}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><tool.icon size={19} strokeWidth={1.8} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">{tool.label}</span><span className="mt-0.5 block truncate text-xs text-[#5f6b7c]">{tool.sub}</span></span>
              <ChevronRight size={16} className="shrink-0 text-[#7b8796] transition-colors group-hover:text-orange-700" />
            </Link>
          ))}
        </div>
        <button type="button" onClick={() => setAreAllToolsVisible((value) => !value)} aria-expanded={areAllToolsVisible} className={`flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 text-sm font-bold text-[#4d5a6b] transition-colors hover:text-orange-700 ${focusRing}`}>
          {areAllToolsVisible ? 'Thu gọn công cụ' : `Xem thêm ${hiddenToolCount} công cụ`}<ChevronDown size={16} className={areAllToolsVisible ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </section>

      {isInstallPromptVisible && (
        <div className="flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Download size={19} strokeWidth={1.8} /></span>
          <div className="min-w-0 flex-1"><p className="font-bold text-[#172033]">Cài đặt TOKUTEI GINO</p><p className="mt-0.5 text-xs text-[#5f6b7c]">Ghim lối tắt để mở nhanh dashboard mỗi ngày.</p></div>
          <Link to="/app/settings" className={`shrink-0 rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}>Cài đặt</Link>
          <button type="button" aria-label="Ẩn nhắc cài đặt" onClick={() => setIsInstallPromptVisible(false)} className="shrink-0 rounded-lg p-1.5 text-[#7b8796] transition-colors hover:text-[#4d5a6b]"><X size={18} /></button>
        </div>
      )}

      {/* Cộng đồng */}
      <section className="space-y-3">
        <div className="flex items-end justify-between px-1"><h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Cộng đồng</h2><Link to="/app/messages" className="text-sm font-bold text-orange-800 hover:underline">Mở tất cả →</Link></div>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Link to="/app/messages" className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Users size={19} strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">Zalo · Nhóm chính</span><span className="mt-0.5 block truncate text-xs text-[#5f6b7c]">Trao đổi nhanh, hỏi bài, nhắc lịch học.</span></span><ChevronRight size={16} className="shrink-0 text-[#7b8796] transition-colors group-hover:text-orange-700" /></Link>
          <Link to="/app/messages" className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><MessageSquareText size={19} strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">Facebook · Cộng đồng</span><span className="mt-0.5 block truncate text-xs text-[#5f6b7c]">Cập nhật đề mới và chia sẻ kinh nghiệm.</span></span><ChevronRight size={16} className="shrink-0 text-[#7b8796] transition-colors group-hover:text-orange-700" /></Link>
        </div>
      </section>
    </div>
  );
}

import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  Flame,
  Home,
  RotateCcw,
  UserRound,
  Zap,
} from 'lucide-react';
import { buildDailySession } from '@/src/features/dashboard/lib/dailySession';
import { XP_PER_LEVEL } from '@/src/features/dashboard/mock/gamifiedDashboardMock';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { cn } from '@/src/lib/utils';

const bottomItems = [
  { label: 'Trang chủ', path: '/app/dashboard', icon: Home },
  { label: 'Khóa học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Cá nhân', path: '/app/profile', icon: UserRound },
];

export default function Dashboard() {
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

  const totalXp = weeklyXp;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;

  // Nhiệm vụ hôm nay: ưu tiên ôn thẻ tới hạn, fallback học từ mới
  const missionTarget = Math.min(Math.max(dueCount, 5), 8);
  const missionDone = Math.min(reviewedToday, missionTarget);
  const missionProgress = missionTarget > 0 ? Math.round((missionDone / missionTarget) * 100) : 0;
  const missionTitle = dueCount > 0
    ? `Học chắc ${missionTarget} từ cần ôn`
    : `Học ${missionTarget} từ mới`;
  const missionPath = dueCount > 0
    ? '/app/review/flashcards?focus=1'
    : '/app/review/flashcards?mode=new&focus=1';

  const primaryStep = dailySession.steps[0];

  return (
    <div className="relative min-h-[calc(100dvh-1.5rem)] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="sticky top-0 z-30 -mx-3 border-b border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">
              Chào anh 👋
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-bold text-orange-700">
                <Flame size={12} aria-hidden="true" />
                {streak} ngày
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e8dccb] bg-[#fffdf8] px-2 py-0.5 text-xs font-bold text-[#5f6b7c]">
                <Zap size={12} className="text-orange-600" aria-hidden="true" />
                Lv.{level}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg space-y-4 pt-4">
        {/* Nhiệm vụ hôm nay — card chính */}
        <section className="overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-[#fff7ed] to-[#fffaf3] p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
            Nhiệm vụ hôm nay
          </p>
          <h2 className="mt-2 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">
            {missionTitle}
          </h2>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5f6b7c]">
              <span>{missionDone}/{missionTarget}</span>
              <span>{missionProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-orange-600 transition-all duration-500"
                style={{ width: `${missionProgress}%` }}
              />
            </div>
          </div>

          <Link
            to={missionPath}
            className="mt-5 flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-700 active:scale-[0.98]"
          >
            Bắt đầu học ngay
          </Link>

          {primaryStep && (
            <p className="mt-3 text-center text-xs text-[#95a0af]">
              ~{primaryStep.minutes} phút · +{primaryStep.xp} XP
            </p>
          )}
        </section>

        {/* Stats nhanh */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4">
            <p className="text-xs font-medium text-[#95a0af]">XP tuần này</p>
            <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{totalXp}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8dccb]">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{ width: `${Math.min(100, (totalXp % XP_PER_LEVEL) / XP_PER_LEVEL * 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4">
            <p className="text-xs font-medium text-[#95a0af]">Từ cần ôn</p>
            <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{dueCount}</p>
            <p className="mt-2 text-xs text-[#95a0af]">
              {dueCount > 0 ? 'Ưu tiên hôm nay' : 'Đã ổn hết'}
            </p>
          </div>
        </section>

        {/* Phiên học gợi ý */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-[var(--font-heading)] text-base font-bold text-[#172033]">
              Gợi ý hôm nay
            </h3>
            <Link to="/app/courses" className="text-xs font-semibold text-orange-700 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-2">
            {dailySession.steps.map((step, index) => (
              <Link
                key={step.id}
                to={step.path}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3.5 transition-colors hover:border-orange-300 hover:bg-orange-50/40',
                  index === 0 && 'border-orange-200 bg-orange-50/30'
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#172033]">{step.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-[#95a0af]">
                    {step.minutes} phút · +{step.xp} XP
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Hoạt động gần đây */}
        <section>
          <h3 className="mb-3 font-[var(--font-heading)] text-base font-bold text-[#172033]">
            Gần đây
          </h3>
          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] divide-y divide-[#e8dccb]">
            {reviewedToday > 0 ? (
              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#172033]">Ôn tập hôm nay</p>
                  <p className="mt-0.5 text-xs text-[#95a0af]">{reviewedToday} thẻ đã ôn</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-orange-700">+{reviewedToday * 3} XP</span>
              </div>
            ) : (
              <div className="px-4 py-5 text-center">
                <p className="text-sm font-semibold text-[#172033]">Chưa có hoạt động hôm nay</p>
                <p className="mt-1 text-xs text-[#95a0af]">Bắt đầu nhiệm vụ để nhận XP</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8dccb] bg-[#fffaf3]/97 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl"
        aria-label="Điều hướng nhanh"
      >
        <div className="mx-auto grid w-full max-w-lg grid-cols-5 gap-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[10px] font-semibold transition-colors',
                    isActive ? 'text-orange-700' : 'text-[#95a0af] hover:text-[#5f6b7c]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

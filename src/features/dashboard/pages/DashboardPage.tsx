import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  Flame,
  Home,
  Menu,
  RotateCcw,
  Settings,
  Sparkles,
  UserRound,
  X,
  Zap,
  ChevronRight,
  Route,
  MessageSquareText,
  BarChart3,
} from 'lucide-react';
import { buildDailySession } from '@/src/features/dashboard/lib/dailySession';
import { XP_PER_LEVEL } from '@/src/features/dashboard/mock/gamifiedDashboardMock';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { cn } from '@/src/lib/utils';

const assetPath = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const sakuraPetals = [
  ['4%', 12, '-2s', '16s'],
  ['15%', 9, '-9s', '19s'],
  ['27%', 14, '-5s', '15s'],
  ['39%', 10, '-12s', '20s'],
  ['51%', 13, '-3s', '17s'],
  ['64%', 9, '-11s', '21s'],
  ['76%', 15, '-6s', '18s'],
  ['89%', 11, '-14s', '22s'],
] as const;

const menuItems = [
  { label: 'Trang chủ', hint: 'Tổng quan học tập', path: '/app/dashboard', icon: Home },
  { label: 'Lộ trình Tokutei', hint: 'N5 đến JFT-Basic', path: '/app/roadmap', icon: Route },
  { label: 'Khóa học', hint: 'Các bài đang học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', hint: 'Từ vựng đến hạn', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', hint: 'Mock test & phỏng vấn', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Coach AI', hint: 'Luyện nói cùng Meow', path: '/app/ai-chat', icon: MessageSquareText },
  { label: 'Thống kê', hint: 'Tiến độ và thành tích', path: '/app/stats', icon: BarChart3 },
];

const bottomItems = [
  { label: 'Trang chủ', path: '/app/dashboard', icon: Home },
  { label: 'Khóa học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Cá nhân', path: '/app/profile', icon: UserRound },
];

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="dashboard-page">
      {/* Topbar */}
      <header className="dashboard-topbar">
        <Link to="/app/dashboard" className="dashboard-brand" aria-label="TOKUTEI GINO - Trang chủ">
          <img src={assetPath('meow-mascot.png')} alt="Meow" />
          <span>
            <strong>TOKUTEI GINO</strong>
            <small>TIẾNG NHẬT ĐI LÀM</small>
          </span>
        </Link>

        <nav className="dashboard-desktop-nav" aria-label="Điều hướng chính">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path}>
                {({ isActive }) => (
                  <>
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="dashboard-top-actions">
          <span className="dashboard-counter">
            <Flame size={16} /> {streak}
          </span>
          <span className="dashboard-counter">
            <Sparkles size={16} /> {totalXp}
          </span>
          <button
            type="button"
            className={`dashboard-menu-button ${isMenuOpen ? 'is-open' : ''}`}
            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="dashboard-menu-panel">
            <div className="dashboard-menu-heading">
              <span>ĐIỀU HƯỚNG</span>
              <small>Chọn nơi anh muốn tiếp tục</small>
            </div>
            <nav aria-label="Menu TOKUTEI GINO">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="dashboard-menu-link"
                  >
                    <span className="dashboard-menu-icon">
                      <Icon size={17} />
                    </span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                    <ChevronRight size={15} />
                  </Link>
                );
              })}
            </nav>
            <Link
              to="/app/settings"
              onClick={() => setIsMenuOpen(false)}
              className="dashboard-menu-settings"
            >
              <Settings size={15} /> Cài đặt
            </Link>
          </div>
        )}
      </header>

      <main className="dashboard-main">
        {/* Hero: chào mừng + Meow + hoa anh đào */}
        <section
          className="dashboard-hero"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255, 250, 246, .12), rgba(255, 250, 246, .76)), url("${assetPath('english-hero-bg.jpg')}")`,
          }}
        >
          <div className="dashboard-sakura-layer" aria-hidden="true">
            {sakuraPetals.map(([left, size, delay, duration], index) => (
              <span
                className="dashboard-sakura-petal"
                key={`${left}-${index}`}
                style={{
                  left,
                  width: size,
                  height: size,
                  animationDelay: delay,
                  animationDuration: duration,
                }}
              />
            ))}
          </div>

          <div className="dashboard-hero-copy">
            <span className="dashboard-eyebrow">HỆ THỐNG · NHẬN DẠNG KÍ CHỦ</span>
            <h1>
              Chào mừng trở lại,
              <br />
              <em>anh</em>
            </h1>
            <p>» Nhiệm vụ Tokutei hôm nay đang chờ. Hành trình chinh phục tiếng Nhật chưa kết thúc. «</p>
            <div className="dashboard-hero-chips">
              <span>
                <Flame size={15} /> Chuỗi {streak} ngày
              </span>
              <span>
                <Zap size={15} /> {totalXp} điểm XP
              </span>
              <span>
                <span className="dashboard-sprout">🌱</span> Cấp {level}
              </span>
            </div>
          </div>

          <div className="dashboard-mascot-wrap">
            <div className="dashboard-system-note">
              【 HỆ THỐNG 】
              <br />
              <span className="dashboard-system-copy">
                Kí Chủ, trạng thái học tập đã sẵn sàng. Nhiệm vụ vẫn chờ đây.
              </span>{' '}
              ⏳
            </div>
            <img
              className="dashboard-mascot"
              src={assetPath('meow-sleeping.png')}
              alt="Meow đang nghỉ"
            />
            <span className="dashboard-zzz">Zzz</span>
          </div>
        </section>

        {/* Nội dung mới: Nhiệm vụ hôm nay + stats */}
        <div className="mx-auto w-full max-w-lg space-y-4 px-4 pt-2 pb-4 sm:px-0">
          {/* Card Nhiệm vụ hôm nay */}
          <section className="overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-[#fff7ed] to-[#fffaf3] p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              Nhiệm vụ hôm nay
            </p>
            <h2 className="mt-2 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">
              {missionTitle}
            </h2>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5f6b7c]">
                <span>
                  {missionDone}/{missionTarget}
                </span>
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
              <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">
                {totalXp}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8dccb]">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{
                    width: `${Math.min(100, ((totalXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4">
              <p className="text-xs font-medium text-[#95a0af]">Từ cần ôn</p>
              <p className="mt-1 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">
                {dueCount}
              </p>
              <p className="mt-2 text-xs text-[#95a0af]">
                {dueCount > 0 ? 'Ưu tiên hôm nay' : 'Đã ổn hết'}
              </p>
            </div>
          </section>

          {/* Gợi ý hôm nay */}
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
                    <span className="block truncate text-sm font-semibold text-[#172033]">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#95a0af]">
                      {step.minutes} phút · +{step.xp} XP
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Gần đây */}
          <section>
            <h3 className="mb-3 font-[var(--font-heading)] text-base font-bold text-[#172033]">
              Gần đây
            </h3>
            <div className="divide-y divide-[#e8dccb] rounded-2xl border border-[#e8dccb] bg-[#fffdf8]">
              {reviewedToday > 0 ? (
                <div className="flex items-center justify-between px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#172033]">Ôn tập hôm nay</p>
                    <p className="mt-0.5 text-xs text-[#95a0af]">{reviewedToday} thẻ đã ôn</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-orange-700">
                    +{reviewedToday * 3} XP
                  </span>
                </div>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm font-semibold text-[#172033]">Chưa có hoạt động hôm nay</p>
                  <p className="mt-1 text-xs text-[#95a0af]">Bắt đầu nhiệm vụ để nhận XP</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="dashboard-bottom-nav" aria-label="Điều hướng nhanh">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <>
                  <Icon size={19} className={isActive ? 'is-active' : ''} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

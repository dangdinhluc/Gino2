import { lazy, Suspense, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { assets } from '@/src/shared/lib/assets';

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

const loadLearningLauncherSheet = () => import('@/src/features/courses/components/LearningLauncherSheet').then(({ LearningLauncherSheet }) => ({ default: LearningLauncherSheet }));
const LazyLearningLauncherSheet = lazy(loadLearningLauncherSheet);

const routePreloaders: Record<string, () => Promise<unknown>> = {
  '/app/dashboard': () => import('@/src/features/dashboard/pages/TodayPage'),
  '/app/courses': () => import('@/src/features/courses/pages/CourseListPage'),
  '/app/exams': () => import('@/src/features/courses/pages/CourseLearningPage'),
  '/app/profile': () => import('@/src/features/profile/pages/ProfilePage'),
};

function canPrefetch(): boolean {
  if (typeof navigator === 'undefined') return false;
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (connection?.saveData) return false;
  return !/^(slow-)?2g$/i.test(connection?.effectiveType ?? '');
}

function preloadNavTarget(path: string): void {
  if (!canPrefetch()) return;
  void routePreloaders[path]?.();
}

function preloadLearningLauncher(): void {
  if (!canPrefetch()) return;
  void loadLearningLauncherSheet();
}

export function BottomNav() {
  const [isLearningLauncherOpen, setIsLearningLauncherOpen] = useState(false);
  const [hasOpenedLearningLauncher, setHasOpenedLearningLauncher] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLearningLauncherOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Hôm nay', path: '/app/dashboard', icon: assets.shared.navigation.home },
    { label: 'Khóa học', path: '/app/courses', icon: assets.shared.navigation.courses },
    { label: 'Thi thử', path: '/app/exams', icon: assets.shared.navigation.exams },
    { label: 'Cá nhân', path: '/app/profile', icon: assets.shared.navigation.profile },
  ];

  const renderNavItem = (item: (typeof navItems)[number]) => (
    <NavLink
      key={item.path}
      to={item.path}
      onPointerEnter={() => preloadNavTarget(item.path)}
      onPointerDown={() => preloadNavTarget(item.path)}
      onFocus={() => preloadNavTarget(item.path)}
      className="relative flex min-w-0 flex-1 items-center justify-center"
    >
      {({ isActive }) => (
        <div
          data-active={isActive ? 'true' : 'false'}
          className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-1 transition-transform duration-150 active:scale-[0.92]"
        >
          <span className="relative flex h-10 w-12 items-center justify-center rounded-xl transition-all">
            <img
              src={item.icon}
              alt=""
              decoding="async"
              className={`h-9 w-9 object-contain transition-transform duration-200 ${
                isActive
                  ? 'scale-110 drop-shadow-[0_4px_8px_rgba(201,106,27,.2)]'
                  : 'scale-100 opacity-85'
              }`}
            />
          </span>
          <span
            className={`gino-bottom-nav-label truncate text-[11px] leading-tight transition-colors ${
              isActive ? 'font-black text-[#c96a1b]' : 'font-semibold text-[#4e505a]'
            }`}
          >
            {item.label}
          </span>
          <div className="h-1.5 w-1.5 flex items-center justify-center">
            {isActive && <span className="gino-bottom-nav-dot h-1.5 w-1.5 rounded-full bg-[#c96a1b]" />}
          </div>
        </div>
      )}
    </NavLink>
  );

  return (
    <>
      {hasOpenedLearningLauncher && (
        <Suspense fallback={null}>
          <LazyLearningLauncherSheet isOpen={isLearningLauncherOpen} onClose={() => setIsLearningLauncherOpen(false)} />
        </Suspense>
      )}

      <nav
        aria-label="Thanh điều hướng chính"
        className="gino-bottom-nav fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[1180px] rounded-t-[28px] border-t border-[#e8dccb] bg-[#fff9f2]/98 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(92,61,35,0.08)] backdrop-blur-xl lg:hidden"
      >
        <div className="grid grid-cols-5 items-end gap-0">
          {renderNavItem(navItems[0])}
          {renderNavItem(navItems[1])}

          <div className="relative flex min-w-0 items-end justify-center">
            <button
              type="button"
              onPointerEnter={preloadLearningLauncher}
              onPointerDown={preloadLearningLauncher}
              onFocus={preloadLearningLauncher}
              onClick={() => {
                setHasOpenedLearningLauncher(true);
                setIsLearningLauncherOpen((open) => !open);
              }}
              aria-haspopup="dialog"
              aria-expanded={isLearningLauncherOpen}
              aria-label="Mở Học ngay"
              className="relative -mt-9 flex min-w-0 flex-col items-center transition-transform duration-150 active:scale-[0.92]"
            >
              <div
                className={`relative flex items-center justify-center transition-transform duration-200 ease-out ${
                  isLearningLauncherOpen ? '-translate-y-1 scale-110' : 'translate-y-0 scale-100'
                }`}
              >
                {isLearningLauncherOpen ? (
                  <div className="relative flex flex-col items-center">
                    <img
                      src={assets.shared.mascots.quickLearnActive}
                      alt="Học ngay"
                      decoding="async"
                      className="h-[74px] w-[74px] object-contain drop-shadow-[0_8px_20px_rgba(201,106,27,0.34)]"
                    />
                    <span className="gino-quick-learn-badge absolute -bottom-1 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#c96a1b] to-[#a95112] px-2.5 py-0.5 text-[9px] font-black text-white shadow-[0_3px_10px_rgba(201,106,27,0.28)] whitespace-nowrap">
                      <span>⚡</span> Học ngay
                    </span>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center">
                    <span className="gino-quick-learn-ring relative flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full border-[2.5px] border-[#e6c39f] bg-[#fffdf9] shadow-[0_8px_20px_rgba(201,106,27,0.14)]">
                      <img
                        src={assets.shared.mascots.quickLearn}
                        alt="Học ngay"
                        decoding="async"
                        className="absolute left-1/2 top-0 h-auto w-[76px] max-w-none -translate-x-1/2"
                      />
                    </span>
                    <span className="mt-1 truncate text-[11px] font-semibold text-[#4e505a]">
                      Học ngay
                    </span>
                    <div className="h-1.5 w-1.5" />
                  </div>
                )}
              </div>
            </button>
          </div>

          {renderNavItem(navItems[2])}
          {renderNavItem(navItems[3])}
        </div>
      </nav>
    </>
  );
}

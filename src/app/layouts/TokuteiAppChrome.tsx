import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Flame, Search, Settings, Sparkles } from 'lucide-react';
import { fetchLearnerStats } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { assets } from '@/src/shared/lib/assets';

const LazyLearningSearchPopover = lazy(() => import('@/src/features/search/components/LearningSearchPopover').then(({ LearningSearchPopover }) => ({ default: LearningSearchPopover })));

const desktopNavItems = [
  { label: 'Hôm nay', path: '/app/dashboard', imageIcon: assets.shared.navigation.home },
  { label: 'Khóa học', path: '/app/courses', imageIcon: assets.shared.navigation.courses },
  { label: 'Luyện tập', path: '/app/practice', imageIcon: assets.shared.navigation.vocabulary },
  { label: 'Thi thử', path: '/app/exams', imageIcon: assets.shared.navigation.exams },
  { label: 'Cá nhân', path: '/app/profile', imageIcon: assets.shared.navigation.profile },
];

export function TokuteiAppChrome() {
  const [streak, setStreak] = useState<number | null>(null);
  const [weeklyXp, setWeeklyXp] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);

  function openSearch(): void {
    setHasOpenedSearch(true);
    setIsSearchOpen(true);
  }

  useEffect(() => {
    let cancelled = false;
    fetchLearnerStats()
      .then((stats) => {
        if (cancelled) return;
        setStreak(stats.currentStreak);
        setWeeklyXp(stats.weeklyXp);
      })
      .catch(() => {
        if (cancelled) return;
        setStreak(null);
        setWeeklyXp(null);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e5dcf2] bg-[#fffcff]/96 shadow-[0_2px_12px_rgba(73,48,126,.05)] backdrop-blur-md">
        <div className="mx-auto hidden h-16 w-full max-w-[1440px] items-center justify-between px-6 md:flex md:px-8">
          <Link to="/app/dashboard" className="group flex min-w-0 items-center gap-2.5" aria-label="TOKUTEI GINO - Trang chủ">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6f45d8] to-[#8a72c7] p-1 shadow-[0_4px_12px_rgba(111,69,216,.16)] transition-transform group-hover:scale-105">
              <img src={assets.shared.mascots.brand} alt="Tokutei Gino" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 space-y-0">
              <h1 className="truncate font-[var(--font-heading)] text-sm font-black leading-tight tracking-tight text-[#211b35] transition-colors group-hover:text-[#6f45d8]">TOKUTEI GINO</h1>
              <p className="text-[8.5px] font-black uppercase leading-none tracking-wider text-[#6f45d8]">TIẾNG NHẬT ĐI LÀM</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5 rounded-full border border-[#e5dcf2] bg-white/90 p-1.5 shadow-[0_2px_8px_rgba(73,48,126,.04)]" aria-label="Điều hướng chính">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-black transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6f45d8] to-[#5631b8] text-white shadow-[0_4px_12px_rgba(111,69,216,.18)]'
                      : 'text-[#6f6880] hover:bg-[#f4effb] hover:text-[#6f45d8]'
                  }`
                }
              >
                <img src={item.imageIcon} alt="" className="h-5 w-5 shrink-0 object-contain drop-shadow-2xs" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#e5dcf2] bg-[#f4effb] px-3 text-xs font-black text-[#6f45d8]">
              <Flame size={14} className="fill-[#6f45d8] text-[#6f45d8]" />
              <span>{streak === null ? '—' : `${streak}d`}</span>
            </div>
            <div className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#e5dcf2] bg-[#f4effb] px-3 text-xs font-black text-[#6f45d8]">
              <Sparkles size={14} className="fill-[#8a72c7] text-[#8a72c7]" />
              <span>{weeklyXp === null ? '— XP' : `${weeklyXp.toLocaleString()} XP`}</span>
            </div>
            <button
              type="button"
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5dcf2] bg-white text-[#6f6880] transition-all hover:border-[#cfc0f1] hover:text-[#6f45d8]"
              title="Tìm nội dung học"
              aria-label="Tìm nội dung học"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
            >
              <Search size={16} />
            </button>
            <Link to="/app/settings" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5dcf2] bg-white text-[#6f6880] transition-all hover:border-[#cfc0f1] hover:text-[#6f45d8]" title="Cài đặt ứng dụng" aria-label="Cài đặt ứng dụng">
              <Settings size={16} />
            </Link>
          </div>
        </div>

        <div className="flex h-13 w-full items-center justify-between px-3 md:hidden">
          <Link to="/app/dashboard" className="flex shrink-0 items-center gap-2" aria-label="TOKUTEI GINO - Trang chủ">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6f45d8] to-[#8a72c7] p-0.5 shadow-2xs">
              <img src={assets.shared.mascots.brand} alt="Tokutei Gino" className="h-full w-full object-contain" />
            </div>
            <div className="space-y-0">
              <h1 className="font-[var(--font-heading)] text-xs font-black leading-tight tracking-tight text-[#211b35]">TOKUTEI GINO</h1>
              <p className="text-[7.5px] font-black uppercase leading-none tracking-wider text-[#6f45d8]">TIẾNG NHẬT ĐI LÀM</p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <span className="flex min-h-8 items-center gap-0.5 rounded-full border border-[#e5dcf2] bg-[#f4effb] px-2 text-[10px] font-black text-[#6f45d8]">
              <Flame size={11} className="fill-[#6f45d8] text-[#6f45d8]" />
              <span>{streak === null ? '—' : `${streak}d`}</span>
            </span>
            <span className="flex min-h-8 items-center gap-0.5 rounded-full border border-[#e5dcf2] bg-[#f4effb] px-2 text-[10px] font-black text-[#6f45d8]">
              <Sparkles size={11} className="fill-[#8a72c7] text-[#8a72c7]" />
              <span>{weeklyXp === null ? '—' : weeklyXp}</span>
            </span>
            <button type="button" onClick={openSearch} aria-label="Tìm nội dung học" aria-haspopup="dialog" aria-expanded={isSearchOpen} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5dcf2] bg-white text-[#6f45d8]">
              <Search size={14} />
            </button>
          </div>
        </div>
      </header>
      {hasOpenedSearch && (
        <Suspense fallback={null}>
          <LazyLearningSearchPopover open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

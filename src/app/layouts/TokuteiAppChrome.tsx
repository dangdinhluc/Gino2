import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Flame,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

const LazyLearningSearchPopover = lazy(() => import('@/src/features/search/components/LearningSearchPopover').then(({ LearningSearchPopover }) => ({ default: LearningSearchPopover })));

const desktopNavItems = [
  { label: 'Trang chủ', path: '/app/dashboard', imageIcon: assets.shared.navigation.home },
  { label: 'Khóa học', path: '/app/courses', imageIcon: assets.shared.navigation.courses },
  { label: 'Ôn tập', path: '/app/practice', imageIcon: assets.shared.navigation.vocabulary },
  { label: 'Luyện thi', path: '/app/exams', imageIcon: assets.shared.navigation.exams },
  { label: 'Cá nhân', path: '/app/profile', imageIcon: assets.shared.navigation.profile },
];

export function TokuteiAppChrome() {
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);

  function openSearch(): void {
    setHasOpenedSearch(true);
    setIsSearchOpen(true);
  }

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#f5ece1] bg-[#fffaf5]/96 shadow-2xs backdrop-blur-md transition-colors">
        {/* DESKTOP HEADER (MD & UP) */}
        <div className="hidden md:flex mx-auto h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-8">
          {/* Left: Brand Logo */}
          <Link to="/app/dashboard" className="flex items-center gap-2.5 min-w-0 group" aria-label="TOKUTEI GINO - Trang chủ">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] p-1 shadow-2xs group-hover:scale-105 transition-transform">
              <img src={assets.shared.mascots.brand} alt="Tokutei Gino" className="h-full w-full object-contain" />
            </div>
            <div className="space-y-0 min-w-0">
              <h1 className="font-[var(--font-heading)] text-sm font-black tracking-tight text-[#0f172a] truncate leading-tight group-hover:text-[#d83a00] transition-colors">
                TOKUTEI GINO
              </h1>
              <p className="text-[8.5px] font-black uppercase tracking-wider text-[#d83a00] leading-none">
                TIẾNG NHẬT ĐI LÀM
              </p>
            </div>
          </Link>

          {/* Center: Desktop 3D Navigation Menu */}
          <nav className="flex items-center gap-1.5 rounded-full border border-orange-200/60 bg-white/90 p-1.5 shadow-2xs backdrop-blur-xs" aria-label="Điều hướng chính">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d83a00] to-[#f26522] text-white shadow-xs scale-102'
                      : 'text-[#5f6b7c] hover:bg-orange-50/80 hover:text-[#d83a00]'
                  }`
                }
              >
                <img src={item.imageIcon} alt={item.label} className="h-5 w-5 object-contain shrink-0 drop-shadow-2xs" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions & Stats */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-3 py-1.5 text-xs font-black text-[#c2410c] shadow-2xs">
              <Flame size={14} className="text-[#d83a00] fill-[#d83a00]" />
              <span>{streak}d</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/90 px-3 py-1.5 text-xs font-black text-[#b45309] shadow-2xs">
              <Sparkles size={14} className="text-amber-500 fill-amber-400" />
              <span>{weeklyXp} XP</span>
            </div>

            <button
              type="button"
        onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f5ece1] bg-white text-[#5f6b7c] hover:border-orange-200 hover:text-[#d83a00] hover:shadow-2xs transition-all"
              title="Tìm nội dung học"
              aria-label="Tìm nội dung học"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
            >
              <Search size={16} />
            </button>

            <Link
              to="/app/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f5ece1] bg-white text-[#5f6b7c] hover:border-orange-200 hover:text-[#d83a00] hover:shadow-2xs transition-all"
              title="Cài đặt ứng dụng"
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>

        {/* MOBILE HEADER (SMALL SCREENS BELOW MD) */}
        <div className="flex md:hidden h-13 w-full items-center justify-between px-3">
          {/* Left: Brand Logo (Fits perfectly without truncation) */}
          <Link to="/app/dashboard" className="flex items-center gap-2 shrink-0" aria-label="TOKUTEI GINO - Trang chủ">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] p-0.5 shadow-2xs">
              <img src={assets.shared.mascots.brand} alt="Tokutei Gino" className="h-full w-full object-contain" />
            </div>
            <div className="space-y-0">
              <h1 className="font-[var(--font-heading)] text-xs font-black tracking-tight text-[#0f172a] leading-tight">
                TOKUTEI GINO
              </h1>
              <p className="text-[7.5px] font-black uppercase tracking-wider text-[#d83a00] leading-none">
                TIẾNG NHẬT ĐI LÀM
              </p>
            </div>
          </Link>

          {/* Right: Mobile stat chips and search */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="flex items-center gap-0.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-2 py-0.5 text-[10px] font-black text-[#c2410c]">
              <Flame size={11} className="text-[#d83a00] fill-[#d83a00]" />
              <span>{streak}d</span>
            </span>

            <span className="flex items-center gap-0.5 rounded-full border border-amber-200/90 bg-amber-50/90 px-2 py-0.5 text-[10px] font-black text-[#b45309]">
              <Sparkles size={11} className="text-amber-500 fill-amber-400" />
              <span>{weeklyXp} XP</span>
            </span>

            <button type="button" onClick={openSearch} aria-label="Tìm nội dung học" aria-haspopup="dialog" aria-expanded={isSearchOpen} className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-200 bg-white text-[#d83a00]">
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

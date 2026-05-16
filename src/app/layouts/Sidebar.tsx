import {
  Home,
  BarChart3,
  Bookmark,
  Layout,
  GraduationCap,
  RotateCcw,
  Settings,
  Users,
  MessageCircle,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [railHint, setRailHint] = useState<{ label: string; top: number; left: number; tone: string } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setRailHint(null);
  }, [isCollapsed]);

  const toneStyles = {
    orange: {
      icon: 'border-orange-200 bg-orange-100 text-orange-600',
      hover: 'group-hover:border-orange-200 group-hover:bg-orange-100 group-hover:text-orange-600',
      active: 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm shadow-orange-100/80',
      badge: 'from-orange-500 to-amber-400',
    },
    blue: {
      icon: 'border-blue-200 bg-blue-100 text-blue-600',
      hover: 'group-hover:border-blue-200 group-hover:bg-blue-100 group-hover:text-blue-600',
      active: 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 text-slate-800 shadow-sm shadow-blue-100/80',
      badge: 'from-blue-500 to-cyan-400',
    },
    violet: {
      icon: 'border-violet-200 bg-violet-100 text-violet-600',
      hover: 'group-hover:border-violet-200 group-hover:bg-violet-100 group-hover:text-violet-600',
      active: 'border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 text-slate-800 shadow-sm shadow-violet-100/80',
      badge: 'from-violet-500 to-purple-400',
    },
    emerald: {
      icon: 'border-emerald-200 bg-emerald-100 text-emerald-600',
      hover: 'group-hover:border-emerald-200 group-hover:bg-emerald-100 group-hover:text-emerald-600',
      active: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-slate-800 shadow-sm shadow-emerald-100/80',
      badge: 'from-emerald-500 to-teal-400',
    },
    pink: {
      icon: 'border-pink-200 bg-pink-100 text-pink-600',
      hover: 'group-hover:border-pink-200 group-hover:bg-pink-100 group-hover:text-pink-600',
      active: 'border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 text-slate-800 shadow-sm shadow-pink-100/80',
      badge: 'from-pink-500 to-rose-400',
    },
    amber: {
      icon: 'border-amber-200 bg-amber-100 text-amber-600',
      hover: 'group-hover:border-amber-200 group-hover:bg-amber-100 group-hover:text-amber-600',
      active: 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-slate-800 shadow-sm shadow-amber-100/80',
      badge: 'from-amber-500 to-orange-400',
    },
    sky: {
      icon: 'border-sky-200 bg-sky-100 text-sky-600',
      hover: 'group-hover:border-sky-200 group-hover:bg-sky-100 group-hover:text-sky-600',
      active: 'border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 text-slate-800 shadow-sm shadow-sky-100/80',
      badge: 'from-sky-500 to-cyan-400',
    },
  } as const;

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/app/dashboard', badge: '4', tone: 'orange' },
    { icon: Layout, label: 'Khóa học', path: '/app/courses', tone: 'sky' },
    { icon: RotateCcw, label: 'Ôn tập', path: '/app/review', tone: 'emerald' },
    { icon: GraduationCap, label: 'Luyện thi', path: '/app/exams', tone: 'amber' },
    { icon: Bookmark, label: 'Từ vựng của tôi', path: '/app/grammar', tone: 'violet' },
    { icon: BarChart3, label: 'Thống kê', path: '/app/stats', tone: 'blue' },
    { icon: Settings, label: 'Cài đặt', path: '/app/settings', tone: 'sky' },
  ];

  const communityItems = [
    { icon: Users, label: 'Bạn bè', path: '/app/friends', tone: 'orange' },
    { icon: MessageCircle, label: 'Tin nhắn', path: '/app/messages', tone: 'pink' },
  ];

  const showRailHint = (target: HTMLElement, label: string, tone: string) => {
    const fullLabelsAreVisible = window.matchMedia('(min-width: 1280px)').matches && !isCollapsed;
    if (fullLabelsAreVisible) return;

    const rect = target.getBoundingClientRect();
    setRailHint({
      label,
      tone,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const hideRailHint = () => setRailHint(null);

  return (
    <aside
      className={cn(
        'relative z-30 hidden h-full min-h-0 overflow-visible border-r border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,251,245,0.96)_0%,rgba(247,242,234,0.98)_100%)] shadow-[0_24px_50px_-38px_rgba(148,163,184,0.18)] md:flex md:flex-col',
        isCollapsed ? 'w-20' : 'w-20 xl:w-[17rem]'
      )}
    >
      <div className={cn('shrink-0 pb-3 pt-4', isCollapsed ? 'px-2.5' : 'px-2.5 xl:px-4')}>
        <div
          className={cn(
            'relative flex items-center',
            isCollapsed
              ? 'flex-col justify-center gap-3'
              : 'flex-col justify-center gap-3 xl:flex-row xl:justify-start xl:gap-2 xl:px-2 xl:pr-12'
          )}
        >
          <div className={cn('flex min-w-0 items-center gap-2', isCollapsed && 'justify-center')}>
            <motion.div whileHover={{ scale: 1.05 }} className="relative h-10 w-10 min-w-[40px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-50 blur-md" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-lg">
                <img
                  src="/mascot.png"
                  alt="Mascot"
                  className="h-full w-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🐯</span>';
                  }}
                />
              </div>
            </motion.div>
            {!isCollapsed && (
              <h1 className="hidden truncate whitespace-nowrap text-xl font-black italic tracking-tighter text-gray-800 uppercase xl:block">
                TOKUTEI<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> GINO</span>
              </h1>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            className={cn(
              'hidden h-9 w-9 items-center justify-center rounded-xl border border-[#e1d8cb] bg-[#fffaf3] text-orange-500 shadow-[0_14px_28px_-22px_rgba(148,163,184,0.2)] transition-colors hover:border-[#dccfbe] hover:bg-[#f8f1e6] xl:flex',
              isCollapsed ? 'relative' : 'relative xl:absolute xl:right-2 xl:top-1/2 xl:-translate-y-1/2'
            )}
          >
            {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </motion.button>
        </div>

        {!isCollapsed && <div className="mx-2 mt-4 hidden h-px bg-gradient-to-r from-transparent via-[#eadfce] to-transparent xl:block" />}
      </div>

      <div
        className={cn(
          'no-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-2',
          isCollapsed ? 'px-2.5' : 'px-2.5 xl:px-4'
        )}
      >
        <nav
          className={cn(
            'w-full rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3]/86 p-2.5 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.16)] backdrop-blur-sm',
            isCollapsed ? 'px-2 py-2.5' : 'px-2 py-2.5 xl:p-2.5'
          )}
        >
          <div className={cn('space-y-1.5', isCollapsed && 'space-y-2')}>
            {menuItems.map((item) => {
              const tone = toneStyles[item.tone as keyof typeof toneStyles];
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between overflow-visible rounded-2xl border font-bold transition-all whitespace-nowrap',
                      isCollapsed ? 'h-12 w-full justify-center px-0' : 'h-12 w-full justify-center px-0 xl:h-auto xl:justify-between xl:px-2.5 xl:py-2.5 xl:text-sm',
                      isActive
                        ? tone.active
                        : 'border-transparent text-gray-500 hover:border-orange-100 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                    )
                  }
                  title={item.label}
                  aria-label={item.label}
                  onPointerEnter={(event) => showRailHint(event.currentTarget, item.label, item.tone)}
                  onPointerLeave={hideRailHint}
                  onFocus={(event) => showRailHint(event.currentTarget, item.label, item.tone)}
                  onBlur={hideRailHint}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white transition-all',
                            isActive ? tone.icon : cn('border-slate-200 text-gray-400', tone.hover)
                          )}
                        >
                          <item.icon size={isCollapsed ? 19 : 17} className="shrink-0" />
                        </div>
                        {!isCollapsed && <span className="hidden xl:inline">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span
                          className={cn(
                            'hidden h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r px-1 text-[10px] font-black text-white shadow-sm xl:flex',
                            tone.badge
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span
                          className={cn(
                            'absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r text-[8px] font-black text-white shadow-sm xl:hidden',
                            tone.badge
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                        <span
                          className={cn(
                            'absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r text-[8px] font-black text-white shadow-sm',
                            tone.badge
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <nav
          className={cn(
            'mt-4 w-full rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3]/86 p-2.5 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.16)] backdrop-blur-sm',
            isCollapsed ? 'px-2 py-2.5' : 'px-2 py-2.5 xl:p-2.5'
          )}
        >
          {!isCollapsed && (
            <p className="mb-2 hidden whitespace-nowrap px-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 xl:block">
              Cộng đồng
            </p>
          )}
          <div className={cn('space-y-1.5', isCollapsed && 'space-y-2')}>
            {communityItems.map((item) => {
              const tone = toneStyles[item.tone as keyof typeof toneStyles];
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center justify-between overflow-visible rounded-2xl border font-bold transition-all whitespace-nowrap',
                      isCollapsed ? 'h-12 w-full justify-center px-0' : 'h-12 w-full justify-center px-0 xl:h-auto xl:justify-between xl:px-2.5 xl:py-2.5 xl:text-sm',
                      isActive
                        ? tone.active
                        : 'border-transparent text-gray-500 hover:border-orange-100 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                    )
                  }
                  title={item.label}
                  aria-label={item.label}
                  onPointerEnter={(event) => showRailHint(event.currentTarget, item.label, item.tone)}
                  onPointerLeave={hideRailHint}
                  onFocus={(event) => showRailHint(event.currentTarget, item.label, item.tone)}
                  onBlur={hideRailHint}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white transition-all',
                            isActive ? tone.icon : cn('border-slate-200 text-gray-400', tone.hover)
                          )}
                        >
                          <item.icon size={isCollapsed ? 19 : 17} className="shrink-0" />
                        </div>
                        {!isCollapsed && <span className="hidden xl:inline">{item.label}</span>}
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      <div
        ref={profileRef}
        className={cn(
          'relative shrink-0 border-t border-[#e6ddd1] bg-[#fffaf3]/72 backdrop-blur-sm',
          isCollapsed ? 'p-2.5' : 'p-2.5 xl:p-4'
        )}
      >
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsProfileOpen((prev) => !prev)}
            onPointerEnter={(event) => showRailHint(event.currentTarget, 'Hồ sơ học tập', 'pink')}
            onPointerLeave={hideRailHint}
            onFocus={(event) => showRailHint(event.currentTarget, 'Hồ sơ học tập', 'pink')}
            onBlur={hideRailHint}
            className={cn(
              'group relative flex w-full items-center overflow-visible rounded-[1.4rem] border border-[#e6ddd1] bg-[#fffaf3]/92 shadow-[0_18px_40px_-32px_rgba(148,163,184,0.18)] transition-all hover:border-[#dccfbe] hover:shadow-[0_22px_46px_-32px_rgba(180,138,91,0.16)]',
              isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-center px-0 py-2.5 xl:justify-start xl:px-3.5 xl:py-3 xl:pr-12'
            )}
            title="Hồ sơ học tập"
            aria-label="Hồ sơ học tập"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-0.5 shadow-md">
                <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-white">
                  <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-base font-black text-transparent">T</span>
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white shadow-sm">
                  1
                </div>
              </div>
              {!isCollapsed && (
                <div className="hidden text-left xl:block">
                  <div className="text-sm font-black uppercase text-gray-800">Anh</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-500">Tokutei Track</span>
                    <span>Lv.1</span>
                  </div>
                </div>
              )}
            </div>
          </motion.button>

          {!isCollapsed && (
            <div className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-[#e1d8cb] bg-[#fffaf3] text-orange-400 xl:flex">
              <Sparkles size={15} />
            </div>
          )}
        </div>

        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              className={cn(
                'absolute z-40 overflow-hidden rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_28px_60px_-34px_rgba(148,163,184,0.22)]',
                isCollapsed
                  ? 'bottom-4 left-full ml-3 w-72'
                  : 'bottom-4 left-full ml-3 w-72 xl:bottom-full xl:left-4 xl:right-4 xl:mb-3 xl:ml-0 xl:w-auto'
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-0.5 shadow-md">
                    <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-white">
                      <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-lg font-black text-transparent">T</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-black uppercase text-gray-900">Anh</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-500">Tokutei Track</span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-500">Lv.1</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-[#e6ddd1] bg-[#f8f1e6] px-3 py-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">XP</div>
                    <div className="mt-1 text-sm font-black text-gray-900">0/300</div>
                  </div>
                  <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3] px-3 py-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Streak</div>
                    <div className="mt-1 text-sm font-black text-orange-500">0d</div>
                  </div>
                  <div className="rounded-2xl border border-[#dbe5f4] bg-blue-50/45 px-3 py-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Hôm nay</div>
                    <div className="mt-1 text-sm font-black text-blue-500">0/50</div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(248,241,230,0.8)_0%,rgba(255,250,243,0.95)_100%)] px-3 py-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
                    <Flame size={14} className="fill-orange-500 text-orange-500" />
                    Giữ nhịp hôm nay
                  </div>
                  <Sparkles size={14} className="text-orange-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <AnimatePresence>
        {railHint && (
          <motion.div
            key={`${railHint.label}-${railHint.top}`}
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{ top: railHint.top, left: railHint.left }}
            className="pointer-events-none fixed z-[80] flex -translate-y-1/2 items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/98 px-3.5 py-2 text-xs font-black text-slate-800 shadow-[0_18px_42px_-24px_rgba(148,163,184,0.34)] backdrop-blur-md"
          >
            <span
              className={cn(
                'h-2 w-2 rounded-full bg-gradient-to-r',
                toneStyles[railHint.tone as keyof typeof toneStyles]?.badge || 'from-orange-500 to-amber-400'
              )}
            />
            <span className="whitespace-nowrap">{railHint.label}</span>
            <span className="absolute left-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l border-[#e6ddd1] bg-[#fffaf3]" />
          </motion.div>
        )}
      </AnimatePresence>

    </aside>
  );
}

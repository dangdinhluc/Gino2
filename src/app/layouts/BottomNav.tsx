import { NavLink, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getDueVocabularyCards } from '@/src/features/courses/repositories/learningProgressRepository';
import { assets } from '@/src/shared/lib/assets';

export function BottomNav() {
  const [dueCount, setDueCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    getDueVocabularyCards(100)
      .then((cards) => { if (!cancelled) setDueCount(cards.filter((card) => card.status !== 'new').length); })
      .catch(() => { if (!cancelled) setDueCount(0); });
    return () => { cancelled = true; };
  }, [location.pathname]);

  const navItems = [
    { label: 'Trang chủ', path: '/app/dashboard', icon: assets.shared.navigation.home },
    { label: 'Khóa học', path: '/app/courses', icon: assets.shared.navigation.courses },
    { label: 'Ôn tập', path: '/app/practice', icon: assets.shared.navigation.vocabulary, badge: dueCount },
    { label: 'Luyện thi', path: '/app/exams', icon: assets.shared.navigation.exams },
    { label: 'Cộng đồng', path: '/app/community', icon: null },
    { label: 'Cá nhân', path: '/app/profile', icon: assets.shared.navigation.profile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex min-h-[4.5rem] items-center justify-around border-t border-[#e8dccb] bg-[#fffaf5]/96 px-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "bottom-nav-item relative flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1 transition-all duration-200"
            )
          }
        >
          {({ isActive }) => (
            <motion.div 
              className="flex min-w-0 flex-col items-center gap-0.5"
              whileTap={{ scale: 0.92 }}
            >
              <div className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-2xl p-1 transition-all duration-200",
                isActive
                  ? "bg-gradient-to-br from-orange-100/90 to-amber-100/60 shadow-2xs scale-105"
                  : "opacity-85 hover:opacity-100"
              )}>
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={cn(
                      "h-8 w-8 object-contain transition-transform duration-200 drop-shadow-xs",
                      isActive ? "scale-110" : "filter grayscale-[15%]"
                    )}
                  />
                ) : (
                  <Users size={22} className={cn(isActive ? 'text-[#d83a00]' : 'text-[#64748b]')} aria-hidden="true" />
                )}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-1 text-[9px] font-black text-white shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "bottom-nav-label max-w-full truncate text-[10px] font-black tracking-tight transition-colors",
                isActive ? "text-[#d83a00]" : "text-[#64748b]"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#d83a00] rounded-full shadow-2xs" />
              )}
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

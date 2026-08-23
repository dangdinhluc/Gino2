import { NavLink, useLocation } from 'react-router-dom';
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
    { label: 'Hôm nay', path: '/app/dashboard', icon: assets.shared.navigation.home },
    { label: 'Khóa học', path: '/app/courses', icon: assets.shared.navigation.courses },
    { label: 'Luyện tập', path: '/app/practice', icon: assets.shared.navigation.vocabulary, badge: dueCount },
    { label: 'Cá nhân', path: '/app/profile', icon: assets.shared.navigation.profile },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex min-h-[4.65rem] max-w-[1180px] items-center justify-around border-t border-[#e7e7ee] bg-white/98 px-2 pb-[calc(.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(30,25,50,.05)] backdrop-blur-xl lg:hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[48%] rounded-full border border-[#e7defc] bg-white p-1.5 shadow-[0_6px_18px_rgba(88,63,170,.16)]">
        <img src={assets.shared.mascots.brand} alt="" className="h-10 w-10 object-contain" />
      </div>

      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} className="relative flex min-w-0 flex-1 items-center justify-center">
          {({ isActive }) => (
            <motion.div className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-1" whileTap={{ scale: 0.94 }}>
              <span className={`relative flex h-9 w-11 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-[#f4f0ff]' : 'bg-transparent'}`}>
                <img
                  src={item.icon}
                  alt=""
                  className={`h-8 w-8 object-contain transition-all ${isActive ? 'scale-110 opacity-100 drop-shadow-[0_3px_6px_rgba(111,69,216,.2)]' : 'scale-100 opacity-75 grayscale-[18%]'}`}
                />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6f45d8] px-1 text-[9px] font-extrabold text-white shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className={`truncate text-[10px] font-bold ${isActive ? 'text-[#6f45d8]' : 'text-[#4f5159]'}`}>{item.label}</span>
              {isActive && <span className="mt-0.5 h-1 w-1 rounded-full bg-[#6f45d8]" />}
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Home, PencilLine, UserRound } from 'lucide-react';
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
    { label: 'Hôm nay', path: '/app/dashboard', icon: Home },
    { label: 'Khóa học', path: '/app/courses', icon: BookOpen },
    { label: 'Luyện tập', path: '/app/practice', icon: PencilLine, badge: dueCount },
    { label: 'Cá nhân', path: '/app/profile', icon: UserRound },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex min-h-[4.5rem] max-w-[1180px] items-center justify-around border-t border-[#e7e7ee] bg-white/98 px-2 pb-[calc(.3rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(30,25,50,.05)] backdrop-blur-xl lg:hidden">
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[46%] rounded-full border border-[#e7defc] bg-white p-1.5 shadow-[0_6px_18px_rgba(88,63,170,.16)]">
        <img src={assets.shared.mascots.brand} alt="" className="h-10 w-10 object-contain" />
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.path} to={item.path} className="relative flex min-w-0 flex-1 items-center justify-center">
            {({ isActive }) => (
              <motion.div className="flex min-w-0 flex-col items-center gap-1 px-1 py-1" whileTap={{ scale: 0.94 }}>
                <span className={`relative flex h-7 w-9 items-center justify-center rounded-xl ${isActive ? 'text-[#6f45d8]' : 'text-[#30313a]'}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6f45d8] px-1 text-[9px] font-extrabold text-white">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </span>
                <span className={`truncate text-[10px] font-bold ${isActive ? 'text-[#6f45d8]' : 'text-[#3f4149]'}`}>{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

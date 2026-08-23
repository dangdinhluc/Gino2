import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getDueVocabularyCards } from '@/src/features/courses/repositories/learningProgressRepository';
import { fetchPublishedCourses } from '@/src/features/courses/repositories/coursesRepository';
import { QuickLearnSheet } from '@/src/app/layouts/QuickLearnSheet';
import { assets } from '@/src/shared/lib/assets';

export function BottomNav() {
  const [dueCount, setDueCount] = useState(0);
  const [currentCourse, setCurrentCourse] = useState<{ id: string; title: string } | null>(null);
  const [isQuickLearnOpen, setIsQuickLearnOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      getDueVocabularyCards(100),
      fetchPublishedCourses(),
    ]).then(([dueResult, coursesResult]) => {
      if (cancelled) return;

      if (dueResult.status === 'fulfilled') {
        setDueCount(dueResult.value.filter((card) => card.status !== 'new').length);
      } else {
        setDueCount(0);
      }

      if (coursesResult.status === 'fulfilled') {
        const enrolledCourses = coursesResult.value.filter((course) => course.isEnrolled === true);
        const activeCourse = enrolledCourses.find((course) => course.progress > 0 && course.progress < 100)
          ?? enrolledCourses[0]
          ?? null;
        setCurrentCourse(activeCourse ? { id: activeCourse.id, title: activeCourse.title } : null);
      } else {
        setCurrentCourse(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    setIsQuickLearnOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Hôm nay', path: '/app/dashboard', icon: assets.shared.navigation.home },
    { label: 'Khóa học', path: '/app/courses', icon: assets.shared.navigation.courses },
    { label: 'Luyện tập', path: '/app/practice', icon: assets.shared.navigation.practice },
    { label: 'Cá nhân', path: '/app/profile', icon: assets.shared.navigation.profile },
  ];

  const handleQuickNavigate = (path: string) => {
    setIsQuickLearnOpen(false);
    navigate(path);
  };

  const renderNavItem = (item: (typeof navItems)[number]) => (
    <NavLink key={item.path} to={item.path} className="relative flex min-w-0 items-center justify-center">
      {({ isActive }) => (
        <motion.div className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-1" whileTap={{ scale: 0.94 }}>
          <span className={`relative flex h-9 w-11 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-[#f4f0ff]' : 'bg-transparent'}`}>
            <img
              src={item.icon}
              alt=""
              className={`h-8 w-8 object-contain transition-all ${isActive ? 'scale-110 opacity-100 drop-shadow-[0_3px_6px_rgba(111,69,216,.2)]' : 'scale-100 opacity-78 grayscale-[14%]'}`}
            />
          </span>
          <span className={`truncate text-[10px] font-bold ${isActive ? 'text-[#6f45d8]' : 'text-[#4f5159]'}`}>{item.label}</span>
          {isActive && <span className="mt-0.5 h-1 w-1 rounded-full bg-[#6f45d8]" />}
        </motion.div>
      )}
    </NavLink>
  );

  return (
    <>
      <QuickLearnSheet
        isOpen={isQuickLearnOpen}
        dueCount={dueCount}
        currentCourse={currentCourse}
        onClose={() => setIsQuickLearnOpen(false)}
        onNavigate={handleQuickNavigate}
      />

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto min-h-[4.8rem] max-w-[1180px] border-t border-[#e7e7ee] bg-white/98 px-2 pb-[calc(.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(30,25,50,.05)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 items-end gap-0">
          {renderNavItem(navItems[0])}
          {renderNavItem(navItems[1])}

          <div className="relative flex min-w-0 items-end justify-center">
            <motion.button
              type="button"
              onClick={() => setIsQuickLearnOpen((open) => !open)}
              whileTap={{ scale: 0.94 }}
              aria-haspopup="dialog"
              aria-expanded={isQuickLearnOpen}
              aria-label="Mở Học nhanh"
              className="relative -mt-7 flex min-w-0 flex-col items-center gap-0.5"
            >
              <motion.span
                animate={isQuickLearnOpen ? { scale: 1.08, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className={`relative flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full border-[3px] bg-white shadow-[0_8px_22px_rgba(91,55,177,.2)] transition-all ${isQuickLearnOpen ? 'border-[#7b55e2] ring-4 ring-[#d9cdfa]/65' : 'border-[#ded4f4]'}`}
              >
                <img src={assets.shared.mascots.quickLearn} alt="" className="absolute left-1/2 top-0 h-auto w-[78px] max-w-none -translate-x-1/2" />
              </motion.span>
              <span className="sr-only">Học nhanh</span>
            </motion.button>
          </div>

          {renderNavItem(navItems[2])}
          {renderNavItem(navItems[3])}
        </div>
      </nav>
    </>
  );
}

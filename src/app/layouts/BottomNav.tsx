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
    <NavLink key={item.path} to={item.path} className="relative flex min-w-0 flex-1 items-center justify-center">
      {({ isActive }) => (
        <motion.div className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-1" whileTap={{ scale: 0.92 }}>
          <span className="relative flex h-10 w-12 items-center justify-center rounded-xl transition-all">
            <img
              src={item.icon}
              alt=""
              className={`h-9 w-9 object-contain transition-transform duration-200 ${
                isActive
                  ? 'scale-110 drop-shadow-[0_4px_8px_rgba(111,69,216,.22)]'
                  : 'scale-100 opacity-85'
              }`}
            />
          </span>
          <span
            className={`truncate text-[11px] leading-tight transition-colors ${
              isActive ? 'font-black text-[#6f45d8]' : 'font-semibold text-[#4e505a]'
            }`}
          >
            {item.label}
          </span>
          <div className="h-1.5 w-1.5 flex items-center justify-center">
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#6f45d8]" />}
          </div>
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

      <nav
        aria-label="Thanh điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[1180px] rounded-t-[28px] border-t border-[#ebe7f3] bg-white/98 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(30,20,55,0.06)] backdrop-blur-xl lg:hidden"
      >
        <div className="grid grid-cols-5 items-end gap-0">
          {renderNavItem(navItems[0])}
          {renderNavItem(navItems[1])}

          {/* Nút trung tâm Mascot: Học nhanh */}
          <div className="relative flex min-w-0 items-end justify-center">
            <motion.button
              type="button"
              onClick={() => setIsQuickLearnOpen((open) => !open)}
              whileTap={{ scale: 0.92 }}
              aria-haspopup="dialog"
              aria-expanded={isQuickLearnOpen}
              aria-label="Mở Học nhanh"
              className="relative -mt-9 flex min-w-0 flex-col items-center"
            >
              <motion.div
                animate={isQuickLearnOpen ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                className="relative flex items-center justify-center"
              >
                {isQuickLearnOpen ? (
                  <div className="relative flex flex-col items-center">
                    <img
                      src={assets.shared.mascots.quickLearnActive}
                      alt="Học nhanh"
                      className="h-[74px] w-[74px] object-contain drop-shadow-[0_8px_20px_rgba(147,75,255,0.5)]"
                    />
                    <span className="absolute -bottom-1 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#6e46e6] to-[#582dd7] px-2.5 py-0.5 text-[9px] font-black text-white shadow-[0_3px_10px_rgba(110,70,230,0.45)] whitespace-nowrap">
                      <span>⚡</span> Học nhanh
                    </span>
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center">
                    <span className="relative flex h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full border-[2.5px] border-[#d8cdf4] bg-white shadow-[0_8px_20px_rgba(111,69,216,0.18)]">
                      <img
                        src={assets.shared.mascots.quickLearn}
                        alt="Học nhanh"
                        className="absolute left-1/2 top-0 h-auto w-[76px] max-w-none -translate-x-1/2"
                      />
                    </span>
                    <span className="mt-1 truncate text-[11px] font-semibold text-[#4e505a]">
                      Học nhanh
                    </span>
                    <div className="h-1.5 w-1.5" />
                  </div>
                )}
              </motion.div>
            </motion.button>
          </div>

          {renderNavItem(navItems[2])}
          {renderNavItem(navItems[3])}
        </div>
      </nav>
    </>
  );
}

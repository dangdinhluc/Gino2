import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BottomNav } from './BottomNav';
import { MobileAITutorPopover } from './MobileAITutorPopover';
import { TokuteiAppChrome } from './TokuteiAppChrome';
import { AnimeBackdrop } from '@/src/shared/components/AnimeBackdrop';

export function MainLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isCourseFocusRoute = /^\/app\/courses\/[^/]+\/(learn|workspace)\/?$/.test(location.pathname);
  const isFlashcardFocusRoute = location.pathname === '/app/review/flashcards';
  const isExamRunnerRoute = /^\/app\/exams\/[^/]+\/start\/?$/.test(location.pathname);
  const isFocusRoute = isCourseFocusRoute || isFlashcardFocusRoute || isExamRunnerRoute;
  const isPrimaryAppRoute = /^\/app\/(dashboard|courses|practice|profile)\/?$/.test(location.pathname);
  const isMockExperience = isPrimaryAppRoute || isCourseFocusRoute;
  const isDashboardRoute = location.pathname === '/app/dashboard';
  const isTokuteiMenuRoute = /^\/app\/(enrollments|review|exams|settings)(?:\/|$)/.test(location.pathname);
  const useTokuteiChrome = !isFocusRoute && !isMockExperience && isTokuteiMenuRoute;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className={`flex h-[100dvh] overflow-hidden ${isMockExperience ? 'bg-[#f7f7fb]' : 'app-layout-root'}`}>
      {!isFocusRoute && !isMockExperience && <AnimeBackdrop />}
      <main
        ref={mainRef}
        className={`desktop-workspace-main relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${useTokuteiChrome ? 'tokutei-app-main' : ''} ${isMockExperience ? 'bg-[#f7f7fb]' : ''}`}
      >
        {!isFocusRoute && !useTokuteiChrome && !isMockExperience && <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.06),transparent_34%)]" />}
        {!isFocusRoute && !useTokuteiChrome && !isMockExperience && <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.035),transparent_72%)]" />}
        {useTokuteiChrome && <TokuteiAppChrome />}
        <div className={`app-route-shell desktop-route-frame relative z-10 ${!isFocusRoute ? 'app-route-shell-wide' : ''} ${isFocusRoute ? 'app-route-shell-focus' : ''} ${isDashboardRoute ? 'app-route-shell-dashboard' : ''} ${isMockExperience ? '!mx-auto !w-full !max-w-[1180px] !px-0 !pt-0' : ''}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      {!isFocusRoute && <BottomNav />}
      {!isMockExperience && !isFlashcardFocusRoute && !isExamRunnerRoute && <MobileAITutorPopover />}
    </div>
  );
}

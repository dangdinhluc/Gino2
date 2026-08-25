import { lazy, Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';

const LazyMobileAITutorPopover = lazy(() => import('./MobileAITutorPopover').then(({ MobileAITutorPopover }) => ({ default: MobileAITutorPopover })));
const LazyTokuteiAppChrome = lazy(() => import('./TokuteiAppChrome').then(({ TokuteiAppChrome }) => ({ default: TokuteiAppChrome })));
const LazyAnimeBackdrop = lazy(() => import('@/src/shared/components/AnimeBackdrop').then(({ AnimeBackdrop }) => ({ default: AnimeBackdrop })));

export function MainLayout() {
  useActiveCourse();
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
  const showAITutor = !isMockExperience && !isFlashcardFocusRoute && !isExamRunnerRoute;

  useEffect(() => {
    const isMobileFocusMode = isFocusRoute && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 1023px)').matches;
    if (isMobileFocusMode) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [isFocusRoute, location.pathname]);

  return (
    <div className={`flex ${isFocusRoute ? 'focus-mode-layout' : 'h-[100dvh] min-h-0 overflow-hidden'} ${isMockExperience ? 'bg-[#f7f7fb]' : 'app-layout-root'}`}>
      {!isFocusRoute && !isMockExperience && (
        <Suspense fallback={null}>
          <LazyAnimeBackdrop />
        </Suspense>
      )}
      <main
        ref={mainRef}
        className={`desktop-workspace-main relative min-w-0 ${isFocusRoute ? 'focus-mode-main' : 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'} ${useTokuteiChrome ? 'tokutei-app-main' : ''} ${isMockExperience ? 'bg-[#f7f7fb]' : ''}`}
      >
        {!isFocusRoute && !useTokuteiChrome && !isMockExperience && <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.06),transparent_34%)]" />}
        {!isFocusRoute && !useTokuteiChrome && !isMockExperience && <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.035),transparent_72%)]" />}
        {useTokuteiChrome && (
          <Suspense fallback={null}>
            <LazyTokuteiAppChrome />
          </Suspense>
        )}
        <div className={`app-route-shell desktop-route-frame relative z-10 ${!isFocusRoute ? 'app-route-shell-wide' : ''} ${isFocusRoute ? 'app-route-shell-focus' : ''} ${isDashboardRoute ? 'app-route-shell-dashboard' : ''} ${isMockExperience ? '!mx-auto !w-full !max-w-[1180px] !px-0 !pt-0' : ''}`}>
          <div
            key={location.pathname}
            className={isFocusRoute ? 'gino-route-enter gino-route-enter-focus' : 'gino-route-enter'}
          >
            <Outlet />
          </div>
        </div>
      </main>
      {!isFocusRoute && <BottomNav />}
      {showAITutor && (
        <Suspense fallback={null}>
          <LazyMobileAITutorPopover />
        </Suspense>
      )}
    </div>
  );
}

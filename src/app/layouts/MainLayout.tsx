import { lazy, Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { isExamWorkspaceTab } from '@/src/shared/lib/appNav';
import { BottomNav } from './BottomNav';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';

const LazyMobileAITutorPopover = lazy(() => import('./MobileAITutorPopover').then(({ MobileAITutorPopover }) => ({ default: MobileAITutorPopover })));
const LazyTokuteiAppChrome = lazy(() => import('./TokuteiAppChrome').then(({ TokuteiAppChrome }) => ({ default: TokuteiAppChrome })));

export function MainLayout() {
  useActiveCourse();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isCourseFocusRoute = /^\/app\/courses\/[^/]+\/(learn|workspace)\/?$/.test(location.pathname);
  const isFlashcardFocusRoute = location.pathname === '/app/review/flashcards';
  const isExamRunnerRoute = /^\/app\/exams\/[^/]+\/start\/?$/.test(location.pathname);
  const isFocusRoute = isCourseFocusRoute || isFlashcardFocusRoute || isExamRunnerRoute;
  // The exam tab of a course workspace is a browsable destination reached from the
  // bottom nav, so it must keep that nav. Only the in-exam runner is real focus mode.
  const onExamWorkspaceTab = isExamWorkspaceTab(location.pathname, location.search);
  // The exam workspace keeps the focused course chrome, but scrolls inside the same
  // app container as the primary destinations because its bottom nav stays mounted.
  const useContainedScroll = !isFocusRoute || onExamWorkspaceTab;
  const showBottomNav = !isFocusRoute || onExamWorkspaceTab;
  const isPrimaryAppRoute = /^\/app\/(dashboard|courses|practice|profile)\/?$/.test(location.pathname);
  // `/app/exams` is the "Thi thử" bottom-nav destination but it is redirect-ONLY
  // (CourseEntryRedirect) — it renders PageLoading, or the active-course error state
  // when the context fails. It is not a primary route, so without this the floating AI
  // tutor sat on top of a loading/error screen, and stayed there indefinitely on error.
  const isExamLandingRoute = location.pathname === '/app/exams';
  const isDashboardRoute = location.pathname === '/app/dashboard';
  const isAiRoute = /^\/app\/(ai-lab|ai-speak)(?:\/|$)/.test(location.pathname);
  const useTokuteiChrome = !isFocusRoute || onExamWorkspaceTab;
  const hideAITutor = (isPrimaryAppRoute && !isDashboardRoute) || isExamLandingRoute || isCourseFocusRoute || isFlashcardFocusRoute || isExamRunnerRoute;
  const showAITutor = !hideAITutor;
  const visualMode = isAiRoute ? 'ai' : 'core';
  const useCompactLearnerWidth = isPrimaryAppRoute || isCourseFocusRoute;

  useEffect(() => {
    const isMobileFocusMode = isFocusRoute && !onExamWorkspaceTab && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 1023px)').matches;
    if (isMobileFocusMode) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [isFocusRoute, location.pathname, onExamWorkspaceTab]);

  return (
    <div
      data-gino-visual={visualMode}
      data-gino-route={location.pathname}
      className={`app-layout-root flex ${useContainedScroll ? 'h-[100dvh] min-h-0 overflow-hidden' : 'focus-mode-layout'}`}
    >
      <main
        ref={mainRef}
        className={`desktop-workspace-main relative min-w-0 ${useContainedScroll ? 'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain' : 'focus-mode-main'} ${useTokuteiChrome ? 'tokutei-app-main' : ''}`}
      >
        {!isFocusRoute && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,rgba(111,69,216,0.07),transparent_34%)]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(138,114,199,0.04),transparent_72%)]" />
          </>
        )}
        {useTokuteiChrome && (
          <Suspense fallback={null}>
            <LazyTokuteiAppChrome />
          </Suspense>
        )}
        <div
          className={`app-route-shell desktop-route-frame relative z-10 ${!isFocusRoute ? 'app-route-shell-wide' : ''} ${isFocusRoute ? 'app-route-shell-focus' : ''} ${onExamWorkspaceTab ? 'app-route-shell-over-nav' : ''} ${isDashboardRoute ? 'app-route-shell-dashboard' : ''} ${useCompactLearnerWidth ? '!mx-auto !w-full !max-w-[1180px]' : ''}`}
        >
          <div
            key={location.pathname}
            className={isFocusRoute ? 'gino-route-enter gino-route-enter-focus' : 'gino-route-enter'}
          >
            <Outlet />
          </div>
        </div>
      </main>
      {showBottomNav && <BottomNav />}
      {showAITutor && (
        <Suspense fallback={null}>
          <LazyMobileAITutorPopover />
        </Suspense>
      )}
    </div>
  );
}

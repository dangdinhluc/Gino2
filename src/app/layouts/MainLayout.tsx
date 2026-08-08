import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { MobileAITutorPopover } from './MobileAITutorPopover';
import { TokuteiAppChrome } from './TokuteiAppChrome';

export function MainLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isCourseLearningRoute = /^\/app\/courses\/[^/]+\/learn\/?$/.test(location.pathname);
  const isFlashcardFocusRoute = location.pathname === '/app/review/flashcards';
  const isExamRunnerRoute = /^\/app\/exams\/[^/]+\/start\/?$/.test(location.pathname);
  const isFocusRoute = isCourseLearningRoute || isFlashcardFocusRoute || isExamRunnerRoute;
  const isAiTutorRoute = location.pathname === '/app/ai-chat';
  const isDashboardRoute = location.pathname === '/app/dashboard';
  const isTokuteiMenuRoute = /^\/app\/(courses|practice|review|exams|profile|settings)(?:\/|$)/.test(location.pathname);
  const useTokuteiChrome = !isFocusRoute && (isDashboardRoute || isTokuteiMenuRoute);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="app-layout-root flex h-[100dvh] overflow-hidden">
      {!isFocusRoute && <Sidebar />}
      <main ref={mainRef} className={`desktop-workspace-main relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain ${useTokuteiChrome ? 'tokutei-app-main' : ''}`}>
        {!isFocusRoute && !useTokuteiChrome && <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.06),transparent_34%)]" />}
        {!isFocusRoute && !useTokuteiChrome && <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.035),transparent_72%)]" />}
        {useTokuteiChrome && !isDashboardRoute && <TokuteiAppChrome />}
        <div className={`app-route-shell desktop-route-frame relative z-10 ${!isFocusRoute ? 'app-route-shell-wide' : ''} ${isFocusRoute ? 'app-route-shell-focus' : ''} ${isDashboardRoute ? 'app-route-shell-dashboard' : ''}`}>
          <Outlet />
        </div>
      </main>
      {!isFocusRoute && <BottomNav />}

      {!isFlashcardFocusRoute && !isExamRunnerRoute && !isAiTutorRoute && <MobileAITutorPopover />}
    </div>
  );
}

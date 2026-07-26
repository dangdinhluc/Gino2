import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { MobileAITutorPopover } from './MobileAITutorPopover';

export function MainLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isCourseLearningRoute = /^\/app\/courses\/[^/]+\/learn\/?$/.test(location.pathname);
  const isAiTutorRoute = location.pathname === '/app/ai-chat';

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,rgba(248,245,239,0.96)_0%,rgba(244,241,235,1)_100%)]">
      {!isCourseLearningRoute && <Sidebar />}
      <main ref={mainRef} className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.06),transparent_34%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.035),transparent_72%)]" />
        <div className="app-route-shell relative z-10">
          <Outlet />
        </div>
      </main>
      {!isCourseLearningRoute && <BottomNav />}

      {!isCourseLearningRoute && !isAiTutorRoute && <MobileAITutorPopover />}
    </div>
  );
}

import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';

const GameScreen = lazy(() => import('@/src/features/games/GameScreen'));
const routeLoading = <main className="grid min-h-dvh place-items-center bg-[#F5EFE6] text-sm font-bold text-[#5F6B7C]">Đang mở trò chơi…</main>;

export function GameRoutes() {
  return (
    <Route
      path="/app/game/:gameId"
      element={
        <ProtectedRoute area="learner">
          <Suspense fallback={routeLoading}><GameScreen /></Suspense>
        </ProtectedRoute>
      }
    />
  );
}

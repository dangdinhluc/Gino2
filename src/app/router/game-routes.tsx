import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';

const GameScreen = lazy(() => import('@/src/features/games/GameScreen'));
const routeLoading = <PageLoading variant="games" />;

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

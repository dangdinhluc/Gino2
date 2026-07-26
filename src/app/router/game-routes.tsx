import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import GameScreen from '@/src/features/games/GameScreen';

export function GameRoutes() {
  return (
    <Route
      path="/app/game/:gameId"
      element={
        <ProtectedRoute area="learner">
          <GameScreen />
        </ProtectedRoute>
      }
    />
  );
}

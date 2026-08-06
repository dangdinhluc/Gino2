import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppRoutes } from '@/src/app/router/app-routes';
import { GameRoutes } from '@/src/app/router/game-routes';
import { PublicRoutes } from '@/src/app/router/public-routes';
import { AuthProvider } from '@/src/features/auth/lib/AuthProvider';
import { AppThemeProvider } from '@/src/app/theme/AppThemeProvider';

// Trên GitHub Pages app chạy dưới /Gino2/ — lấy basename từ vite base để route hoạt động đúng.
const routerBasename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

export function AppRouter() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <Router basename={routerBasename}>
          <Routes>
            {PublicRoutes()}
            {GameRoutes()}
            {AppRoutes()}
          </Routes>
        </Router>
      </AuthProvider>
    </AppThemeProvider>
  );
}

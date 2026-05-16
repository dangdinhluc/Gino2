import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppRoutes } from '@/src/app/router/app-routes';
import { PublicRoutes } from '@/src/app/router/public-routes';
import { AuthProvider } from '@/src/features/auth/lib/AuthProvider';

export function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {PublicRoutes()}
          {AppRoutes()}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

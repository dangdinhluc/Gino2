import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import LoginPage from '@/src/features/auth/pages/LoginPage';
import QuickLoginPage from '@/src/features/auth/pages/QuickLoginPage';
import AdminDashboardPage from '@/src/features/admin/pages/AdminDashboardPage';
import LandingPage from '@/src/features/public/pages/LandingPage';
import OnboardingPage from '@/src/features/public/pages/OnboardingPage';
import TermsPage from '@/src/features/public/pages/TermsPage';
import PrivacyPage from '@/src/features/public/pages/PrivacyPage';

export function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<QuickLoginPage />} />
      <Route path="/quick-login" element={<QuickLoginPage />} />
      <Route path="/login/learner" element={<LoginPage area="learner" />} />
      <Route path="/login/admin" element={<LoginPage area="admin" />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/admin/login" element={<QuickLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute area="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
    </>
  );
}

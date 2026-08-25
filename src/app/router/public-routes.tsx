import { lazy, Suspense, type ReactNode } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import LandingPage from '@/src/features/public/pages/LandingPage';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';

const LoginPage = lazy(() => import('@/src/features/auth/pages/LoginPage'));
const QuickLoginPage = lazy(() => import('@/src/features/auth/pages/QuickLoginPage'));
const SignupPage = lazy(() => import('@/src/features/auth/pages/SignupPage'));
const PasswordRecoveryPage = lazy(() => import('@/src/features/auth/pages/PasswordRecoveryPage'));
const ResetPasswordPage = lazy(() => import('@/src/features/auth/pages/ResetPasswordPage'));
const AdminDashboardPage = lazy(() => import('@/src/features/admin/pages/AdminDashboardPage'));
const OnboardingPage = lazy(() => import('@/src/features/public/pages/OnboardingPage'));
const TermsPage = lazy(() => import('@/src/features/public/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/src/features/public/pages/PrivacyPage'));

const routeLoading = <PageLoading />;
const screen = (content: ReactNode) => <Suspense fallback={routeLoading}>{content}</Suspense>;

export function PublicRoutes() {
  return (
    <>
      <Route path="/" element={screen(<LandingPage />)} />
      <Route path="/login" element={screen(<QuickLoginPage />)} />
      <Route path="/quick-login" element={screen(<QuickLoginPage />)} />
      <Route path="/login/learner" element={screen(<LoginPage area="learner" />)} />
      <Route path="/login/admin" element={screen(<LoginPage area="admin" />)} />
      <Route path="/signup" element={screen(<SignupPage />)} />
      <Route path="/forgot-password" element={screen(<PasswordRecoveryPage />)} />
      <Route path="/reset-password" element={screen(<ResetPasswordPage />)} />
      <Route path="/onboarding" element={screen(<OnboardingPage />)} />
      <Route path="/terms" element={screen(<TermsPage />)} />
      <Route path="/privacy" element={screen(<PrivacyPage />)} />
      <Route path="/admin/login" element={screen(<QuickLoginPage />)} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute area="admin">
            {screen(<AdminDashboardPage />)}
          </ProtectedRoute>
        }
      />
    </>
  );
}

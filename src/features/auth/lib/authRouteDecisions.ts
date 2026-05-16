export type ProtectedRouteArea = 'admin' | 'learner';

export type AuthRouteDecision =
  | { status: 'allowed' }
  | { status: 'redirect'; to: string; reason: 'missing-session' }
  | { status: 'denied'; reason: 'missing-admin-role' }
  | { status: 'setup-required'; reason: 'missing-supabase-config' };

export interface AuthRouteDecisionInput {
  area: ProtectedRouteArea;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupabaseConfigured: boolean;
  isDemo?: boolean;
}

export function decideAuthRouteAccess({
  area,
  isAuthenticated,
  isAdmin,
  isSupabaseConfigured,
  isDemo,
}: AuthRouteDecisionInput): AuthRouteDecision {
  // Demo mode bypasses Supabase for the learner area so reviewers / users
  // without local Supabase can fully browse the app shell.
  if (isDemo && area === 'learner') {
    return { status: 'allowed' };
  }

  if (!isSupabaseConfigured) {
    return { status: 'setup-required', reason: 'missing-supabase-config' };
  }

  if (!isAuthenticated) {
    return { status: 'redirect', to: area === 'admin' ? '/admin/login' : '/login', reason: 'missing-session' };
  }

  if (area === 'admin' && !isAdmin) {
    return { status: 'denied', reason: 'missing-admin-role' };
  }

  return { status: 'allowed' };
}

export type ProtectedRouteArea = 'admin' | 'learner';
export type StaffRoleStatus = 'idle' | 'loading' | 'loaded' | 'error';

export type AuthRouteDecision =
  | { status: 'allowed' }
  | { status: 'loading-role' }
  | { status: 'role-error' }
  | { status: 'redirect'; to: string; reason: 'missing-session' }
  | { status: 'denied'; reason: 'missing-admin-role' }
  | { status: 'setup-required'; reason: 'missing-supabase-config' };

export interface AuthRouteDecisionInput {
  area: ProtectedRouteArea;
  isAuthenticated: boolean;
  isAdmin: boolean;
  staffRoleStatus: StaffRoleStatus;
  isSupabaseConfigured: boolean;
}

export function decideAuthRouteAccess({ area, isAuthenticated, isAdmin, staffRoleStatus, isSupabaseConfigured }: AuthRouteDecisionInput): AuthRouteDecision {
  if (!isSupabaseConfigured) {
    return { status: 'setup-required', reason: 'missing-supabase-config' };
  }

  if (!isAuthenticated) {
    return { status: 'redirect', to: area === 'admin' ? '/admin/login' : '/login', reason: 'missing-session' };
  }

  if (area === 'admin') {
    if (staffRoleStatus === 'loading' || staffRoleStatus === 'idle') return { status: 'loading-role' };
    if (staffRoleStatus === 'error') return { status: 'role-error' };
    if (!isAdmin) return { status: 'denied', reason: 'missing-admin-role' };
  }

  return { status: 'allowed' };
}

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
}

export function decideAuthRouteAccess({ area, isAuthenticated, isAdmin, isSupabaseConfigured }: AuthRouteDecisionInput): AuthRouteDecision {
  if (!isSupabaseConfigured) {
    // Demo mode: không có Supabase thì khu vực học mở tự do (dữ liệu lưu local trên máy người dùng),
    // riêng khu admin vẫn yêu cầu cấu hình backend thật.
    if (area === 'learner') {
      return { status: 'allowed' };
    }
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

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfig } from '@/src/features/supabase/lib/supabaseClient';

interface AuthActionResult {
  ok: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

export type StaffRole = 'owner' | 'content_editor' | 'instructor_support' | 'analyst';

export type StaffRoleStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  staffRole: StaffRole | null;
  staffRoleStatus: StaffRoleStatus;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  isLocalSupabase: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  refreshSession: () => Promise<void>;
}

const initialState: AuthState = {
  session: null,
  user: null,
  isAdmin: false,
  staffRole: null,
  staffRoleStatus: 'idle',
  isLoading: true,
  error: null,
};

const AUTH_ERROR_MESSAGE = 'Không thể xác thực phiên đăng nhập. Vui lòng thử lại.';
const SIGN_IN_ERROR_MESSAGE = 'Email hoặc mật khẩu không đúng.';
const AUTH_REQUEST_TIMEOUT_MS = 3500;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return 'unknown';
}

function getAuthErrorMessage(error: unknown): string {
  if (import.meta.env.DEV) {
    const detail = describeError(error);
    return detail && detail !== 'unknown' ? `${AUTH_ERROR_MESSAGE} [DEV: ${detail}]` : AUTH_ERROR_MESSAGE;
  }
  return AUTH_ERROR_MESSAGE;
}

function getSignInErrorMessage(error: unknown): string {
  if (import.meta.env.DEV) {
    const detail = describeError(error);
    return detail && detail !== 'unknown' ? `${SIGN_IN_ERROR_MESSAGE} [DEV: ${detail}]` : SIGN_IN_ERROR_MESSAGE;
  }
  return SIGN_IN_ERROR_MESSAGE;
}

function withAuthTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} timed out`));
    }, AUTH_REQUEST_TIMEOUT_MS);

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  });
}

function appRedirectUrl(path = ''): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return new URL(`${base}${path.replace(/^\//, '')}`, window.location.origin).toString();
}

async function loadStaffRole(user: User | null): Promise<StaffRole | null> {
  if (!supabase || !user) {
    return null;
  }

  const { data, error } = await withAuthTimeout(
    supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
    'admin role check',
  );

  if (error) {
    throw new Error(error.message);
  }

  const role = data?.role as string | undefined;
  if (role === 'admin') return 'owner';
  return role === 'owner' || role === 'content_editor' || role === 'instructor_support' || role === 'analyst'
    ? role
    : null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const [state, setState] = useState<AuthState>(() => ({ ...initialState, isLoading: supabaseConfig.isConfigured }));

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      sessionRequestIdRef.current += 1;
    };
  }, []);

  const applySession = useCallback(async (session: Session | null): Promise<void> => {
    const requestId = sessionRequestIdRef.current + 1;
    sessionRequestIdRef.current = requestId;

    if (!session) {
      if (isMountedRef.current) setState({ ...initialState, isLoading: false });
      return;
    }

    setState({ session, user: session.user, isAdmin: false, staffRole: null, staffRoleStatus: 'loading', isLoading: false, error: null });
    try {
      const staffRole = await loadStaffRole(session.user);
      if (!isMountedRef.current || sessionRequestIdRef.current !== requestId) return;
      setState({ session, user: session.user, isAdmin: staffRole !== null, staffRole, staffRoleStatus: 'loaded', isLoading: false, error: null });
    } catch (error: unknown) {
      if (isMountedRef.current && sessionRequestIdRef.current === requestId) {
        setState({ session, user: session.user, isAdmin: false, staffRole: null, staffRoleStatus: 'error', isLoading: false, error: getAuthErrorMessage(error) });
      }
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!supabase) {
      if (isMountedRef.current) {
        setState({ ...initialState, isLoading: false });
      }
      return;
    }

    try {
      if (isMountedRef.current) {
        setState((currentState) => ({ ...currentState, isLoading: true, error: null }));
      }
      const { data, error } = await withAuthTimeout(supabase.auth.getSession(), 'session refresh');

      if (error) {
        throw new Error(error.message);
      }

      await applySession(data.session);
    } catch (error: unknown) {
      if (isMountedRef.current) {
        setState({ ...initialState, isLoading: false, error: getAuthErrorMessage(error) });
      }
    }
  }, [applySession]);

  useEffect(() => {
    if (!supabase) {
      if (isMountedRef.current) {
        setState({ ...initialState, isLoading: false });
      }
      return undefined;
    }

    let shouldUpdate = true;
    const authChangeTimeouts = new Set<ReturnType<typeof setTimeout>>();

    const refreshInitialSession = async (): Promise<void> => {
      try {
        const { data, error } = await withAuthTimeout(supabase.auth.getSession(), 'initial session');

        if (error) {
          throw new Error(error.message);
        }

        if (shouldUpdate && isMountedRef.current) {
          await applySession(data.session);
        }
      } catch (error: unknown) {
        if (shouldUpdate && isMountedRef.current) {
          setState({ ...initialState, isLoading: false, error: getAuthErrorMessage(error) });
        }
      }
    };

    void refreshInitialSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const timeoutId = setTimeout(() => {
        authChangeTimeouts.delete(timeoutId);

        if (shouldUpdate && isMountedRef.current) {
          void applySession(session);
        }
      }, 0);

      authChangeTimeouts.add(timeoutId);
    });

    return () => {
      shouldUpdate = false;
      sessionRequestIdRef.current += 1;
      for (const timeoutId of authChangeTimeouts) {
        clearTimeout(timeoutId);
      }
      data.subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!supabase) {
        return { ok: false, error: 'Supabase chưa được cấu hình.' };
      }

      try {
        const { error } = await withAuthTimeout(supabase.auth.signInWithPassword({ email, password }), 'sign in');

        if (error) {
          if (import.meta.env.DEV) {
            console.error('[auth] signInWithPassword error', error);
          }
          return { ok: false, error: getSignInErrorMessage(error) };
        }

        await refreshSession();
        return { ok: true };
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          console.error('[auth] signIn threw', error);
        }
        return { ok: false, error: getSignInErrorMessage(error) };
      }
    },
    [refreshSession],
  );

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthActionResult> => {
    if (!supabase) return { ok: false, error: 'Supabase chưa được cấu hình.' };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: appRedirectUrl('onboarding'),
        },
      });
      if (error) return { ok: false, error: error.message };
      if (data.session) await refreshSession();
      return { ok: true, requiresEmailConfirmation: !data.session };
    } catch (error: unknown) {
      return { ok: false, error: getAuthErrorMessage(error) };
    }
  }, [refreshSession]);

  const requestPasswordReset = useCallback(async (email: string): Promise<AuthActionResult> => {
    if (!supabase) return { ok: false, error: 'Supabase chưa được cấu hình.' };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: appRedirectUrl('reset-password') });
      return error ? { ok: false, error: error.message } : { ok: true };
    } catch (error: unknown) {
      return { ok: false, error: getAuthErrorMessage(error) };
    }
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<AuthActionResult> => {
    if (!supabase) return { ok: false, error: 'Supabase chưa được cấu hình.' };
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { ok: false, error: error.message } : { ok: true };
    } catch (error: unknown) {
      return { ok: false, error: getAuthErrorMessage(error) };
    }
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    if (!supabase) {
      return { ok: true };
    }

    try {
      sessionRequestIdRef.current += 1;
      const { error } = await withAuthTimeout(supabase.auth.signOut(), 'sign out');

      if (error) {
        return { ok: false, error: AUTH_ERROR_MESSAGE };
      }

      sessionRequestIdRef.current += 1;
      if (isMountedRef.current) {
        setState({ ...initialState, isLoading: false });
      }
      return { ok: true };
    } catch (_error: unknown) {
      return { ok: false, error: AUTH_ERROR_MESSAGE };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.session),
      isSupabaseConfigured: supabaseConfig.isConfigured,
      isLocalSupabase: supabaseConfig.isLocal,
      signIn,
      signUp,
      requestPasswordReset,
      updatePassword,
      signOut,
      refreshSession,
    }),
    [refreshSession, requestPasswordReset, signIn, signOut, signUp, state, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

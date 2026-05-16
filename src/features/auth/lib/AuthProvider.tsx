import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfig } from '@/src/features/supabase/lib/supabaseClient';

interface AuthActionResult {
  ok: boolean;
  error?: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isSupabaseConfigured: boolean;
  isLocalSupabase: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  refreshSession: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const initialState: AuthState = {
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  error: null,
};

const AUTH_ERROR_MESSAGE = 'Không thể xác thực phiên đăng nhập. Vui lòng thử lại.';
const SIGN_IN_ERROR_MESSAGE = 'Email hoặc mật khẩu không đúng.';
const AUTH_REQUEST_TIMEOUT_MS = 3500;
const DEMO_STORAGE_KEY = 'tokutei.demoMode';

function readPersistedDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writePersistedDemoMode(isDemo: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (isDemo) {
      window.localStorage.setItem(DEMO_STORAGE_KEY, '1');
    } else {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

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

async function loadAdminStatus(user: User | null): Promise<boolean> {
  if (!supabase || !user) {
    return false;
  }

  const { data, error } = await withAuthTimeout(
    supabase.from('admin_roles').select('role').eq('user_id', user.id).maybeSingle(),
    'admin role check',
  );

  if (error) {
    throw new Error(error.message);
  }

  return data?.role === 'admin';
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const [state, setState] = useState<AuthState>(() => ({ ...initialState, isLoading: supabaseConfig.isConfigured }));
  const [isDemo, setIsDemo] = useState<boolean>(() => readPersistedDemoMode());

  const enterDemoMode = useCallback(() => {
    setIsDemo(true);
    writePersistedDemoMode(true);
  }, []);

  const exitDemoMode = useCallback(() => {
    setIsDemo(false);
    writePersistedDemoMode(false);
  }, []);

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

    try {
      const isAdmin = await loadAdminStatus(session?.user ?? null);

      if (!isMountedRef.current || sessionRequestIdRef.current !== requestId) {
        return;
      }

      setState({
        session,
        user: session?.user ?? null,
        isAdmin,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      if (isMountedRef.current && sessionRequestIdRef.current === requestId) {
        setState({ ...initialState, isLoading: false, error: getAuthErrorMessage(error) });
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
      isDemo,
      signIn,
      signOut,
      refreshSession,
      enterDemoMode,
      exitDemoMode,
    }),
    [enterDemoMode, exitDemoMode, isDemo, refreshSession, signIn, signOut, state],
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

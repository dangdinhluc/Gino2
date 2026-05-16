import { useEffect, useRef, useState } from 'react';

export type SupabaseQueryStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SupabaseQueryState<T> {
  status: SupabaseQueryStatus;
  data: T | null;
  error: string | null;
}

export interface UseSupabaseQueryOptions {
  /** Skip the query and stay in `idle` until the flag flips to true. */
  enabled?: boolean;
}

/**
 * Read-only React hook around an async Supabase fetcher. Owns loading/error
 * lifecycle while ignoring stale responses if the component unmounts or the
 * dependency list changes mid-flight. Pages should treat `null` data as a
 * signal to fall back to mock content.
 */
export function useSupabaseQuery<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  options: UseSupabaseQueryOptions = {},
): SupabaseQueryState<T> {
  const { enabled = true } = options;
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const [state, setState] = useState<SupabaseQueryState<T>>(() => ({
    status: enabled ? 'loading' : 'idle',
    data: null,
    error: null,
  }));

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle', data: null, error: null });
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setState((current) => ({ status: 'loading', data: current.data, error: null }));

    let cancelled = false;
    fetcher()
      .then((data) => {
        if (cancelled || !isMountedRef.current || requestIdRef.current !== requestId) {
          return;
        }
        setState({ status: 'ready', data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled || !isMountedRef.current || requestIdRef.current !== requestId) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu Supabase.';
        setState({ status: 'error', data: null, error: message });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return state;
}

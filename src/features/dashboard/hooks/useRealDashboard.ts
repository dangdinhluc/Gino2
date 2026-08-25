import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import {
  clearRealDashboardCache,
  fetchRealDashboardData,
  readRealDashboardCache,
  REAL_DASHBOARD_CACHE_STALE_TIME_MS,
  type RealDashboardData,
} from '@/src/features/dashboard/repositories/realDashboardRepository';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

type DashboardReason = 'auth' | 'active-course' | 'no-course' | 'dashboard' | 'loading' | null;

interface DashboardState {
  key: string | null;
  data: RealDashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  reason: DashboardReason;
}

const initialState: DashboardState = {
  key: null,
  data: null,
  loading: true,
  refreshing: false,
  error: null,
  reason: 'loading',
};

export function useRealDashboard() {
  const { user } = useAuth();
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const activeCourseStatus = useActiveCourseStore((state) => state.status);
  const activeCourseError = useActiveCourseStore((state) => state.error);
  const [state, setState] = useState<DashboardState>(initialState);
  const [reloadToken, setReloadToken] = useState(0);
  const stateRef = useRef(state);
  const previousUserIdRef = useRef<string | null>(null);
  const completedReloadRef = useRef(0);
  stateRef.current = state;

  const refetch = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    const userId = user?.id ?? null;

    if (previousUserIdRef.current && previousUserIdRef.current !== userId) {
      clearRealDashboardCache(previousUserIdRef.current);
    }
    previousUserIdRef.current = userId;

    if (!userId) {
      clearRealDashboardCache();
      setState({ key: null, data: null, loading: false, refreshing: false, error: new Error('Vui lòng đăng nhập để xem Dashboard.'), reason: 'auth' });
      return () => {
        cancelled = true;
      };
    }

    const key = activeCourseId ? `${userId}:${activeCourseId}` : null;
    const previousData = key && stateRef.current.key === key ? stateRef.current.data : null;

    if (activeCourseStatus === 'error') {
      setState({
        key,
        data: previousData,
        loading: false,
        refreshing: Boolean(previousData),
        error: new Error(activeCourseError ?? 'Không tải được khóa học đang học.'),
        reason: 'active-course',
      });
      return () => {
        cancelled = true;
      };
    }

    if (activeCourseStatus !== 'ready') {
      setState({
        key,
        data: previousData,
        loading: !previousData,
        refreshing: Boolean(previousData),
        error: null,
        reason: 'loading',
      });
      return () => {
        cancelled = true;
      };
    }

    if (!activeCourseId) {
      setState({ key: null, data: null, loading: false, refreshing: false, error: null, reason: 'no-course' });
      return () => {
        cancelled = true;
      };
    }

    const cached = readRealDashboardCache(userId, activeCourseId);
    const existingData = previousData ?? cached?.data ?? null;
    const force = reloadToken > completedReloadRef.current;
    const isFresh = cached !== null && Date.now() - cached.fetchedAt < REAL_DASHBOARD_CACHE_STALE_TIME_MS;

    if (isFresh && !force) {
      setState({ key, data: cached.data, loading: false, refreshing: false, error: null, reason: null });
      return () => {
        cancelled = true;
      };
    }

    setState({
      key,
      data: existingData,
      loading: !existingData,
      refreshing: Boolean(existingData),
      error: null,
      reason: null,
    });

    fetchRealDashboardData(userId, activeCourseId, { force })
      .then((value) => {
        if (cancelled) return;
        completedReloadRef.current = reloadToken;
        setState({ key, data: value, loading: false, refreshing: false, error: null, reason: null });
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        completedReloadRef.current = reloadToken;
        setState({
          key,
          data: existingData,
          loading: false,
          refreshing: false,
          error: reason instanceof Error ? reason : new Error('Không thể tải dữ liệu Dashboard.'),
          reason: 'dashboard',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [activeCourseError, activeCourseId, activeCourseStatus, reloadToken, user?.id]);

  return {
    data: state.data,
    // `loading` stays the initial-load signal for existing consumers.
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    reason: state.reason,
    refetch,
  };
}

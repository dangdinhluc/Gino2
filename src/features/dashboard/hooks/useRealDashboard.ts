import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { fetchRealDashboardData, type RealDashboardData } from '@/src/features/dashboard/repositories/realDashboardRepository';

export function useRealDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<RealDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setData(null);
      setLoading(false);
      setError(new Error('Vui lòng đăng nhập để xem Dashboard.'));
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    fetchRealDashboardData(user.id)
      .then((value) => {
        if (cancelled) return;
        setData(value);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(reason instanceof Error ? reason : new Error('Không thể tải dữ liệu Dashboard.'));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, user?.id]);

  return { data, loading, error, refetch };
}

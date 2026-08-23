import { useEffect, useState } from 'react';
import { fetchRealDashboard } from '../repositories/realDashboardRepository';
import type { RealDashboardData } from '../types';

export function useRealDashboard() {
  const [data, setData] = useState<RealDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const dashboard = await fetchRealDashboard();
        if (mounted) setData(dashboard);
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu dashboard');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

import { useCallback, useEffect, useRef, useState } from 'react';

export interface AdminQueryState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
}

export function useAdminQuery<T>(load: () => Promise<T>): AdminQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);
    setError(false);
    try {
      const nextData = await load();
      if (requestId.current === currentRequest) setData(nextData);
    } catch {
      if (requestId.current === currentRequest) setError(true);
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh]);

  return { data, loading, error, refresh };
}

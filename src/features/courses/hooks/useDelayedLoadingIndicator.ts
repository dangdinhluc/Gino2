import { useEffect, useState } from 'react';

export function useDelayedLoadingIndicator(isLoading: boolean, delay = 700, resetKey?: string): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setVisible(false);
      return;
    }

    setVisible(false);
    const timeoutId = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay, isLoading, resetKey]);

  return visible;
}

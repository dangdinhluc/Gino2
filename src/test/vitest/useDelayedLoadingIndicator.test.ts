import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDelayedLoadingIndicator } from '@/src/features/courses/hooks/useDelayedLoadingIndicator';

afterEach(() => {
  vi.useRealTimers();
});

describe('useDelayedLoadingIndicator', () => {
  it('waits 400ms, then resets immediately and cancels the pending timer', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ isLoading }: { isLoading: boolean }) => useDelayedLoadingIndicator(isLoading), {
      initialProps: { isLoading: true },
    });

    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);

    rerender({ isLoading: false });
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it('restarts the delay when the loading context changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ mode }: { mode: string }) => useDelayedLoadingIndicator(true, 400, mode),
      { initialProps: { mode: 'vocabulary' } },
    );

    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe(true);

    rerender({ mode: 'documents' });
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe(false);
  });
});

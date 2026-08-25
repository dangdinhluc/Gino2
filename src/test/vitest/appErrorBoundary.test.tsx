import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppErrorBoundary, claimChunkReloadAttempt } from '@/src/app/components/AppErrorBoundary';

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('chunk recovery guard', () => {
  it('allows only one automatic reload attempt until recovery succeeds', () => {
    expect(claimChunkReloadAttempt(window.sessionStorage)).toBe(true);
    expect(claimChunkReloadAttempt(window.sessionStorage)).toBe(false);
  });

  it('clears the guard after a fresh document mounts successfully', () => {
    window.sessionStorage.setItem('gino2-chunk-reload-attempted', '1');
    window.history.replaceState(null, '', '/?gino2_reload=123');

    render(
      <AppErrorBoundary>
        <div>Ứng dụng sẵn sàng</div>
      </AppErrorBoundary>,
    );

    expect(window.sessionStorage.getItem('gino2-chunk-reload-attempted')).toBeNull();
    expect(window.location.search).toBe('');
  });
});

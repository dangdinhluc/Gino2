import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

const CHUNK_RELOAD_KEY = 'gino2-chunk-reload-attempted';

function reloadWithFreshDocument(): void {
  const url = new URL(window.location.href);
  url.searchParams.set('gino2_reload', String(Date.now()));
  window.location.replace(url.toString());
}

export function isChunkLoadError(error: Error): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(
    error.message,
  );
}

export function claimChunkReloadAttempt(storage: Storage): boolean {
  if (storage.getItem(CHUNK_RELOAD_KEY) === '1') return false;
  storage.setItem(CHUNK_RELOAD_KEY, '1');
  return true;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  declare readonly props: Readonly<{ children: ReactNode }>;

  state: AppErrorBoundaryState = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown application error' };
  }

  componentDidMount(): void {
    // A fresh document reached the app successfully, so the one-shot guard
    // can be cleared for the next independent stale-chunk incident.
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('gino2_reload')) return;
      window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      url.searchParams.delete('gino2_reload');
      window.history.replaceState(window.history.state, '', url.toString());
    } catch {
      // URL/history/storage may be restricted in embedded browsers.
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled application error', error, info);

    if (!isChunkLoadError(error)) return;

    try {
      if (claimChunkReloadAttempt(window.sessionStorage)) {
        reloadWithFreshDocument();
        return;
      }
      window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      // Storage may be unavailable; keep the normal fallback UI instead of crashing again.
    }
  }

  handleReload = (): void => {
    try {
      window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      // Ignore storage restrictions.
    }
    reloadWithFreshDocument();
  };

  handleHome = (): void => {
    const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
    window.location.assign(`${base}app/dashboard`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-dvh place-items-center bg-[#F5EFE6] p-6">
          <section className="w-full max-w-md rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-6 text-center shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C96A1B]">TOKUTEI GINO</p>
            <h1 className="mt-3 text-2xl font-black text-[#172033]">Màn hình này gặp sự cố</h1>
            <p className="mt-3 text-sm leading-6 text-[#5F6B7C]">
              Không có dữ liệu nào bị thay đổi. Hãy tải lại ứng dụng để thử khôi phục màn hình.
            </p>
            {this.state.errorMessage && (
              <details className="mt-4 rounded-2xl border border-[#E9DED0] bg-[#F8F2EA] p-3 text-left">
                <summary className="cursor-pointer text-xs font-black text-[#7A5B3D]">Chi tiết kỹ thuật</summary>
                <p className="mt-2 break-words font-mono text-[11px] leading-5 text-[#6B7280]">
                  {this.state.errorMessage}
                </p>
              </details>
            )}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-xl bg-[#C96A1B] px-4 py-2.5 text-sm font-black text-white"
              >
                Tải lại
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="rounded-xl border border-[#D9CBB9] bg-white px-4 py-2.5 text-sm font-black text-[#5F6B7C]"
              >
                Về trang học
              </button>
            </div>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  declare readonly props: Readonly<{ children: ReactNode }>;

  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled application error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <main className="grid min-h-dvh place-items-center bg-[#F5EFE6] p-6"><section className="max-w-md rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-6 text-center shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#C96A1B]">TOKUTEI GINO</p><h1 className="mt-3 text-2xl font-black text-[#172033]">Màn hình này gặp sự cố</h1><p className="mt-3 text-sm leading-6 text-[#5F6B7C]">Không có dữ liệu nào bị thay đổi. Anh hãy tải lại ứng dụng và thử lại.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-[#C96A1B] px-4 py-2.5 text-sm font-black text-white">Tải lại</button></section></main>;
    }
    return this.props.children;
  }
}

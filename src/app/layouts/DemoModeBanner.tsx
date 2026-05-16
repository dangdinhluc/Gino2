import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Play, X, LogIn } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

const DISMISS_KEY = 'tokutei.demoBannerDismissed';

function readDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // ignore
  }
}

export function DemoModeBanner() {
  const { isDemo, exitDemoMode } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissed());

  if (!isDemo || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="demo-banner"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="sticky top-0 z-40 mx-auto w-full max-w-screen-xl px-3 pt-2 md:px-6 md:pt-3"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-3 py-2 text-[12px] font-bold text-orange-900 shadow-[0_14px_32px_-22px_rgba(249,115,22,0.35)] md:gap-3 md:px-4 md:py-2.5 md:text-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
            <Play size={13} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-black tracking-tight text-orange-900">Chế độ Demo</p>
            <p className="hidden truncate text-[11px] font-medium text-orange-700/85 sm:block">
              Đang dùng dữ liệu mock · Supabase không cần thiết.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              exitDemoMode();
              navigate('/quick-login', { replace: true });
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white/85 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-orange-700 shadow-sm transition-colors hover:bg-white"
          >
            <LogIn size={12} /> Thoát
          </button>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              writeDismissed();
            }}
            aria-label="Ẩn thông báo demo"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white/60 text-orange-500 transition-colors hover:bg-white"
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

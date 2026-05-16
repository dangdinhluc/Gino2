import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap, Loader2, Play, Sparkles } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

const ACCOUNTS = {
  learner: { email: 'learner@example.test', password: 'LocalLearner123!', redirect: '/app/dashboard' },
  admin: { email: 'admin@example.test', password: 'LocalAdmin123!', redirect: '/admin' },
} as const;

type Role = keyof typeof ACCOUNTS;

export default function QuickLoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loginAs(role: Role) {
    setError(null);
    setLoading(role);
    const { email, password, redirect } = ACCOUNTS[role];
    const result = await auth.signIn(email, password);
    if (!result.ok) {
      setError(result.error ?? 'Đăng nhập thất bại.');
      setLoading(null);
      return;
    }
    navigate(redirect, { replace: true });
  }

  function handleDemo() {
    auth.enterDemoMode();
    navigate('/app/dashboard', { replace: true });
  }

  if (auth.isLoading) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#F7F1E8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C96A1B]" />
      </main>
    );
  }

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#F7F1E8] px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] shadow-sm">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-2xl font-black text-transparent">T</span>
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-[#172033]">TOKUTEI GINO</h1>
          <p className="mt-2 text-sm text-[#5F6B7C]">Chọn cách vào app</p>
        </div>

        <button
          type="button"
          onClick={handleDemo}
          className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 p-4 text-left text-white shadow-[0_18px_40px_-18px_rgba(249,115,22,0.65)] transition-all hover:shadow-[0_22px_46px_-18px_rgba(249,115,22,0.8)]"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
            <Play size={22} />
          </span>
          <div className="relative">
            <p className="flex items-center gap-2 text-base font-black">
              Vào chế độ Demo
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={10} /> Đề xuất
              </span>
            </p>
            <p className="mt-1 text-xs font-medium text-white/85">Duyệt toàn bộ app với dữ liệu mock, không cần đăng nhập.</p>
          </div>
        </button>

        <div className="relative flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#5F6B7C]">
          <span className="h-px flex-1 bg-[#E4D8C9]" /> Hoặc Supabase <span className="h-px flex-1 bg-[#E4D8C9]" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => loginAs('learner')}
            disabled={loading !== null || !auth.isSupabaseConfigured}
            className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 text-left shadow-sm transition-all hover:border-orange-200 hover:shadow-[0_12px_28px_-12px_rgba(201,106,27,0.4)] disabled:opacity-60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 text-[#C96A1B]">
              {loading === 'learner' ? <Loader2 size={22} className="animate-spin" /> : <GraduationCap size={22} />}
            </span>
            <div>
              <p className="text-base font-black text-[#172033]">Đăng nhập Học viên</p>
              <p className="mt-0.5 text-xs text-[#5F6B7C]">learner@example.test → /app/dashboard</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => loginAs('admin')}
            disabled={loading !== null || !auth.isSupabaseConfigured}
            className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 text-left shadow-sm transition-all hover:border-[#315C73]/40 hover:shadow-[0_12px_28px_-12px_rgba(49,92,115,0.4)] disabled:opacity-60"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#315C73]/10 text-[#315C73]">
              {loading === 'admin' ? <Loader2 size={22} className="animate-spin" /> : <ShieldCheck size={22} />}
            </span>
            <div>
              <p className="text-base font-black text-[#172033]">Đăng nhập Admin</p>
              <p className="mt-0.5 text-xs text-[#5F6B7C]">admin@example.test → /admin</p>
            </div>
          </button>
        </div>

        {error && (
          <p className="rounded-2xl border border-[#C65B57]/30 bg-[#C65B57]/10 px-4 py-3 text-sm font-semibold text-[#8C3B38]">
            {error}
          </p>
        )}

        <p className="text-center text-[11px] text-[#5F6B7C]">
          {auth.isSupabaseConfigured
            ? 'Supabase đã cấu hình · Tài khoản seed local-only'
            : 'Supabase chưa cấu hình → Demo là lựa chọn duy nhất hiện tại.'}
        </p>
      </div>
    </main>
  );
}

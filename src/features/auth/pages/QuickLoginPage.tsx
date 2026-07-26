import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, GraduationCap, Loader2 } from 'lucide-react';
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

  if (auth.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F1E8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C96A1B]" />
      </main>
    );
  }

  // Bản demo (không cấu hình Supabase): vào học thẳng, dữ liệu lưu trên máy người dùng.
  if (!auth.isSupabaseConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] shadow-sm">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-2xl font-black text-transparent">T</span>
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#172033]">TOKUTEI GINO</h1>
            <p className="mt-2 text-sm text-[#5F6B7C]">Bản demo — không cần tài khoản, tiến độ học lưu ngay trên thiết bị của bạn.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/dashboard', { replace: true })}
            className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-orange-200 bg-[#FFFCF7] p-4 text-left shadow-sm transition-all hover:border-orange-300 hover:shadow-[0_12px_28px_-12px_rgba(201,106,27,0.4)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 text-[#C96A1B]">
              <GraduationCap size={22} />
            </span>
            <div>
              <p className="text-base font-black text-[#172033]">Vào học ngay</p>
              <p className="mt-0.5 text-xs text-[#5F6B7C]">Flashcard SRS · Khóa học · Cộng đồng</p>
            </div>
            <LogIn size={18} className="ml-auto text-[#C96A1B] transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-center text-[11px] text-[#5F6B7C]">
            Khu vực admin cần cấu hình Supabase riêng
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] shadow-sm">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-2xl font-black text-transparent">T</span>
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-[#172033]">TOKUTEI GINO</h1>
          <p className="mt-2 text-sm text-[#5F6B7C]">Chọn tài khoản để vào nhanh</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => loginAs('learner')}
            disabled={loading !== null}
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
            disabled={loading !== null}
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
          Tài khoản seed local-only · Supabase phải đang chạy
        </p>
      </div>
    </main>
  );
}

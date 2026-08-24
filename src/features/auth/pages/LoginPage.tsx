import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import { decideAuthRouteAccess, type ProtectedRouteArea } from '@/src/features/auth/lib/authRouteDecisions';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { assets } from '@/src/shared/lib/assets';

const TRUST_SIGNALS = [
  { icon: Sparkles, label: 'AI tutor + writing/speaking lab' },
  { icon: Trophy, label: 'Đề luyện thi theo từng track' },
  { icon: Target, label: '4 trục Tokutei trong 1 dashboard' },
] as const;

interface LoginPageProps {
  area: ProtectedRouteArea;
}

function getDefaultRedirect(area: ProtectedRouteArea): string {
  return area === 'admin' ? '/admin' : '/app';
}

function isSafeRedirect(area: ProtectedRouteArea, target: string): boolean {
  const prefix = area === 'admin' ? '/admin' : '/app';
  return target === prefix || target.startsWith(`${prefix}/`);
}

export default function LoginPage({ area }: LoginPageProps) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const from = location.state && typeof location.state === 'object' && 'from' in location.state ? location.state.from : null;
    return typeof from === 'string' && isSafeRedirect(area, from) ? from : getDefaultRedirect(area);
  }, [area, location.state]);

  const decision = decideAuthRouteAccess({
    area,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    staffRoleStatus: auth.staffRoleStatus,
    isSupabaseConfigured: auth.isSupabaseConfigured,
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (decision.status === 'allowed') {
      navigate(redirectTo, { replace: true });
    }
  }, [decision.status, navigate, redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await auth.signIn(email.trim(), password);

    if (!isMountedRef.current) {
      return;
    }

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Đăng nhập không thành công.');
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  if (auth.isLoading) {
    return (
      <AuthShellBackground>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex items-center gap-3 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]/95 px-5 py-3 text-sm font-bold text-[#5F6B7C] shadow-[0_24px_60px_-32px_rgba(180,138,91,0.4)] backdrop-blur"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C96A1B] opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C96A1B]" />
          </span>
          Đang kiểm tra phiên đăng nhập…
        </motion.div>
      </AuthShellBackground>
    );
  }

  if (decision.status === 'setup-required') {
    return (
      <AuthShellBackground>
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#E4D8C9] bg-[#FFFCF7]/95 p-8 shadow-[0_40px_90px_-50px_rgba(180,138,91,0.5)] backdrop-blur"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-200/40 blur-3xl" />
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E4D8C9] bg-[#F0E8DC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#315C73]">
            <Sparkles size={12} /> Supabase setup
          </span>
          <h1 className="relative mt-4 text-3xl font-black tracking-tight text-[#172033]">Cần cấu hình Supabase Cloud</h1>
          <p className="relative mt-4 text-sm leading-7 text-[#5F6B7C]">
            Kiểm tra URL Cloud và anon key trong <code className="rounded-md bg-[#F0E8DC] px-1.5 py-0.5 font-mono text-[#172033]">.env</code>, rồi restart Vite. <code className="rounded-md bg-[#F0E8DC] px-1.5 py-0.5 font-mono text-[#172033]">.env.example</code> đã có placeholder cần thiết.
          </p>
        </motion.section>
      </AuthShellBackground>
    );
  }

  if (decision.status === 'allowed') {
    return <Navigate to={redirectTo} replace />;
  }

  const isAdminArea = area === 'admin';
  const title = isAdminArea ? 'Đăng nhập Admin' : 'Đăng nhập học viên';
  const eyebrow = isAdminArea ? 'TOKUTEI GINO · Admin Console' : 'TOKUTEI GINO · Học viên';
  const subtitle = isAdminArea
    ? 'Dùng tài khoản có role admin để vào dashboard quản trị nội dung, học viên và gói học.'
    : 'Đăng nhập để mở khu vực học tập, theo dõi tiến độ và đồng bộ progress với Supabase.';

  return (
    <AuthShellBackground>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-8 md:py-16">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* Hero side */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-7"
          >
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] shadow-sm transition-transform group-hover:scale-105">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-lg font-black text-transparent">T</span>
                <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-300/40 to-amber-300/40 blur-md transition-opacity group-hover:opacity-100" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">Tokutei prep</span>
                <span className="mt-1 text-base font-black tracking-tight text-[#172033]">TOKUTEI GINO</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B] shadow-sm backdrop-blur">
              <ShieldCheck size={14} />
              {eyebrow}
            </span>

            <div className="space-y-5">
              <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#172033] sm:text-5xl xl:text-6xl">
                {isAdminArea ? (
                  <>
                    Vào{' '}
                    <span className="relative whitespace-nowrap">
                      <span className="bg-gradient-to-r from-[#315C73] via-[#4475A1] to-[#6F4AA8] bg-clip-text text-transparent">
                        Admin Console
                      </span>
                      <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 220 12" fill="none" preserveAspectRatio="none">
                        <path d="M2 8 Q 60 1, 110 6 T 218 5" stroke="#315C73" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                      </svg>
                    </span>
                    <br />
                    quản trị TOKUTEI GINO.
                  </>
                ) : (
                  <>
                    Lộ trình Tokutei rõ từ
                    <span className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 bg-clip-text text-transparent"> JFT Basic </span>
                    tới luyện phỏng vấn.
                  </>
                )}
              </h1>
              <p className="max-w-xl text-base font-medium leading-7 text-[#5F6B7C] md:text-lg">{subtitle}</p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="group flex items-center gap-3 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]/85 p-3.5 text-sm font-semibold text-[#172033] shadow-[0_20px_40px_-32px_rgba(180,138,91,0.45)] backdrop-blur transition-colors hover:border-orange-200"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 text-[#C96A1B]">
                    <Icon size={16} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            {/* Mascot float */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pointer-events-none relative hidden items-center gap-4 lg:flex"
            >
              <motion.img
                src={assets.shared.mascots.brand}
                alt=""
                aria-hidden
                className="h-32 w-32 object-contain drop-shadow-[0_18px_24px_rgba(201,106,27,0.25)]"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
              />
              <div className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]/90 p-3 shadow-sm backdrop-blur">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">Gino tip</p>
                <p className="mt-1 text-sm font-semibold text-[#172033]">{isAdminArea ? 'Admin role chỉ phát qua admin_roles.' : 'Đăng nhập để giữ nhịp học mỗi ngày.'}</p>
              </div>
            </motion.div>
          </motion.aside>

          {/* Form side */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="relative"
          >
            {/* glow ring */}
            <div className="pointer-events-none absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-orange-300/30 via-amber-200/20 to-purple-200/20 blur-2xl" />
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-300/40 blur-3xl" />
            <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-purple-200/40 blur-3xl" />

            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-[2rem] border border-[#E4D8C9] bg-[#FFFCF7]/95 p-6 shadow-[0_40px_90px_-50px_rgba(180,138,91,0.55)] backdrop-blur sm:p-8"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />

              <div className="flex items-center gap-3">
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#C96A1B] to-[#E08A3C] text-white shadow-[0_12px_28px_-12px_rgba(201,106,27,0.7)]">
                  <LogIn size={20} />
                  <span className="absolute -inset-1 rounded-2xl bg-orange-300/40 blur-lg" />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#5F6B7C]">Đăng nhập</p>
                  <h2 className="text-lg font-black tracking-tight text-[#172033]">{title}</h2>
                </div>
                <span className="ml-auto hidden items-center gap-1 rounded-full border border-[#E4D8C9] bg-[#F0E8DC] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-[#315C73] sm:inline-flex">
                  <Star size={10} fill="currentColor" /> Premium
                </span>
              </div>

              <div className="mt-7 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.18em] text-[#5F6B7C]" htmlFor={`${area}-email`}>
                    Email
                  </label>
                  <div className="group relative mt-2">
                    <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A95A3] transition-colors group-focus-within:text-[#C96A1B]" />
                    <input
                      id={`${area}-email`}
                      className="w-full rounded-2xl border border-[#E4D8C9] bg-[#FFF9F2] py-3.5 pl-11 pr-4 text-sm font-medium text-[#172033] outline-none transition-all placeholder:text-[#a89a85] focus:border-[#C96A1B] focus:bg-white focus:ring-4 focus:ring-[#C96A1B]/15"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="ban@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.18em] text-[#5F6B7C]" htmlFor={`${area}-password`}>
                    Mật khẩu
                  </label>
                  <div className="group relative mt-2">
                    <Lock size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A95A3] transition-colors group-focus-within:text-[#C96A1B]" />
                    <input
                      id={`${area}-password`}
                      className="w-full rounded-2xl border border-[#E4D8C9] bg-[#FFF9F2] py-3.5 pl-11 pr-4 text-sm font-medium text-[#172033] outline-none transition-all placeholder:text-[#a89a85] focus:border-[#C96A1B] focus:bg-white focus:ring-4 focus:ring-[#C96A1B]/15"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              {(error || auth.error) && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-2xl border border-[#C65B57]/30 bg-[#C65B57]/10 px-4 py-3 text-sm font-semibold text-[#8C3B38]"
                >
                  {error ?? auth.error}
                </motion.p>
              )}

              <button
                className="group relative mt-6 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#C96A1B] via-[#D8791F] to-[#E08A3C] px-5 py-3.5 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_22px_40px_-18px_rgba(201,106,27,0.7)] transition-all hover:shadow-[0_24px_44px_-18px_rgba(201,106,27,0.85)] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {/* shimmer */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative inline-flex items-center gap-2">
                  {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
                  {!isSubmitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </span>
              </button>

              <p className="mt-5 text-center text-xs text-[#5F6B7C]">
                {isAdminArea ? (
                  <>
                    <Link to="/forgot-password" className="inline-block px-1 py-2.5 font-black text-[#C96A1B] hover:underline">Quên mật khẩu?</Link>{' '}
                    Owner sẽ cấp lại quyền quản trị sau khi xác thực tài khoản.
                  </>
                ) : (
                  <>
                    Chưa có tài khoản? <Link to="/signup" className="inline-block px-1 py-2.5 font-black text-[#C96A1B] hover:underline">Tạo tài khoản miễn phí</Link>
                    {' · '}<Link to="/forgot-password" className="inline-block px-1 py-2.5 font-black text-[#C96A1B] hover:underline">Quên mật khẩu?</Link>
                  </>
                )}
              </p>
            </form>
          </motion.div>
        </div>
      </main>
    </AuthShellBackground>
  );
}

interface AuthShellBackgroundProps {
  children: ReactNode;
}

function AuthShellBackground({ children }: AuthShellBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F1E8] text-[#172033] selection:bg-orange-100 selection:text-orange-700">
      {/* Aurora mesh */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(201,106,27,0.18),transparent)]" />
        <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(111,74,168,0.18),transparent)]" />
        <div className="absolute -bottom-24 left-1/4 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(closest-side,rgba(49,92,115,0.18),transparent)]" />
      </div>

      {/* Floating orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-12 top-32 h-3 w-3 rounded-full bg-[#C96A1B]/60 blur-[1px]"
        animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-16 top-44 h-2.5 w-2.5 rounded-full bg-[#6F4AA8]/60 blur-[1px]"
        animate={{ y: [0, 14, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-24 left-1/3 h-2 w-2 rounded-full bg-[#315C73]/70 blur-[1px]"
        animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
      />

      {/* Subtle grain via radial dots */}
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(180,138,91,0.06)_1px,transparent_1px)] [background-size:18px_18px] opacity-60" />

      <div className="relative">{children}</div>
    </div>
  );
}

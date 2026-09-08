import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock3, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { decideAuthRouteAccess, type ProtectedRouteArea } from '@/src/features/auth/lib/authRouteDecisions';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { assets } from '@/src/shared/lib/assets';

interface LoginPageProps {
  area: ProtectedRouteArea;
}

function getDefaultRedirect(area: ProtectedRouteArea): string {
  return area === 'admin' ? '/admin' : '/app/dashboard';
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
    if (decision.status === 'allowed') navigate(redirectTo, { replace: true });
  }, [decision.status, navigate, redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await auth.signIn(email.trim(), password);

    if (!isMountedRef.current) return;

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Đăng nhập không thành công.');
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  if (auth.isLoading) {
    return <AuthShellBackground><div className="auth-v2-centered"><div className="auth-v2-status"><span className="auth-v2-status-dot" aria-hidden="true" />Đang kiểm tra phiên đăng nhập…</div></div></AuthShellBackground>;
  }

  if (decision.status === 'setup-required') {
    return (
      <AuthShellBackground>
        <div className="auth-v2-centered"><section className="auth-v2-config-card"><span className="auth-v2-config-label"><ShieldCheck size={14} /> Hệ thống cần cấu hình</span><h1>Cần cấu hình Supabase Cloud</h1><p>Kiểm tra URL Cloud và anon key trong <code>.env</code>, rồi restart Vite. <code>.env.example</code> đã có placeholder cần thiết.</p></section></div>
      </AuthShellBackground>
    );
  }

  if (decision.status === 'allowed') return <Navigate to={redirectTo} replace />;

  const isAdminArea = area === 'admin';
  const title = isAdminArea ? 'Đăng nhập Admin' : 'Đăng nhập học viên';
  const subtitle = isAdminArea
    ? 'Dùng tài khoản có quyền quản trị để quản lý nội dung, học viên và gói học.'
    : 'Đăng nhập để tiếp tục bài học, giữ tiến độ và học đúng phần đang cần.';

  return (
    <AuthShellBackground>
      <main className={`auth-v2-layout ${isAdminArea ? 'auth-v2-layout-admin' : ''}`}>
        <section className="auth-v2-story" aria-labelledby="auth-story-title">
          <Link className="auth-v2-brand" to="/" aria-label="TOKUTEI GINO trang chủ">
            <span className="auth-v2-brand-mark"><img src={assets.shared.mascots.brand} alt="" aria-hidden="true" /></span>
            <span><strong>TOKUTEI GINO</strong><small>HỌC TIẾNG NHẬT CÓ ĐÍCH</small></span>
          </Link>

          <p className="auth-v2-overline"><span aria-hidden="true" /> {isAdminArea ? 'KHU VỰC QUẢN TRỊ' : 'KHU HỌC TẬP'}</p>
          <h1 id="auth-story-title">{isAdminArea ? <>Quản lý <em>đúng nhịp.</em></> : <>Tiếp tục hành trình <em>đi Nhật.</em></>}</h1>
          <p className="auth-v2-story-copy">{isAdminArea ? 'Giữ nội dung học tập rõ ràng, cập nhật và sẵn sàng cho từng học viên.' : 'Mỗi lần quay lại, anh sẽ biết mình đã đi đến đâu và nên học gì tiếp theo.'}</p>

          <div className="auth-v2-preview" aria-label="Xem trước khu học tập">
            <div className="auth-v2-preview-header"><span>HÔM NAY</span><span className="auth-v2-preview-live"><i aria-hidden="true" /> Đang học</span></div>
            <div className="auth-v2-preview-main"><div><small>{isAdminArea ? 'BẢNG ĐIỀU KHIỂN' : 'LỘ TRÌNH CỦA BẠN'}</small><strong>{isAdminArea ? 'TOKUTEI GINO CMS' : 'Tiếng Nhật đi làm'}</strong></div><img src={isAdminArea ? assets.shared.mascots.lightbulb : assets.shared.mascots.brand} alt="" aria-hidden="true" /></div>
            <div className="auth-v2-preview-row"><span><Clock3 size={14} /> {isAdminArea ? 'Cập nhật nội dung' : '20 phút học tập'}</span><b>{isAdminArea ? 'Sẵn sàng' : '68%'}</b></div>
            <div className="auth-v2-preview-track" aria-hidden="true"><span /></div>
            <div className="auth-v2-preview-check"><Check size={14} aria-hidden="true" /> {isAdminArea ? 'Nội dung được phân quyền an toàn' : 'Tiến bộ được lưu tự động'}</div>
          </div>
        </section>

        <section className="auth-v2-card" aria-labelledby="login-title">
          <Link className="auth-v2-back" to="/">← Về trang chủ</Link>
          <div className="auth-v2-card-icon"><LogIn size={20} aria-hidden="true" /></div>
          <p className="auth-v2-card-kicker">TOKUTEI GINO / {isAdminArea ? 'ADMIN' : 'LEARNER'}</p>
          <h2 id="login-title">{title}</h2>
          <p className="auth-v2-card-intro">{subtitle}</p>

          <form className="auth-v2-form" onSubmit={handleSubmit}>
            <label htmlFor={`${area}-email`}>Email</label>
            <div className="auth-v2-input-wrap"><Mail size={17} aria-hidden="true" /><input id={`${area}-email`} value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="anh@example.com" required /></div>

            <div className="auth-v2-label-row"><label htmlFor={`${area}-password`}>Mật khẩu</label><Link to="/forgot-password">Quên mật khẩu?</Link></div>
            <div className="auth-v2-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input id={`${area}-password`} value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" required /></div>

            {(error || auth.error) && <p className="auth-v2-error" role="alert">{error ?? auth.error}</p>}

            <button className="auth-v2-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang đăng nhập…' : isAdminArea ? 'Vào Admin Console' : 'Vào khu học tập'}{!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}</button>
          </form>

          <div className="auth-v2-secure-note"><ShieldCheck size={15} aria-hidden="true" /> Phiên đăng nhập được bảo vệ an toàn</div>
          {!isAdminArea && <p className="auth-v2-signup">Chưa có tài khoản? <Link to="/signup">Tạo tài khoản miễn phí</Link></p>}
        </section>
      </main>
    </AuthShellBackground>
  );
}

function AuthShellBackground({ children }: { children: ReactNode }) {
  return (
    <div className="auth-v2-shell">
      <div className="auth-v2-shell-shape auth-v2-shell-shape-one" aria-hidden="true" />
      <div className="auth-v2-shell-shape auth-v2-shell-shape-two" aria-hidden="true" />
      <div className="auth-v2-shell-grid" aria-hidden="true" />
      <div className="auth-v2-shell-content">{children}</div>
    </div>
  );
}

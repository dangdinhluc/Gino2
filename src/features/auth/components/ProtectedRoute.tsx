import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Play, ShieldCheck } from 'lucide-react';
import { decideAuthRouteAccess, type ProtectedRouteArea } from '@/src/features/auth/lib/authRouteDecisions';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

interface ProtectedRouteProps {
  area: ProtectedRouteArea;
  children: ReactNode;
}

function AuthShell({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#F7F1E8] px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#E4D8C9] bg-[#FFFCF7] p-8 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.35)]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E4D8C9] bg-[#F0E8DC] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#315C73]">
          <ShieldCheck size={12} /> Supabase Auth
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#172033]">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-[#5F6B7C]">{body}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </main>
  );
}

export function ProtectedRoute({ area, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isLoading, isSupabaseConfigured, isDemo, enterDemoMode } = useAuth();

  if (isLoading) {
    return <AuthShell title="Đang kiểm tra phiên đăng nhập" body="Em đang xác thực session Supabase trước khi mở khu vực học/admin." />;
  }

  const decision = decideAuthRouteAccess({ area, isAuthenticated, isAdmin, isSupabaseConfigured, isDemo });

  if (decision.status === 'setup-required') {
    return (
      <AuthShell
        title="Chưa cấu hình Supabase"
        body="Anh có thể vào chế độ Demo để duyệt toàn bộ app với dữ liệu mock, hoặc cấu hình Supabase trong .env nếu muốn dùng auth thật."
        action={
          area === 'learner' ? (
            <button
              type="button"
              onClick={enterDemoMode}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02]"
            >
              <Play size={16} /> Vào chế độ Demo
            </button>
          ) : null
        }
      />
    );
  }

  if (decision.status === 'redirect') {
    return <Navigate to={decision.to} replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  }

  if (decision.status === 'denied') {
    return <AuthShell title="Không có quyền admin" body="Tài khoản hiện tại đã đăng nhập nhưng chưa có role admin trong bảng admin_roles." />;
  }

  return <>{children}</>;
}

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';
import { decideAuthRouteAccess, type ProtectedRouteArea } from '@/src/features/auth/lib/authRouteDecisions';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

interface ProtectedRouteProps {
  area: ProtectedRouteArea;
  children: ReactNode;
}

function AuthShell({ title, body }: { title: string; body: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-6 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#E4D8C9] bg-[#FFFCF7] p-8 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.35)]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E4D8C9] bg-[#F0E8DC] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#315C73]">
          <ShieldCheck size={12} /> Supabase Auth
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#172033]">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-[#5F6B7C]">{body}</p>
      </div>
    </main>
  );
}

export function ProtectedRoute({ area, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isLoading, isSupabaseConfigured } = useAuth();

  if (isLoading) {
    return <AuthShell title="Đang kiểm tra phiên đăng nhập" body="Em đang xác thực session Supabase trước khi mở khu vực học/admin." />;
  }

  const decision = decideAuthRouteAccess({ area, isAuthenticated, isAdmin, isSupabaseConfigured });

  if (decision.status === 'setup-required') {
    return (
      <AuthShell
        title="Cần cấu hình Supabase Cloud"
        body="Copy URL Cloud và anon key vào VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, rồi restart Vite để kiểm tra auth gate."
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

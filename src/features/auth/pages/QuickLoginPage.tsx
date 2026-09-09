import { Link, Navigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { assets } from '@/src/shared/lib/assets';

export default function QuickLoginPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4fc] text-sm font-bold text-[#6f6880]">Đang kiểm tra phiên đăng nhập…</main>;
  }

  if (auth.isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  if (!auth.isSupabaseConfigured) {
    return <main className="grid min-h-screen place-items-center bg-[#f7f4fc] px-4"><section className="max-w-md rounded-3xl border border-[#e5dcf2] bg-[#fffcff] p-7 text-center shadow-sm"><h1 className="text-2xl font-black text-[#211b35]">Cần cấu hình Supabase Cloud</h1><p className="mt-3 text-sm leading-6 text-[#6f6880]">Ứng dụng production không mở dữ liệu local khi Cloud chưa sẵn sàng.</p></section></main>;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#eee7ff_0%,#f7f4fc_38%,#f7f4fc_100%)] px-4 py-8">
      <section className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#d6c8ea] bg-white p-1.5 shadow-[0_8px_22px_rgba(111,69,216,.12)]"><img src={assets.shared.mascots.brand} alt="TOKUTEI GINO" className="h-full w-full object-contain" /></div>
          <h1 className="mt-4 font-[var(--font-heading)] text-2xl font-black tracking-tight text-[#211b35]">TOKUTEI GINO</h1>
          <p className="mt-2 text-sm text-[#6f6880]">Chọn khu vực bạn muốn đăng nhập</p>
        </div>
        <div className="space-y-3">
          <Link to="/login/learner" className="group flex min-h-[76px] w-full items-center gap-4 rounded-[20px] border border-[#e5dcf2] bg-[#fffcff] p-4 text-left shadow-[0_4px_16px_rgba(73,48,126,.05)] transition hover:-translate-y-0.5 hover:border-[#cfc0f1] hover:shadow-[0_8px_24px_rgba(111,69,216,.1)]"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee7ff] text-[#6f45d8]"><GraduationCap size={22} /></span><span><strong className="block text-base text-[#211b35]">Đăng nhập Học viên</strong><small className="text-xs text-[#6f6880]">Học, ôn tập và theo dõi tiến độ</small></span></Link>
          <Link to="/login/admin" className="group flex min-h-[76px] w-full items-center gap-4 rounded-[20px] border border-[#e5dcf2] bg-[#fffcff] p-4 text-left shadow-[0_4px_16px_rgba(73,48,126,.05)] transition hover:-translate-y-0.5 hover:border-[#315C73]/40 hover:shadow-md"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#315C73]/10 text-[#315C73]"><ShieldCheck size={22} /></span><span><strong className="block text-base text-[#211b35]">Đăng nhập Admin</strong><small className="text-xs text-[#6f6880]">CMS, học viên và vận hành</small></span></Link>
        </div>
        <p className="text-center text-[11px] text-[#6f6880]"><Link to="/signup" className="inline-flex min-h-11 items-center px-2 font-bold text-[#6f45d8]">Tạo tài khoản học viên miễn phí</Link></p>
      </section>
    </main>
  );
}

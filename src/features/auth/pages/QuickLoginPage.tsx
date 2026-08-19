import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

export default function QuickLoginPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#F7F1E8] text-sm font-bold text-[#5F6B7C]">Đang kiểm tra phiên đăng nhập…</main>;
  }

  if (!auth.isSupabaseConfigured) {
    return <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4"><section className="max-w-md rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-7 text-center shadow-sm"><h1 className="text-2xl font-black text-[#172033]">Cần cấu hình Supabase Cloud</h1><p className="mt-3 text-sm leading-6 text-[#5F6B7C]">Ứng dụng production không mở dữ liệu local khi Cloud chưa sẵn sàng.</p></section></main>;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4">
      <section className="w-full max-w-md space-y-6">
        <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] text-2xl font-black text-orange-500">T</div><h1 className="mt-4 text-2xl font-black tracking-tight text-[#172033]">TOKUTEI GINO</h1><p className="mt-2 text-sm text-[#5F6B7C]">Đăng nhập tài khoản Supabase Cloud</p></div>
        <div className="space-y-3">
          <Link to="/login/learner" className="group flex w-full items-center gap-4 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 text-left shadow-sm transition hover:border-orange-200 hover:shadow-md"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#C96A1B]"><GraduationCap size={22} /></span><span><strong className="block text-base text-[#172033]">Đăng nhập Học viên</strong><small className="text-xs text-[#5F6B7C]">Học, ôn tập và theo dõi tiến độ</small></span></Link>
          <Link to="/login/admin" className="group flex w-full items-center gap-4 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 text-left shadow-sm transition hover:border-[#315C73]/40 hover:shadow-md"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#315C73]/10 text-[#315C73]"><ShieldCheck size={22} /></span><span><strong className="block text-base text-[#172033]">Đăng nhập Admin</strong><small className="text-xs text-[#5F6B7C]">CMS, học viên và vận hành</small></span></Link>
        </div>
        <p className="text-center text-[11px] text-[#5F6B7C]"><Link to="/signup" className="inline-block px-2 py-2.5 font-bold text-[#C96A1B]">Tạo tài khoản học viên miễn phí</Link></p>
      </section>
    </main>
  );
}

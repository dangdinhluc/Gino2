import { Link } from 'react-router-dom';
import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Sparkles, Flame, BookOpen } from 'lucide-react';

export default function Profile() {
  const menuItems = [
    { icon: User, label: 'Thông tin cá nhân', tone: 'blue', path: '/app/profile' },
    { icon: Bell, label: 'Thông báo học tập', tone: 'orange', path: '/app/settings' },
    { icon: Shield, label: 'Bảo mật tài khoản', tone: 'green', path: '/privacy' },
    { icon: HelpCircle, label: 'Trung tâm trợ giúp', tone: 'purple', path: '/terms' },
    { icon: Settings, label: 'Cài đặt ứng dụng', tone: 'gray', path: '/app/settings' },
  ] as const;

  const toneClasses = {
    blue: 'bg-blue-50 text-blue-500',
    orange: 'bg-orange-50 text-orange-500',
    green: 'bg-emerald-50 text-emerald-500',
    purple: 'bg-violet-50 text-violet-500',
    gray: 'bg-slate-100 text-slate-500',
  } as const;

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4 md:gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-[1.75rem] bg-gradient-to-tr from-orange-400 to-orange-600 p-1 shadow-xl shadow-orange-200 md:h-24 md:w-24 md:rounded-[2rem]">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100"
                  alt="Avatar"
                  className="h-full w-full rounded-[1.45rem] border-4 border-white object-cover md:rounded-[1.7rem]"
                />
              </div>
              <Link to="/app/settings" aria-label="Mở cài đặt hồ sơ" className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-orange-500 p-2 text-white shadow-sm transition-transform hover:scale-110">
                <Settings size={14} />
              </Link>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px] md:tracking-[0.2em]">
                <Sparkles size={14} />
                Tokutei Profile
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Đình Lực</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">tokutei.mock@example.com</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-[#e6ddd1] bg-[#fffaf3]/92 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.24)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">Ngày học</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">32</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100/70 bg-blue-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-400 md:text-[10px] md:tracking-[0.18em]">Checklist</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">48</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100/70 bg-emerald-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 md:text-[10px] md:tracking-[0.18em]">Cấp độ</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">Lvl 12</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <Flame size={14} />
              Nhịp học hiện tại
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-orange-50 px-4 py-3">
                <div className="text-sm font-black text-gray-800">32 ngày học liên tiếp</div>
                <p className="mt-1 text-xs font-medium text-gray-500">Tiếp tục giữ streak để mở thêm thử thách và bộ đề mới.</p>
              </div>
              <div className="rounded-2xl bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-black text-gray-800">
                  <BookOpen size={16} className="text-blue-500" />
                  Hồ sơ học đang hoạt động ổn định
                </div>
                <p className="mt-1 text-xs font-medium text-gray-500">Nhắc học, mock interview và dữ liệu ôn tập đang đi cùng một track Tokutei.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm shadow-orange-50">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex w-full items-center justify-between border-b border-gray-100 p-4 transition-colors hover:bg-orange-50/40 last:border-0 md:p-5"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl p-3 ${toneClasses[item.tone]}`}>
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-gray-800">{item.label}</span>
                  <p className="mt-1 text-xs font-medium text-gray-400">Chỉnh từng mục ngay trong hồ sơ học tập.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </section>

      <Link to="/" className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-red-100 p-4 font-bold text-red-500 transition-colors hover:bg-red-50">
        <LogOut size={20} />
        Đăng xuất
      </Link>
    </div>
  );
}

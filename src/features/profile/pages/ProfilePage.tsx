import { Link } from 'react-router-dom';
import { User, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Sparkles, Flame, BookOpen } from 'lucide-react';

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

export default function Profile() {
  const menuItems = [
    { icon: User, label: 'Thông tin cá nhân', path: '/app/profile' },
    { icon: Bell, label: 'Thông báo học tập', path: '/app/settings' },
    { icon: Shield, label: 'Bảo mật tài khoản', path: '/privacy' },
    { icon: HelpCircle, label: 'Trung tâm trợ giúp', path: '/terms' },
    { icon: Settings, label: 'Cài đặt ứng dụng', path: '/app/settings' },
  ] as const;

  const stats = [
    { label: 'Ngày học', value: '32' },
    { label: 'Checklist', value: '48' },
    { label: 'Cấp độ', value: 'Lvl 12' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-16">
      <section className={panelClass}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 font-[var(--font-heading)] text-2xl font-bold text-orange-700 md:h-24 md:w-24">ĐL</div>
              <Link to="/app/settings" aria-label="Mở cài đặt hồ sơ" className={`absolute -bottom-1 -right-1 rounded-lg border border-[#e8dccb] bg-[#fffdf8] p-2 text-orange-700 transition-colors hover:bg-[#f6efe6] ${focusRing}`}>
                <Settings size={14} />
              </Link>
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
                <Sparkles size={14} /> Tokutei Profile
              </div>
              <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Đình Lực</h1>
              <p className="text-sm text-[#7b8796]">tokutei.mock@example.com</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 md:min-w-[5.5rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">{stat.label}</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-xl font-bold leading-none text-[#172033] md:text-2xl">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={panelClass}>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
            <Flame size={14} /> Nhịp học hiện tại
          </div>
          <div className="mt-4 space-y-2.5">
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3">
              <div className="font-bold text-[#172033]">32 ngày học liên tiếp</div>
              <p className="mt-1 text-xs text-[#7b8796]">Tiếp tục giữ streak để mở thêm thử thách và bộ đề mới.</p>
            </div>
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3">
              <div className="flex items-center gap-2 font-bold text-[#172033]">
                <BookOpen size={16} className="text-orange-700" strokeWidth={1.8} /> Hồ sơ học đang hoạt động ổn định
              </div>
              <p className="mt-1 text-xs text-[#7b8796]">Nhắc học, mock interview và dữ liệu ôn tập đang đi cùng một track Tokutei.</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e8dccb] bg-[#fffdf8]">
          <ul className="divide-y divide-[#efe5d7]">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link to={item.path} className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-[#fffaf3] md:px-5">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                      <item.icon size={19} strokeWidth={1.8} />
                    </span>
                    <div className="text-left">
                      <span className="font-bold text-[#172033]">{item.label}</span>
                      <p className="mt-0.5 text-xs text-[#95a0af]">Chỉnh từng mục ngay trong hồ sơ học tập.</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#95a0af]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Link to="/" className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/40 p-4 font-bold text-red-600 transition-colors hover:bg-red-50 ${focusRing}`}>
        <LogOut size={20} strokeWidth={1.8} /> Đăng xuất
      </Link>
    </div>
  );
}

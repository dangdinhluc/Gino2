import { Link } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

export default function Profile() {
  const menuItems = [
    { icon: User, label: 'Thông tin cá nhân', hint: 'Cập nhật tên, email và hồ sơ học tập', path: '/app/profile', tone: 'blue' },
    { icon: Bell, label: 'Thông báo học tập', hint: 'Chọn cách nhận nhắc học mỗi ngày', path: '/app/settings', tone: 'orange' },
    { icon: Shield, label: 'Bảo mật tài khoản', hint: 'Quản lý quyền truy cập và an toàn', path: '/privacy', tone: 'green' },
    { icon: HelpCircle, label: 'Trung tâm trợ giúp', hint: 'Tìm câu trả lời nhanh khi cần', path: '/terms', tone: 'purple' },
    { icon: Settings, label: 'Cài đặt ứng dụng', hint: 'Điều chỉnh trải nghiệm Tokutei Gino', path: '/app/settings', tone: 'red' },
  ] as const;

  const stats = [
    { icon: CalendarDays, label: 'Ngày học', value: '32', note: 'liên tiếp' },
    { icon: CheckCircle2, label: 'Checklist', value: '48', note: 'đã xong' },
    { icon: Target, label: 'Cấp độ', value: '12', note: 'Cơ bản' },
  ];

  return (
    <div className="profile-page mx-auto space-y-5 pb-16">
      <section className="profile-identity-card">
        <div className="profile-identity-copy">
          <div className="profile-mascot-wrap">
            <img
              src={`${import.meta.env.BASE_URL}mascot.png`}
              alt="Meow đồng hành học tập"
              className="profile-mascot"
            />
            <span className="profile-mascot-status">12</span>
          </div>
          <div className="profile-identity-details">
            <div className="profile-kicker"><Sparkles size={14} /> Tokutei profile</div>
            <h1>Đình Lực</h1>
            <p>tokutei.mock@example.com</p>
            <span className="profile-active-pill"><span /> Đang học đều</span>
          </div>
        </div>

        <div className="profile-stats-grid" aria-label="Tổng quan hồ sơ">
          {stats.map(({ icon: Icon, label, value, note }) => (
            <div key={label} className="profile-stat">
              <span className="profile-stat-icon"><Icon size={16} strokeWidth={1.9} /></span>
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{note}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-content-grid">
        <div className="profile-rhythm-card">
          <div className="profile-section-heading">
            <span className="profile-heading-icon profile-heading-icon-orange"><Flame size={18} /></span>
            <div><span>Nhịp học hiện tại</span><small>Giữ đà nhỏ mỗi ngày</small></div>
          </div>

          <div className="profile-streak-hero">
            <div className="profile-streak-number"><strong>32</strong><span>ngày liên tiếp</span></div>
            <span className="profile-streak-badge"><Zap size={14} /> Tốt lắm!</span>
            <div className="profile-streak-track"><span /></div>
            <p>Tiếp tục giữ streak để mở thêm thử thách và bộ đề mới.</p>
          </div>

          <div className="profile-mini-status-list">
            <div className="profile-mini-status">
              <span className="profile-mini-icon profile-mini-icon-green"><BookOpen size={16} /></span>
              <div><strong>Hồ sơ học ổn định</strong><small>Nhắc học và ôn tập đang đi cùng một track</small></div>
              <CheckCircle2 size={17} className="profile-mini-check" />
            </div>
            <div className="profile-mini-status">
              <span className="profile-mini-icon profile-mini-icon-blue"><Target size={16} /></span>
              <div><strong>Đang theo Tokutei</strong><small>48 mục checklist đã sẵn sàng cho anh</small></div>
              <ChevronRight size={17} className="profile-mini-arrow" />
            </div>
          </div>
        </div>

        <div className="profile-menu-card">
          <div className="profile-menu-heading"><div><h2>Trung tâm tài khoản</h2><p>Mọi thiết lập học tập ở một chỗ.</p></div><Sparkles size={19} /></div>
          <ul>
            {menuItems.map(({ icon: Icon, label, hint, path, tone }) => (
              <li key={label}>
                <Link to={path} className={`profile-menu-link profile-menu-link-${tone} ${focusRing}`}>
                  <span className="profile-menu-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="profile-menu-copy"><strong>{label}</strong><small>{hint}</small></span>
                  <ChevronRight size={18} className="profile-menu-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Link to="/" className={`profile-logout-button ${focusRing}`}>
        <LogOut size={18} strokeWidth={1.8} /> Đăng xuất
      </Link>
    </div>
  );
}

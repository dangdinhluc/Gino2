import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Flame,
  Home,
  LayoutGrid,
  Menu,
  MessageSquareText,
  Route,
  RotateCcw,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { dashboardTasks } from '@/src/data/dashboardMock';
import { XP_PER_LEVEL } from '@/src/features/dashboard/mock/gamifiedDashboardMock';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { xpForRating } from '@/src/features/review/lib/srs';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

const assetPath = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const sakuraPetals = [
  ['4%', 12, '-2s', '16s'],
  ['15%', 9, '-9s', '19s'],
  ['27%', 14, '-5s', '15s'],
  ['39%', 10, '-12s', '20s'],
  ['51%', 13, '-3s', '17s'],
  ['64%', 9, '-11s', '21s'],
  ['76%', 15, '-6s', '18s'],
  ['89%', 11, '-14s', '22s'],
] as const;

const menuItems = [
  { label: 'Trang chủ', hint: 'Tổng quan học tập', path: '/app/dashboard', icon: Home },
  { label: 'Lộ trình Tokutei', hint: 'N5 đến JFT-Basic', path: '/app/roadmap', icon: Route },
  { label: 'Khóa học', hint: 'Các bài đang học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', hint: 'Từ vựng đến hạn', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', hint: 'Mock test & phỏng vấn', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Coach AI', hint: 'Luyện nói cùng Meow', path: '/app/ai-chat', icon: MessageSquareText },
  { label: 'Thống kê', hint: 'Tiến độ và thành tích', path: '/app/stats', icon: BarChart3 },
];

const bottomItems = [
  { label: 'Trang chủ', path: '/app/dashboard', icon: Home },
  { label: 'Khóa học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Cá nhân', path: '/app/profile', icon: UserRound },
];

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const reviewStates = useReviewStore((state) => state.states);
  const reviewLog = useReviewStore((state) => state.log);
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);

  const dueCount = useMemo(() => collectDueCards(reviewStates, Date.now()).length, [reviewStates]);
  const reviewedToday = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return reviewLog.filter((entry) => entry.at >= dayStart).length;
  }, [reviewLog]);
  const dailyXp = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return reviewLog.filter((entry) => entry.at >= dayStart).reduce((total, entry) => total + xpForRating(entry.rating), 0);
  }, [reviewLog]);

  const totalXp = weeklyXp;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const levelProgress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
  const dailyGoal = 30;
  const dailyGoalProgress = Math.min(100, Math.round((dailyXp / dailyGoal) * 100));

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <Link to="/app/dashboard" className="dashboard-brand" aria-label="TOKUTEI GINO - Trang chủ">
          <img src={assetPath('meow-mascot.png')} alt="Meow" />
          <span>
            <strong>TOKUTEI GINO</strong>
            <small>TIẾNG NHẬT ĐI LÀM</small>
          </span>
        </Link>

        <nav className="dashboard-desktop-nav" aria-label="Điều hướng chính">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return <NavLink key={item.path} to={item.path}>{() => <><Icon size={17} /><span>{item.label}</span></>}</NavLink>;
          })}
        </nav>

        <div className="dashboard-top-actions">
          <span className="dashboard-counter"><Flame size={17} /><strong>{streak}</strong><small>ngày</small></span>
          <span className="dashboard-counter"><Sparkles size={17} /><strong>{totalXp}</strong><small>XP</small></span>
          <button
            type="button"
            className={`dashboard-menu-button ${isMenuOpen ? 'is-open' : ''}`}
            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="dashboard-menu-panel">
            <div className="dashboard-menu-heading">
              <span>ĐIỀU HƯỚNG</span>
              <small>Chọn nơi anh muốn tiếp tục</small>
            </div>
            <nav aria-label="Menu TOKUTEI GINO">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className="dashboard-menu-link">
                    <span className="dashboard-menu-icon"><Icon size={17} /></span>
                    <span><strong>{item.label}</strong><small>{item.hint}</small></span>
                    <ChevronRight size={15} />
                  </Link>
                );
              })}
            </nav>
            <Link to="/app/settings" onClick={() => setIsMenuOpen(false)} className="dashboard-menu-settings"><Settings size={15} /> Cài đặt</Link>
          </div>
        )}
      </header>

      <main className="dashboard-main">
        <section
          className="dashboard-hero"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(255, 250, 246, .12), rgba(255, 250, 246, .76)), url("${assetPath('english-hero-bg.jpg')}")` }}
        >
          <div className="dashboard-sakura-layer" aria-hidden="true">
            {sakuraPetals.map(([left, size, delay, duration], index) => (
              <span
                className="dashboard-sakura-petal"
                key={`${left}-${index}`}
                style={{ left, width: size, height: size, animationDelay: delay, animationDuration: duration }}
              />
            ))}
          </div>
          <div className="dashboard-hero-copy">
            <h1>Chào mừng<br /><em>trở lại, anh.</em></h1>
            <p>Nhiệm vụ Tokutei hôm nay đang chờ. Hành trình chinh phục tiếng Nhật vẫn tiếp tục.</p>
            <div className="dashboard-hero-chips">
              <span><Flame size={15} /> Chuỗi {streak} ngày</span>
              <span><Zap size={15} /> {totalXp} điểm XP</span>
              <span><span className="dashboard-sprout">🌱</span> Cấp {level}</span>
            </div>
          </div>
          <div className="dashboard-mascot-wrap">
            <div className="dashboard-system-note">【 HỆ THỐNG 】<br /><span className="dashboard-system-copy">Kí Chủ, trạng thái học tập đã sẵn sàng. Nhiệm vụ vẫn chờ đây.</span> ⏳</div>
            <img className="dashboard-mascot" src={assetPath('meow-sleeping.png')} alt="Meow đang nghỉ" />
            <span className="dashboard-zzz">Zzz</span>
          </div>
        </section>

        <section className="dashboard-lower-content">
          <section className="dashboard-welcome-card">
            <div className="dashboard-welcome-topline"><span><Sparkles size={14} /> HÔM NAY CÙNG MEOW</span><Link to="/app/profile">Chia sẻ <ChevronRight size={14} /></Link></div>
            <h2>Chào mừng trở lại, Lực</h2>
            <p>Chăm chỉ học tập để nhận thêm nhiều phần quà Tokutei nhé.</p>
          </section>

          <section className="dashboard-progress-cards" aria-label="Tiến độ hôm nay">
            <article className="dashboard-progress-card dashboard-streak-card">
              <div className="dashboard-progress-card-head"><span className="dashboard-progress-icon"><Flame size={22} /></span><span className="dashboard-progress-label">CHUỖI STREAK</span><span className="dashboard-progress-badge">Kỷ lục {Math.max(1, streak)}</span></div>
              <div className="dashboard-progress-value"><strong>{streak}</strong><span>ngày</span></div>
              <div className="dashboard-progress-scale"><span>0</span><i><b style={{ width: `${Math.min(100, Math.max(8, streak * 20))}%` }} /></i><span>5</span></div>
              <Link to="/app/review" className="dashboard-progress-action dashboard-progress-action-purple"><CalendarDays size={16} /> Điểm danh ngay</Link>
            </article>

            <article className="dashboard-progress-card dashboard-xp-card">
              <div className="dashboard-progress-card-head"><span className="dashboard-progress-icon"><Zap size={22} /></span><span className="dashboard-progress-label">ĐIỂM XP</span><span className="dashboard-progress-badge">Cấp độ {level}</span></div>
              <div className="dashboard-xp-value"><span className="dashboard-xp-ring"><b>{levelProgress}%</b></span><span><strong>{totalXp}</strong><small>XP · {xpIntoLevel}/{XP_PER_LEVEL}</small></span></div>
            </article>

            <article className="dashboard-progress-card dashboard-goal-card">
              <div className="dashboard-progress-card-head"><span className="dashboard-progress-icon"><CheckCircle2 size={22} /></span><span className="dashboard-progress-label">MỤC TIÊU HÔM NAY</span></div>
              <div className="dashboard-goal-row"><span><strong>{dailyXp}</strong> / {dailyGoal} XP</span><b>{dailyGoalProgress}%</b></div>
              <div className="dashboard-goal-track"><i style={{ width: `${dailyGoalProgress}%` }} /></div>
              <div className="dashboard-goal-row"><span><strong>{reviewedToday}</strong> lượt ôn hôm nay</span><b>{dueCount} đến hạn</b></div>
              <div className="dashboard-goal-track is-soft"><i style={{ width: `${Math.min(100, reviewedToday * 10)}%` }} /></div>
            </article>
          </section>

          <section className="dashboard-task-section">
            <div className="dashboard-task-heading"><div><span className="dashboard-section-kicker">GIỮ NHỊP MỖI NGÀY</span><h2>Nhiệm vụ hôm nay</h2></div><Link to="/app/courses">Xem tất cả <ChevronRight size={15} /></Link></div>
            <div className="dashboard-task-grid">
              {dashboardTasks.map((task, index) => {
                const Icon = task.icon;
                return <Link key={task.title} to={task.path} className={`dashboard-task-card ${index === 0 ? 'is-featured' : ''}`}><span className="dashboard-task-icon"><Icon size={19} /></span><span className="dashboard-task-copy"><strong>{task.title}</strong><small>{task.status} · {task.xp} XP</small></span><span className="dashboard-task-reward">+{index === 0 ? '50' : '20'} 💎</span><ChevronRight size={17} /></Link>;
              })}
            </div>
          </section>

          <section className="dashboard-explore-section" aria-labelledby="dashboard-explore-title">
            <div className="dashboard-explore-heading">
              <div>
                <span className="dashboard-section-kicker">HỌC THÊM · KẾT NỐI</span>
                <h2 id="dashboard-explore-title">Ứng dụng & cộng đồng</h2>
              </div>
              <span className="dashboard-explore-note">Đi xa hơn cùng Meow</span>
            </div>
            <div className="dashboard-shortcut-grid">
              <Link to="/app/hub" className="dashboard-shortcut-card dashboard-shortcut-app">
                <span className="dashboard-shortcut-icon"><LayoutGrid size={19} /></span>
                <span className="dashboard-shortcut-copy"><strong>Ứng dụng học tập</strong><small>Bài tập nhanh · game · thư viện</small></span>
                <ChevronRight size={17} />
              </Link>
              <Link to="/app/friends" className="dashboard-shortcut-card dashboard-shortcut-community">
                <span className="dashboard-shortcut-icon"><Users size={19} /></span>
                <span className="dashboard-shortcut-copy"><strong>Cộng đồng Tokutei</strong><small>Kết nối · chia sẻ streak · hỏi đáp</small></span>
                <ChevronRight size={17} />
              </Link>
            </div>
          </section>
        </section>
      </main>

      <nav className="dashboard-bottom-nav" aria-label="Điều hướng nhanh">
        {bottomItems.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path}>{({ isActive }) => <><Icon size={19} className={isActive ? 'is-active' : ''} /><span>{item.label}</span></>}</NavLink>; })}
      </nav>
    </div>
  );
}

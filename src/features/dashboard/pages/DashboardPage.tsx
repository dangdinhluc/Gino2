import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Flame,
  Home,
  Menu,
  MessageSquareText,
  Route,
  RotateCcw,
  Settings,
  Sparkles,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { dashboardTools } from '@/src/data/dashboardMock';
import { buildDailySession } from '@/src/features/dashboard/lib/dailySession';
import { XP_PER_LEVEL } from '@/src/features/dashboard/mock/gamifiedDashboardMock';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
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

const skillCards = [
  { label: 'Tiếng Nhật nền', detail: 'Kana, kanji, mẫu câu', value: 34, tone: 'red' },
  { label: 'Từ vựng công việc', detail: 'Nhà hàng, xây dựng, điều dưỡng', value: 18, tone: 'gold' },
  { label: 'Luyện JFT-Basic', detail: 'Nghe, đọc và phản xạ', value: 8, tone: 'blue' },
  { label: 'Phỏng vấn Tokutei', detail: 'Tự giới thiệu và trả lời ngắn', value: 0, tone: 'green' },
] as const;

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
  const dailySession = useMemo(() => buildDailySession(dueCount), [dueCount]);
  const reviewedToday = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return reviewLog.filter((entry) => entry.at >= dayStart).length;
  }, [reviewLog]);

  const totalXp = weeklyXp;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const levelProgress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
  const completedSteps = reviewedToday >= 8 ? 1 : 0;
  const activeTools = dashboardTools.slice(0, 6);

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
            return <NavLink key={item.path} to={item.path}>{({ isActive }) => <><Icon size={15} /><span>{item.label}</span></>}</NavLink>;
          })}
        </nav>

        <div className="dashboard-top-actions">
          <span className="dashboard-counter"><Flame size={16} /> {streak}</span>
          <span className="dashboard-counter"><Sparkles size={16} /> {totalXp}</span>
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
            <span className="dashboard-eyebrow">HỆ THỐNG · NHẬN DẠNG KÍ CHỦ</span>
            <h1>Chào mừng trở lại,<br /><em>anh</em></h1>
            <p>» Nhiệm vụ Tokutei hôm nay đang chờ. Hành trình chinh phục tiếng Nhật chưa kết thúc. «</p>
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

        <section className="dashboard-level-card">
          <div className="dashboard-level-title">
            <span className="dashboard-level-icon">🌱</span>
            <span><small>CẤP ĐỘ HIỆN TẠI</small><strong>Cơ bản</strong></span>
          </div>
          <div className="dashboard-level-progress">
            <div className="dashboard-level-meta"><span>{totalXp} XP tổng</span><span>Tới 🌿 Trung cấp</span></div>
            <div className="dashboard-progress-track"><span style={{ width: `${levelProgress}%` }} /></div>
            <div className="dashboard-level-foot"><small>CẦN {Math.max(0, XP_PER_LEVEL - xpIntoLevel)} XP</small><strong>{levelProgress}% hoàn thành</strong></div>
          </div>
        </section>

        <section className="dashboard-stats" aria-label="Tổng quan tiến độ">
          {[
            ['✓', 'Hoàn thành', reviewedToday],
            ['↻', 'Cần ôn', dueCount],
            ['▱', 'Bài đang mở', activeTools.length],
            ['◷', 'Ngày đã học', streak],
          ].map(([icon, label, value]) => (
            <div key={label} className="dashboard-stat"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>
          ))}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><span className="dashboard-section-kicker">LỘ TRÌNH TOKUTEI</span><h2>Tiến trình kỹ năng</h2><p>Chi tiết năng lực để anh sẵn sàng đi làm tại Nhật.</p></div><Link to="/app/stats">Xem chi tiết <ChevronRight size={15} /></Link></div>
          <div className="dashboard-skill-grid">
            {skillCards.map((skill) => <Link key={skill.label} to="/app/courses" className="dashboard-skill-card"><span className={`dashboard-skill-dot ${skill.tone}`} /><span><strong>{skill.label}</strong><small>{skill.detail}</small></span><b>{skill.value}%</b><span className="dashboard-skill-bar"><i style={{ width: `${skill.value}%` }} /></span></Link>)}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading"><div><span className="dashboard-section-kicker">PHIÊN HỌC HÔM NAY</span><h2>Tiếp tục học</h2><p>{dailySession.track}</p></div><Link to="/app/courses">Tất cả <ChevronRight size={15} /></Link></div>
          <div className="dashboard-lesson-grid">
            {dailySession.steps.map((step, index) => (
              <Link key={step.id} to={step.path} className={`dashboard-lesson-card ${index === completedSteps ? 'is-current' : ''}`}>
                <span className="dashboard-lesson-number">0{index + 1}</span><span><small>{step.minutes} phút · +{step.xp} XP</small><strong>{step.title}</strong><em>{step.detail}</em></span><ChevronRight size={17} />
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section dashboard-tools-section">
          <div className="dashboard-section-heading"><div><span className="dashboard-section-kicker">KHO BÁU CỦA MEOW</span><h2>Luyện tập nhanh</h2></div></div>
          <div className="dashboard-tools-grid">
            {activeTools.map((tool) => { const Icon = tool.icon; return <Link key={tool.path} to={tool.path} className="dashboard-tool-card"><span><Icon size={18} /></span><strong>{tool.label}</strong><small>{tool.sub}</small></Link>; })}
          </div>
        </section>
      </main>

      <nav className="dashboard-bottom-nav" aria-label="Điều hướng nhanh">
        {bottomItems.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path}>{({ isActive }) => <><Icon size={19} className={isActive ? 'is-active' : ''} /><span>{item.label}</span></>}</NavLink>; })}
      </nav>
    </div>
  );
}

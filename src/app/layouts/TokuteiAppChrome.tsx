import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  Flame,
  Home,
  Menu,
  MessageSquareText,
  RotateCcw,
  Settings,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';

const assetPath = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const menuItems = [
  { label: 'Trang chủ', hint: 'Tổng quan học tập', path: '/app/dashboard', icon: Home },
  { label: 'Khóa học', hint: 'Các bài đang học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', hint: 'Từ vựng đến hạn', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', hint: 'Mock test & phỏng vấn', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Cá nhân', hint: 'Hồ sơ và cài đặt', path: '/app/profile', icon: UserRound },
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

export function TokuteiAppChrome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);
  const reviewStates = useReviewStore((state) => state.states);
  const dueCount = collectDueCards(reviewStates, Date.now()).length;

  return (
    <>
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
          <span className="dashboard-counter"><Sparkles size={16} /> {weeklyXp}</span>
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

      <nav className="dashboard-bottom-nav" aria-label="Điều hướng nhanh">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => <><Icon size={19} className={isActive ? 'is-active' : ''} /><span>{item.label}{item.path === '/app/review' && dueCount > 0 ? ` · ${dueCount}` : ''}</span></>}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

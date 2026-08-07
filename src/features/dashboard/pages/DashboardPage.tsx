import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
  MessageSquareText,
  Route,
  RotateCcw,
  Settings,
  Smartphone,
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

const bottomItems = [
  { label: 'Trang chủ', path: '/app/dashboard', icon: Home },
  { label: 'Khóa học', path: '/app/courses', icon: BookOpen },
  { label: 'Ôn tập', path: '/app/review', icon: RotateCcw },
  { label: 'Luyện thi', path: '/app/exams', icon: ClipboardCheck },
  { label: 'Cá nhân', path: '/app/profile', icon: UserRound },
];

export default function Dashboard() {
  const [showInstallModal, setShowInstallModal] = useState(false);
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
          <span className="dashboard-counter"><Flame size={15} /><strong>{streak}</strong><small>d</small></span>
          <span className="dashboard-counter"><Sparkles size={15} /><strong>{totalXp}</strong><small>XP</small></span>
          
          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522] px-3 py-1.5 text-xs font-black text-white shadow-2xs transition-all duration-200 hover:shadow-md hover:brightness-110 active:scale-95 shrink-0"
            title="Cài ứng dụng Tokutei Gino về điện thoại"
          >
            <Smartphone size={14} />
            <span>Cài App</span>
          </button>
        </div>
      </header>

      {/* Install App Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            onClick={() => setShowInstallModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-[28px] border border-[#fde6d2] bg-white p-6 shadow-2xl text-center space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                <X size={18} />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] shadow-md">
                <img src={assetPath('meow-mascot.png')} alt="Tokutei Gino" className="h-12 w-12 object-contain" />
              </div>

              <div>
                <h3 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
                  Cài đặt Tokutei Gino App 📱
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">
                  Trải nghiệm ứng dụng mượt mà, học offline & nhận thông báo ôn từ vựng hàng ngày.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200/80 bg-orange-50/60 p-3.5 text-left text-xs font-bold text-[#c2410c] space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d83a00] text-[10px] text-white font-extrabold mt-0.5">1</span>
                  <span><strong>iOS (Safari):</strong> Bấm nút <strong>Chia sẻ (Share)</strong> ➔ chọn <strong>"Thêm vào Màn hình chính"</strong> (Add to Home Screen).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d83a00] text-[10px] text-white font-extrabold mt-0.5">2</span>
                  <span><strong>Android (Chrome):</strong> Bấm menu <strong>3 chấm (⋮)</strong> ➔ chọn <strong>"Cài đặt ứng dụng"</strong> (Install App).</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] text-sm font-extrabold text-white shadow-xs hover:shadow-md transition-all active:scale-98"
              >
                Đã hiểu 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="dashboard-hero-copy space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs backdrop-blur-xs">
              <Sparkles size={13} className="text-amber-500 fill-amber-400" /> TOKUTEI GINO • TIẾNG NHẬT ĐI LÀM
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.03em] text-[#0f172a] sm:text-4xl leading-tight">
              Chào mừng trở lại, <span className="bg-gradient-to-r from-[#d83a00] to-[#f26522] bg-clip-text text-transparent">anh Lực 🚀</span>
            </h1>
            <p className="text-xs font-bold leading-relaxed text-[#5f6b7c] sm:text-sm max-w-md">
              Nhiệm vụ Tokutei hôm nay đang chờ. Hành trình chinh phục tiếng Nhật vẫn tiếp tục!
            </p>
            <div className="dashboard-hero-chips pt-1">
              <span><Flame size={15} className="text-[#d83a00]" /> Chuỗi {streak} ngày</span>
              <span><Zap size={15} className="text-amber-500" /> {totalXp} điểm XP</span>
              <span><span className="dashboard-sprout">🌱</span> Cấp {level}</span>
            </div>
          </div>
          <div className="dashboard-mascot-wrap">
            <div className="dashboard-system-note">【 HỆ THỐNG 】<br /><span className="dashboard-system-copy">Kí Chủ, trạng thái học tập đã sẵn sàng. Nhiệm vụ vẫn chờ đây.</span> ⏳</div>
            <img className="dashboard-mascot drop-shadow-2xl" src={assetPath('sleeping-meow-mascot.png')} alt="Meow đang nghỉ" />
          </div>
        </section>

        <section className="dashboard-lower-content">

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
    </div>
  );
}

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  ClipboardCheck,
  Flame,
  Home,
  Smartphone,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';

const assetPath = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const bottomItems = [
  { label: 'Trang chủ', path: '/app/dashboard', icon: Home, imageIcon: assetPath('assets/nav-icons/nav_home.png') },
  { label: 'Khóa học', path: '/app/courses', icon: BookOpen, imageIcon: assetPath('assets/nav-icons/nav_courses.png') },
  { label: 'Ôn tập', path: '/app/practice', icon: Sparkles, imageIcon: assetPath('assets/nav-icons/nav_vocabulary.png') },
  { label: 'Luyện thi', path: '/app/exams', icon: ClipboardCheck, imageIcon: assetPath('assets/nav-icons/nav_exams.png') },
  { label: 'Cá nhân', path: '/app/profile', icon: UserRound, imageIcon: assetPath('assets/nav-icons/nav_profile.png') },
];

export function TokuteiAppChrome() {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);

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
            return <NavLink key={item.path} to={item.path}>{() => <><Icon size={17} /><span>{item.label}</span></>}</NavLink>;
          })}
        </nav>

        <div className="dashboard-top-actions">
          <span className="dashboard-counter"><Flame size={15} /><strong>{streak}</strong><small>d</small></span>
          <span className="dashboard-counter"><Sparkles size={15} /><strong>{weeklyXp}</strong><small>XP</small></span>
          
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
    </>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  FileText,
  Flame,
  Gamepad2,
  GraduationCap,
  Home,
  Layers,
  Settings,
  Sparkles,
  Target,
  User,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { assetPath } from '@/src/shared/lib/assets';

export type CourseMenuSection = 'vocabulary' | 'documents' | 'practice' | 'games' | 'exams';

// Các khu vực bên trong khóa học đang mở.
const sectionItems = [
  { id: 'vocabulary', label: 'Từ vựng', hint: 'Danh sách từ & Flashcards', imageIcon: assetPath('assets/course-workspace-icons/workspace_vocab.png') },
  { id: 'documents', label: 'Tài liệu', hint: 'Bài đọc, quy trình & hội thoại', imageIcon: assetPath('assets/course-workspace-icons/workspace_documents.png') },
  { id: 'practice', label: 'Luyện tập', hint: 'Phản xạ theo chủ đề & cấp độ', imageIcon: assetPath('assets/course-workspace-icons/workspace_practice.png') },
  { id: 'games', label: 'Game', hint: 'Flappy Vocab, Sprint & Tình huống', imageIcon: assetPath('assets/course-workspace-icons/workspace_game.png') },
  { id: 'exams', label: 'Thi thử', hint: 'Đề thi mô phỏng Tokutei chuẩn hóa', imageIcon: assetPath('assets/course-workspace-icons/workspace_exam.png') },
] satisfies Array<{ id: CourseMenuSection; label: string; hint: string; imageIcon: string }>;

// Các đường dẫn đi ra ngoài khóa học với link chuẩn xác 100%.
const navigationItems = [
  { path: '/app/dashboard', label: 'Trang chủ', hint: 'Bảng điều khiển học tập', icon: Home },
  { path: '/app/ai-chat', label: 'Trợ lý AI Chat', hint: 'Hỏi đáp từ vựng, ngữ pháp & tác phong', icon: Sparkles },
  { path: '/app/courses', label: 'Khóa học Tokutei', hint: 'Tất cả lộ trình & bài học', icon: BookOpen },
  { path: '/app/practice', label: 'Trung tâm Ôn tập SRS', hint: 'Lịch ôn thẻ nhớ tự động', icon: Target },
  { path: '/app/exams', label: 'Trung tâm Luyện thi', hint: 'Đề thi mô phỏng & đáp án', icon: GraduationCap },
  { path: '/app/stats', label: 'Thống kê & Thành tích', hint: 'Tiến độ, chuỗi ngày & huy hiệu', icon: BarChart3 },
  { path: '/app/profile', label: 'Trang cá nhân', hint: 'Hồ sơ học viên & điểm thưởng', icon: User },
  { path: '/app/settings', label: 'Cài đặt ứng dụng', hint: 'Tùy chọn hiển thị & âm thanh', icon: Settings },
];

interface CourseLearningMenuSheetProps {
  activeSection: CourseMenuSection;
  courseTitle: string;
  isOpen: boolean;
  level: number;
  progress: number;
  streak: number;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSelectSection: (section: CourseMenuSection) => void;
}

export function CourseLearningMenuSheet({
  activeSection,
  courseTitle,
  isOpen,
  level,
  progress,
  streak,
  onClose,
  onNavigate,
  onSelectSection,
}: CourseLearningMenuSheetProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex bg-black/50 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu khóa học"
            initial={{ x: -28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-[20rem] flex-col overflow-y-auto border-r border-[#fde6d2] bg-[#fffaf5] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl space-y-4"
          >
            {/* Header: Title, Close button & Progress */}
            <div className="space-y-3 border-b border-[#f5ece1] pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs">
                    <Sparkles size={11} className="text-amber-500 fill-amber-400" /> MENU KHÓA HỌC
                  </div>
                  <h2 className="truncate font-[var(--font-heading)] text-base font-black tracking-[-0.02em] text-[#0f172a]">
                    {courseTitle}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng menu"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Course Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[#717d8f]">
                  <span>Tiến độ học</span>
                  <span className="font-black text-[#d83a00]">{clampedProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee3d5] p-0.5 shadow-2xs">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#d83a00] via-[#f26522] to-[#ff8c42] transition-all duration-300"
                    style={{ width: `${clampedProgress}%` }}
                  />
                </div>
              </div>

              {/* Streak & Level Badges */}
              <div className="flex items-center gap-2 pt-1">
                <span className="flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-3 py-1 text-xs font-black text-[#c2410c] shadow-2xs">
                  <Flame size={14} className="text-orange-500 fill-orange-400" />
                  <span>{streak} ngày</span>
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/90 px-3 py-1 text-xs font-black text-[#b45309] shadow-2xs">
                  <Zap size={14} className="text-amber-500 fill-amber-400" />
                  <span>Lv.{level}</span>
                </span>
              </div>
            </div>

            {/* Section 1: In Course Tabs */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#717d8f]">
                Trong khóa học
              </span>

              <ul className="space-y-1.5">
                {sectionItems.map((item) => {
                  const isActive = item.id === activeSection;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          onClose();
                        }}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200',
                          isActive
                            ? 'border-[#fde6d2] bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] shadow-2xs ring-2 ring-[#d83a00]'
                            : 'border-[#f5ece1] bg-white hover:border-orange-200 hover:bg-[#fffcf9]'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-1 shadow-2xs transition-transform',
                            isActive ? 'bg-gradient-to-br from-[#d83a00] to-[#f26522] scale-105' : 'bg-orange-50/80 border border-orange-100'
                          )}
                        >
                          <img src={item.imageIcon} alt="" className="h-7 w-7 object-contain drop-shadow-2xs" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate font-black text-sm', isActive ? 'text-[#d83a00]' : 'text-[#0f172a]')}>
                            {item.label}
                          </span>
                          <span className="block truncate text-[11px] font-semibold text-[#717d8f]">
                            {item.hint}
                          </span>
                        </span>

                        {isActive && <ChevronRight size={16} className="shrink-0 text-[#d83a00]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Section 2: External Navigation Links */}
            <div className="space-y-2 pt-2 border-t border-[#f5ece1]">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#717d8f]">
                Điều hướng ứng dụng
              </span>

              <ul className="space-y-1.5">
                {navigationItems.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(item.path);
                        onClose();
                      }}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-[#f5ece1] bg-white p-2.5 text-left transition-all duration-200 hover:border-orange-200 hover:bg-[#fffcf9]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/50 group-hover:scale-105 transition-transform">
                        <item.icon size={17} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-black text-[#0f172a] group-hover:text-[#d83a00] transition-colors">
                          {item.label}
                        </span>
                        <span className="block truncate text-[10px] font-semibold text-[#717d8f]">
                          {item.hint}
                        </span>
                      </span>

                      <ChevronRight size={15} className="shrink-0 text-[#95a0af] group-hover:text-[#d83a00] transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
  Route,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { focusRing } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { cn } from '@/src/lib/utils';

export type CourseMenuSection = 'vocabulary' | 'documents' | 'review' | 'games' | 'exams';

// Các khu vực bên trong khóa học đang mở.
const sectionItems = [
  { id: 'vocabulary', label: 'Từ vựng', hint: 'Danh sách và flashcard', icon: Layers },
  { id: 'documents', label: 'Tài liệu', hint: 'Bài đọc, hội thoại', icon: FileText },
  { id: 'review', label: 'Ôn tập', hint: 'Chọn chế độ ôn', icon: Zap },
  { id: 'games', label: 'Game', hint: 'Học qua chơi', icon: Gamepad2 },
  { id: 'exams', label: 'Thi thử', hint: 'Đề mô phỏng', icon: GraduationCap },
] satisfies Array<{ id: CourseMenuSection; label: string; hint: string; icon: typeof Layers }>;

// Các đường đi ra ngoài khóa học, luôn có lối trở về trang chủ.
const navigationItems = [
  { path: '/app/dashboard', label: 'Trở về trang chủ', hint: 'Bảng điều khiển học tập', icon: Home },
  { path: '/app/roadmap', label: 'Lộ trình', hint: 'Hành trình N5 đến N1', icon: Route },
  { path: '/app/courses', label: 'Khóa học của tôi', hint: 'Tất cả khóa đang học', icon: BookOpen },
  { path: '/app/stats', label: 'Thống kê', hint: 'Tiến độ và huy hiệu', icon: BarChart3 },
  { path: '/app/settings', label: 'Cài đặt', hint: 'Tùy chọn ứng dụng', icon: Settings },
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex bg-gray-950/35 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu khóa học"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-[19rem] flex-col overflow-y-auto border-r border-[#e8dccb] bg-[#fffaf3] p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Menu khóa học</span>
                <h2 className="mt-1 truncate font-[var(--font-heading)] text-base font-bold tracking-[-0.02em] text-[#172033]">{courseTitle}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng menu"
                className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
              >
                <X size={18} aria-hidden="true" focusable="false" />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#efe5d7]">
                <div className="h-full rounded-full bg-orange-700" style={{ width: `${progress}%` }} />
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#5f6b7c]">{progress}%</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                <Flame size={13} aria-hidden="true" focusable="false" /> {streak} ngày
              </span>
              <span className="flex items-center gap-1 rounded-full border border-[#e8dccb] bg-[#fffdf8] px-2.5 py-1 text-xs font-bold text-[#5f6b7c]">
                <Zap size={13} className="text-orange-600" aria-hidden="true" focusable="false" /> Lv.{level}
              </span>
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">Trong khóa học</p>
            <ul className="mt-2 space-y-1">
              {sectionItems.map((item) => {
                const isActive = item.id === activeSection;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectSection(item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        isActive ? 'border-orange-700 bg-orange-700 text-white' : 'border-transparent text-[#172033] hover:bg-[#fffdf8]',
                        focusRing
                      )}
                    >
                      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isActive ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-700')}>
                        <item.icon size={17} aria-hidden="true" focusable="false" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{item.label}</span>
                        <span className={cn('mt-0.5 block truncate text-xs', isActive ? 'text-white/80' : 'text-[#7b8796]')}>{item.hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">Đi tới</p>
            <ul className="mt-2 space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={cn('flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-[#172033] transition-colors hover:bg-[#fffdf8]', focusRing)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]">
                      <item.icon size={17} aria-hidden="true" focusable="false" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{item.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-[#7b8796]">{item.hint}</span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

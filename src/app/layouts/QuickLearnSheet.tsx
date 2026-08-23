import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Gamepad2, RotateCcw, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';

interface QuickLearnSheetProps {
  isOpen: boolean;
  dueCount: number;
  currentCourse?: {
    id: string;
    title: string;
  } | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function QuickLearnSheet({ isOpen, dueCount, currentCourse, onClose, onNavigate }: QuickLearnSheetProps) {
  const suggestion = dueCount > 0
    ? {
        title: `${dueCount} từ đang chờ ôn`,
        subtitle: 'Khoảng 5 phút',
        path: '/app/practice/review',
        icon: RotateCcw,
      }
    : currentCourse
      ? {
          title: 'Tiếp tục bài đang học',
          subtitle: currentCourse.title,
          path: `/app/courses/${currentCourse.id}/learn`,
          icon: BookOpen,
        }
      : {
          title: 'Luyện nhanh 5 câu',
          subtitle: 'Ngữ pháp & Từ vựng',
          path: '/app/practice',
          icon: Zap,
        };

  const SuggestionIcon = suggestion.icon;
  const quickActions = [
    ...(currentCourse
      ? [{
          label: 'Tiếp tục bài đang học',
          hint: currentCourse.title,
          path: `/app/courses/${currentCourse.id}/learn`,
          icon: BookOpen,
          iconClass: 'bg-[#eef4ff] text-[#4f79d4]',
        }]
      : []),
    {
      label: 'Luyện nhanh 5 câu',
      hint: 'Ngữ pháp & Từ vựng',
      path: '/app/practice',
      icon: Zap,
      iconClass: 'bg-[#fff2d9] text-[#e49a13]',
    },
    {
      label: 'Thi thử nhanh',
      hint: '10 câu · 10 phút',
      path: '/app/exams',
      icon: Trophy,
      iconClass: 'bg-[#ffe9ef] text-[#df4f78]',
    },
    {
      label: 'Chơi game học tập',
      hint: 'Vừa học vừa vui',
      path: '/app/hub',
      icon: Gamepad2,
      iconClass: 'bg-[#fff0dc] text-[#b96a18]',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-[#17131f]/35 backdrop-blur-[2px] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Học nhanh"
            initial={{ y: '100%', opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] mx-auto w-full max-w-[760px] rounded-t-[28px] border border-[#e9e3f4] bg-white px-4 pb-5 pt-3 shadow-[0_-18px_50px_rgba(32,22,58,.16)]"
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-[#d9d5e5]" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f5fb] text-[#777482] transition-colors hover:bg-[#eee9f8]"
              aria-label="Đóng Học nhanh"
            >
              <X size={18} />
            </button>

            <div className="mt-4 flex items-center gap-3 pr-11">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#ded4f4] bg-[#faf8ff] p-1 shadow-[0_5px_16px_rgba(111,69,216,.12)]">
                <img src={assets.shared.mascots.brand} alt="" className="h-full w-full object-contain" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={15} className="text-[#7a50dc]" />
                  <h2 className="text-[20px] font-black tracking-[-0.03em] text-[#22232a]">Học nhanh</h2>
                </div>
                <p className="mt-1 text-[12px] font-medium text-[#7c7e88]">Để Tanuki dẫn anh đến việc phù hợp nhất nhé!</p>
              </div>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#d9cafa] bg-[linear-gradient(135deg,#fbf9ff_0%,#f2ebff_100%)] p-3 shadow-[0_6px_18px_rgba(111,69,216,.08)]">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.08em] text-[#6f45d8]">
                <Sparkles size={12} /> Gợi ý cho anh
              </p>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#e9f8ef] text-[#26a562]">
                  <SuggestionIcon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-[14px] font-extrabold text-[#292a31]">{suggestion.title}</strong>
                  <span className="mt-1 block truncate text-[11px] font-medium text-[#8a8c96]">{suggestion.subtitle}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(suggestion.path)}
                  className="h-10 shrink-0 rounded-[13px] bg-[linear-gradient(135deg,#7650e6,#5f31d5)] px-4 text-[11px] font-extrabold text-white shadow-[0_6px_16px_rgba(111,69,216,.24)] active:scale-[.98]"
                >
                  Bắt đầu
                </button>
              </div>
            </div>

            <p className="mb-2 mt-4 text-[11px] font-extrabold text-[#494a52]">Hoặc chọn nhanh</p>
            <div className="overflow-hidden rounded-[18px] border border-[#e8e8ef] bg-white">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={`${action.label}-${action.path}`}
                    type="button"
                    onClick={() => onNavigate(action.path)}
                    className={`flex min-h-[62px] w-full items-center gap-3 px-3 text-left transition-colors hover:bg-[#faf9fd] ${index ? 'border-t border-[#eeeeF3]' : ''}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${action.iconClass}`}>
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[12px] font-extrabold text-[#303138]">{action.label}</strong>
                      <small className="mt-0.5 block truncate text-[10px] font-medium text-[#9597a0]">{action.hint}</small>
                    </span>
                    <span className="text-[22px] font-light leading-none text-[#7b5bd4]">›</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate(suggestion.path)}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[15px] border border-[#d8cdf0] bg-[#fbf9ff] text-[12px] font-extrabold text-[#6f45d8] transition-colors hover:bg-[#f5f0ff]"
            >
              <span className="text-base">🎲</span> Để Tanuki quyết định
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronRight, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type {
  CourseWorkspaceSection,
  CourseWorkspaceTab,
} from '@/src/features/courses/lib/courseWorkspaceNavigation';

interface CourseLearningMenuSheetProps {
  activeSection: CourseWorkspaceSection;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: CourseWorkspaceSection) => void;
  tabs: readonly CourseWorkspaceTab[];
}

const modeDescriptions: Record<CourseWorkspaceSection, string> = {
  vocabulary: 'Học từ mới theo khóa',
  documents: 'Đọc và học tài liệu',
  practice: 'Luyện theo bài / chủ đề / nhanh',
  games: 'Học qua trò chơi',
  exams: 'Làm đề thi thử',
};

export function CourseLearningMenuSheet({
  activeSection,
  courseTitle,
  isOpen,
  onClose,
  onSelectSection,
  tabs,
}: CourseLearningMenuSheetProps) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const scrollContainer = document.querySelector<HTMLElement>('.desktop-workspace-main');
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousScrollOverflow = scrollContainer?.style.overflowY;

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollContainer) scrollContainer.style.overflowY = 'hidden';

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      if (scrollContainer) scrollContainer.style.overflowY = previousScrollOverflow ?? '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex touch-none items-end justify-center bg-[#130f24]/45 p-0 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Đổi chế độ học"
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90dvh] min-h-0 w-full max-w-[500px] flex-col overflow-hidden rounded-t-[30px] border-t border-[#ebe3fa] bg-[#fffaf5] shadow-[0_-16px_50px_rgba(25,15,50,0.2)]"
          >
            <div className="relative shrink-0 border-b border-[#f0e9e1] bg-gradient-to-b from-[#eadefc] via-[#f4efff] to-[#fffaf5] px-5 pb-4 pt-2.5">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#c8bde3]/70" />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/85 text-[#636573] shadow-xs backdrop-blur-xs transition-colors hover:bg-white hover:text-[#1e1f26]"
                aria-label="Đóng đổi chế độ học"
              >
                <X size={17} strokeWidth={2.4} />
              </button>

              <div className="pr-12">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f45d8]">Đổi chế độ học</p>
                <h2 className="mt-1 truncate text-[17px] font-black tracking-tight text-[#24212d]">{courseTitle}</h2>
                <p className="mt-1 text-[11px] font-medium text-[#777083]">Chọn nội dung bạn muốn tập trung hôm nay.</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 touch-pan-y" aria-label="Các chế độ học">
              {tabs.map((tab) => {
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      onSelectSection(tab.id);
                      onClose();
                    }}
                    className={cn(
                      'flex min-h-[68px] w-full items-center gap-3 rounded-[20px] border px-3.5 text-left transition-colors active:scale-[.99]',
                      isActive
                        ? 'border-[#d8c8f7] bg-[#f5f0ff] shadow-[0_4px_14px_rgba(111,69,216,.08)]'
                        : 'border-[#eee6dc] bg-white hover:border-[#ded6f3] hover:bg-[#fcfaff]',
                    )}
                  >
                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-1.5', isActive ? 'bg-white' : 'bg-[#f6f2ff]')}>
                      <img src={tab.imageIcon} alt="" className="h-full w-full object-contain" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className={cn('block text-[14px] font-extrabold', isActive ? 'text-[#6f45d8]' : 'text-[#292a32]')}>{tab.label}</strong>
                      <span className="mt-0.5 block truncate text-[11px] font-medium text-[#858794]">{modeDescriptions[tab.id]}</span>
                    </span>
                    {isActive ? <Check size={17} className="shrink-0 text-[#6f45d8]" /> : <ChevronRight size={18} className="shrink-0 text-[#aaa0c3]" />}
                  </button>
                );
              })}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
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

export function QuickLearnSheet({
  isOpen,
  dueCount,
  currentCourse,
  onClose,
  onNavigate,
}: QuickLearnSheetProps) {
  const courseTitle = currentCourse?.title || 'Chưa chọn khóa học';
  const coursePath = currentCourse ? `/app/courses/${currentCourse.id}/learn` : '/app/courses';

  const quickOptions = [
    {
      id: 'continue-course',
      title: 'Tiếp tục bài đang học',
      subtitle: courseTitle,
      icon: assets.courses.workspace.documents,
      path: coursePath,
    },
    {
      id: 'quick-practice',
      title: 'Luyện nhanh',
      subtitle: '5 câu hỏi ngắn',
      icon: assets.courses.workspace.practice,
      path: '/app/practice',
    },
    {
      id: 'play-game',
      title: 'Chơi game',
      subtitle: 'Học mà vui',
      icon: assets.courses.workspace.games,
      path: '/app/hub',
    },
    {
      id: 'mock-exam',
      title: 'Thi thử',
      subtitle: 'Kiểm tra trình độ',
      icon: assets.courses.workspace.exam,
      path: '/app/exams',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#130f24]/40 p-0 backdrop-blur-[3px] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Học nhanh"
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90dvh] w-full max-w-[500px] flex-col overflow-hidden rounded-t-[32px] border-t border-[#ebe3fa] bg-white shadow-[0_-16px_50px_rgba(25,15,50,0.2)]"
          >
            {/* Header với nền gradient tím pastel & mascot vẫy tay */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#eadefc] via-[#f4efff] to-white px-5 pb-3 pt-2.5">
              {/* Thanh kéo sheet */}
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-[#c8bde3]/70" />

              {/* Nút đóng tròn mờ góc trên phải */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/85 text-[#636573] shadow-xs backdrop-blur-xs transition-all hover:bg-white hover:text-[#1e1f26] active:scale-95"
                aria-label="Đóng Học nhanh"
              >
                <X size={17} strokeWidth={2.4} />
              </button>

              {/* Phần mascot và bong bóng thoại */}
              <div className="relative flex items-center justify-between pr-8 pt-1">
                {/* Speech Bubble "一緒に勉強しよう!" */}
                <div className="relative flex items-center">
                  <img
                    src={assets.shared.mascots.speechBubble}
                    alt="一緒に勉強しよう!"
                    className="h-auto w-[130px] drop-shadow-[0_4px_10px_rgba(111,69,216,0.12)] sm:w-[145px]"
                  />
                  <span className="absolute -right-3 -top-1 text-base animate-pulse">✨</span>
                </div>

                {/* Mascot Tanuki vẫy tay */}
                <div className="relative flex h-[100px] w-[100px] items-end justify-center sm:h-[110px] sm:w-[110px]">
                  <img
                    src={assets.shared.mascots.tanukiWaving}
                    alt="Tanuki"
                    className="h-full w-full object-contain drop-shadow-[0_6px_16px_rgba(111,69,216,0.16)]"
                  />
                </div>
              </div>

              {/* Tiêu đề & phụ đề */}
              <div className="mt-1 text-center">
                <h2 className="flex items-center justify-center gap-1.5 text-[22px] font-black tracking-tight text-[#1e1e24]">
                  <span className="text-[#7144e8]">⚡</span>
                  <span>Học nhanh</span>
                </h2>
                <p className="mt-0.5 text-[12.5px] font-medium text-[#646675]">
                  Tanuki sẽ giúp bạn chọn việc học phù hợp nhất!
                </p>
              </div>
            </div>

            {/* Nội dung danh sách các tác vụ */}
            <div className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 pb-6 pt-1">
              {/* Card gợi ý chính: Ôn từ vựng */}
              <div className="relative flex items-center justify-between rounded-[22px] border border-[#d8c7fa] bg-gradient-to-r from-[#f7f3ff] to-[#f0e7ff] p-3.5 shadow-[0_4px_16px_rgba(111,69,216,0.06)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                    <img
                      src={assets.shared.navigation.vocabulary}
                      alt="Ôn từ vựng"
                      className="h-full w-full object-contain drop-shadow-xs"
                    />
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-[15px] font-extrabold text-[#1c1d24]">
                      Ôn từ vựng
                    </strong>
                    <span className="mt-0.5 block text-[11.5px] font-medium text-[#6e707e]">
                      {dueCount} từ đang chờ ôn
                    </span>
                    <span className="block text-[10.5px] font-medium text-[#8d8f9c]">
                      Khoảng 5 phút
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/app/practice/review')}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#6e46e6] to-[#582dd7] px-4 text-[12px] font-extrabold text-white shadow-[0_4px_14px_rgba(110,70,230,0.35)] transition-all hover:shadow-[0_6px_18px_rgba(110,70,230,0.45)] active:scale-95"
                >
                  <span>Bắt đầu</span>
                  <span className="text-[14px]">›</span>
                </button>
              </div>

              {/* Danh sách 4 tác vụ nhanh dạng card trắng */}
              {quickOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onNavigate(option.path)}
                  className="flex w-full items-center justify-between rounded-[20px] border border-[#eae6f4] bg-white p-3 text-left shadow-[0_2px_8px_rgba(0,0,0,0.025)] transition-all hover:border-[#ded6f3] hover:bg-[#faf9fe] active:scale-[0.99]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                      <img
                        src={option.icon}
                        alt=""
                        className="h-full w-full object-contain drop-shadow-2xs"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-[14px] font-extrabold text-[#202128]">
                        {option.title}
                      </strong>
                      <span className="mt-0.5 block truncate text-[11.5px] font-medium text-[#7d7f8d]">
                        {option.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="pl-2 text-[20px] font-light leading-none text-[#989aa6]">
                    ›
                  </span>
                </button>
              ))}

              {/* Banner mẹo nhỏ từ Tanuki ở dưới cùng */}
              <div className="flex items-center gap-3 rounded-[20px] border border-[#e8dffc] bg-[#f5efff] p-3.5 shadow-2xs">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                  <img
                    src={assets.shared.mascots.lightbulb}
                    alt="Mẹo"
                    className="h-full w-full object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-black text-[#6f45d8]">
                    Mẹo nhỏ từ Tanuki:
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium italic text-[#4a4c58]">
                    &quot;Học 5 phút mỗi ngày cũng tạo nên sự khác biệt lớn!&quot;
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

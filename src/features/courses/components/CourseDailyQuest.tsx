import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, CheckCircle2, ChevronRight, Flame, Sparkles, Target, X, Zap } from 'lucide-react';
import type { LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import type { CourseWorkspaceSection } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { focusRing } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { cn } from '@/src/lib/utils';

const XP_TARGET = 50;
const NEW_WORDS_TARGET = 5;

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

interface QuestRowProps {
  icon: typeof BookOpen;
  iconClass: string;
  label: string;
  sublabel: string;
  progress: number; // 0..100
  done: boolean;
}

function QuestRow({ icon: Icon, iconClass, label, sublabel, progress, done }: QuestRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconClass)}>
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-[#172033]">{label}</span>
          <span className={cn('shrink-0 text-xs font-black', done ? 'text-emerald-600' : 'text-[#d83a00]')}>
            {done ? 'Xong' : `${progress}%`}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-[#7b8796]">{sublabel}</p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#efe5d7]">
          <motion.div
            className={cn('h-full rounded-full', done ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#d83a00] to-[#f27427]')}
            initial={{ width: 0 }}
            animate={{ width: `${clampPercent(progress)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
      {done && <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />}
    </div>
  );
}

interface CourseDailyQuestProps {
  stats: LearnerStatsSnapshot | null;
  onNavigate: (section: CourseWorkspaceSection) => void;
  /** Kiểu nút: 'banner' hiển thị dạng banner gọn; 'header' là nút nhỏ gọn đặt trên header. */
  variant?: 'banner' | 'header';
}

export function CourseDailyQuest({ stats, onNavigate, variant = 'banner' }: CourseDailyQuestProps) {
  const [isOpen, setIsOpen] = useState(false);

  const reviewedToday = stats?.reviewedToday ?? 0;
  const dueVocabulary = stats?.dueVocabulary ?? 0;
  const dailyXp = stats?.dailyXp ?? 0;
  const streak = stats?.currentStreak ?? 0;

  // Quest 1: ôn từ đến hạn. Hết từ tới hạn → gợi ý học từ mới (target 5).
  const hasDue = dueVocabulary > 0;
  const vocabTarget = hasDue ? dueVocabulary : NEW_WORDS_TARGET;
  const vocabProgress = clampPercent((reviewedToday / vocabTarget) * 100);
  const vocabDone = hasDue ? reviewedToday >= dueVocabulary : reviewedToday >= NEW_WORDS_TARGET;

  // Quest 2: XP hôm nay.
  const xpProgress = clampPercent((dailyXp / XP_TARGET) * 100);
  const xpDone = dailyXp >= XP_TARGET;

  // Quest 3: duy trì streak.
  const streakDone = streak >= 1;

  const overall = clampPercent((vocabProgress + xpProgress + (streakDone ? 100 : 0)) / 3);
  const allDone = vocabDone && xpDone && streakDone;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overall / 100) * circumference;

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  return (
    <>
      {/* Nút bấm — biến thể banner (dưới header) hoặc header (nút nhỏ trên header) */}
      {variant === 'header' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Xem nhiệm vụ hôm nay"
          title={allDone ? 'Nhiệm vụ hôm nay đã hoàn thành' : `Nhiệm vụ hôm nay ${overall}%`}
          className={cn(
            'group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-all hover:-translate-y-0.5 active:scale-95 lg:h-10 lg:w-10',
            allDone
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200/70'
              : 'border-orange-200/90 bg-gradient-to-br from-[#fff7f0] to-[#ffe5cf] text-[#d83a00] hover:border-[#d83a00] hover:bg-orange-50',
            focusRing
          )}
        >
          <Target size={17} strokeWidth={2.2} aria-hidden="true" />
          {/* Badge phần trăm tiến độ nhỏ */}
          <span
            className={cn(
              'absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-white px-0.5 text-[8px] font-black leading-none',
              allDone ? 'bg-emerald-500 text-white' : 'bg-[#d83a00] text-white'
            )}
          >
            {overall}%
          </span>
          <span className="sr-only">{allDone ? 'Nhiệm vụ hôm nay đã hoàn thành' : `Nhiệm vụ hôm nay ${overall}%`}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Xem nhiệm vụ hôm nay"
          className={cn(
            'group flex w-full items-center gap-3 rounded-[22px] border p-3.5 text-left shadow-2xs transition-all duration-200 hover:shadow-md gino-hover-lift sm:p-4',
            allDone
              ? 'border-emerald-200 bg-gradient-to-br from-[#f0fdf4] via-[#fffaf3] to-[#fff5eb]'
              : 'border-[#eedecf] bg-gradient-to-br from-[#fffaf3] via-[#fff7f0] to-[#ffeedd]'
          )}
        >
          {/* Ring tiến độ nhỏ gọn */}
          <div className="relative h-12 w-12 shrink-0">
            <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
              <circle cx="24" cy="24" r={radius} fill="none" stroke="#efe5d7" strokeWidth="5" />
              <motion.circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke={allDone ? '#10b981' : '#d83a00'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#172033]">
              {overall}%
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">Nhiệm vụ hôm nay</p>
            <h2 className="mt-0.5 truncate font-[var(--font-heading)] text-base font-black leading-tight tracking-[-0.02em] text-[#172033] sm:text-lg">
              {allDone ? 'Tuyệt vời, anh đã xong hôm nay!' : 'Chỉ vài phút nữa là xong mục tiêu'}
            </h2>
            <p className="mt-0.5 truncate text-xs text-[#7b8796]">
              Nhấn để xem chi tiết nhiệm vụ và tiến độ.
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-2.5 py-1 text-xs font-black text-[#c2410c]">
            <Flame size={14} className="fill-orange-400 text-orange-500" />
            {streak}d
          </span>
          <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-transform group-hover:translate-x-0.5" />
        </button>
      )}

      {/* Popup chi tiết nhiệm vụ hôm nay — chỉ hiện khi người dùng bấm */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Nhiệm vụ hôm nay"
              >
                <motion.section
                  initial={{ y: 24, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 16, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(event) => event.stopPropagation()}
                  className={cn(
                    'relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border bg-[#fffaf5] shadow-2xl',
                    allDone ? 'border-emerald-200' : 'border-[#fde6d2]'
                  )}
                >
                  {/* Header */}
                  <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#f5ece1] bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] px-5 py-4 sm:px-6">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs">
                        <Sparkles size={11} className="fill-amber-400 text-amber-500" /> Nhiệm vụ hôm nay
                      </span>
                      <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
                        {allDone ? 'Hoàn thành hôm nay 🎉' : 'Giữ nhịp học mỗi ngày'}
                      </h2>
                      <p className="text-xs font-semibold text-[#717d8f]">
                        {allDone ? 'Hẹn anh ngày mai nhé.' : 'Mỗi việc nhỏ đều giúp anh tiến gần hơn tới kỳ thi.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Đóng nhiệm vụ"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#5f6b7c] transition-colors hover:bg-white hover:text-[#d83a00]"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Danh sách nhiệm vụ chi tiết */}
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                    <div className="divide-y divide-[#f0e4d4] rounded-2xl border border-[#efe5d7] bg-white/70 px-3.5">
                      <QuestRow
                        icon={BookOpen}
                        iconClass="bg-sky-50 text-sky-600"
                        label={hasDue ? 'Ôn từ đến hạn' : 'Học từ mới'}
                        sublabel={hasDue ? `Còn ${dueVocabulary} từ cần ôn` : `Đã học ${reviewedToday}/${NEW_WORDS_TARGET} từ mới`}
                        progress={vocabProgress}
                        done={vocabDone}
                      />
                      <QuestRow
                        icon={Zap}
                        iconClass="bg-amber-50 text-amber-600"
                        label="Tích lũy XP hôm nay"
                        sublabel={`${dailyXp}/${XP_TARGET} XP`}
                        progress={xpProgress}
                        done={xpDone}
                      />
                      <QuestRow
                        icon={Flame}
                        iconClass="bg-orange-50 text-orange-600"
                        label="Duy trì chuỗi học"
                        sublabel={streakDone ? `Đang giữ chuỗi ${streak} ngày` : 'Học 1 phiên để bắt đầu chuỗi'}
                        progress={streakDone ? 100 : 0}
                        done={streakDone}
                      />
                    </div>

                    {!allDone && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('vocabulary');
                        }}
                        className={cn(
                          'mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-sm font-black text-white shadow-xs transition-all hover:brightness-110 active:scale-[0.98]',
                          focusRing
                        )}
                      >
                        <BookOpen size={16} /> Tiếp tục học
                      </button>
                    )}
                  </div>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

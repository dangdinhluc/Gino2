import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, Flame, Sparkles, Zap } from 'lucide-react';
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
}

export function CourseDailyQuest({ stats, onNavigate }: CourseDailyQuestProps) {
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

  return (
    <section
      aria-label="Nhiệm vụ hôm nay"
      className={cn(
        'relative overflow-hidden rounded-[22px] border p-4 shadow-2xs transition-colors sm:p-5',
        allDone ? 'border-emerald-200 bg-gradient-to-br from-[#f0fdf4] via-[#fffaf3] to-[#fff5eb]' : 'border-[#eedecf] bg-gradient-to-br from-[#fffaf3] via-[#fff7f0] to-[#ffeedd]',
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full border-[1rem] border-orange-200/30" aria-hidden="true" />

      <div className="relative flex items-center gap-4">
        {/* Ring tiến độ hôm nay */}
        <div className="relative h-14 w-14 shrink-0">
          <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
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
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-black text-[#172033]">
            {overall}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">Nhiệm vụ hôm nay</p>
            {allDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                <Sparkles size={11} /> Hoàn thành!
              </span>
            )}
          </div>
          <h2 className="mt-0.5 truncate font-[var(--font-heading)] text-lg font-black leading-tight tracking-[-0.02em] text-[#172033]">
            {allDone ? 'Tuyệt vời, anh đã xong hôm nay!' : 'Chỉ vài phút nữa là xong mục tiêu'}
          </h2>
          <p className="mt-0.5 truncate text-xs text-[#7b8796]">
            {allDone ? 'Hẹn anh ngày mai nhé.' : 'Mỗi việc nhỏ đều giúp anh tiến gần hơn tới kỳ thi.'}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-2.5 py-1 text-xs font-black text-[#c2410c]">
          <Flame size={14} className="fill-orange-400 text-orange-500" />
          {streak}d
        </span>
      </div>

      <div className="relative mt-3 divide-y divide-[#f0e4d4] rounded-2xl border border-[#efe5d7] bg-white/70 px-3.5">
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
          onClick={() => onNavigate('vocabulary')}
          className={cn(
            'relative mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-sm font-black text-white shadow-xs transition-all hover:brightness-110 active:scale-[0.98]',
            focusRing,
          )}
        >
          <BookOpen size={16} /> Tiếp tục học
        </button>
      )}
    </section>
  );
}

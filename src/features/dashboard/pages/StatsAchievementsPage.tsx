import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Flame,
  Layers,
  Lock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TOKUTEI_TOPICS, TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import { cardStrength, startOfDay, xpForRating } from '@/src/features/review/lib/srs';
import { computeRetention, reviewHeatmap } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

const DAY_MS = 86_400_000;
const DAILY_GOAL_XP = 60;
const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

interface ComputedAchievement {
  id: string;
  title: string;
  progress: number;
  icon: LucideIcon;
}

export default function StatsAchievements() {
  const log = useReviewStore((state) => state.log);
  const states = useReviewStore((state) => state.states);
  const totalReviewXp = useReviewStore((state) => state.totalReviewXp);
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);

  const now = Date.now();
  const totalXp = totalReviewXp + weeklyXp;
  const level = Math.floor(totalXp / 300) + 1;

  const xpToday = useMemo(() => {
    const dayStart = startOfDay(now);
    return log.filter((entry) => entry.at >= dayStart).reduce((sum, entry) => sum + xpForRating(entry.rating), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  const dailyProgress = Math.min(100, Math.round((xpToday / DAILY_GOAL_XP) * 100));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const heatmap = useMemo(() => reviewHeatmap(log, now, 84), [log]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retention = useMemo(() => computeRetention(log, now), [log]);

  const weeklyActivity = useMemo(() => {
    const todayStart = startOfDay(now);
    const days: { day: string; reviews: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = todayStart - i * DAY_MS;
      const reviews = log.filter((entry) => entry.at >= dayStart && entry.at < dayStart + DAY_MS).length;
      days.push({ day: WEEKDAY_LABELS[new Date(dayStart).getDay()], reviews });
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);
  const maxWeekly = Math.max(1, ...weeklyActivity.map((activity) => activity.reviews));

  const learnedCount = useMemo(
    () => TOKUTEI_VOCAB.filter((card) => {
      const state = states[card.id];
      return state && state.phase !== 'new';
    }).length,
    [states],
  );

  const topicMastery = useMemo(
    () =>
      TOKUTEI_TOPICS.map((topic) => {
        const cards = TOKUTEI_VOCAB.filter((card) => card.topicId === topic.id);
        const total = cards.reduce((sum, card) => sum + cardStrength(states[card.id]), 0);
        return { topic, value: Math.round(total / Math.max(1, cards.length)) };
      }).sort((a, b) => b.value - a.value),
    [states],
  );

  const topicsCovered = useMemo(
    () =>
      TOKUTEI_TOPICS.filter((topic) =>
        TOKUTEI_VOCAB.some((card) => {
          const state = states[card.id];
          return card.topicId === topic.id && state && state.phase !== 'new';
        }),
      ).length,
    [states],
  );

  const achievements: ComputedAchievement[] = useMemo(
    () => [
      { id: 'streak-7', title: 'Giữ nhịp 7 ngày liên tục', progress: Math.min(100, Math.round((streak / 7) * 100)), icon: Flame },
      { id: 'reviews-100', title: '100 lượt ôn thẻ nhớ', progress: Math.min(100, Math.round((log.length / 100) * 100)), icon: Trophy },
      { id: 'words-50', title: 'Học 50 từ Tokutei', progress: Math.min(100, Math.round((learnedCount / 50) * 100)), icon: BookOpen },
      { id: 'retention-90', title: 'Ghi nhớ đạt 90%', progress: retention === null ? 0 : Math.min(100, Math.round((retention / 90) * 100)), icon: Brain },
      { id: 'topics-8', title: 'Chạm đủ 8 chủ đề', progress: Math.round((topicsCovered / 8) * 100), icon: Layers },
      { id: 'xp-1000', title: 'Tích lũy 1000 XP ôn tập', progress: Math.min(100, Math.round((totalReviewXp / 1000) * 100)), icon: Sparkles },
    ],
    [learnedCount, log.length, retention, streak, topicsCovered, totalReviewXp],
  );
  const unlockedCount = achievements.filter((achievement) => achievement.progress >= 100).length;

  const highlights = [
    { label: 'Chuỗi hiện tại', value: `${streak} ngày`, icon: Flame },
    { label: 'XP tuần này', value: `+${weeklyXp} XP`, icon: Sparkles },
    { label: 'Từ đã học', value: `${learnedCount}/${TOKUTEI_VOCAB.length}`, icon: BookOpen },
  ];

  const summaryStats = [
    { label: 'Ngày', value: streak },
    { label: 'XP', value: totalXp },
    { label: 'Level', value: level },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-24">
      <section className={panelClass}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link
              to="/app/dashboard"
              className={`inline-flex items-center gap-1.5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-1.5 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}
            >
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Stats + Achievements</p>
              <h1 className="mt-1.5 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Tiến độ học của anh</h1>
              <p className="mt-2 max-w-xl text-sm text-[#5f6b7c]">
                Toàn bộ số liệu lấy từ hoạt động học thật trên máy này: streak, lượt ôn thẻ, độ ghi nhớ và huy hiệu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-center">
                <div className="font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{stat.value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#7b8796]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className={panelClass}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
            <CalendarDays size={14} /> Mục tiêu hôm nay
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <div className="font-[var(--font-heading)] text-4xl font-bold text-[#172033]">{xpToday}</div>
              <div className="mt-1 text-sm text-[#7b8796]">/{DAILY_GOAL_XP} XP từ ôn thẻ hôm nay</div>
            </div>
            <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">{dailyProgress}%</div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#efe5d7]">
            <motion.div className="h-full rounded-full bg-orange-700" initial={{ width: 0 }} whileInView={{ width: `${dailyProgress}%` }} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">
              <span>Heatmap 12 tuần</span>
              <span>{log.length} lượt ôn</span>
            </div>
            <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
              {heatmap.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} lượt`}
                  className={cn(
                    'aspect-square rounded-[4px]',
                    day.intensity === 0 && 'bg-[#f1e7d9]',
                    day.intensity === 1 && 'bg-orange-200',
                    day.intensity === 2 && 'bg-orange-300',
                    day.intensity === 3 && 'bg-orange-500',
                    day.intensity === 4 && 'bg-orange-700',
                  )}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1 text-[10px] font-bold text-[#95a0af]">
              Ít
              <span className="h-2.5 w-2.5 rounded-sm bg-[#f1e7d9]" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-200" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-300" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-700" />
              Nhiều
            </div>
          </div>
        </div>

        <div className={panelClass}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <Sparkles size={14} /> Lượt ôn 7 ngày qua
            </div>
            <div className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
              Ghi nhớ {retention === null ? '—' : `${retention}%`}
            </div>
          </div>
          <div className="mt-5 flex h-56 items-end gap-3 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
            {weeklyActivity.map((activity, index) => {
              const height = Math.max(6, Math.round((activity.reviews / maxWeekly) * 100));
              return (
                <div key={`${activity.day}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end">
                    <motion.div
                      className={cn('w-full rounded-t-lg', index === 6 ? 'bg-orange-700' : 'bg-orange-300')}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                    />
                  </div>
                  <div className={cn('text-[11px] font-bold', index === 6 ? 'text-orange-700' : 'text-[#95a0af]')}>{activity.day}</div>
                  <div className="text-[11px] text-[#95a0af]">{activity.reviews}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.42fr_1fr]">
        <aside className="space-y-3">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <div key={highlight.label} className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[#7b8796]">{highlight.label}</div>
                    <div className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">{highlight.value}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Độ chắc theo chủ đề</div>
            <div className="mt-4 space-y-3.5">
              {topicMastery.slice(0, 5).map(({ topic, value }) => (
                <div key={topic.id}>
                  <div className="mb-1.5 flex justify-between text-xs font-bold text-[#5f6b7c]">
                    <span>{topic.label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div
                      className={cn('h-full rounded-full', value >= 60 ? 'bg-orange-700' : value >= 30 ? 'bg-orange-500' : 'bg-orange-300')}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Achievements</p>
              <h2 className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Huy hiệu</h2>
            </div>
            <div className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">{unlockedCount} đã mở</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const isUnlocked = achievement.progress >= 100;
              return (
                <div
                  key={achievement.id}
                  className={cn('rounded-xl border p-4', isUnlocked ? 'border-orange-200 bg-orange-50/50' : 'border-[#e8dccb] bg-[#fffdf8]')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', isUnlocked ? 'border-orange-200 bg-white text-orange-700' : 'border-[#e8dccb] bg-white text-[#95a0af]')}>
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', isUnlocked ? 'bg-orange-100 text-orange-700' : 'bg-[#f0f2f5] text-[#95a0af]')}>
                      {isUnlocked ? <CheckCircle2 size={16} /> : <Lock size={14} />}
                    </span>
                  </div>
                  <h3 className="mt-3.5 font-bold text-[#172033]">{achievement.title}</h3>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div className="h-full rounded-full bg-orange-700" initial={{ width: 0 }} whileInView={{ width: `${achievement.progress}%` }} />
                  </div>
                  <div className="mt-1.5 text-xs font-bold text-[#95a0af]">{achievement.progress}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

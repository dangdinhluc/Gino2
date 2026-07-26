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

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      <section className="overflow-hidden rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-6 shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-2 text-sm font-black text-gray-600 transition-all hover:bg-orange-50">
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">Stats + Achievements</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">Tiến độ học của anh</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
                Toàn bộ số liệu bên dưới lấy từ hoạt động học thật của anh trên máy này: streak, lượt ôn thẻ, độ ghi nhớ và huy hiệu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 px-4 py-4 text-center">
              <Flame className="mx-auto fill-orange-500 text-orange-500" size={24} />
              <div className="mt-2 text-2xl font-black text-gray-900">{streak}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Ngày</div>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 px-4 py-4 text-center">
              <Sparkles className="mx-auto text-blue-500" size={24} />
              <div className="mt-2 text-2xl font-black text-gray-900">{totalXp}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">XP</div>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4 text-center">
              <Trophy className="mx-auto text-emerald-500" size={24} />
              <div className="mt-2 text-2xl font-black text-gray-900">{level}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Level</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
            <CalendarDays size={14} /> Mục tiêu hôm nay
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="text-5xl font-black text-gray-900">{xpToday}</div>
              <div className="mt-1 text-sm font-bold text-gray-400">/{DAILY_GOAL_XP} XP từ ôn thẻ hôm nay</div>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-black text-orange-600">{dailyProgress}%</div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#efe5d7]">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" initial={{ width: 0 }} whileInView={{ width: `${dailyProgress}%` }} />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              <span>Heatmap 12 tuần</span>
              <span>{log.length} lượt ôn</span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5 md:grid-cols-14" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
              {heatmap.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} lượt`}
                  className={cn(
                    'aspect-square rounded-md border border-white',
                    day.intensity === 0 && 'bg-[#f1e7d9]',
                    day.intensity === 1 && 'bg-orange-200',
                    day.intensity === 2 && 'bg-orange-300',
                    day.intensity === 3 && 'bg-orange-400',
                    day.intensity === 4 && 'bg-orange-500',
                  )}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1 text-[9px] font-bold text-gray-400">
              Ít
              <span className="h-2.5 w-2.5 rounded-sm bg-[#f1e7d9]" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-200" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-300" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-400" />
              <span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
              Nhiều
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
              <Sparkles size={14} /> Lượt ôn 7 ngày qua
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">
              Ghi nhớ {retention === null ? '—' : `${retention}%`}
            </div>
          </div>
          <div className="mt-5 flex h-64 items-end gap-3 rounded-[2rem] border border-blue-100 bg-blue-50/50 p-4">
            {weeklyActivity.map((activity, index) => {
              const height = Math.max(8, Math.round((activity.reviews / maxWeekly) * 100));
              return (
                <div key={`${activity.day}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end rounded-full bg-white/80 p-1">
                    <motion.div className="w-full rounded-full bg-gradient-to-t from-blue-500 to-cyan-300" initial={{ height: 0 }} whileInView={{ height: `${height}%` }} />
                  </div>
                  <div className={cn('text-[10px] font-black uppercase', index === 6 ? 'text-orange-500' : 'text-blue-500')}>{activity.day}</div>
                  <div className="text-[10px] font-bold text-gray-400">{activity.reviews}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.42fr_1fr]">
        <aside className="space-y-4">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <div key={highlight.label} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{highlight.label}</div>
                    <div className="text-xl font-black text-gray-900">{highlight.value}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Độ chắc theo chủ đề</div>
            <div className="mt-4 space-y-4">
              {topicMastery.slice(0, 5).map(({ topic, value }) => (
                <div key={topic.id}>
                  <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
                    <span>{topic.label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div
                      className={cn('h-full rounded-full', value >= 60 ? 'bg-emerald-500' : value >= 30 ? 'bg-amber-400' : 'bg-orange-400')}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Achievements</p>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Huy hiệu</h2>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">{unlockedCount} đã mở</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              const isUnlocked = achievement.progress >= 100;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cn('rounded-[2rem] border p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.16)]', isUnlocked ? 'border-orange-100 bg-orange-50/60' : 'border-[#e6ddd1] bg-[#fffdf8]')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-[1.35rem] border bg-white shadow-sm', isUnlocked ? 'border-orange-100 text-orange-500' : 'border-gray-100 text-gray-300')}>
                      <Icon size={26} />
                    </div>
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isUnlocked ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400')}>
                      {isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={16} />}
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-gray-900">{achievement.title}</h3>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" initial={{ width: 0 }} whileInView={{ width: `${achievement.progress}%` }} />
                  </div>
                  <div className="mt-2 text-xs font-bold text-gray-400">{achievement.progress}%</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

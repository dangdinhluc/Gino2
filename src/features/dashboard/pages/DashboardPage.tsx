import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Bell,
  Flame,
  GraduationCap,
  Layers,
  Rocket,
  Sparkles,
  Sprout,
  Target,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { fetchDailyLearningPlan, fetchDashboardHeroSlots, fetchLearnerDashboard, type DailyLearningPlan, type DashboardHeroSlot, type LearnerDashboardSnapshot } from '@/src/features/dashboard/repositories/learnerDashboardRepository';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { listLearnerNotifications, type LearnerNotification } from '@/src/features/notifications/repositories/notificationRepository';
import { pickRandomDashboardAnnouncement, resolveDashboardHeroAsset, selectDashboardHeroSlot } from '@/src/features/dashboard/lib/dashboardHero';
import { assets } from '@/src/shared/lib/assets';
import { SparkleField } from '@/src/shared/components/SparkleField';
import { Reveal } from '@/src/shared/components/Reveal';

const XP_PER_LEVEL = 500;
const DAILY_XP_GOAL = 60;

interface DashboardTask {
  title: string;
  status: string;
  action: string;
  icon: LucideIcon;
  path: string;
}

const sakuraPetals = [
  ['4%', 12, '-2s', '16s'],
  ['15%', 9, '-9s', '19s'],
  ['27%', 14, '-5s', '15s'],
  ['39%', 10, '-12s', '20s'],
  ['51%', 13, '-3s', '17s'],
  ['64%', 9, '-11s', '21s'],
  ['76%', 15, '-6s', '18s'],
  ['89%', 11, '-14s', '22s'],
] as const;

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<LearnerDashboardSnapshot | null>(null);
  const [stats, setStats] = useState<LearnerStatsSnapshot | null>(null);
  const [profile, setProfile] = useState<LearnerProfileSnapshot | null>(null);
  const [plan, setPlan] = useState<DailyLearningPlan | null>(null);
  const [announcement, setAnnouncement] = useState<LearnerNotification | null>(null);
  const [heroSlots, setHeroSlots] = useState<DashboardHeroSlot[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadErrors([]);
    Promise.allSettled([
      fetchLearnerDashboard(),
      fetchLearnerStats(),
      fetchLearnerProfile(),
      fetchDailyLearningPlan(),
      listLearnerNotifications().catch(() => [] as LearnerNotification[]),
      fetchDashboardHeroSlots(),
    ])
      .then(([nextDashboard, nextStats, nextProfile, nextPlan, nextNotifications, nextHeroSlots]) => {
        if (cancelled) return;
        const failures: string[] = [];
        const nextDashboardValue = settledValue(nextDashboard, failures, 'kế hoạch học tập');
        const nextStatsValue = settledValue(nextStats, failures, 'chỉ số học tập');
        const nextProfileValue = settledValue(nextProfile, failures, 'hồ sơ cá nhân');
        const nextPlanValue = settledValue(nextPlan, failures, 'nhiệm vụ hôm nay');
        const nextNotificationsValue = settledValue(nextNotifications, failures, 'thông báo');
        const nextHeroSlotsValue = settledValue(nextHeroSlots, failures, 'hình nền');
        setDashboard(nextDashboardValue);
        setStats(nextStatsValue);
        setProfile(nextProfileValue);
        setPlan(nextPlanValue);
        setAnnouncement(pickRandomDashboardAnnouncement(nextNotificationsValue ?? []));
        setHeroSlots(nextHeroSlotsValue ?? []);
        if (failures.length > 0) setLoadErrors(failures);
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const displayName = profile?.displayName || 'Học viên';
  const displayStreak = stats?.currentStreak ?? dashboard?.streakDays ?? 0;
  const displayDueCount = plan?.dueVocabulary ?? dashboard?.dueVocabulary ?? 0;
  const displayReviewedToday = stats?.reviewedToday ?? 0;
  const totalXp = stats?.totalXp ?? 0;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const levelProgress = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
  const effectiveDailyXp = stats?.dailyXp ?? 0;
  const dailyGoalProgress = Math.min(100, Math.round((effectiveDailyXp / DAILY_XP_GOAL) * 100));
  const remainingLevelXp = Math.max(0, XP_PER_LEVEL - xpIntoLevel);
  const streakMilestone = displayStreak < 7 ? 7 : displayStreak < 30 ? 30 : displayStreak < 100 ? 100 : null;
  const weeklyActivity = stats?.weeklyActivity ?? [];
  const taskItems: DashboardTask[] = [];
  if (plan?.nextLesson) taskItems.push({ title: plan.nextLesson.title, status: plan.nextLesson.courseTitle, action: 'Học bài', icon: BookOpen, path: `/app/courses/${plan.nextLesson.courseId}/learn` });
  if (displayDueCount > 0) taskItems.push({ title: `Ôn ${displayDueCount} thẻ đến hạn`, status: 'Lịch SRS hôm nay', action: 'Ôn ngay', icon: Layers, path: '/app/review/flashcards?mode=due' });
  if (plan?.weakAssessment) taskItems.push({ title: plan.weakAssessment.title, status: `Điểm gần nhất ${plan.weakAssessment.score}%`, action: 'Làm lại', icon: GraduationCap, path: `/app/exams/${plan.weakAssessment.id}/start` });
  if (taskItems.length === 0) taskItems.push({ title: 'Chọn khóa học để bắt đầu', status: `Mục tiêu ${plan?.goalMinutes ?? 20} phút hôm nay`, action: 'Xem khóa học', icon: BookOpen, path: '/app/courses' });

  const heroSlot = selectDashboardHeroSlot(heroSlots, now);
  const heroAsset = resolveDashboardHeroAsset(heroSlot?.assetKey);
  const announcementTarget = announcement?.actionUrl?.startsWith('/') ? announcement.actionUrl : '/app/notifications';

  if (isLoading) return <PageState message="Đang tải kế hoạch học tập…" />;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 pb-24 sm:px-6 md:px-8 md:py-6">
      {loadErrors.length > 0 && (
        <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
          Không tải được: {loadErrors.join(', ')} — các phần còn lại vẫn hiển thị.
        </p>
      )}

      {/* 1. Hero Section (Japanese Fuji & Sakura Background Aesthetic) */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[28px] border border-[#fde6d2] p-4 shadow-[0_10px_32px_rgba(217,74,19,0.06)] sm:p-8"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255, 252, 248, 0.45) 0%, rgba(255, 245, 235, 0.88) 100%), url("${assets.shared.backgrounds.englishHero}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Sakura Falling Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {sakuraPetals.map(([left, size, delay, duration], index) => (
            <span
              className="dashboard-sakura-petal"
              key={`${left}-${index}`}
              style={{ left, width: size, height: size, animationDelay: delay, animationDuration: duration }}
            />
          ))}
        </div>
        <SparkleField />

        <div className="relative z-10 grid gap-6 md:grid-cols-[1.25fr_0.75fr] items-center">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-white/95 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs backdrop-blur-xs">
              <Sparkles size={13} className="text-amber-500 fill-amber-400" /> TOKUTEI GINO • TIẾNG NHẬT ĐI LÀM
            </div>

            <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-tight text-[#0f172a] sm:text-4xl leading-tight">
              Chào mừng trở lại,<br className="sm:hidden" />{' '}
              <span className="inline-block whitespace-nowrap bg-gradient-to-r from-[#d83a00] via-[#f26522] to-[#ff8c42] bg-clip-text text-transparent">
                <span className="inline-flex items-center gap-1.5">
                  {displayName}
                  <Rocket aria-hidden="true" className="shrink-0 text-[#f26522]" size={28} strokeWidth={2.5} />
                </span>
              </span>
            </h1>

            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm max-w-md">
              Nhiệm vụ Tokutei hôm nay đang chờ. Hành trình chinh phục tiếng Nhật vẫn tiếp tục!
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[#c2410c] shadow-2xs">
                <Flame size={14} className="text-[#d83a00] fill-[#d83a00]" /> Chuỗi {displayStreak} ngày
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[#b45309] shadow-2xs">
                <Zap size={14} className="text-amber-500 fill-amber-400" /> {totalXp} XP
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[#059669] shadow-2xs">
                <Sprout aria-hidden="true" size={14} /> Cấp {level}
              </span>
            </div>
          </div>

          {/* Admin announcement & time-based mascot */}
          <div className="relative flex flex-col items-center justify-center text-center">
            <div className="mb-2 max-w-xs rounded-2xl border border-orange-200/80 bg-white/95 p-3 text-left shadow-md backdrop-blur-xs sm:mb-2.5 sm:p-3.5">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#d83a00]">
                <Bell aria-hidden="true" size={12} />
                <span>【 THÔNG BÁO ADMIN 】</span>
              </div>
              {announcement ? <Link to={announcementTarget} className="group mt-1 block">
                <strong className="block truncate text-xs font-black text-[#0f172a] group-hover:text-[#d83a00]">{announcement.title}</strong>
                <span className="mt-0.5 hidden line-clamp-3 text-xs font-extrabold leading-relaxed text-[#5f6b7c] sm:block">{announcement.body}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-[#d83a00] sm:mt-2">Xem thông báo <ChevronRight aria-hidden="true" size={13} /></span>
              </Link> : <Link to="/app/notifications" className="group mt-1 block">
                <strong className="block truncate text-xs font-black text-[#0f172a]">Chưa có thông báo mới</strong>
                <span className="mt-0.5 hidden text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:block">Thông báo từ quản trị viên sẽ hiển thị tại đây.</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-[#d83a00] sm:mt-2">Mở trung tâm thông báo <ChevronRight aria-hidden="true" size={13} /></span>
              </Link>}
            </div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-24 w-24 shrink-0 sm:h-44 sm:w-44"
            >
              <img
                src={heroAsset.src}
                alt={heroSlot?.altText || heroAsset.alt}
                className="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(217,74,19,0.22)]"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2. Nhiệm Vụ Hôm Nay (Daily RPG Quests) — ngay dưới hero để thấy việc cần làm trước */}
      <Reveal delay={0.04}>
      <section className="rounded-[28px] border border-[#f5ece1] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#d83a00]">
              GIỮ NHỊP MỖI NGÀY
            </span>
            <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
              Nhiệm vụ Tokutei hôm nay ⚔️
            </h2>
          </div>

          <Link
            to="/app/courses"
            className="flex items-center gap-1 text-xs font-extrabold text-[#d83a00] hover:underline"
          >
            <span>Tất cả khóa học</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {taskItems.map((task, index) => {
            const Icon = task.icon;
            return (
              <Link
                key={task.title}
                to={task.path}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[#f5ece1] bg-[#fffcf9] p-3.5 transition-all duration-200 hover:border-orange-200 hover:bg-[#fff7f0] hover:shadow-2xs gino-hover-lift"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00] border border-orange-200/60 group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-black text-sm text-[#0f172a] group-hover:text-[#d83a00] transition-colors">
                      {task.title}
                    </span>
                    <span className="block truncate text-xs font-semibold text-[#717d8f]">{task.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-black text-[#b45309]">{task.action}</span>
                  <ChevronRight size={16} className="text-[#95a0af] group-hover:text-[#d83a00] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </Reveal>

      {/* 3. 3 Stat Cards — hàng ngang trên mobile, đầy đủ trên desktop */}
      <Reveal delay={0.08}>
      <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Tiến độ hôm nay">
        {/* Card 1: Chuỗi Streak */}
        <article className="flex flex-col justify-between gap-2 overflow-hidden rounded-[20px] border border-orange-200/80 bg-gradient-to-br from-[#fffdf9] via-[#fff7ee] to-[#ffedd9] p-2.5 shadow-[0_8px_20px_rgba(217,74,19,0.07)] sm:gap-3 sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-white shadow-2xs sm:h-10 sm:w-10 sm:rounded-2xl">
              <Flame size={16} className="fill-white sm:h-5 sm:w-5" />
            </div>
            <span className="hidden rounded-full bg-white/80 border border-orange-200/60 px-2.5 py-0.5 text-[10px] font-black text-[#c2410c] sm:inline-block">
              Đang theo dõi
            </span>
          </div>

          <div className="min-w-0">
            <span className="block truncate text-[9px] font-black uppercase tracking-wider text-[#d83a00] sm:text-[10px]">CHUỖI STREAK</span>
            <div className="font-[var(--font-heading)] text-lg font-black leading-tight text-[#0f172a] sm:text-xl">
              {displayStreak}<span className="hidden text-xs font-bold text-[#717d8f] sm:inline"> ngày liên tiếp</span>
            </div>
          </div>

          <div className="hidden space-y-1 sm:block">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#717d8f]">
              <span>Chuỗi hiện tại</span>
              <span className="font-black text-[#d83a00]">{displayStreak} ngày</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee3d5] p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522]"
                style={{ width: `${Math.min(100, Math.max(10, displayStreak * 20))}%` }}
              />
            </div>
          </div>

          {displayDueCount > 0 ? (
            <Link
              to="/app/review/flashcards?mode=due"
              className="hidden items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] py-2.5 text-xs font-black text-white shadow-xs hover:brightness-110 active:scale-95 transition-all sm:flex"
            >
              <Layers size={15} />
              <span>Ôn {displayDueCount} thẻ giữ chuỗi (+10 XP)</span>
            </Link>
          ) : (
            <Link
              to="/app/courses"
              className="hidden items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] py-2.5 text-xs font-black text-white shadow-xs hover:brightness-110 active:scale-95 transition-all sm:flex"
            >
              <BookOpen size={15} />
              <span>Học bài giữ chuỗi (+25 XP)</span>
            </Link>
          )}
          <span className="block truncate text-[10px] font-black text-[#c2410c] sm:hidden">{displayDueCount > 0 ? `${displayDueCount} thẻ tới hạn` : 'Giữ lửa mỗi ngày'}</span>
        </article>

        {/* Card 2: Điểm XP */}
        <article className="flex flex-col justify-between gap-2 overflow-hidden rounded-[20px] border border-orange-200/80 bg-gradient-to-br from-[#fffdf9] via-[#fff7ee] to-[#ffedd9] p-2.5 shadow-[0_8px_20px_rgba(217,74,19,0.07)] sm:gap-3 sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-white shadow-2xs sm:h-10 sm:w-10 sm:rounded-2xl">
              <Zap size={16} className="fill-white sm:h-5 sm:w-5" />
            </div>
            <span className="hidden rounded-full bg-white/80 border border-orange-200/60 px-2.5 py-0.5 text-[10px] font-black text-[#c2410c] sm:inline-block">
              Cấp {level}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block truncate text-[9px] font-black uppercase tracking-wider text-[#d83a00] sm:text-[10px]">ĐIỂM XP TÍCH LŨY</span>
            <div className="font-[var(--font-heading)] text-lg font-black leading-tight text-[#0f172a] sm:text-xl">
              {totalXp}<span className="hidden text-xs font-bold text-[#717d8f] sm:inline"> XP</span>
            </div>
          </div>

          <div className="hidden space-y-1 sm:block">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#717d8f]">
              <span>Cấp {level} ➔ {level + 1}</span>
              <span className="font-black text-[#d83a00]">{xpIntoLevel} / {XP_PER_LEVEL} XP</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee3d5] p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          <div className="hidden items-center justify-between text-xs font-black text-[#d83a00] bg-white/70 rounded-2xl p-2.5 px-3.5 border border-orange-200/50 sm:flex">
            <span>Tiến độ cấp hiện tại</span>
            <span className="text-sm font-black">{levelProgress}%</span>
          </div>
          <span className="block truncate text-[10px] font-black text-[#c2410c] sm:hidden">Cấp {level} · {levelProgress}%</span>
        </article>

        {/* Card 3: Mục tiêu hôm nay */}
        <article className="flex flex-col justify-between gap-2 overflow-hidden rounded-[20px] border border-orange-200/80 bg-gradient-to-br from-[#fffdf9] via-[#fff7ee] to-[#ffedd9] p-2.5 shadow-[0_8px_20px_rgba(217,74,19,0.07)] sm:gap-3 sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-white shadow-2xs sm:h-10 sm:w-10 sm:rounded-2xl">
              <CheckCircle2 size={16} className="sm:h-5 sm:w-5" />
            </div>
            <span className="hidden rounded-full bg-white/80 border border-orange-200/60 px-2.5 py-0.5 text-[10px] font-black text-[#c2410c] sm:inline-block">
              {dailyGoalProgress}%
            </span>
          </div>

          <div className="min-w-0">
            <span className="block truncate text-[9px] font-black uppercase tracking-wider text-[#d83a00] sm:text-[10px]">MỤC TIÊU HÔM NAY</span>
            <div className="font-[var(--font-heading)] text-lg font-black leading-tight text-[#0f172a] sm:text-xl">
              {effectiveDailyXp}<span className="hidden text-xs font-bold text-[#717d8f] sm:inline"> / {DAILY_XP_GOAL} XP</span>
            </div>
          </div>

          <div className="hidden space-y-1 sm:block">
            <div className="flex items-center justify-between text-[11px] font-extrabold text-[#717d8f]">
              <span>Tiến độ XP hôm nay</span>
              <span className="font-black text-[#d83a00]">{dailyGoalProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee3d5] p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522]"
                style={{ width: `${dailyGoalProgress}%` }}
              />
            </div>
          </div>

          <div className="hidden items-center justify-between text-xs font-black text-[#d83a00] bg-white/70 rounded-2xl p-2.5 px-3.5 border border-orange-200/50 sm:flex">
            <span>{displayReviewedToday} hoạt động</span>
            <span className="font-extrabold">{displayDueCount} thẻ đến hạn</span>
          </div>
          <span className="block truncate text-[10px] font-black text-[#c2410c] sm:hidden">{dailyGoalProgress}% hôm nay</span>
        </article>
      </section>
      </Reveal>

      {/* 2.5. Nhịp học 7 ngày + Anticipation */}
      {weeklyActivity.length > 0 && (
      <Reveal delay={0.06}>
      <section className="rounded-[28px] border border-[#f5ece1] bg-white p-5 sm:p-6 shadow-2xs space-y-4" aria-label="Nhịp học 7 ngày qua">
        <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#b45309]">
              GIỮ LỬA MỖI NGÀY
            </span>
            <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
              Nhịp học 7 ngày qua
            </h2>
          </div>
          <span className="rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-black text-[#b45309]">
            {weeklyActivity.filter((day) => day.xp > 0).length}/7 ngày
          </span>
        </div>

        <div className="flex items-end justify-between gap-2" role="img" aria-label="Heatmap 7 ngày học gần nhất">
          {weeklyActivity.map((day) => {
            const date = new Date(`${day.date}T00:00:00`);
            const isToday = date.toDateString() === now.toDateString();
            const label = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
            const xp = day.xp;
            const cellClass = xp <= 0
              ? 'bg-[#f3ead9]'
              : xp < 10
                ? 'bg-orange-100'
                : xp < 25
                  ? 'bg-orange-200'
                  : xp < 40
                    ? 'bg-orange-300'
                    : 'bg-gradient-to-br from-[#d83a00] to-[#f26522]';
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5" title={`${day.date}: ${day.xp} XP`}>
                <span className={`h-9 w-full max-w-12 rounded-xl border ${isToday ? 'border-[#d83a00] ring-2 ring-orange-200' : 'border-[#efe3d2]'} ${cellClass}`} />
                <span className={`text-[10px] font-black ${isToday ? 'text-[#d83a00]' : 'text-[#95a0af]'}`}>{label}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-1.5 rounded-2xl bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] border border-orange-200/70 p-3.5">
          {remainingLevelXp > 0 ? (
            <p className="text-xs font-black text-[#c2410c]">
              <Zap size={13} className="mr-1 inline text-amber-500 fill-amber-400" />
              Còn {remainingLevelXp} XP nữa lên Cấp {level + 1} — {xpIntoLevel}/{XP_PER_LEVEL} XP
            </p>
          ) : (
            <p className="text-xs font-black text-[#c2410c]">
              <Sparkles size={13} className="mr-1 inline text-amber-500" />
              Đã đạt cấp tối đa hôm nay — giữ phong độ nhé!
            </p>
          )}
          {streakMilestone !== null && (
            <p className="text-xs font-bold text-[#5f6b7c]">
              🔥 Thêm {streakMilestone - displayStreak} ngày nữa đạt mốc {streakMilestone} ngày 🏅
            </p>
          )}
        </div>
      </section>
      </Reveal>
      )}

      {/* 4. Quick Access Shortcuts */}
      <Reveal delay={0.1}>
      <section className="rounded-[28px] border border-[#f5ece1] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#717d8f]">
              HỌC THÊM • KẾT NỐI
            </span>
            <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
              Lối tắt ứng dụng Tokutei 🚀
            </h2>
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
          <Link
            to="/app/courses"
            className="group flex flex-col justify-between rounded-2xl border border-[#f5ece1] bg-gradient-to-b from-white to-[#fffaf3] p-4 transition-all duration-200 hover:border-sky-300 hover:shadow-md space-y-3 gino-hover-lift"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200/70 group-hover:scale-105 transition-transform">
                <BookOpen size={22} />
              </div>
              <ChevronRight size={16} className="text-[#95a0af] group-hover:text-sky-600 transition-colors" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#0f172a] group-hover:text-sky-600 transition-colors">
                Khóa học Tokutei
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-[#717d8f]">
                Lộ trình JFT, từ vựng & bài học
              </p>
            </div>
          </Link>

          <Link
            to="/app/practice"
            className="group flex flex-col justify-between rounded-2xl border border-[#f5ece1] bg-gradient-to-b from-white to-[#fffaf3] p-4 transition-all duration-200 hover:border-emerald-300 hover:shadow-md space-y-3 gino-hover-lift"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200/70 group-hover:scale-105 transition-transform">
                <Target size={22} />
              </div>
              <ChevronRight size={16} className="text-[#95a0af] group-hover:text-[#059669] transition-colors" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#0f172a] group-hover:text-[#059669] transition-colors">
                Ôn tập Flashcards
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-[#717d8f]">
                {displayDueCount > 0 ? `${displayDueCount} thẻ đến hạn hôm nay` : 'Luyện thẻ nhớ tự động SRS'}
              </p>
            </div>
          </Link>

          <Link
            to="/app/exams"
            className="group flex flex-col justify-between rounded-2xl border border-[#f5ece1] bg-gradient-to-b from-white to-[#fffaf3] p-4 transition-all duration-200 hover:border-amber-300 hover:shadow-md space-y-3 gino-hover-lift"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#b45309] border border-amber-200/70 group-hover:scale-105 transition-transform">
                <GraduationCap size={22} />
              </div>
              <ChevronRight size={16} className="text-[#95a0af] group-hover:text-[#b45309] transition-colors" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#0f172a] group-hover:text-[#b45309] transition-colors">
                Thi thử Tokutei
              </h3>
              <p className="mt-0.5 text-xs font-semibold text-[#717d8f]">
                Đề thi mô phỏng chuẩn hóa
              </p>
            </div>
          </Link>
        </div>
      </section>
      </Reveal>
    </div>
  );
}

function settledValue<T>(result: PromiseSettledResult<T>, failures: string[], label: string): T | null {
  if (result.status === 'fulfilled') return result.value;
  failures.push(label);
  return null;
}

function PageState({ message, tone }: { message: string; tone?: 'error' }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-5"><div className={tone === 'error' ? 'w-full rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700' : 'w-full rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 text-sm font-semibold text-[#5f6b7c]'}>{message}</div></div>;
}

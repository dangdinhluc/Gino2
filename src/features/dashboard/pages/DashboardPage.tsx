import { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, GraduationCap, Layers, Target } from 'lucide-react';
import type { DashboardTask } from '@/src/features/dashboard/components/DashboardQuestsModal';
import { fetchDailyLearningPlan, fetchDashboardHeroSlots, fetchLearnerDashboard, type DailyLearningPlan, type DashboardHeroSlot, type LearnerDashboardSnapshot } from '@/src/features/dashboard/repositories/learnerDashboardRepository';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { listLearnerNotifications, type LearnerNotification } from '@/src/features/notifications/repositories/notificationRepository';
import { pickRandomDashboardAnnouncement, selectDashboardHeroSlot } from '@/src/features/dashboard/lib/dashboardHero';
import { Reveal } from '@/src/shared/components/Reveal';
import { DashboardHero } from '@/src/features/dashboard/components/DashboardHero';
import { DashboardStatCards } from '@/src/features/dashboard/components/DashboardStatCards';
import { DailyRewardBanner } from '@/src/features/dashboard/components/DailyRewardBanner';
import { WeeklyActivity } from '@/src/features/dashboard/components/WeeklyActivity';
import { CourseMastery } from '@/src/features/dashboard/components/CourseMastery';
import { DashboardShortcuts } from '@/src/features/dashboard/components/DashboardShortcuts';
import { DashboardQuestsModal } from '@/src/features/dashboard/components/DashboardQuestsModal';
import { claimDailyReward } from '@/src/features/rewards/repositories/rewardRepository';

const XP_PER_LEVEL = 500;
const DAILY_XP_GOAL = 60;

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
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [rewardState, setRewardState] = useState<{ claimed: boolean; rewardXp: number } | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);

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

  useEffect(() => {
    if (!isQuestsOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQuestsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isQuestsOpen]);

  async function handleClaimReward(): Promise<void> {
    if (claimingReward) return;
    setClaimingReward(true); setRewardError(null);
    try {
      const result = await claimDailyReward();
      setRewardState({ claimed: result.claimed, rewardXp: result.rewardXp });
      if (result.claimed) {
        const refreshed = await fetchLearnerStats();
        setStats(refreshed);
      }
    } catch (reason) {
      setRewardError(reason instanceof Error ? reason.message : 'Không nhận được phần thưởng hôm nay.');
    } finally { setClaimingReward(false); }
  }

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
  const topicMastery = stats?.topicMastery ?? [];
  const taskItems: DashboardTask[] = [];
  if (plan?.nextLesson) taskItems.push({ title: plan.nextLesson.title, status: plan.nextLesson.courseTitle, action: 'Học bài', icon: BookOpen, path: `/app/courses/${plan.nextLesson.courseId}/learn` });
  if (displayDueCount > 0) taskItems.push({ title: `Ôn ${displayDueCount} thẻ đến hạn`, status: 'Lịch SRS hôm nay', action: 'Ôn ngay', icon: Layers, path: '/app/review/flashcards?mode=due' });
  if (plan?.weakAssessment) taskItems.push({ title: plan.weakAssessment.title, status: `Điểm gần nhất ${plan.weakAssessment.score}%`, action: 'Làm lại', icon: GraduationCap, path: `/app/exams/${plan.weakAssessment.id}/start` });
  if (taskItems.length === 0) taskItems.push({ title: 'Chọn khóa học để bắt đầu', status: `Mục tiêu ${plan?.goalMinutes ?? 20} phút hôm nay`, action: 'Xem khóa học', icon: BookOpen, path: '/app/courses' });

  const heroSlot = selectDashboardHeroSlot(heroSlots, now);
  const announcementTarget = announcement?.actionUrl?.startsWith('/') ? announcement.actionUrl : '/app/notifications';

  if (isLoading) return <PageState message="Đang tải kế hoạch học tập…" />;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 pb-24 sm:px-6 md:px-8 md:py-6">
      {loadErrors.length > 0 && (
        <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
          Không tải được: {loadErrors.join(', ')} — các phần còn lại vẫn hiển thị.
        </p>
      )}

      <DashboardHero
        displayName={displayName}
        streak={displayStreak}
        totalXp={totalXp}
        level={level}
        heroSlot={heroSlot}
        announcement={announcement}
        announcementTarget={announcementTarget}
      />

      <Reveal delay={0.04}>
        <button
          type="button"
          onClick={() => setIsQuestsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isQuestsOpen}
          className="group flex w-full items-center gap-3.5 rounded-[28px] border border-orange-200/80 bg-gradient-to-r from-[#fffdf9] via-[#fff7ee] to-[#ffedd9] p-4 text-left shadow-[0_8px_20px_rgba(217,74,19,0.07)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)] gino-hover-lift sm:p-5"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-white shadow-2xs group-hover:scale-105 transition-transform">
            <Target size={22} />
            {taskItems.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#d83a00] px-1 text-[10px] font-black text-white shadow-2xs">
                {taskItems.length}
              </span>
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-[#d83a00]">
              GIỮ NHỊP MỖI NGÀY
            </span>
            <span className="block font-[var(--font-heading)] text-base font-black text-[#0f172a] sm:text-lg">
              Nhiệm vụ Tokutei hôm nay ⚔️
            </span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-[#717d8f]">
              {taskItems.length > 0
                ? `${taskItems.length} nhiệm vụ đang chờ — nhấn để xem chi tiết`
                : 'Xem kế hoạch học hôm nay'}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/85 px-3.5 py-2 text-xs font-black text-[#c2410c] shadow-2xs">
            <span className="hidden sm:inline">Xem nhiệm vụ</span>
            <ChevronRight size={15} className="text-[#95a0af] transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </Reveal>

      <Reveal delay={0.08}>
        <DashboardStatCards
          dailyGoalProgress={dailyGoalProgress}
          displayStreak={displayStreak}
          displayDueCount={displayDueCount}
          displayReviewedToday={displayReviewedToday}
          totalXp={totalXp}
          level={level}
          levelProgress={levelProgress}
          effectiveDailyXp={effectiveDailyXp}
        />
      </Reveal>

      <Reveal delay={0.04}>
        <DailyRewardBanner claiming={claimingReward} rewardState={rewardState} rewardError={rewardError} onClaim={() => void handleClaimReward()} />
      </Reveal>

      {weeklyActivity.length > 0 && (
        <Reveal delay={0.06}>
          <WeeklyActivity
            today={weeklyActivity[weeklyActivity.length - 1]?.date ?? ''}
            weeklyActivity={weeklyActivity}
            displayStreak={displayStreak}
            xpIntoLevel={xpIntoLevel}
            remainingLevelXp={remainingLevelXp}
            level={level}
            streakMilestone={streakMilestone}
          />
        </Reveal>
      )}

      {topicMastery.length > 0 && (
        <Reveal delay={0.08}>
          <CourseMastery topicMastery={topicMastery} />
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <DashboardShortcuts displayDueCount={displayDueCount} />
      </Reveal>

      <DashboardQuestsModal
        open={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        tasks={taskItems}
      />
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

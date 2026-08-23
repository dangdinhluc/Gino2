import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
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
type LoadStatus = 'loading' | 'ready' | 'error';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<LearnerDashboardSnapshot | null>(null);
  const [stats, setStats] = useState<LearnerStatsSnapshot | null>(null);
  const [profile, setProfile] = useState<LearnerProfileSnapshot | null>(null);
  const [plan, setPlan] = useState<DailyLearningPlan | null>(null);
  const [announcement, setAnnouncement] = useState<LearnerNotification | null>(null);
  const [heroSlots, setHeroSlots] = useState<DashboardHeroSlot[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [dashboardStatus, setDashboardStatus] = useState<LoadStatus>('loading');
  const [statsStatus, setStatsStatus] = useState<LoadStatus>('loading');
  const [profileStatus, setProfileStatus] = useState<LoadStatus>('loading');
  const [planStatus, setPlanStatus] = useState<LoadStatus>('loading');
  const [notificationStatus, setNotificationStatus] = useState<LoadStatus>('loading');
  const [heroStatus, setHeroStatus] = useState<LoadStatus>('loading');
  const [statsRetryCount, setStatsRetryCount] = useState(0);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);
  const [rewardState, setRewardState] = useState<{ claimed: boolean; rewardXp: number } | null>(null);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadErrors([]);

    fetchLearnerDashboard()
      .then((value) => {
        if (cancelled) return;
        setDashboard(value);
        setDashboardStatus('ready');
        clearLoadError(setLoadErrors, 'kế hoạch học tập');
      })
      .catch(() => {
        if (cancelled) return;
        setDashboardStatus('error');
        addLoadError(setLoadErrors, 'kế hoạch học tập');
      });

    fetchLearnerProfile()
      .then((value) => {
        if (cancelled) return;
        setProfile(value);
        setProfileStatus('ready');
        clearLoadError(setLoadErrors, 'hồ sơ cá nhân');
      })
      .catch(() => {
        if (cancelled) return;
        setProfileStatus('error');
        addLoadError(setLoadErrors, 'hồ sơ cá nhân');
      });

    fetchDailyLearningPlan()
      .then((value) => {
        if (cancelled) return;
        setPlan(value);
        setPlanStatus('ready');
        clearLoadError(setLoadErrors, 'nhiệm vụ hôm nay');
      })
      .catch(() => {
        if (cancelled) return;
        setPlanStatus('error');
        addLoadError(setLoadErrors, 'nhiệm vụ hôm nay');
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatsStatus('loading');

    fetchLearnerStats()
      .then((value) => {
        if (cancelled) return;
        setStats(value);
        setStatsStatus('ready');
        clearLoadError(setLoadErrors, 'chỉ số học tập');
      })
      .catch(() => {
        if (cancelled) return;
        setStatsStatus('error');
        addLoadError(setLoadErrors, 'chỉ số học tập');
      });

    return () => { cancelled = true; };
  }, [statsRetryCount]);

  useEffect(() => {
    let cancelled = false;

    listLearnerNotifications()
      .then((value) => {
        if (cancelled) return;
        setAnnouncement(pickRandomDashboardAnnouncement(value));
        setNotificationStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setNotificationStatus('error');
        addLoadError(setLoadErrors, 'thông báo');
      });

    fetchDashboardHeroSlots()
      .then((value) => {
        if (cancelled) return;
        setHeroSlots(value);
        setHeroStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setHeroStatus('error');
        addLoadError(setLoadErrors, 'hình nền');
      });

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
        setStatsStatus('loading');
        const refreshed = await fetchLearnerStats();
        setStats(refreshed);
        setStatsStatus('ready');
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
  const hasCriticalData = dashboard !== null || profile !== null || plan !== null;
  const criticalLoading = dashboardStatus === 'loading' || profileStatus === 'loading' || planStatus === 'loading';

  if (!hasCriticalData && criticalLoading) return <DashboardSkeleton />;

  return (
    <div
      className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 pb-24 sm:px-6 md:px-8 md:py-6"
      data-dashboard-status={dashboardStatus}
      data-profile-status={profileStatus}
      data-plan-status={planStatus}
      data-stats-status={statsStatus}
      data-notifications-status={notificationStatus}
      data-hero-status={heroStatus}
    >
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

      {statsStatus === 'ready' && stats ? (
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
      ) : (
        <DashboardSectionState
          message={statsStatus === 'error' ? 'Không tải được chỉ số học tập.' : 'Đang tải chỉ số học tập…'}
          retry={statsStatus === 'error' ? () => setStatsRetryCount((value) => value + 1) : undefined}
        />
      )}

      <Reveal delay={0.04}>
        <DailyRewardBanner claiming={claimingReward} rewardState={rewardState} rewardError={rewardError} onClaim={() => void handleClaimReward()} />
      </Reveal>

      {statsStatus === 'ready' && weeklyActivity.length > 0 && (
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

      {statsStatus === 'ready' && topicMastery.length > 0 && (
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

function addLoadError(setLoadErrors: Dispatch<SetStateAction<string[]>>, label: string): void {
  setLoadErrors((current) => current.includes(label) ? current : [...current, label]);
}

function clearLoadError(setLoadErrors: Dispatch<SetStateAction<string[]>>, label: string): void {
  setLoadErrors((current) => current.filter((item) => item !== label));
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-4 pb-24 sm:px-6 md:px-8 md:py-6" aria-busy="true" aria-label="Đang tải Dashboard">
      <div className="h-44 animate-pulse rounded-[28px] border border-[#f5ece1] bg-white" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-[22px] border border-[#f5ece1] bg-white" />)}
      </div>
      <div className="h-24 animate-pulse rounded-[28px] border border-[#f5ece1] bg-white" />
    </div>
  );
}

function DashboardSectionState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <section className="rounded-[22px] border border-[#f5ece1] bg-white px-4 py-5 text-sm font-semibold text-[#7b8796]" role={retry ? 'alert' : undefined}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        {retry && <button type="button" onClick={retry} className="rounded-xl border border-[#e8dccb] px-3 py-2 text-xs font-black text-[#d83a00]">Thử lại</button>}
      </div>
    </section>
  );
}

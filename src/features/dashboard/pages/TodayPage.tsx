import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Flame, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import {
  fetchDailyLearningPlan,
  type DailyLearningPlan,
} from '@/src/features/dashboard/repositories/learnerDashboardRepository';
import {
  fetchLearnerStats,
  type LearnerStatsSnapshot,
} from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { fetchLearnerProfile } from '@/src/features/profile/repositories/profileRepository';
import { claimDailyReward } from '@/src/features/rewards/repositories/rewardRepository';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

export default function TodayPage() {
  const auth = useAuth();
  const courses = useCourseList();
  const storeStreak = useProgressStore((state) => state.streak);
  const storeWeeklyXp = useProgressStore((state) => state.weeklyXp);

  const [displayName, setDisplayName] = useState('Luc');
  const [learnerStats, setLearnerStats] = useState<LearnerStatsSnapshot | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyLearningPlan | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  useEffect(() => {
    const userId = auth.user?.id;
    if (!userId) return;
    let cancelled = false;

    fetchLearnerProfile(userId)
      .then((profile) => {
        if (!cancelled && profile?.displayName) {
          setDisplayName(profile.displayName);
        } else if (!cancelled && auth.user?.email) {
          setDisplayName(auth.user.email.split('@')[0]);
        }
      })
      .catch(() => undefined);

    fetchLearnerStats()
      .then((stats) => {
        if (!cancelled && stats) {
          setLearnerStats(stats);
        }
      })
      .catch(() => undefined);

    fetchDailyLearningPlan()
      .then((plan) => {
        if (!cancelled && plan) {
          setDailyPlan(plan);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [auth.user?.id, auth.user?.email]);

  const enrolledCourses = useMemo(
    () => courses.data.filter((course) => course.isEnrolled !== false),
    [courses.data]
  );

  const currentCourse =
    enrolledCourses.find((course) => course.progress > 0 && course.progress < 100) ??
    enrolledCourses[0] ??
    null;

  const streak = learnerStats?.currentStreak || storeStreak || 12;
  const dailyXp = learnerStats?.dailyXp || storeWeeklyXp || 120;
  const dueCount = learnerStats?.dueVocabulary ?? dailyPlan?.dueVocabulary ?? 24;
  const reviewedToday = learnerStats?.reviewedToday ?? 8;
  const exercisesDone = learnerStats?.totalReviews ? Math.min(5, Math.max(2, Math.floor(learnerStats.totalReviews / 5))) : 5;
  const studyMinutes = Math.max(12, Math.round(reviewedToday * 1.5));

  const activeLessonTitle = dailyPlan?.nextLesson?.title || 'Bài 8: て あります';
  const activeCourseTitle = currentCourse?.title || dailyPlan?.nextLesson?.courseTitle || 'Minna no Nihongo N5';
  const currentProgressPercent = currentCourse?.progress ?? 58;
  const currentLessonFraction = currentCourse?.totalLessons
    ? `${Math.max(1, Math.round((currentProgressPercent / 100) * currentCourse.totalLessons))} / ${currentCourse.totalLessons} bài`
    : '7 / 12 bài';

  const nextLessonTitle = dailyPlan?.nextLesson?.title || 'Bài 9: の・に・へ';

  const courseCards = useMemo(() => {
    const defaultThumbnails = [
      assets.shared.backgrounds.fujiLandscape,
      assets.shared.backgrounds.pagodaLandscape,
      assets.shared.backgrounds.fujiLandscape,
    ];

    if (enrolledCourses.length >= 3) {
      return enrolledCourses.slice(0, 3).map((course, index) => ({
        id: course.id,
        title: course.title,
        progress: course.progress,
        tag: `${course.progress}%`,
        thumbnail: course.image || defaultThumbnails[index % defaultThumbnails.length],
        link: `/app/courses/${course.id}/learn`,
      }));
    }

    const fallbackList = [
      {
        id: enrolledCourses[0]?.id || 'minna-n5',
        title: enrolledCourses[0]?.title || 'Minna no Nihongo N5',
        progress: enrolledCourses[0]?.progress ?? 38,
        tag: `${enrolledCourses[0]?.progress ?? 38}%`,
        thumbnail: defaultThumbnails[0],
        link: enrolledCourses[0] ? `/app/courses/${enrolledCourses[0].id}/learn` : '/app/courses',
      },
      {
        id: enrolledCourses[1]?.id || 'kaiwa-a1',
        title: enrolledCourses[1]?.title || 'Kaiwa Starter A1',
        progress: enrolledCourses[1]?.progress ?? 16,
        tag: `${enrolledCourses[1]?.progress ?? 16}%`,
        thumbnail: defaultThumbnails[1],
        link: enrolledCourses[1] ? `/app/courses/${enrolledCourses[1].id}/learn` : '/app/courses',
      },
      {
        id: enrolledCourses[2]?.id || 'grammar-n5',
        title: enrolledCourses[2]?.title || 'Ngữ pháp N5',
        progress: enrolledCourses[2]?.progress ?? 8,
        tag: `${enrolledCourses[2]?.progress ?? 8}%`,
        thumbnail: defaultThumbnails[2],
        link: enrolledCourses[2] ? `/app/courses/${enrolledCourses[2].id}/learn` : '/app/courses',
      },
    ];

    return fallbackList;
  }, [enrolledCourses]);

  const handleClaimReward = async () => {
    if (claimingReward || rewardClaimed) return;
    setClaimingReward(true);
    try {
      const res = await claimDailyReward();
      setRewardClaimed(true);
      setRewardToast(`🎉 +${res.rewardXp || 30} XP nhận thưởng thành công!`);
    } catch {
      setRewardClaimed(true);
      setRewardToast('🎉 +30 XP nhận thưởng hôm nay!');
    } finally {
      setClaimingReward(false);
      setTimeout(() => setRewardToast(null), 3500);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[500px] space-y-4 px-3 pb-28 pt-2 sm:px-4">
      <AnimatePresence>
        {rewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 inset-x-4 z-50 mx-auto max-w-sm rounded-2xl border border-[#c3adfa] bg-[#6e46e6] px-4 py-2.5 text-center text-xs font-black text-white shadow-xl"
          >
            {rewardToast}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative overflow-hidden rounded-[30px] bg-[#221640] p-4 text-white shadow-[0_12px_32px_rgba(25,12,50,0.18)]">
        <div className="absolute inset-0">
          <img src={assets.shared.backgrounds.fujiLandscape} alt="Fuji Landscape" className="h-full w-full object-cover object-center opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160d2d]/95 via-[#1d123b]/50 to-[#190f33]/30" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/95 text-[#1e1f29] shadow-sm backdrop-blur-xs transition-transform hover:scale-105 active:scale-95" aria-label="Menu">
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3.5 py-1.5 text-center shadow-xs backdrop-blur-xs">
            <Flame size={15} className="fill-[#ff6b35] text-[#ff6b35]" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[12px] font-black text-[#1e1f29]">{streak}</span>
              <span className="text-[8.5px] font-bold text-[#626472]">Ngày liên tiếp</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-[22px] font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              <span>Xin chào, {displayName}!</span><span className="text-yellow-300">✨</span>
            </h1>
            <p className="mt-1 text-[12px] font-medium leading-snug text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Hôm nay là một ngày tuyệt vời để học tiếng Nhật!</p>
          </div>
          <div className="relative -mb-1 -mr-1 h-24 w-24 shrink-0 sm:h-28 sm:w-28">
            <img src={assets.shared.mascots.headerWaving} alt="Tanuki Mascot" className="h-full w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        <div className="relative z-10 mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-[#eee8f7] bg-white p-3.5 text-[#1e1f26] shadow-[0_8px_24px_rgba(15,10,35,0.14)]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center"><img src={assets.shared.dashboard.openBook} alt="" className="h-full w-full object-contain drop-shadow-2xs" /></span>
            <div className="min-w-0 flex-1">
              <span className="text-[10.5px] font-black uppercase tracking-wide text-[#6e46e6]">Tiếp tục học</span>
              <strong className="block truncate text-[14.5px] font-black text-[#191a22]">{activeLessonTitle}</strong>
              <span className="block truncate text-[11.5px] font-semibold text-[#767886]">{activeCourseTitle}</span>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0ebf8]"><div className="h-full rounded-full bg-gradient-to-r from-[#7c4df2] to-[#6035d8]" style={{ width: `${currentProgressPercent}%` }} /></div>
                <span className="text-[10px] font-extrabold text-[#747684]">{currentLessonFraction}</span>
              </div>
            </div>
          </div>
          <Link to={currentCourse ? `/app/courses/${currentCourse.id}/learn` : '/app/courses'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#6e46e6] to-[#552ad6] text-white shadow-[0_5px_16px_rgba(110,70,230,0.38)] transition-all hover:scale-105 active:scale-95" aria-label="Tiếp tục học">
            <ChevronRight size={20} strokeWidth={2.8} />
          </Link>
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5"><h2 className="text-[15.5px] font-black tracking-tight text-[#1e1f26]">Nhiệm vụ hôm nay</h2><button type="button" className="text-[#9698a4] hover:text-[#6e46e6]" title="Thông tin nhiệm vụ" aria-label="Thông tin nhiệm vụ"><Info size={15} /></button></div>
          <motion.button type="button" onClick={handleClaimReward} whileTap={{ scale: 0.94 }} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7042e6] to-[#5a2fd8] py-1 pl-1.5 pr-3 text-[11.5px] font-black text-white shadow-[0_3px_12px_rgba(110,70,230,0.35)] transition-transform">
            <img src={assets.shared.dashboard.chestGold} alt="" className="h-5 w-5 object-contain drop-shadow-xs" /><span>+30 XP</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Link to="/app/review/flashcards?mode=due" className="flex flex-col items-center justify-between rounded-[24px] border border-[#d6e7fc] bg-gradient-to-b from-[#f0f7ff] to-[#e4f0fc] p-3 text-center shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div><strong className="block text-[13.5px] font-black text-[#2d6fd8]">Ôn từ vựng</strong><span className="mt-0.5 block text-[11px] font-medium text-[#606272]">{dueCount} từ đến hạn</span></div>
            <div className="my-1.5 h-20 w-20 sm:h-22 sm:w-22"><img src={assets.shared.mascots.reading} alt="Ôn từ vựng" className="h-full w-full object-contain drop-shadow-2xs" /></div>
            <div className="flex w-full items-center justify-between rounded-full bg-white/95 p-0.5 text-[10px] font-black shadow-2xs border border-[#d6e7fc]"><span className="flex items-center gap-1 rounded-full bg-[#2d6fd8] px-2 py-0.5 text-white"><span className="h-1.5 w-1.5 rounded-full bg-white" /><span>12/24</span></span><span className="pr-2 text-[#2d6fd8]">12/24</span></div>
          </Link>

          <Link to="/app/practice" className="flex flex-col items-center justify-between rounded-[24px] border border-[#d3ecd5] bg-gradient-to-b from-[#f0fbf0] to-[#e3f6e4] p-3 text-center shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div><strong className="block text-[13.5px] font-black text-[#2d9e48]">Luyện tập</strong><span className="mt-0.5 block text-[11px] font-medium text-[#606272]">Làm 5 câu</span></div>
            <div className="my-1.5 h-20 w-20 sm:h-22 sm:w-22"><img src={assets.shared.mascots.writing} alt="Luyện tập" className="h-full w-full object-contain drop-shadow-2xs" /></div>
            <div className="flex w-full items-center justify-between rounded-full bg-white/95 p-0.5 text-[10px] font-black shadow-2xs border border-[#d3ecd5]"><span className="flex items-center gap-1 rounded-full bg-[#2d9e48] px-2 py-0.5 text-white"><span className="h-1.5 w-1.5 rounded-full bg-white" /><span>2/5</span></span><span className="pr-2 text-[#2d9e48]">2/5</span></div>
          </Link>

          <Link to={currentCourse ? `/app/courses/${currentCourse.id}/learn` : '/app/courses'} className="flex flex-col items-center justify-between rounded-[24px] border border-[#fbe5cb] bg-gradient-to-b from-[#fdf5ea] to-[#faedd9] p-3 text-center shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div><strong className="block text-[13.5px] font-black text-[#d6791e]">Bài tiếp theo</strong><span className="mt-0.5 block truncate text-[11px] font-medium text-[#606272]">{nextLessonTitle}</span></div>
            <div className="my-1.5 h-20 w-20 sm:h-22 sm:w-22"><img src={assets.shared.mascots.celebrate} alt="Bài tiếp theo" className="h-full w-full object-contain drop-shadow-2xs" /></div>
            <div className="flex w-full items-center justify-between rounded-full bg-white/95 p-0.5 text-[10px] font-black shadow-2xs border border-[#fbe5cb]"><span className="flex items-center gap-1 rounded-full bg-[#d6791e] px-2 py-0.5 text-white"><span className="h-1.5 w-1.5 rounded-full bg-white" /><span>0/1</span></span><span className="pr-2 text-[#d6791e]">0/1</span></div>
          </Link>
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1"><h2 className="text-[15.5px] font-black tracking-tight text-[#1e1f26]">Khóa học của bạn</h2><Link to="/app/courses" className="text-[12px] font-bold text-[#6e46e6] hover:underline">Xem tất cả</Link></div>
        <div className="grid grid-cols-3 gap-2.5">
          {courseCards.map((course) => (
            <Link key={course.id} to={course.link} className="flex flex-col justify-between rounded-[22px] border border-[#ece7f5] bg-white p-2 shadow-xs transition-all hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]">
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-[15px]"><img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" /><span className="absolute right-1.5 top-1.5 rounded-full bg-[#6e46e6]/95 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs backdrop-blur-xs">{course.tag}</span></div>
              <strong className="mt-2 block truncate text-[12px] font-black text-[#202129]">{course.title}</strong>
              <div className="mt-2 flex items-center justify-center"><span className="rounded-full bg-[#6e46e6] px-3.5 py-1 text-[10.5px] font-black text-white shadow-2xs">Tiếp tục</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[26px] border border-[#d6c7f5] bg-gradient-to-r from-[#e3d8f8] via-[#e9defb] to-[#ded0f7] p-4 shadow-[0_4px_16px_rgba(110,70,230,0.08)]">
        <div className="flex items-center justify-between"><h2 className="text-[15px] font-black tracking-tight text-[#1e1f26]">Thành tích hôm nay</h2><div className="flex items-center gap-1"><span className="text-xs">✨</span><img src={assets.shared.mascots.faceWinking} alt="Mascot" className="h-8 w-8 object-contain drop-shadow-xs" /></div></div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs"><img src={assets.shared.dashboard.bookStack} alt="" className="h-7 w-7 object-contain" /><strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">{reviewedToday} từ</strong><span className="text-[9.5px] font-bold text-[#656775]">Đã ôn</span></div>
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs"><img src={assets.shared.navigation.practice} alt="" className="h-7 w-7 object-contain" /><strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">{exercisesDone} câu</strong><span className="text-[9.5px] font-bold text-[#656775]">Đã làm</span></div>
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs"><img src={assets.shared.dashboard.calendarPaw} alt="" className="h-7 w-7 object-contain" /><strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">{studyMinutes} phút</strong><span className="text-[9.5px] font-bold text-[#656775]">Thời gian học</span></div>
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs"><img src={assets.shared.dashboard.xpStar} alt="" className="h-7 w-7 object-contain" /><strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">{dailyXp} XP</strong><span className="text-[9.5px] font-bold text-[#656775]">Điểm kinh nghiệm</span></div>
        </div>
      </section>
    </div>
  );
}

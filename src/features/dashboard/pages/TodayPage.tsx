import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Flame,
  Gamepad2,
  Headphones,
  Sparkles,
  Star,
} from 'lucide-react';
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
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

const DAILY_XP_GOAL = 60;

export default function TodayPage() {
  const auth = useAuth();
  const courses = useCourseList();
  const storeStreak = useProgressStore((state) => state.streak);
  const storeWeeklyXp = useProgressStore((state) => state.weeklyXp);

  const [displayName, setDisplayName] = useState('Bạn');
  const [learnerStats, setLearnerStats] = useState<LearnerStatsSnapshot | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyLearningPlan | null>(null);

  useEffect(() => {
    const userId = auth.user?.id;
    if (!userId) return;
    let cancelled = false;

    fetchLearnerProfile(userId)
      .then((profile) => {
        if (cancelled) return;
        if (profile?.displayName) {
          setDisplayName(profile.displayName);
        } else if (auth.user?.email) {
          setDisplayName(auth.user.email.split('@')[0]);
        }
      })
      .catch(() => undefined);

    fetchLearnerStats()
      .then((stats) => {
        if (!cancelled) setLearnerStats(stats);
      })
      .catch(() => undefined);

    fetchDailyLearningPlan()
      .then((plan) => {
        if (!cancelled) setDailyPlan(plan);
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

  const currentCourse = useMemo(() => {
    const plannedCourseId = dailyPlan?.nextLesson?.courseId;
    return (
      enrolledCourses.find((course) => course.id === plannedCourseId) ??
      enrolledCourses.find((course) => course.progress > 0 && course.progress < 100) ??
      enrolledCourses[0] ??
      null
    );
  }, [dailyPlan?.nextLesson?.courseId, enrolledCourses]);

  const streak = learnerStats?.currentStreak || storeStreak || 0;
  const dailyXp = learnerStats?.dailyXp ?? 0;
  const weeklyXp = learnerStats?.weeklyXp || storeWeeklyXp || 0;
  const dueCount = learnerStats?.dueVocabulary ?? dailyPlan?.dueVocabulary ?? 0;
  const reviewedToday = learnerStats?.reviewedToday ?? 0;
  const masteredVocabulary = learnerStats?.masteredVocabulary ?? 0;
  const dailyXpProgress = Math.min(100, Math.round((dailyXp / DAILY_XP_GOAL) * 100));
  const totalXp = learnerStats?.totalXp ?? 0;
  const level = Math.floor(totalXp / 500) + 1;

  const activeCourseTitle =
    currentCourse?.title || dailyPlan?.nextLesson?.courseTitle || 'Chọn khóa học Tokutei';
  const activeLessonTitle = dailyPlan?.nextLesson?.title || 'Bắt đầu bài học đầu tiên';
  const activeProgress = currentCourse?.progress ?? 0;
  const activeLessonFraction = currentCourse?.totalLessons
    ? `${Math.max(0, Math.round((activeProgress / 100) * currentCourse.totalLessons))}/${currentCourse.totalLessons} bài`
    : `${activeProgress}%`;
  const activeCourseLink = currentCourse
    ? `/app/courses/${currentCourse.id}/learn`
    : '/app/courses';

  const courseCards = enrolledCourses.slice(0, 3);
  const reminder = dailyPlan?.weakAssessment
    ? {
        title: 'Gino thấy bạn nên ôn lại',
        body: `${dailyPlan.weakAssessment.title} · Điểm gần nhất ${dailyPlan.weakAssessment.score}%`,
        action: 'Ôn ngay chủ đề này',
        href: `/app/exams/${dailyPlan.weakAssessment.id}/start`,
      }
    : dueCount > 0
      ? {
          title: 'Gino nhắc bạn',
          body: `Bạn đang có ${dueCount} từ vựng đến hạn. Ôn một lượt ngắn để giữ nhịp nhớ nhé.`,
          action: 'Ôn từ vựng ngay',
          href: '/app/review/flashcards?mode=due',
        }
      : {
          title: 'Gino nhắc bạn',
          body: 'Hôm nay chưa có bài ôn bắt buộc. Học tiếp một bài Tokutei để giữ chuỗi học nhé.',
          action: 'Học tiếp',
          href: activeCourseLink,
        };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 pb-28 pt-3 sm:px-5 lg:px-6 lg:pt-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] lg:gap-5">
        <div className="space-y-4">
          <header className="flex items-center justify-between px-1">
            <Link to="/app/dashboard" className="flex items-center gap-2.5" aria-label="Gino2 trang chủ">
              <img src={assets.shared.mascots.brand} alt="" className="h-11 w-11 object-contain" />
              <div className="leading-none">
                <strong className="block text-[24px] font-black tracking-[-0.04em] text-[#191a22]">
                  Gin<span className="text-[#f5a600]">o2</span>
                </strong>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#858995]">
                  Tokutei Learning
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-2xl border border-[#f3e6cc] bg-[#fffaf0] px-3 py-2 shadow-xs">
                <Flame size={19} className="fill-[#ff8a00] text-[#ff8a00]" />
                <div className="leading-none">
                  <strong className="block text-[13px] font-black text-[#26272f]">{streak} ngày</strong>
                  <span className="mt-1 block text-[9px] font-bold text-[#858995]">Chuỗi học</span>
                </div>
              </div>
              <Link
                to="/app/notifications"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ece7df] bg-white text-[#31333c] shadow-xs transition hover:border-[#f2bd51] hover:text-[#e89300]"
                aria-label="Thông báo"
              >
                <Bell size={19} />
              </Link>
            </div>
          </header>

          <section className="relative min-h-[210px] overflow-hidden rounded-[28px] border border-[#f4dfad] bg-gradient-to-br from-[#fff8df] via-[#fff2c5] to-[#ffe8a2] px-5 py-5 shadow-[0_10px_28px_rgba(143,105,23,0.10)] sm:min-h-[230px] sm:px-6">
            <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/40 blur-2xl" />
            <div className="relative z-10 max-w-[58%]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#b97900]">
                <Sparkles size={12} /> Hôm nay
              </span>
              <h1 className="mt-3 font-[var(--font-heading)] text-[27px] font-black leading-tight tracking-[-0.035em] text-[#201f25] sm:text-[31px]">
                Xin chào, {displayName}! 👋
              </h1>
              <p className="mt-2 max-w-[280px] text-[13px] font-semibold leading-relaxed text-[#65656b]">
                Hôm nay chúng ta tiếp tục chinh phục Tokutei nhé.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-[11px] font-black text-[#37363d] shadow-xs">
                  <Star size={14} className="fill-[#f6b700] text-[#f6b700]" /> {totalXp.toLocaleString('vi-VN')} XP
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-[11px] font-black text-[#37363d] shadow-xs">
                  🏆 Lv.{level}
                </span>
              </div>
            </div>

            <img
              src={assets.shared.mascots.headerWaving}
              alt="Gino chào bạn"
              className="absolute -bottom-4 -right-2 h-[190px] w-[190px] object-contain drop-shadow-[0_15px_24px_rgba(90,62,16,0.20)] sm:h-[215px] sm:w-[215px]"
            />
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <BookOpen size={17} className="text-[#6e46e6]" />
              <h2 className="text-[15px] font-black uppercase tracking-[-0.01em] text-[#25262d]">Học tiếp</h2>
            </div>

            <article className="rounded-[26px] border border-[#ece5da] bg-white p-4 shadow-[0_6px_20px_rgba(35,30,24,0.06)] sm:p-5">
              <div className="flex items-start gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#fff2dc]">
                  <img src={assets.shared.dashboard.openBook} alt="" className="h-11 w-11 object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[18px] font-black text-[#202129]">{activeCourseTitle}</h3>
                      <span className="mt-0.5 block text-[11px] font-bold text-[#9a6a11]">Tiến độ khóa học</span>
                    </div>
                    <strong className="shrink-0 text-[27px] font-black text-[#f4a000]">{activeProgress}%</strong>
                  </div>

                  <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#f1eee9]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#ffb000] to-[#f49a00] transition-[width] duration-500"
                      style={{ width: `${Math.max(3, activeProgress)}%` }}
                    />
                  </div>

                  <div className="mt-3 border-t border-[#f1ece5] pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#99979a]">Bài tiếp theo</span>
                    <strong className="mt-1 block truncate text-[14px] font-black text-[#25262d]">{activeLessonTitle}</strong>
                    <span className="mt-1 block text-[11px] font-semibold text-[#88878b]">{activeLessonFraction}</span>
                  </div>
                </div>
              </div>

              <Link
                to={activeCourseLink}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#ffc21a] to-[#ffad00] text-[13px] font-black text-[#242018] shadow-[0_7px_16px_rgba(243,169,0,0.22)] transition hover:brightness-[0.98] active:scale-[0.99]"
              >
                ▶ Học tiếp
              </Link>
            </article>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={17} className="text-[#ee6c64]" />
                <h2 className="text-[15px] font-black uppercase tracking-[-0.01em] text-[#25262d]">Việc hôm nay</h2>
              </div>
              <Link to="/app/practice" className="text-[11px] font-bold text-[#777780] hover:text-[#6e46e6]">
                Xem luyện tập
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <TodayTaskCard
                href="/app/review/flashcards?mode=due"
                icon={assets.shared.dashboard.bookStack}
                title="Từ vựng"
                value={`${reviewedToday}/${Math.max(reviewedToday + dueCount, reviewedToday || dueCount || 1)}`}
                progress={reviewedToday + dueCount > 0 ? Math.round((reviewedToday / (reviewedToday + dueCount)) * 100) : 0}
                tone="green"
              />
              <TodayTaskCard
                href="/app/practice"
                icon={assets.shared.navigation.practice}
                title="Luyện tập"
                value={`${dailyXp}/${DAILY_XP_GOAL} XP`}
                progress={dailyXpProgress}
                tone="purple"
              />
              <TodayTaskCard
                href={activeCourseLink}
                icon={assets.shared.mascots.reading}
                title="Bài học"
                value={dailyPlan?.nextLesson ? '1 bài' : 'Chọn bài'}
                progress={dailyPlan?.nextLesson ? 25 : 0}
                tone="blue"
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[24px] border border-[#e8def8] bg-gradient-to-r from-[#fbf8ff] to-[#f3ebff] p-4 shadow-[0_5px_18px_rgba(84,54,140,0.06)]">
            <div className="flex items-start gap-3.5">
              <img src={assets.shared.mascots.lightbulb} alt="" className="h-14 w-14 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wide text-[#7b4ad9]">Gino nhắc bạn</span>
                <h2 className="mt-1 text-[15px] font-black text-[#28262e]">{reminder.title}</h2>
                <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-[#77727e]">{reminder.body}</p>
              </div>
            </div>
            <Link
              to={reminder.href}
              className="mt-3 flex h-11 items-center justify-center rounded-[15px] bg-[#ece2ff] text-[12px] font-black text-[#7040cf] transition hover:bg-[#e4d6ff]"
            >
              {reminder.action} <ChevronRight size={15} />
            </Link>
          </section>
        </div>

        <div className="space-y-4">
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <BookOpen size={17} className="text-[#466fd8]" />
                <h2 className="text-[15px] font-black uppercase tracking-[-0.01em] text-[#25262d]">Khóa học của bạn</h2>
              </div>
              <Link to="/app/courses" className="flex items-center gap-1 text-[11px] font-bold text-[#777780] hover:text-[#6e46e6]">
                Tất cả khóa học <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-hidden rounded-[26px] border border-[#ece7df] bg-white shadow-[0_6px_20px_rgba(35,30,24,0.05)]">
              {courseCards.length > 0 ? (
                courseCards.map((course, index) => (
                  <Link
                    key={course.id}
                    to={`/app/courses/${course.id}/learn`}
                    className={`group flex items-center gap-3.5 px-4 py-4 transition hover:bg-[#fffaf1] ${index > 0 ? 'border-t border-[#f0ece6]' : ''}`}
                  >
                    <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-[16px] bg-[#fff3de]">
                      <img
                        src={course.image || assets.shared.dashboard.openBook}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <strong className="truncate text-[13px] font-black text-[#272831]">{course.title}</strong>
                        <strong className="text-[17px] font-black text-[#31323a]">{course.progress}%</strong>
                      </div>
                      <span className="mt-0.5 block text-[10px] font-semibold text-[#929097]">Tiến độ</span>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efede9]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#ffb31c] to-[#f49b00]"
                          style={{ width: `${Math.max(3, course.progress)}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight size={17} className="shrink-0 text-[#aaa8ad] transition group-hover:translate-x-0.5 group-hover:text-[#e69a00]" />
                  </Link>
                ))
              ) : (
                <div className="p-5 text-center">
                  <img src={assets.shared.mascots.reading} alt="" className="mx-auto h-20 w-20 object-contain" />
                  <h3 className="mt-2 text-sm font-black text-[#292a31]">Chưa có khóa học đang học</h3>
                  <p className="mt-1 text-[11px] font-semibold text-[#8a8990]">Chọn ngành Tokutei để bắt đầu lộ trình.</p>
                  <Link to="/app/courses" className="mt-3 inline-flex rounded-xl bg-[#ffb30e] px-4 py-2 text-[11px] font-black text-[#28231a]">
                    Xem khóa học
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center gap-2 px-1">
              <Sparkles size={17} className="text-[#f2a300]" />
              <h2 className="text-[15px] font-black uppercase tracking-[-0.01em] text-[#25262d]">Truy cập nhanh</h2>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              <QuickAction href="/app/exams" icon={assets.shared.navigation.exams} label="Đề thi" />
              <QuickAction href="/app/practice" icon={assets.shared.navigation.vocabulary} label="Từ vựng" />
              <QuickAction href="/app/hub" icon={assets.courses.workspace.games} label="Game" />
              <QuickAction href="/app/ai-lab" icon={assets.shared.mascots.aiTutorTanuki} label="AI Gino" />
            </div>
          </section>

          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px]">📊</span>
                <h2 className="text-[15px] font-black uppercase tracking-[-0.01em] text-[#25262d]">Thống kê học tập</h2>
              </div>
              <span className="text-[10px] font-bold text-[#8c8990]">Tuần này</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={assets.shared.dashboard.bookStack} value={reviewedToday} label="Đã ôn hôm nay" />
              <StatCard icon={assets.shared.dashboard.openBook} value={masteredVocabulary} label="Từ đã nắm" />
              <StatCard icon={assets.shared.dashboard.xpStar} value={weeklyXp} label="XP tuần" />
              <StatCard icon={assets.shared.dashboard.flameStreak} value={streak} label="Ngày liên tiếp" />
            </div>
          </section>

          <section className="relative min-h-[170px] overflow-hidden rounded-[26px] border border-[#f2dfad] bg-gradient-to-r from-[#fff5ce] via-[#ffedb3] to-[#ffe49a] p-5 shadow-[0_7px_22px_rgba(139,102,23,0.08)]">
            <img
              src={assets.shared.backgrounds.fujiLandscape}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-[0.16]"
            />
            <div className="relative z-10 max-w-[61%]">
              <span className="text-[10px] font-black uppercase tracking-wide text-[#a56b00]">Gino gửi bạn</span>
              <h2 className="mt-2 text-[20px] font-black leading-tight text-[#28251f]">Sẵn sàng chinh phục Tokutei!</h2>
              <p className="mt-2 text-[11.5px] font-semibold leading-relaxed text-[#716b61]">
                Mỗi ngày tiến một chút, mục tiêu Tokutei sẽ gần hơn rất nhiều. 💪
              </p>
            </div>
            <img
              src={assets.shared.mascots.celebrate}
              alt="Gino cổ vũ"
              className="absolute -bottom-7 -right-3 h-[150px] w-[150px] object-contain drop-shadow-[0_10px_18px_rgba(79,56,16,0.18)]"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

function TodayTaskCard({
  href,
  icon,
  title,
  value,
  progress,
  tone,
}: {
  href: string;
  icon: string;
  title: string;
  value: string;
  progress: number;
  tone: 'green' | 'purple' | 'blue';
}) {
  const tones = {
    green: { surface: 'bg-[#f0faf2]', bar: 'bg-[#4fb765]', border: 'border-[#dcefe0]' },
    purple: { surface: 'bg-[#f7f2ff]', bar: 'bg-[#8a62df]', border: 'border-[#e7dcfa]' },
    blue: { surface: 'bg-[#f0f7ff]', bar: 'bg-[#5c93e6]', border: 'border-[#dbe9fa]' },
  } as const;
  const currentTone = tones[tone];

  return (
    <Link
      to={href}
      className={`rounded-[20px] border bg-white p-3 text-center shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm ${currentTone.border}`}
    >
      <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-[15px] ${currentTone.surface}`}>
        <img src={icon} alt="" className="h-8 w-8 object-contain" />
      </div>
      <strong className="mt-2 block text-[11.5px] font-black text-[#2a2b32]">{title}</strong>
      <span className="mt-1 block text-[11px] font-black text-[#494a51]">{value}</span>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efefef]">
        <div className={`h-full rounded-full ${currentTone.bar}`} style={{ width: `${Math.max(4, Math.min(progress, 100))}%` }} />
      </div>
    </Link>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      to={href}
      className="group rounded-[20px] border border-[#ece7df] bg-white p-3 text-center shadow-xs transition hover:-translate-y-0.5 hover:border-[#f0c667] hover:shadow-sm"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#fff9ee]">
        <img src={icon} alt="" className="h-9 w-9 object-contain transition group-hover:scale-105" />
      </div>
      <strong className="mt-2 block truncate text-[10.5px] font-black text-[#34353c]">{label}</strong>
    </Link>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="rounded-[19px] border border-[#ece7df] bg-white p-3 text-center shadow-xs">
      <img src={icon} alt="" className="mx-auto h-7 w-7 object-contain" />
      <strong className="mt-1.5 block text-[17px] font-black text-[#292a31]">{value.toLocaleString('vi-VN')}</strong>
      <span className="mt-0.5 block text-[9.5px] font-bold leading-tight text-[#8c8a91]">{label}</span>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Menu, Flame, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { claimDailyReward } from '@/src/features/rewards/repositories/rewardRepository';
import { useRealDashboard } from '@/src/features/dashboard/hooks/useRealDashboard';
import { DashboardLoading } from '@/src/features/dashboard/components/DashboardLoading';
import { courseWorkspaceTabs } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { assets } from '@/src/shared/lib/assets';

export default function TodayPage() {
  const { data, loading, refreshing, error, reason, refetch } = useRealDashboard();
  const navigate = useNavigate();
  const [claimingReward, setClaimingReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  useEffect(() => {
    if (reason === 'no-course') {
      navigate('/app/courses', { replace: true });
    }
  }, [navigate, reason]);

  if (loading) return <DashboardLoading />;
  if (reason === 'no-course') return <DashboardLoading />;
  if (error && !data) {
    return <DashboardError message={reason === 'active-course' ? 'Không thể xác định khóa học đang học. Dữ liệu của bạn vẫn được giữ nguyên.' : undefined} onRetry={refetch} />;
  }
  if (!data) return <DashboardError onRetry={refetch} />;

  const { profile, activeCourse, today, stats } = data;
  const dueCount = today.vocabularyDue;
  const nextLesson = activeCourse?.nextLesson;
  const defaultWorkspaceTab = courseWorkspaceTabs[0]?.id ?? 'vocabulary';

  const handleClaimReward = async () => {
    if (claimingReward || rewardClaimed) return;
    setClaimingReward(true);
    try {
      const res = await claimDailyReward();
      setRewardClaimed(true);
      setRewardToast(res.claimed ? `🎉 +${res.rewardXp} XP nhận thưởng thành công!` : 'Phần thưởng hôm nay đã được nhận.');
      refetch();
    } catch (reason: unknown) {
      setRewardToast(reason instanceof Error ? reason.message : 'Không thể nhận phần thưởng hôm nay.');
    } finally {
      setClaimingReward(false);
      setTimeout(() => setRewardToast(null), 3500);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[500px] space-y-4 px-3 pb-28 pt-2 sm:px-4">
      {(refreshing || error || data.warnings?.length) ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7def8] bg-[#faf8ff] px-3.5 py-2.5 text-[11px] font-semibold text-[#6f6680]" role={error ? 'alert' : 'status'}>
          <span>{error ? 'Dữ liệu đang được giữ lại trong lúc kết nối được khôi phục.' : refreshing ? 'Đang cập nhật dữ liệu học…' : 'Một số số liệu phụ chưa sẵn sàng.'}</span>
          {error ? <button type="button" onClick={refetch} className="shrink-0 font-black text-[#6f45d8]">Thử lại</button> : null}
        </div>
      ) : null}
      {/* Toast thông báo thưởng */}
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

      {/* 1. Hero Header Banner */}
      <section className="relative overflow-hidden rounded-[30px] bg-[#221640] p-4 text-white shadow-[0_12px_32px_rgba(25,12,50,0.18)]">
        {/* Nền phong cảnh Phú Sĩ & Torii */}
        <div className="absolute inset-0">
          <img
            src={assets.shared.backgrounds.fujiLandscape}
            alt="Fuji Landscape"
            className="h-full w-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160d2d]/95 via-[#1d123b]/50 to-[#190f33]/30" />
        </div>

        {/* Thanh Menu + Streak */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/95 text-[#1e1f29] shadow-sm backdrop-blur-xs transition-transform hover:scale-105 active:scale-95"
            aria-label="Menu"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3.5 py-1.5 text-center shadow-xs backdrop-blur-xs">
            <Flame size={15} className="fill-[#ff6b35] text-[#ff6b35]" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[12px] font-black text-[#1e1f29]">{stats.streak}</span>
              <span className="text-[8.5px] font-bold text-[#626472]">Ngày liên tiếp</span>
            </div>
          </div>
        </div>

        {/* Lời chào + Mascot cử nhân vẫy tay nháy mắt (01-mascot-hero-wave.png) */}
        <div className="relative z-10 mt-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-[22px] font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              <span>Xin chào, {profile.name}!</span>
              <span className="text-yellow-300">✨</span>
            </h1>
            <p className="mt-1 text-[12px] font-medium leading-snug text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Hôm nay là một ngày tuyệt vời để học tiếng Nhật!
            </p>
          </div>

          <div className="relative -mb-1 -mr-1 h-24 w-24 shrink-0 sm:h-28 sm:w-28">
            <img
              src={assets.shared.mascots.headerWaving}
              alt="Tanuki Mascot"
              className="h-full w-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {activeCourse ? (
          <Link
            to="/app/courses"
            aria-label={`Khóa đang học: ${activeCourse.title}. Mở quản lý khóa học`}
            className="relative z-10 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#d7c8f6] bg-[#f8f4ff]/95 px-3.5 py-3 text-[#221640] shadow-sm transition hover:border-[#6e46e6]"
          >
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#6e46e6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6e46e6]" aria-hidden="true" />
                Khóa đang học
              </span>
              <strong className="mt-1 block truncate text-[15px] font-black">{activeCourse.title}</strong>
              <span className="mt-0.5 block text-[11px] font-bold text-[#77718a]">
                Đã chọn · {activeCourse.progress}% hoàn thành
              </span>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6e46e6] text-sm font-black text-white" aria-hidden="true">
              ✓
            </span>
          </Link>
        ) : null}

        {/* Floating Lesson Card: Tiếp tục học (09-icon-open-book.png) */}
        <div className="relative z-10 mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-[#eee8f7] bg-white p-3.5 text-[#1e1f26] shadow-[0_8px_24px_rgba(15,10,35,0.14)]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center">
              <img
                src={assets.shared.dashboard.openBook}
                alt=""
                className="h-full w-full object-contain drop-shadow-2xs"
              />
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[10.5px] font-black uppercase tracking-wide text-[#6e46e6]">
                {nextLesson ? 'Tiếp tục học' : activeCourse ? 'Khóa học của bạn' : 'Bắt đầu học'}
              </span>
              <strong className="block truncate text-[14.5px] font-black text-[#191a22]">
                {nextLesson?.title ?? (activeCourse ? 'Chưa có bài học tiếp theo' : 'Bạn chưa có khóa học')}
              </strong>
              <span className="block truncate text-[11.5px] font-semibold text-[#767886]">
                {activeCourse ? (nextLesson ? activeCourse.title : 'Khám phá khóa học') : 'Chọn khóa Tokutei để bắt đầu'}
              </span>
              {activeCourse ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0ebf8]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7c4df2] to-[#6035d8]"
                      style={{ width: `${activeCourse.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-[#747684]">
                    {activeCourse.progress}%
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {activeCourse ? (
            <Link
              to={`/app/courses/${activeCourse.id}/workspace?tab=${defaultWorkspaceTab}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#6e46e6] to-[#552ad6] text-white shadow-[0_5px_16px_rgba(110,70,230,0.38)] transition-all hover:scale-105 active:scale-95"
              aria-label={nextLesson ? 'Tiếp tục học' : 'Khám phá khóa học'}
            >
              <ChevronRight size={20} strokeWidth={2.8} />
            </Link>
          ) : (
            <Link
              to="/app/courses"
              className="shrink-0 rounded-full bg-gradient-to-r from-[#6e46e6] to-[#552ad6] px-3 py-2 text-center text-[10px] font-black text-white shadow-[0_5px_16px_rgba(110,70,230,0.38)] transition-all hover:scale-105 active:scale-95"
            >
              Xem khóa học
            </Link>
          )}
        </div>
      </section>

      {/* 2. Nhiệm vụ hôm nay */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[15.5px] font-black tracking-tight text-[#1e1f26]">
              Nhiệm vụ hôm nay
            </h2>
            <button
              type="button"
              className="text-[#9698a4] hover:text-[#6e46e6]"
              title="Thông tin nhiệm vụ"
              aria-label="Thông tin nhiệm vụ"
            >
              <Info size={15} />
            </button>
          </div>

          {/* Treasure Box / XP Badge (19-badge-reward-30xp.png) */}
          <motion.button
            type="button"
            onClick={handleClaimReward}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7042e6] to-[#5a2fd8] py-1 pl-1.5 pr-3 text-[11.5px] font-black text-white shadow-[0_3px_12px_rgba(110,70,230,0.35)] transition-transform"
          >
            <img
              src={assets.shared.dashboard.chestGold}
              alt=""
              className="h-5 w-5 object-contain drop-shadow-xs"
            />
            <span>{rewardClaimed ? 'Đã nhận' : 'Nhận XP'}</span>
          </motion.button>
        </div>

        {/* 3 Mission Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Ôn từ vựng (03-mascot-vocab-writing.png) */}
          <Link
            to="/app/review/flashcards?mode=due"
            className="flex flex-col items-center justify-start rounded-[24px] border border-[#d6e7fc] bg-gradient-to-b from-[#f0f7ff] to-[#e4f0fc] p-3 text-center shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div>
              <strong className="block text-[13.5px] font-black text-[#2d6fd8]">Ôn từ vựng</strong>
              <span className="mt-0.5 block text-[11px] font-medium text-[#606272]">
                {dueCount > 0 ? `${dueCount} từ đến hạn` : 'Hôm nay chưa có từ cần ôn'}
              </span>
            </div>

            <div className="my-1.5 h-20 w-20 sm:h-22 sm:w-22">
              <img
                src={assets.shared.mascots.vocabWriting}
                alt="Ôn từ vựng"
                className="h-full w-full object-contain drop-shadow-2xs"
              />
            </div>

          </Link>

          {/* Card 2: Luyện tập (04-mascot-practice-pencil.png) */}
          <Link
            to="/app/practice"
            className="flex flex-col items-center justify-start rounded-[24px] border border-[#d3ecd5] bg-gradient-to-b from-[#f0fbf0] to-[#e3f6e4] p-3 text-center shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div>
              <strong className="block text-[13.5px] font-black text-[#2d9e48]">Luyện tập</strong>
              <span className="mt-0.5 block text-[11px] font-medium text-[#606272]">
                {today.exercises > 0 ? `${today.exercises} lượt ôn hôm nay` : 'Chưa có hoạt động hôm nay'}
              </span>
            </div>

            <div className="my-1.5 h-20 w-20 sm:h-22 sm:w-22">
              <img
                src={assets.shared.mascots.practicePencil}
                alt="Luyện tập"
                className="h-full w-full object-contain drop-shadow-2xs"
              />
            </div>

          </Link>

          {/* Card 3: Bài tiếp theo (05-mascot-next-lesson-n5.png) */}
          <Link
            to={activeCourse ? `/app/courses/${activeCourse.id}/workspace?tab=${defaultWorkspaceTab}` : '/app/courses'}
            className="flex flex-col items-center justify-start rounded-[24px] border border-[#fbe5cb] bg-gradient-to-b from-[#fdf5ea] to-[#faedd9] p-3 text-center shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div>
              <strong className="block text-[13.5px] font-black text-[#d6791e]">Bài tiếp theo</strong>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-[#606272]">
                {nextLesson?.title ?? 'Chưa có bài học tiếp theo'}
              </span>
            </div>

            <div className="my-1.5 h-20 w-20 sm:h-22 sm:w-22">
              <img
                src={assets.shared.mascots.nextLessonN5}
                alt="Bài tiếp theo"
                className="h-full w-full object-contain drop-shadow-2xs"
              />
            </div>

          </Link>
        </div>
      </section>

      {/* 3. Thành tích hôm nay */}
      <section className="relative overflow-hidden rounded-[26px] border border-[#d6c7f5] bg-gradient-to-r from-[#e3d8f8] via-[#e9defb] to-[#ded0f7] p-4 shadow-[0_4px_16px_rgba(110,70,230,0.08)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-black tracking-tight text-[#1e1f26]">
            Thành tích hôm nay
          </h2>
          <div className="flex items-center gap-1">
            <span className="text-xs">✨</span>
            <img
              src={assets.shared.mascots.faceWinking}
              alt="Mascot"
              className="h-8 w-8 object-contain drop-shadow-xs"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {/* 1. Đã ôn (07-icon-japanese-books.png) */}
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs">
            <img
              src={assets.shared.dashboard.bookStack}
              alt=""
              className="h-7 w-7 object-contain"
            />
            <strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">
              {stats.learnedWords} từ
            </strong>
            <span className="text-[9.5px] font-bold text-[#656775]">Từ đã nhớ</span>
          </div>

          {/* 2. Đã làm (08-icon-checklist.png) */}
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs">
            <img
              src={assets.shared.dashboard.checklist}
              alt=""
              className="h-7 w-7 object-contain"
            />
            <strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">
              {today.exercises} lượt
            </strong>
            <span className="text-[9.5px] font-bold text-[#656775]">Đã ôn hôm nay</span>
          </div>

          {/* 3. Thời gian học (15-icon-study-timer.png) */}
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs">
            <img
              src={assets.shared.dashboard.studyTimer}
              alt=""
              className="h-7 w-7 object-contain"
            />
            <strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">
              {stats.studyMinutes === null ? '—' : `${stats.studyMinutes} phút`}
            </strong>
            <span className="text-[9.5px] font-bold text-[#656775]">Thời gian học</span>
          </div>

          {/* 4. Điểm kinh nghiệm (16-icon-xp-star.png) */}
          <div className="flex flex-col items-center rounded-[18px] bg-white/85 p-2.5 text-center shadow-2xs backdrop-blur-xs">
            <img
              src={assets.shared.dashboard.xpStar}
              alt=""
              className="h-7 w-7 object-contain"
            />
            <strong className="mt-1 text-[12.5px] font-black text-[#1e1f26]">
              {stats.xp} XP
            </strong>
            <span className="text-[9.5px] font-bold text-[#656775]">Điểm kinh nghiệm</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[500px] items-center justify-center px-4 pb-28 pt-2">
      <div className="w-full rounded-[26px] border border-[#ece7f5] bg-white p-6 text-center shadow-sm">
        <strong className="block text-[16px] font-black text-[#202129]">Không thể tải dữ liệu</strong>
        <p className="mt-1 text-[12px] font-medium text-[#606272]">{message ?? 'Vui lòng thử lại sau giây lát.'}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-[#6e46e6] px-5 py-2 text-[12px] font-black text-white shadow-2xs"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

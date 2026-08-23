import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flame } from 'lucide-react';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import { getDueVocabularyCards } from '@/src/features/courses/repositories/learningProgressRepository';
import { fetchLearnerProfile } from '@/src/features/profile/repositories/profileRepository';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

const PURPLE = '#6f45d8';

export default function TodayPage() {
  const auth = useAuth();
  const courses = useCourseList();
  const streak = useProgressStore((state) => state.streak);
  const [displayName, setDisplayName] = useState('Học viên');
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const userId = auth.user?.id;
    if (!userId) return;
    let cancelled = false;
    fetchLearnerProfile(userId)
      .then((profile) => { if (!cancelled) setDisplayName(profile.displayName || 'Học viên'); })
      .catch(() => undefined);
    getDueVocabularyCards(100)
      .then((cards) => { if (!cancelled) setDueCount(cards.filter((card) => card.status !== 'new').length); })
      .catch(() => { if (!cancelled) setDueCount(0); });
    return () => { cancelled = true; };
  }, [auth.user?.id]);

  const enrolledCourses = useMemo(() => courses.data.filter((course) => course.isEnrolled !== false), [courses.data]);
  const currentCourse = enrolledCourses.find((course) => course.progress > 0 && course.progress < 100) ?? enrolledCourses[0];

  const tasks = [
    { icon: assets.shared.navigation.vocabulary, title: `${dueCount} từ cần ôn`, note: 'Khoảng 5 phút', action: 'ÔN NGAY', to: '/app/review/flashcards?mode=due' },
    { icon: assets.shared.navigation.practice, title: 'Bài luyện tập', note: '5 câu hỏi ngắn', action: 'LÀM NGAY', to: '/app/practice' },
    { icon: assets.courses.workspace.documents, title: 'Bài học tiếp theo', note: currentCourse?.title ?? 'Chọn khóa học', action: 'HỌC NGAY', to: currentCourse ? `/app/courses/${currentCourse.id}/learn` : '/app/courses' },
  ];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-[#17181d]">Xin chào, {displayName} 👋</h1>
          <p className="mt-1 text-[12px] font-medium text-[#8a8d98]">Hôm nay bạn sẽ học rất tuyệt!</p>
        </div>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ececf2] bg-white px-3 text-[11px] font-bold text-[#595b65] shadow-[0_2px_8px_rgba(25,25,40,.04)]">
          <Flame size={14} className="fill-[#ff8559] text-[#ff8559]" /> {streak} ngày
        </span>
      </header>

      {currentCourse ? (
        <section className="relative overflow-hidden rounded-[18px] border border-[#ded5f5] bg-[linear-gradient(135deg,#fbf9ff_0%,#f4efff_100%)] p-4 shadow-[0_8px_20px_rgba(85,62,150,.08)]">
          <div className="relative z-10 max-w-[70%]">
            <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#744de0]">Tiếp tục học</p>
            <h2 className="mt-2 text-[17px] font-extrabold text-[#191a20]">{currentCourse.title}</h2>
            <p className="mt-1 line-clamp-1 text-[11px] font-medium text-[#747782]">{currentCourse.description || 'Bài học gần nhất của khóa'}</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full" style={{ width: `${currentCourse.progress}%`, background: PURPLE }} />
              </div>
              <span className="text-[10px] font-extrabold text-[#6940ce]">{currentCourse.progress}%</span>
            </div>
            <Link to={`/app/courses/${currentCourse.id}/learn`} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#6f45d8] px-4 text-[11px] font-extrabold text-white shadow-[0_5px_12px_rgba(111,69,216,.24)]">
              TIẾP TỤC HỌC <ChevronRight size={14} />
            </Link>
          </div>
          <img src={assets.shared.mascots.brand} alt="Tanuki" className="absolute bottom-1 right-3 h-28 w-28 object-contain drop-shadow-md" />
        </section>
      ) : (
        <section className="rounded-[18px] border border-[#e5e5ed] bg-white p-5 shadow-[0_4px_14px_rgba(20,20,35,.05)]">
          <h2 className="text-[16px] font-extrabold text-[#1c1d22]">Bắt đầu khóa học đầu tiên</h2>
          <Link to="/app/courses" className="mt-3 inline-flex h-9 items-center rounded-lg bg-[#6f45d8] px-4 text-[11px] font-extrabold text-white">XEM KHÓA HỌC</Link>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[.05em] text-[#34353b]">Việc cần làm hôm nay</h2>
        <div className="overflow-hidden rounded-[14px] border border-[#e8e8ef] bg-white shadow-[0_3px_12px_rgba(20,20,35,.035)]">
          {tasks.map(({ icon, title, note, action, to }, index) => (
            <Link key={title} to={to} className={`flex min-h-[62px] items-center gap-3 px-3.5 py-2.5 ${index ? 'border-t border-[#eeeeF3]' : ''}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"><img src={icon} alt="" className="h-full w-full object-contain" /></span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-[12px] font-extrabold text-[#25262c]">{title}</strong>
                <small className="mt-0.5 block truncate text-[10px] font-medium text-[#9799a3]">{note}</small>
              </span>
              <span className="shrink-0 rounded-md border border-[#d9cff4] bg-[#faf8ff] px-2.5 py-1.5 text-[9px] font-extrabold text-[#7048d4]">{action}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[.05em] text-[#34353b]">Khóa học của bạn</h2>
          <Link to="/app/courses" className="text-[10px] font-semibold text-[#858893]">Xem tất cả ›</Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {enrolledCourses.slice(0, 3).map((course, index) => {
            const tones = ['from-[#ffe8e3] to-[#fff3ed]', 'from-[#dff7f7] to-[#eefcfc]', 'from-[#e4f6df] to-[#f2fbef]'];
            return (
              <Link key={course.id} to={`/app/courses/${course.id}/learn`} className={`min-h-[112px] rounded-[13px] border border-white/80 bg-gradient-to-br ${tones[index % tones.length]} p-3 shadow-[0_3px_10px_rgba(30,30,50,.04)]`}>
                <strong className="line-clamp-2 text-[10px] font-extrabold leading-4 text-[#34353b]">{course.title}</strong>
                <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/90"><div className="h-full rounded-full bg-[#6f45d8]" style={{ width: `${course.progress}%` }} /></div>
                <span className="mt-1 block text-[9px] font-bold text-[#666a75]">{course.progress}%</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

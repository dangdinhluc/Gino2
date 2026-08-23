import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Flame, RotateCcw, Target } from 'lucide-react';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import { getDueVocabularyCards } from '@/src/features/courses/repositories/learningProgressRepository';
import { fetchLearnerProfile } from '@/src/features/profile/repositories/profileRepository';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { assets } from '@/src/shared/lib/assets';

export default function TodayPage() {
  const auth = useAuth();
  const courses = useCourseList();
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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      <section className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#7b8796]">Xin chào,</p>
          <h1 className="font-[var(--font-heading)] text-2xl font-black text-[#172033]">{displayName} 👋</h1>
          <p className="mt-1 text-xs font-semibold text-[#8c97a8]">Hôm nay chỉ cần tập trung vào bước tiếp theo.</p>
        </div>
        <img src={assets.shared.mascots.brand} alt="Tokutei mascot" className="h-16 w-16 object-contain drop-shadow-sm" />
      </section>

      {currentCourse ? (
        <section className="relative overflow-hidden rounded-[28px] border border-[#f4d7bc] bg-gradient-to-br from-[#fffaf3] via-[#fff3e7] to-[#ffe4cb] p-5 shadow-[0_14px_32px_rgba(217,74,19,0.09)] sm:p-6">
          <div className="relative">
            <span className="inline-flex rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-[#d83a00]">Tiếp tục học</span>
            <h2 className="mt-3 font-[var(--font-heading)] text-xl font-black text-[#172033] sm:text-2xl">{currentCourse.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#687385]">{currentCourse.description}</p>
            <div className="mt-4 max-w-xl">
              <div className="flex items-center justify-between text-xs font-black text-[#6b7280]">
                <span>Tiến độ</span><span className="text-[#d83a00]">{currentCourse.progress}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/90">
                <div className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f59e0b]" style={{ width: `${currentCourse.progress}%` }} />
              </div>
            </div>
            <Link to={`/app/courses/${currentCourse.id}/learn`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#d83a00] px-5 text-sm font-black text-white shadow-lg shadow-orange-200/50">
              Tiếp tục học <ChevronRight size={17} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-[24px] border border-[#eedecf] bg-white p-5 shadow-2xs">
          <h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Bắt đầu khóa học đầu tiên</h2>
          <p className="mt-1 text-sm font-semibold text-[#7b8796]">Chọn một khóa phù hợp để Gino2 tạo nhịp học hằng ngày cho anh.</p>
          <Link to="/app/courses" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#d83a00] px-4 py-2.5 text-sm font-black text-white">Xem khóa học <ChevronRight size={16} /></Link>
        </section>
      )}

      <section>
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]">Việc cần làm hôm nay</p>
          <h2 className="font-[var(--font-heading)] text-xl font-black text-[#172033]">Học ngắn, rõ việc</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/app/review/flashcards?mode=due" className="group rounded-[22px] border border-[#eedecf] bg-white p-4 shadow-2xs hover:border-orange-300">
            <RotateCcw size={20} className="text-[#d83a00]" />
            <strong className="mt-3 block text-base font-black text-[#172033]">{dueCount} từ cần ôn</strong>
            <span className="mt-1 block text-xs font-semibold text-[#7b8796]">Khoảng 5 phút</span>
          </Link>
          <Link to="/app/practice" className="group rounded-[22px] border border-[#eedecf] bg-white p-4 shadow-2xs hover:border-orange-300">
            <Target size={20} className="text-[#d83a00]" />
            <strong className="mt-3 block text-base font-black text-[#172033]">Luyện nhanh</strong>
            <span className="mt-1 block text-xs font-semibold text-[#7b8796]">Câu hỏi, game, AI</span>
          </Link>
          <Link to="/app/courses" className="group rounded-[22px] border border-[#eedecf] bg-white p-4 shadow-2xs hover:border-orange-300">
            <BookOpen size={20} className="text-[#d83a00]" />
            <strong className="mt-3 block text-base font-black text-[#172033]">{enrolledCourses.length} khóa đang học</strong>
            <span className="mt-1 block text-xs font-semibold text-[#7b8796]">Chọn khóa muốn tiếp tục</span>
          </Link>
        </div>
      </section>

      <section className="rounded-[22px] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-2xs"><Flame size={20} /></span>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-black text-[#172033]">Muốn xem tiến độ chi tiết?</strong>
            <span className="text-xs font-semibold text-[#7b8796]">XP, hoạt động tuần và mức độ thành thạo được tách khỏi màn Hôm nay.</span>
          </div>
          <Link to="/app/progress" className="shrink-0 text-xs font-black text-[#d83a00]">Xem tiến độ</Link>
        </div>
      </section>
    </div>
  );
}

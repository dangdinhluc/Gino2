import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  GraduationCap,
  Headphones,
  Heart,
  Layers,
  Play,
  Sparkles,
  Star,
  type LucideIcon,
  Zap,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProgressStore } from '../store/progressStore';
import {
  getCourseDetailSeed,
  getCourseLessonCount,
  type CourseHighlightIcon,
} from '@/src/data/courseDetailMock';

const highlightIcons: Record<CourseHighlightIcon, LucideIcon> = {
  check: CheckCircle2,
  layers: Layers,
  headphones: Headphones,
  zap: Zap,
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const courseId = id || 'course-1';
  const course = getCourseDetailSeed(courseId);
  const totalLessons = getCourseLessonCount(course);
  const { courseProgress } = useProgressStore();
  const completedLessonIds = courseProgress[courseId]?.completedLessons ?? [];
  const completedCount = course.modules.reduce(
    (total, module) => total + module.lessons.filter((lesson) => completedLessonIds.includes(lesson.id) || lesson.completed).length,
    0,
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const nextLesson = course.modules.flatMap((module) => module.lessons).find((lesson) => !completedLessonIds.includes(lesson.id) && !lesson.completed && !lesson.locked);
  const nextActionLabel = nextLesson
    ? `${progress > 0 ? 'Tiếp tục' : 'Bắt đầu'}: ${nextLesson.title.replace(/^Bài \d+: /, '')}`
    : 'Mở khu học tập';

  const handleStartLearning = () => navigate(`/app/courses/${courseId}/learn`);

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] pb-6">
      <header className="sticky top-0 z-50 flex items-center gap-2 rounded-2xl border border-[#e8dccb] bg-[#f8f4ee]/92 px-2 py-2 backdrop-blur-md md:px-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Quay lại" className={`rounded-xl p-2 text-[#172033] transition-colors hover:bg-[#f1ebe2] ${focusRing}`}>
          <ChevronLeft size={22} />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#172033]">Giới thiệu khóa học</p>
        <span className="hidden rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800 sm:inline-flex">{course.level}</span>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-5 pt-4">
        <section className="overflow-hidden rounded-2xl border border-[#e0d2bf] bg-[#fffaf3]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-5 md:p-8">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg bg-orange-50 px-2.5 py-1 font-bold text-orange-800">{course.level}</span>
                <span className="inline-flex items-center gap-1 text-[#4d5a6b]"><Star size={13} className="fill-amber-500 text-amber-500" /> <b className="text-[#172033]">{course.rating}</b> · {course.students} học viên</span>
              </div>
              <h1 className="mt-4 max-w-2xl font-[var(--font-heading)] text-3xl font-bold leading-tight tracking-[-0.03em] text-[#172033] md:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4d5a6b]">{course.description}</p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-3.5"><Clock size={17} className="text-orange-700" /><p className="mt-2 text-xs text-[#5f6b7c]">Tổng thời lượng</p><p className="mt-0.5 font-bold text-[#172033]">{course.duration}</p></div>
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-3.5"><BookOpen size={17} className="text-orange-700" /><p className="mt-2 text-xs text-[#5f6b7c]">Lộ trình</p><p className="mt-0.5 font-bold text-[#172033]">{totalLessons} bài ngắn</p></div>
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-3.5"><GraduationCap size={17} className="text-orange-700" /><p className="mt-2 text-xs text-[#5f6b7c]">Hình thức</p><p className="mt-0.5 font-bold text-[#172033]">Tự học linh hoạt</p></div>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[linear-gradient(145deg,#24334b_0%,#172033_60%,#3f536e_100%)] p-5 text-white md:p-8">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-orange-200"><Sparkles size={14} /> Lộ trình đề xuất</span>
                <h2 className="mt-4 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em]">Học ít, dùng được ngay.</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-200">Mỗi lần vào học, anh chỉ cần làm một bài ngắn rồi ôn lại đúng phần cần nhớ.</p>
              </div>
              <div className="mt-8 rounded-xl border border-white/15 bg-white/10 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200"><span>Tiến độ của anh</span><span>{progress}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-orange-400" /></div>
                <p className="mt-2 text-xs text-slate-200">{completedCount}/{totalLessons} bài đã hoàn thành</p>
              </div>
              <button type="button" onClick={handleStartLearning} className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-400 ${focusRing}`}>
                <Play size={16} className="fill-white" /> {nextActionLabel}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Heart size={19} className="fill-orange-700" /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-800">Khóa này giúp anh</p><h2 className="font-[var(--font-heading)] text-xl font-bold text-[#172033]">Sẵn sàng cho bước Tokutei đầu tiên</h2></div></div>
            <ul className="mt-5 space-y-3">
              {course.overviewPoints.map((point) => <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-[#4d5a6b]"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><Check size={13} strokeWidth={3} /></span>{point}</li>)}
            </ul>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {course.highlights.map((item) => {
              const Icon = highlightIcons[item.icon];
              return <div key={item.title} className="rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Icon size={18} /></span><h3 className="mt-3 font-bold text-[#172033]">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-[#4d5a6b]">{item.description}</p></div>;
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-800">Cách học đơn giản</p><h2 className="mt-1 font-[var(--font-heading)] text-xl font-bold text-[#172033]">Bắt đầu đúng một việc</h2></div><button type="button" onClick={handleStartLearning} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white hover:bg-orange-800 ${focusRing}`}>{nextActionLabel}<ArrowRight size={16} /></button></div>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            <li className="rounded-xl border border-orange-200 bg-orange-50/65 p-4"><span className="text-xs font-bold text-orange-800">01 · 10–15 phút</span><h3 className="mt-2 font-bold text-[#172033]">Học một bài</h3><p className="mt-1 text-sm text-[#4d5a6b]">Theo đúng thứ tự lộ trình, không cần tự chọn lung tung.</p></li>
            <li className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4"><span className="text-xs font-bold text-[#5f6b7c]">02 · 3–5 phút</span><h3 className="mt-2 font-bold text-[#172033]">Ôn ngay phần vừa học</h3><p className="mt-1 text-sm text-[#4d5a6b]">Dùng từ vựng, tài liệu và câu hỏi ngắn của chính khóa này.</p></li>
            <li className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4"><span className="text-xs font-bold text-[#5f6b7c]">03 · Khi rảnh</span><h3 className="mt-2 font-bold text-[#172033]">Luyện thêm nếu muốn</h3><p className="mt-1 text-sm text-[#4d5a6b]">Game, podcast và thi thử là phần bổ trợ, không bắt buộc.</p></li>
          </ol>
        </section>

        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5">
          <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-800">Lộ trình khóa học</p><h2 className="mt-1 font-[var(--font-heading)] text-xl font-bold text-[#172033]">Anh sẽ học gì?</h2></div><span className="text-sm text-[#5f6b7c]">{course.modules.length} phần · {totalLessons} bài</span></div>
          <ol className="mt-4 overflow-hidden rounded-xl border border-[#e8dccb] bg-[#fffdf8]">
            {course.modules.map((module, index) => <li key={module.title} className="flex gap-3 border-b border-[#efe5d7] px-4 py-4 last:border-b-0"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-800">{index + 1}</span><span className="min-w-0 flex-1"><span className="block font-bold text-[#172033]">{module.title}</span><span className="mt-1 block text-sm text-[#5f6b7c]">{module.lessons.length} bài · {module.lessons.map((lesson) => lesson.title.replace(/^Bài \d+: /, '')).join(' · ')}</span></span></li>)}
          </ol>
          {nextLesson && <p className="mt-3 text-sm text-[#5f6b7c]">Bài tiếp theo: <b className="text-[#172033]">{nextLesson.title}</b></p>}
        </section>
      </main>
    </div>
  );
}

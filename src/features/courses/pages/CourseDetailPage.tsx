import { motion } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  GraduationCap,
  Headphones,
  Heart,
  Layers,
  Play,
  Star,
  Zap,
  type LucideIcon,
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

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const courseId = id || 'course-1';

  const course = getCourseDetailSeed(courseId);
  const totalLessons = getCourseLessonCount(course);

  const { courseProgress } = useProgressStore();
  const progressData = courseProgress[courseId] || { completedLessons: [] };
  const completedLessonIds = progressData.completedLessons ?? [];

  const completedCount = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.filter(
        (lesson) => completedLessonIds.includes(lesson.id) || lesson.completed
      ).length,
    0
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const overviewStats = [
    { label: 'Thời lượng', value: course.duration, icon: Clock },
    { label: 'Bài học', value: `${totalLessons} bài`, icon: BookOpen },
    { label: 'Cấp độ', value: course.level, icon: GraduationCap },
  ];

  const handleStartLearning = () => {
    navigate(`/app/courses/${courseId}/learn`);
  };

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] pb-4">
      <div className="sticky top-0 z-50 flex items-center gap-2 rounded-2xl border border-[#e8dccb] bg-[#f8f4ee]/92 px-2 py-2 backdrop-blur-md md:px-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="rounded-xl p-2 text-[#172033] transition-colors hover:bg-[#f1ebe2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-[#172033]">Giới thiệu khóa học</h2>
      </div>

      <div className="mx-auto w-full max-w-[1120px] space-y-4 pt-4">
        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3]">
          <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1 font-bold text-orange-700">
                  {course.level}
                </span>
                <span className="flex items-center gap-1 text-[#5f6b7c]">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  <span className="font-bold text-[#172033]">{course.rating}</span>
                </span>
                <span className="text-[#7b8796]">{course.students} học viên</span>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-[#4d5a6b]">{course.description}</p>
                <ul className="grid gap-2 text-sm leading-relaxed text-[#4d5a6b]">
                  {course.overviewPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                {overviewStats.map((item) => (
                  <div key={item.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3.5 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#7b8796]">
                      <item.icon size={13} strokeWidth={1.8} />
                      {item.label}
                    </div>
                    <div className="mt-1.5 font-bold text-[#172033]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4">
              <p className="text-sm text-[#5f6b7c]">Tiến độ hiện tại</p>
              <div className="mt-1 font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033]">
                {progress}%
              </div>
              <p className="mt-0.5 text-sm text-[#7b8796]">
                {completedCount > 0
                  ? `${completedCount}/${totalLessons} bài đã xong`
                  : 'Chưa bắt đầu bài học nào'}
              </p>

              <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[#efe5d7]">
                <div className="h-full rounded-full bg-orange-600" style={{ width: `${progress}%` }} />
              </div>

              <button
                type="button"
                onClick={handleStartLearning}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf8]"
              >
                <Play size={16} className="fill-white" />
                {progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
              </button>
              <p className="mt-2.5 text-center text-xs leading-relaxed text-[#7b8796]">
                Khu học tập có từ vựng, tài liệu, ôn tập, game và thi thử.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Heart size={19} className="fill-orange-700" />
              </span>
              <div>
                <p className="text-xs text-[#7b8796]">Phù hợp với</p>
                <h3 className="font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">
                  Người mới vào track Tokutei
                </h3>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#4d5a6b]">
              <p>Khóa này đi từ lời chào đầu ca, cụm từ sống còn, hồ sơ và các câu trả lời phỏng vấn cơ bản.</p>
              <p>
                Anh có thể học theo phiên ngắn 10-15 phút, sau đó chuyển sang ôn tập hoặc thi thử để chốt ngay phần
                vừa học.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {course.highlights.map((item) => {
              const HighlightIcon = highlightIcons[item.icon];
              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4"
                >
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <HighlightIcon size={18} strokeWidth={1.8} />
                  </span>
                  <h4 className="font-bold text-[#172033]">{item.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5f6b7c]">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">
                Lộ trình học
              </h3>
              <p className="mt-0.5 text-sm text-[#5f6b7c]">
                {course.modules.length} phần · {totalLessons} bài
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartLearning}
              className="w-fit rounded-xl bg-orange-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]"
            >
              Đi tới khu học tập
            </button>
          </div>

          <ol className="divide-y divide-[#efe5d7] overflow-hidden rounded-xl border border-[#e8dccb] bg-[#fffdf8]">
            {course.modules.map((module, index) => (
              <li key={module.title} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-700">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#172033]">{module.title}</span>
                  <span className="mt-0.5 block text-sm text-[#7b8796]">{module.lessons.length} bài học</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

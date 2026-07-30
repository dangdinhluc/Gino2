import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Play,
  Lock,
  CheckCircle2,
  Star,
  Clock,
  BookOpen,
  GraduationCap,
  FileText,
  Volume2,
  Layers,
  Zap,
  Heart,
  Headphones,
  X,
  Pause,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useProgressStore } from '../store/progressStore';
import {
  getCourseDetailSeed,
  getCourseLessonCount,
  type CourseHighlightIcon,
  type CourseResourceKind,
} from '@/src/data/courseDetailMock';

type CourseTab = 'lessons' | 'vocab' | 'docs' | 'review';

const highlightIcons: Record<CourseHighlightIcon, LucideIcon> = {
  check: CheckCircle2,
  layers: Layers,
  headphones: Headphones,
  zap: Zap,
};

const resourceIcons: Record<CourseResourceKind, LucideIcon> = {
  pdf: FileText,
  audio: Volume2,
};

const resourceKindLabels: Record<CourseResourceKind, string> = {
  pdf: 'PDF',
  audio: 'MP3',
};

const tabs: Array<{ id: CourseTab; label: string; icon: LucideIcon }> = [
  { id: 'lessons', label: 'Bài học', icon: BookOpen },
  { id: 'vocab', label: 'Từ vựng', icon: Layers },
  { id: 'docs', label: 'Tài liệu', icon: FileText },
  { id: 'review', label: 'Ôn tập', icon: Zap },
];

export default function CourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const courseId = id || 'course-1';
  const isLearningView = location.pathname.endsWith('/learn');

  const course = getCourseDetailSeed(courseId);
  const totalLessons = getCourseLessonCount(course);

  const { courseProgress } = useProgressStore();
  const progressData = courseProgress[courseId] || { completedLessons: [] };
  const completedLessonIds = progressData.completedLessons ?? [];

  const isLessonCompleted = (lessonId: string, completedInSeed: boolean) =>
    completedLessonIds.includes(lessonId) || completedInSeed;

  const completedCount = course.modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => isLessonCompleted(lesson.id, lesson.completed)).length,
    0
  );
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const [activeTab, setActiveTab] = useState<CourseTab>('lessons');
  const [showPodcast, setShowPodcast] = useState(false);
  const [playingPodcastId, setPlayingPodcastId] = useState<number | null>(null);

  const overviewStats = [
    { label: 'Thời lượng', value: course.duration, icon: Clock },
    { label: 'Bài học', value: `${totalLessons} bài`, icon: BookOpen },
    { label: 'Cấp độ', value: course.level, icon: GraduationCap },
  ];

  const handleStartLearning = () => {
    navigate(`/app/courses/${courseId}/learn`);
  };

  if (!isLearningView) {
    return (
      <div className="min-h-[calc(100dvh-1.5rem)] pb-4">
        <div className="sticky top-0 z-50 flex items-center gap-3 rounded-2xl border border-[#e6ddd1] bg-[#f8f4ee]/90 px-3 py-2.5 shadow-[0_16px_34px_-30px_rgba(148,163,184,0.16)] backdrop-blur-md md:px-4 md:py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
            className="-ml-2 rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <h2 className="min-w-0 flex-1 truncate text-sm font-black text-gray-800">Giới thiệu khóa học</h2>
        </div>

        <div className="mx-auto w-full max-w-[1320px] space-y-6 pt-4">
          <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf4] shadow-[0_20px_44px_-36px_rgba(148,163,184,0.22)]">
            <div className="grid gap-6 px-4 py-5 sm:px-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:p-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-orange-200 bg-[#fff3e6] px-3 py-1 text-xs font-black text-orange-700">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-[#fff7e8] px-3 py-1 text-amber-700">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black">{course.rating}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{course.students} học viên đang học</span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-gray-900 md:text-5xl">
                    {course.title}
                  </h1>
                  <p className="max-w-2xl text-base font-medium leading-7 text-gray-600 md:text-lg">
                    {course.description}
                  </p>
                  <ul className="grid gap-2.5 text-sm font-semibold leading-relaxed text-gray-600">
                    {course.overviewPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {overviewStats.map((item) => (
                    <div key={item.label} className="rounded-[1.35rem] border border-[#ece4d8] bg-white px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                        <item.icon size={14} />
                        {item.label}
                      </div>
                      <div className="mt-2 text-lg font-black text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_34px_-30px_rgba(148,163,184,0.22)]">
                <p className="text-sm font-bold text-gray-500">Tiến độ hiện tại</p>
                <div className="mt-1 text-3xl font-black tracking-tight text-gray-900">{progress}%</div>
                <p className="text-sm font-semibold text-gray-500">
                  {completedCount > 0
                    ? `${completedCount}/${totalLessons} bài đã xong`
                    : 'Chưa bắt đầu bài học nào'}
                </p>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#efe5d7]">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
                </div>

                <button
                  type="button"
                  onClick={handleStartLearning}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-orange-600 active:scale-[0.99]"
                >
                  <Play size={18} className="fill-white" />
                  {progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                </button>
                <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-gray-500">
                  Khu học tập có bài học, từ vựng, tài liệu và ôn tập.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_46px_-38px_rgba(148,163,184,0.18)] md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                  <Heart size={22} className="fill-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-700">Phù hợp với</p>
                  <h3 className="text-xl font-black text-gray-900">Người mới vào track Tokutei</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm font-medium leading-relaxed text-gray-600">
                <p>Khóa này đi từ lời chào đầu ca, cụm từ sống còn, hồ sơ và các câu trả lời phỏng vấn cơ bản.</p>
                <p>
                  Anh có thể học theo phiên ngắn 10-15 phút, sau đó chuyển sang ôn tập hoặc mock để chốt ngay phần
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
                    className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_18px_36px_-32px_rgba(148,163,184,0.16)]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#fff7ed] text-orange-500">
                      <HighlightIcon size={20} />
                    </div>
                    <h4 className="text-base font-black text-gray-900">{item.title}</h4>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">{item.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_46px_-38px_rgba(148,163,184,0.18)] md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-black tracking-tight text-gray-900">Lộ trình học</h3>
              <button
                type="button"
                onClick={handleStartLearning}
                className="w-fit rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02]"
              >
                Đi tới khu học tập
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {course.modules.map((module, index) => (
                <div key={module.title} className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffdf8] p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                      {index + 1}
                    </div>
                    <h4 className="text-sm font-black text-gray-800">{module.title}</h4>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {module.lessons.length} bài học, học theo thứ tự để không bị hụt nền.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] pb-4">
      <div className="sticky top-0 z-50 flex items-center gap-3 rounded-2xl border border-[#e6ddd1] bg-[#f8f4ee]/90 px-3 py-2.5 shadow-[0_16px_34px_-30px_rgba(148,163,184,0.16)] backdrop-blur-md md:px-4 md:py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="-ml-2 rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]"
        >
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-black text-gray-800">{course.title}</h2>
      </div>

      <div className="w-full">
        <div className="mx-auto w-full max-w-[1320px] pt-4">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,rgba(255,249,240,0.98)_0%,rgba(247,242,234,0.98)_52%,rgba(242,236,226,0.98)_100%)] shadow-[0_28px_60px_-42px_rgba(180,138,91,0.24)]">
            <div className="absolute inset-0">
              <img src={course.image} className="h-full w-full object-cover opacity-[0.08]" alt="" />
              <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-orange-100/45 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-5 md:p-8 lg:flex-row lg:items-end lg:justify-between xl:p-10">
              <div className="max-w-2xl flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-orange-200 bg-[#fff3e6] px-3 py-1 text-xs font-black text-orange-700">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-[#fff7e8] px-3 py-1 text-amber-700">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black">{course.rating}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">{course.students} học viên</span>
                </div>

                <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">{course.title}</h1>

                <p className="max-w-lg text-sm font-medium leading-relaxed text-gray-600 md:text-base">
                  {course.description}
                </p>

                <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-1 pt-2 text-gray-600">
                  <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#e6ddd1] bg-[#fffaf3]/90 px-3 py-2 text-xs font-bold">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#e6ddd1] bg-[#fffaf3]/90 px-3 py-2 text-xs font-bold">
                    <BookOpen size={16} />
                    <span>{totalLessons} bài học</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPodcast(true)}
                    className="flex items-center gap-2 whitespace-nowrap rounded-full bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-[0_16px_32px_-24px_rgba(249,115,22,0.65)] transition-transform active:scale-[0.97]"
                  >
                    <Headphones size={15} />
                    <span>Nghe Podcast</span>
                  </button>
                </div>
              </div>

              <div className="w-full shrink-0 rounded-[2rem] border border-[#eadfce] bg-[#fffaf3]/92 p-5 shadow-[0_22px_42px_-30px_rgba(148,163,184,0.18)] md:w-80">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-600">Tiến độ</h3>
                  <span className="text-sm font-black text-orange-600">{progress}%</span>
                </div>
                <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-[#efe5d7]">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
                </div>
                <button
                  type="button"
                  onClick={handleStartLearning}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-sm font-black text-white shadow-[0_18px_36px_-26px_rgba(249,115,22,0.65)] transition-transform active:scale-[0.98]"
                >
                  <Play size={18} className="fill-white" /> Vào màn học tập
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl space-y-6 py-6 md:px-4">
          <div className="flex justify-center">
            <div className="no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[#e6ddd1] bg-[#fffaf3]/95 p-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id}
                  className={cn(
                    'flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-black transition-all sm:px-6',
                    activeTab === tab.id
                      ? 'border border-orange-200 bg-[#fff3e6] text-orange-700'
                      : 'text-gray-500 hover:bg-[#f5efe6] hover:text-gray-700'
                  )}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'lessons' && (
                <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
                  {course.modules.map((module) => (
                    <div
                      key={module.title}
                      className="space-y-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_40px_-32px_rgba(148,163,184,0.16)] md:p-6"
                    >
                      <h4 className="text-sm font-black text-gray-800">{module.title}</h4>
                      <div className="space-y-3">
                        {module.lessons.map((lesson) => {
                          const isCompleted = isLessonCompleted(lesson.id, lesson.completed);
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              disabled={lesson.locked}
                              onClick={() => navigate(`/app/courses/${courseId}/lessons/${lesson.id}`)}
                              className={cn(
                                'flex w-full items-center gap-4 rounded-[1.5rem] border p-4 text-left transition-all',
                                isCompleted && 'border-emerald-200 bg-emerald-50/60',
                                lesson.locked && 'cursor-not-allowed border-[#ece4d8] bg-[#f5efe6] opacity-60',
                                !isCompleted &&
                                  !lesson.locked &&
                                  'border-[#e8dece] bg-[#fffdf9] hover:border-orange-200 active:scale-[0.99]'
                              )}
                            >
                              <div
                                className={cn(
                                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                  isCompleted
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : lesson.locked
                                      ? 'bg-gray-200 text-gray-400'
                                      : 'bg-orange-50 text-orange-500'
                                )}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={20} />
                                ) : lesson.locked ? (
                                  <Lock size={18} />
                                ) : (
                                  <Play size={16} className="ml-0.5 fill-orange-500" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="truncate text-sm font-black text-gray-800">{lesson.title}</h5>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                  <Clock size={12} /> {lesson.duration}
                                  {lesson.locked ? ' · Chưa mở' : ''}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'vocab' && (
                <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
                  <div className="flex flex-col gap-4 rounded-[2rem] border border-[#eadfce] bg-[#fff8f0] p-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#fffaf3]">
                      <Layers className="text-orange-500" size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-gray-800">Bộ từ vựng khóa học</h4>
                      <p className="text-xs font-bold text-gray-500">{course.vocabulary.length} cụm từ</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/app/grammar')}
                      className="whitespace-nowrap rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-black text-white shadow-[0_16px_30px_-22px_rgba(249,115,22,0.65)] transition-transform active:scale-[0.97]"
                    >
                      Mở thư viện
                    </button>
                  </div>

                  <div className="divide-y divide-[#efe6da] overflow-hidden rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3]">
                    {course.vocabulary.map((item) => (
                      <div
                        key={item.word}
                        className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-[#f8f3ec]"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-black text-gray-800">{item.word}</h4>
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-black text-blue-600">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-500">{item.meaning}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Nghe phát âm ${item.word}`}
                          className="shrink-0 rounded-xl border border-[#e6ddd1] bg-[#fffdf9] p-3 text-gray-500 transition-all hover:border-orange-200 hover:bg-[#fff3e6] hover:text-orange-600 active:scale-[0.95]"
                        >
                          <Volume2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
                  {course.resources.map((resource) => {
                    const ResourceIcon = resourceIcons[resource.kind];
                    return (
                      <button
                        key={resource.title}
                        type="button"
                        className="group flex items-center gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 text-left transition-all hover:border-orange-200"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e8dece] bg-[#fffdf9] text-gray-500 transition-all group-hover:bg-[#fff3e6] group-hover:text-orange-600">
                          <ResourceIcon size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-black text-gray-800">{resource.title}</h4>
                          <p className="text-xs font-bold text-gray-500">
                            {resourceKindLabels[resource.kind]} · {resource.size}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'review' && (
                <div className="mx-auto max-w-2xl">
                  <div className="space-y-5 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fff8f0] p-5 text-center md:space-y-6 md:p-8">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-[#eadfce] bg-[#fff3e6] text-orange-500">
                      <Zap size={38} className="fill-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-800">Chốt lại module</h3>
                      <p className="text-sm font-semibold text-gray-500">
                        Làm {course.reviewSession.questionCount} câu hỏi ngắn để khóa lại phần đầu ca, hồ sơ và tự
                        giới thiệu.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-[#e8dece] bg-[#fffaf3] p-3">
                        <p className="mb-1 text-xs font-bold text-gray-500">Mục tiêu</p>
                        <p className="text-sm font-black text-gray-800">{course.reviewSession.questionCount} câu</p>
                      </div>
                      <div className="rounded-2xl border border-[#e8dece] bg-[#fffaf3] p-3">
                        <p className="mb-1 text-xs font-bold text-gray-500">Thời gian</p>
                        <p className="text-sm font-black text-gray-800">{course.reviewSession.minutes} phút</p>
                      </div>
                      <div className="rounded-2xl border border-[#e8dece] bg-[#fffaf3] p-3">
                        <p className="mb-1 text-xs font-bold text-gray-500">XP</p>
                        <p className="text-sm font-black text-gray-800">+{course.reviewSession.xp}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/app/review/flashcards')}
                      className="w-full rounded-2xl bg-orange-500 py-4 text-sm font-black text-white shadow-[0_18px_36px_-24px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.01] active:scale-[0.98]"
                    >
                      Bắt đầu phiên ôn
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showPodcast && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPodcast(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-podcast-title"
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[80vh] w-full flex-col rounded-t-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 md:left-1/2 md:top-1/2 md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem]"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 id="course-podcast-title" className="text-xl font-black tracking-tight text-gray-800">
                    Nghe lại module
                  </h3>
                  <p className="text-xs font-bold text-gray-500">Phiên audio ngắn để giữ tai quen nhịp Tokutei</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPodcast(false)}
                  aria-label="Đóng danh sách podcast"
                  className="shrink-0 rounded-full bg-[#f5efe6] p-2 transition-colors hover:bg-[#eee6dc]"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {playingPodcastId !== null && (
                <div className="mb-5 flex shrink-0 items-center gap-4 rounded-2xl border border-[#eadfce] bg-[#fff8f0] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500">
                    <Volume2 size={22} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-orange-700">Đang chọn</p>
                    <h4 className="truncate text-sm font-bold text-gray-800">
                      {course.podcasts.find((episode) => episode.id === playingPodcastId)?.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlayingPodcastId(null)}
                    aria-label="Bỏ chọn episode"
                    className="shrink-0 p-2 text-gray-500 transition-colors hover:text-orange-600"
                  >
                    <Pause size={22} className="fill-current" />
                  </button>
                </div>
              )}

              <div className="no-scrollbar -mx-6 flex-1 space-y-2 overflow-y-auto px-6 pb-2">
                {course.podcasts.map((episode) => (
                  <button
                    key={episode.id}
                    type="button"
                    onClick={() => setPlayingPodcastId(episode.id)}
                    aria-pressed={playingPodcastId === episode.id}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                      playingPodcastId === episode.id
                        ? 'border-orange-200 bg-[#fffaf3]'
                        : 'border-[#eee5d9] bg-[#f8f3ec] hover:bg-[#fffaf3]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                        playingPodcastId === episode.id
                          ? 'bg-orange-500 text-white'
                          : 'border border-[#e6ddd1] bg-[#fffdf9] text-gray-500'
                      )}
                    >
                      {playingPodcastId === episode.id ? (
                        <Volume2 size={18} />
                      ) : (
                        <Play size={18} className="translate-x-[1px] fill-current" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-sm font-bold',
                          playingPodcastId === episode.id ? 'text-orange-700' : 'text-gray-700'
                        )}
                      >
                        {episode.title}
                      </span>
                      <span className="block text-xs font-semibold text-gray-500">{episode.duration}</span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

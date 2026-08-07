import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  X,
  AlertTriangle,
  PlayCircle,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import { assetPath } from '@/src/shared/lib/assets';

const ALL_LEVELS = 'Tất cả';

export default function CourseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeLevel, setActiveLevel] = useState(ALL_LEVELS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const courseList = useCourseList();
  const courses = courseList.data;
  const isLoadingFromSupabase = courseList.status === 'loading';
  const levels = useMemo(
    () => [ALL_LEVELS, ...Array.from(new Set(courses.map((course) => course.level)))],
    [courses]
  );

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    setIsSearching(false);
  }, [searchQuery]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return courses.filter((course) => {
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query);
      const matchesLevel = activeLevel === ALL_LEVELS || course.level === activeLevel;
      return matchesQuery && matchesLevel;
    });
  }, [searchQuery, activeLevel, courses]);

  const hasActiveLevelFilter = activeLevel !== ALL_LEVELS;
  const isFiltering = hasActiveLevelFilter || searchQuery.trim() !== '';

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-20">
      {/* 1. Hero Header Banner */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] px-4 py-4.5 shadow-2xs sm:px-6 sm:py-6">
        {/* Watermark Kanji */}
        <div
          className="pointer-events-none absolute left-4 top-1 select-none text-4xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          学
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0 max-w-lg">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#d83a00] shadow-2xs">
              <Sparkles size={13} className="text-amber-500 fill-amber-400" /> Khóa học Tokutei
            </div>
            <h1 className="mt-2 font-[var(--font-heading)] text-2xl font-black tracking-[-0.03em] text-[#0f172a] sm:text-3xl">
              Chương trình Học tập
            </h1>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm">
              Luyện tiếng Nhật sống còn, phản xạ ca làm & đề thi mô phỏng Tokutei chuẩn hóa.
            </p>
          </div>

          {/* Right 3D Illustration */}
          <div className="relative shrink-0 hidden sm:block">
            <img
              src={assetPath('assets/nav-icons/nav_courses.png')}
              alt="Tokutei Courses"
              className="h-16 w-auto object-contain drop-shadow-md sm:h-20"
            />
          </div>
        </div>
      </section>

      <CourseListErrorNotice result={courseList} />

      {/* 2. Search & Filter Bar */}
      <section className="sticky top-[68px] z-30 rounded-[22px] border border-[#eee3d5] bg-white/95 backdrop-blur-md p-2.5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="group relative flex-1 min-w-0">
            {isSearching ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#d83a00]" size={18} strokeWidth={2} />
            ) : (
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af] transition-colors group-focus-within:text-[#d83a00]"
                size={18}
                strokeWidth={2}
              />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm khóa học, bài học hoặc nội dung..."
              className="w-full rounded-2xl border border-[#eee3d5] bg-[#fffcf9] py-2.5 pl-10 pr-9 text-xs font-bold text-[#0f172a] outline-none transition-all placeholder:text-[#95a0af] focus:border-[#d83a00] focus:bg-white focus:ring-2 focus:ring-[#d83a00]/15 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Button (Mobile Sheet Trigger) */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className={cn(
              'relative flex h-10 px-3 shrink-0 items-center justify-center gap-1.5 rounded-2xl border text-xs font-extrabold transition-all duration-200 shadow-2xs md:hidden active:scale-95',
              hasActiveLevelFilter
                ? 'border-[#d83a00] bg-orange-50 text-[#d83a00]'
                : 'border-[#eee3d5] bg-[#fffcf9] text-[#5f6b7c] hover:text-[#0f172a]'
            )}
            aria-label="Mở bộ lọc khóa học"
            aria-haspopup="dialog"
            aria-expanded={isFilterSheetOpen}
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            <span>Lọc</span>
            {hasActiveLevelFilter && (
              <span className="h-2 w-2 rounded-full bg-[#d83a00] animate-pulse" />
            )}
          </button>
        </div>

        {/* Level Category Pills (Desktop & Tablet) */}
        <div className="hidden flex-wrap items-center gap-1.5 pt-1 md:flex">
          {levels.map((level) => {
            const isActive = activeLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setActiveLevel(level)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 shadow-2xs',
                  isActive
                    ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-xs'
                    : 'border border-[#eee3d5] bg-[#fffcf9] text-[#5f6b7c] hover:border-orange-200 hover:text-[#0f172a]'
                )}
              >
                {level === ALL_LEVELS ? level : `Cấp độ: ${level}`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Bottom Sheet (Mobile) */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end bg-black/60 p-3 pb-[calc(5.8rem+env(safe-area-inset-bottom))] backdrop-blur-xs md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-filter-title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-[28px] border border-[#eee3d5] bg-white p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3">
                <h3 id="course-filter-title" className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
                  Chọn cấp độ khóa học
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                  aria-label="Đóng bộ lọc"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {levels.map((level) => {
                  const isActive = activeLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setActiveLevel(level);
                        setIsFilterSheetOpen(false);
                      }}
                      className={cn(
                        'rounded-xl px-4 py-2 text-xs font-extrabold transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-xs'
                          : 'border border-[#eee3d5] bg-slate-50 text-[#5f6b7c]'
                      )}
                    >
                      {level === ALL_LEVELS ? level : `Cấp độ: ${level}`}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Course Cards Grid */}
      {isSearching || isLoadingFromSupabase ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="flex h-72 animate-pulse flex-col space-y-3 rounded-[24px] border border-[#eee3d5] bg-white p-5 shadow-2xs"
            >
              <div className="h-32 w-full rounded-2xl bg-slate-100" />
              <div className="h-5 w-2/3 rounded-lg bg-slate-100" />
              <div className="h-4 w-full rounded-lg bg-slate-100" />
              <div className="mt-auto h-11 w-full rounded-2xl bg-slate-100" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/app/courses/${course.id}/learn`}
                  className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#f5ece1] bg-white shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)]"
                >
                  {/* Top Stylized Banner with 3D Badge */}
                  <div className="relative flex h-36 w-full items-center justify-between overflow-hidden bg-gradient-to-br from-[#fff7f0] via-[#ffeedd] to-[#ffe5cf] p-4.5">
                    {/* Background Pattern */}
                    <div
                      className="pointer-events-none absolute -right-4 -top-6 select-none text-7xl font-black text-[#f7c297]/15"
                      aria-hidden="true"
                    >
                      {idx === 0 ? '基' : '職'}
                    </div>

                    {/* Level Pill */}
                    <div className="z-10 flex flex-col items-start gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/95 px-3 py-1 text-[11px] font-extrabold text-[#c2410c] shadow-2xs backdrop-blur-xs">
                        {course.level.includes('Workplace') ? <BriefcaseBusiness size={13} /> : <GraduationCap size={13} />}
                        {course.level}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a3412] bg-orange-100/70 px-2 py-0.5 rounded-md">
                        Tokutei Gino
                      </span>
                    </div>

                    {/* 3D Course Icon Illustration */}
                    <div className="z-10 shrink-0">
                      <img
                        src={assetPath(
                          idx === 0
                            ? 'assets/course-workspace-icons/workspace_vocab.png'
                            : 'assets/course-workspace-icons/workspace_practice.png'
                        )}
                        alt=""
                        className="h-20 w-auto object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
                    <div>
                      <h4 className="font-[var(--font-heading)] text-lg font-black leading-snug text-[#0f172a] transition-colors group-hover:text-[#d83a00]">
                        {course.title}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-relaxed text-[#5f6b7c]">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-[#f5ece1] pt-3">
                      {/* Lesson Count & Status */}
                      <div className="flex items-center justify-between text-xs font-bold text-[#717d8f]">
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} className="text-[#d83a00]" />
                          <span>{course.totalLessons > 0 ? `${course.totalLessons} bài học` : 'Đang phát triển'}</span>
                        </span>
                        <span className="font-extrabold text-[#d83a00]">46% Hoàn thành</span>
                      </div>

                      {/* Progress Line */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eee5da]">
                        <div className="h-full bg-gradient-to-r from-[#d83a00] to-[#f27427] w-[46%]" />
                      </div>

                      {/* Primary CTA Button */}
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] text-xs font-extrabold text-white shadow-xs transition-all duration-200 group-hover:shadow-md group-hover:from-[#c23400] group-hover:to-[#d84800] active:scale-98"
                      >
                        <span>Học tiếp ngay</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-[24px] border border-[#eee3d5] bg-white p-8 text-center space-y-4 shadow-2xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]">
            <BookOpen size={36} strokeWidth={2} />
          </div>
          <div>
            <p className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">Chưa thấy khóa học phù hợp</p>
            <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">Thử từ khóa khác hoặc xóa lọc cấp độ để xem toàn bộ danh sách.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveLevel(ALL_LEVELS);
            }}
            className="rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            Bỏ lọc & Hiển thị tất cả
          </button>
        </div>
      )}
    </div>
  );
}

interface CourseListErrorNoticeProps {
  result: ReturnType<typeof useCourseList>;
}

function CourseListErrorNotice({ result }: CourseListErrorNoticeProps) {
  if (result.status !== 'error') return null;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800">
      <AlertTriangle size={15} className="shrink-0 text-amber-600" />
      <span>Không tải được dữ liệu mới · Đang hiển thị danh sách tạm thời</span>
    </div>
  );
}

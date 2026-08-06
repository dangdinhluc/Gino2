import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, BriefcaseBusiness, GraduationCap, Loader2, SlidersHorizontal, Sparkles, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';

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
    <div className="space-y-5 pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-16">
      <section className="course-page-heading flex items-baseline justify-between gap-4 px-1 pt-1 md:rounded-2xl md:border md:border-[#e8dccb] md:bg-[#fffaf3] md:p-6">
        <h2 className="font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">Khóa học</h2>
        <p className="shrink-0 text-sm text-[#5f6b7c]">
          {courses.length} khóa học
          {isFiltering ? ` · ${filteredCourses.length} kết quả` : ''}
        </p>
      </section>
      <CourseListErrorNotice result={courseList} />

      <section className="course-search-dock sticky top-14 z-20 -mx-3 space-y-4 px-3 py-2 md:static md:mx-0 md:rounded-2xl md:border md:border-[#e8dccb] md:bg-[#fffaf3] md:p-5">
        <div className="flex items-center gap-3">
          <div className="group relative flex-1">
            {isSearching ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin text-orange-700" size={20} strokeWidth={1.8} />
            ) : (
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af] transition-colors group-focus-within:text-orange-700"
                size={20}
                strokeWidth={1.8}
              />
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm khóa học..."
              className="w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-3.5 pl-12 pr-4 text-base text-[#172033] outline-none transition-colors placeholder:text-[#95a0af] focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8] md:text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className={cn(
              'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors md:hidden',
              hasActiveLevelFilter
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]'
            )}
            aria-label="Mở bộ lọc khóa học"
            aria-haspopup="dialog"
            aria-expanded={isFilterSheetOpen}
          >
            <SlidersHorizontal size={18} strokeWidth={1.8} />
            {hasActiveLevelFilter && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-700 ring-2 ring-[#fffaf3]" />
            )}
          </button>
        </div>

        <div className="hidden flex-wrap gap-2 md:flex">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                activeLevel === level
                  ? 'border-orange-700 bg-orange-700 text-white'
                  : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-700'
              )}
            >
              {level === ALL_LEVELS ? level : `Cấp độ ${level}`}
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end bg-gray-950/28 px-3 pb-[calc(5.8rem+env(safe-area-inset-bottom))] pt-12 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-filter-title"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id="course-filter-title" className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">
                  Chọn cấp độ
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]"
                  aria-label="Đóng bộ lọc khóa học"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setActiveLevel(level);
                      setIsFilterSheetOpen(false);
                    }}
                    className={cn(
                      'rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors',
                      activeLevel === level
                        ? 'border-orange-700 bg-orange-700 text-white'
                        : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]'
                    )}
                  >
                    {level === ALL_LEVELS ? level : `Cấp độ ${level}`}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSearching || isLoadingFromSupabase ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex h-80 animate-pulse flex-col space-y-4 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-6"
            >
              <div className="h-44 w-full rounded-xl bg-[#f1e7d9]" />
              <div className="h-6 w-2/3 rounded-lg bg-[#f1e7d9]" />
              <div className="h-4 w-full rounded-lg bg-[#f1e7d9]" />
              <div className="mt-auto h-10 w-full rounded-xl bg-[#f1e7d9]" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.22 }}
              >
                <Link
                  to={`/app/courses/${course.id}/learn`}
                  className="course-card-link group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8dccb] bg-[#fffaf3] transition-colors hover:border-orange-300"
                >
                  <div className="course-card-media relative h-32 overflow-hidden sm:h-44">
                    <img
                      src={course.image}
                      alt=""
                      className="course-card-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="course-card-spark" aria-hidden="true"><Sparkles size={17} /></span>
                    <span className="course-card-level-badge absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-[#e8dccb] bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-orange-700 backdrop-blur-sm sm:left-4 sm:top-4 sm:bottom-auto sm:px-3 sm:py-1.5 sm:text-xs">
                      {course.level.includes('Workplace') ? <BriefcaseBusiness size={13} /> : <GraduationCap size={13} />}
                      {course.level}
                    </span>
                  </div>

                  <div className="course-card-content flex flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-5">
                    <h4 className="font-[var(--font-heading)] text-xl font-bold leading-tight tracking-[-0.02em] text-[#172033] transition-colors group-hover:text-orange-700 sm:text-lg">
                      {course.title}
                    </h4>
                    <p className="line-clamp-1 text-[13px] leading-relaxed text-[#5f6b7c] sm:line-clamp-2 sm:text-sm">
                      {course.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#efe5d7] pt-3 sm:pt-4">
                      <span className="text-xs font-semibold text-[#7b8796]">
                        {course.totalLessons > 0 ? `${course.totalLessons} bài học` : 'Đang đồng bộ'}
                      </span>
                      <span className="course-card-action inline-flex min-h-10 items-center gap-1 rounded-lg bg-orange-700 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-orange-800">
                        Học tiếp <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4 py-20 text-center">
          <div className="inline-flex rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-8 text-[#95a0af]">
            <BookOpen size={48} strokeWidth={1.8} />
          </div>
          <div className="space-y-1">
            <p className="font-[var(--font-heading)] text-base font-bold text-[#172033]">Chưa thấy khóa học phù hợp</p>
            <p className="text-sm text-[#5f6b7c]">Thử từ khóa khác hoặc bỏ bộ lọc để xem toàn bộ danh sách.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveLevel(ALL_LEVELS);
            }}
            className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-6 py-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50"
          >
            Xóa tìm kiếm và bộ lọc
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
    <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <AlertTriangle size={14} strokeWidth={1.8} />
      Không tải được dữ liệu mới · đang hiển thị danh sách tạm
    </p>
  );
}

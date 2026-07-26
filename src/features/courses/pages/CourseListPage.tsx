import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Loader2, SlidersHorizontal, X, Database, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';

export default function CourseList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeLevel, setActiveLevel] = useState('Tất cả');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const navigate = useNavigate();
  const courseList = useCourseList();
  const courses = courseList.data;
  const isLoadingFromSupabase = courseList.status === 'loading';
  const levels = useMemo(() => ['Tất cả', ...Array.from(new Set(courses.map((course) => course.level)))], [courses]);

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
      const matchesLevel = activeLevel === 'Tất cả' || course.level === activeLevel;
      return matchesQuery && matchesLevel;
    });
  }, [searchQuery, activeLevel, courses]);
  const hasActiveLevelFilter = activeLevel !== 'Tất cả';

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-end gap-2">
              <h2 className="text-[2rem] font-black tracking-[-0.08em] text-[#172033] md:text-4xl">Khóa</h2>
              <span className="rounded-[1rem] bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[1.9rem] font-black leading-none tracking-[-0.08em] text-white shadow-[0_18px_34px_-20px_rgba(249,115,22,0.42)] md:px-4 md:text-4xl">
                học
              </span>
            </div>
            <CourseListSourceBadge result={courseList} />
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-[#e6ddd1] bg-[#fffaf3]/92 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.24)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">Khóa đang có</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{courses.length}</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100/70 bg-blue-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-400 md:text-[10px] md:tracking-[0.18em]">Bộ lọc</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{activeLevel}</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100/70 bg-emerald-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 md:text-[10px] md:tracking-[0.18em]">Kết quả</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{filteredCourses.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 lg:max-w-xl">
              <div className="relative flex-1 group">
                {isSearching ? (
                  <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-orange-500" size={20} />
                ) : (
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange-500" size={20} />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm khóa học, bài học hoặc nội dung đang cần ôn..."
                  className="w-full rounded-2xl border border-[#e1d8cb] bg-[#f5efe6]/80 py-3.5 pl-12 pr-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-orange-200 focus:bg-[#fffaf3] focus:ring-2 focus:ring-orange-100/70"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={cn(
                  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white transition-all md:hidden',
                  hasActiveLevelFilter ? 'border-orange-200 bg-orange-50 text-orange-500 shadow-sm shadow-orange-100' : 'border-[#e1d8cb] text-gray-500'
                )}
                aria-label="Mở bộ lọc khóa học"
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
              >
                <SlidersHorizontal size={18} />
                {hasActiveLevelFilter && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#fffaf3]" />}
              </button>
            </div>

            <button className="hidden items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-500 md:flex">
              <SlidersHorizontal size={16} />
              Bộ lọc
            </button>
          </div>

          <div className="hidden flex-wrap gap-2 md:flex">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-bold transition-all',
                  activeLevel === level
                    ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                )}
              >
                {level === 'Tất cả' ? level : `Cấp độ ${level}`}
              </button>
            ))}
          </div>
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
              className="w-full rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_30px_80px_-36px_rgba(17,24,39,0.42)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Bộ lọc khóa học</p>
                  <h3 id="course-filter-title" className="mt-2 text-2xl font-black tracking-tight text-gray-900">Chọn nhóm khóa học muốn xem</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">Lọc nhanh danh sách khóa học theo cấp độ để đỡ phải cuộn nhiều.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm"
                  aria-label="Đóng bộ lọc khóa học"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Đang lọc</div>
                <div className="mt-2 text-lg font-black text-gray-900">{activeLevel === 'Tất cả' ? 'Tất cả khóa học' : `Cấp độ ${activeLevel}`}</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setActiveLevel(level);
                      setIsFilterSheetOpen(false);
                    }}
                    className={cn(
                      'rounded-full border px-4 py-2.5 text-sm font-bold transition-all',
                      activeLevel === level
                        ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                    )}
                  >
                    {level === 'Tất cả' ? level : `Cấp độ ${level}`}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLevel('Tất cả');
                    setIsFilterSheetOpen(false);
                  }}
                  className="flex-1 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-sm font-black text-gray-600"
                >
                  Xóa lọc
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)]"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isSearching || isLoadingFromSupabase ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex h-80 flex-col space-y-4 rounded-[2rem] border border-[#ece5da] bg-[#fffaf3] p-6 animate-pulse">
              <div className="h-44 w-full rounded-2xl bg-gray-50" />
              <div className="h-6 w-2/3 rounded-lg bg-gray-50" />
              <div className="h-4 w-full rounded-lg bg-gray-50" />
              <div className="mt-auto h-10 w-full rounded-xl bg-gray-50" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => navigate(`/app/courses/${course.id}`)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] shadow-[0_20px_48px_-38px_rgba(148,163,184,0.16)] transition-all hover:border-[#dccfbe] hover:shadow-[0_24px_52px_-36px_rgba(180,138,91,0.14)]"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-xl bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 ring-1 ring-orange-100 backdrop-blur-sm">
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col space-y-4 p-6">
                  <div className="space-y-2">
                    <h4 className="text-xl font-black italic leading-tight text-gray-800 transition-colors group-hover:text-orange-600">
                      {course.title}
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-gray-500 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-orange-50 pt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        {course.totalLessons > 0 ? `${course.totalLessons} bài học` : 'Đang đồng bộ'}
                      </span>
                    </div>
                    <button className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-100 transition-all hover:shadow-orange-200">
                      Học ngay
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-24 text-center">
          <div className="relative inline-flex rounded-[2.5rem] border border-[#ece5da] bg-[#fffaf3] p-10 text-gray-100 shadow-[0_18px_40px_-34px_rgba(148,163,184,0.14)]">
            <BookOpen size={64} />
            <div className="absolute bottom-4 right-4 h-12 w-12">
              <img src={`${import.meta.env.BASE_URL}mascot.png`} alt="Mascot" className="h-full w-full animate-float object-contain grayscale" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML='<span class="text-3xl">🐯</span>'; }} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-black text-gray-500">Chưa thấy khóa học phù hợp...</p>
            <p className="text-sm font-bold text-gray-400 opacity-70">Thử tìm kiếm khác hoặc bỏ bộ lọc để mở lại toàn bộ danh sách nhé anh.</p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveLevel('Tất cả');
            }}
            className="rounded-2xl border border-gray-100 bg-white px-8 py-3 text-sm font-black text-orange-500 shadow-sm transition-all hover:shadow-md"
          >
            Xóa tìm kiếm
          </button>
        </motion.div>
      )}
    </div>
  );
}

interface CourseListSourceBadgeProps {
  result: ReturnType<typeof useCourseList>;
}

function CourseListSourceBadge({ result }: CourseListSourceBadgeProps) {
  if (result.status === 'loading') {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
        <Loader2 size={12} className="animate-spin" />
        Đang tải Supabase
      </p>
    );
  }

  if (result.status === 'error') {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
        <AlertTriangle size={12} />
        Supabase lỗi · đang dùng dữ liệu mẫu
      </p>
    );
  }

  if (result.source === 'supabase') {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        <Database size={12} />
        Dữ liệu Supabase
      </p>
    );
  }

  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
      <Database size={12} />
      Dữ liệu mẫu local{result.isFallback ? ' · Supabase chưa có dữ liệu' : ''}
    </p>
  );
}

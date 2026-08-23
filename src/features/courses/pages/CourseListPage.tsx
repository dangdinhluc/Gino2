import { useMemo, useState } from 'react';
import { Bell, BookOpen, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';

const PURPLE = '#6f45d8';
const ALL = 'Tất cả';

export default function CourseListPage() {
  const courseList = useCourseList();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(ALL);

  const enrolled = useMemo(() => courseList.data.filter((course) => course.isEnrolled !== false), [courseList.data]);
  const discover = useMemo(() => courseList.data.filter((course) => course.isEnrolled === false), [courseList.data]);
  const levels = useMemo(() => [ALL, ...Array.from(new Set(courseList.data.map((course) => course.level).filter(Boolean)))], [courseList.data]);
  const filteredDiscover = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return discover.filter((course) => {
      const matchesLevel = level === ALL || course.level === level;
      const matchesQuery = !normalized || course.title.toLowerCase().includes(normalized) || course.description.toLowerCase().includes(normalized);
      return matchesLevel && matchesQuery;
    });
  }, [discover, query, level]);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-[#17181d]">Khóa học của tôi</h1>
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ececf2] bg-white text-[#34353b] shadow-[0_2px_8px_rgba(25,25,40,.04)]" aria-label="Thông báo">
          <Bell size={17} />
        </button>
      </header>

      {courseList.status === 'error' && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{courseList.error}</div>
      )}

      <section>
        <h2 className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[.06em] text-[#3f4148]">Đang học</h2>
        <div className="space-y-2.5">
          {courseList.status === 'loading' && [0, 1, 2].map((item) => <div key={item} className="h-[86px] animate-pulse rounded-[14px] border border-[#ececf2] bg-white" />)}
          {enrolled.map((course, index) => {
            const thumbTones = ['from-[#f0d2b6] to-[#8b5b38]', 'from-[#d8e3e8] to-[#6f8792]', 'from-[#efdcb8] to-[#9b7745]', 'from-[#d7ead2] to-[#6c8d68]'];
            return (
              <Link key={course.id} to={`/app/courses/${course.id}/learn`} className="flex min-h-[86px] overflow-hidden rounded-[14px] border border-[#e8e8ef] bg-white shadow-[0_3px_12px_rgba(20,20,35,.04)]">
                <div className={`flex w-[88px] shrink-0 items-center justify-center bg-gradient-to-br ${thumbTones[index % thumbTones.length]}`}>
                  <BookOpen size={25} className="text-white/90" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-[12px] font-extrabold text-[#25262c]">{course.title}</strong>
                    <span className="mt-1 block truncate text-[9px] font-medium text-[#898c96]">Bài tiếp theo: {course.level || 'Tiếp tục lộ trình'}</span>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#efeff4]"><div className="h-full rounded-full" style={{ width: `${course.progress}%`, background: PURPLE }} /></div>
                      <span className="text-[9px] font-extrabold text-[#595c66]">{course.progress}%</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#6f45d8] px-2.5 py-1.5 text-[9px] font-extrabold text-white">TIẾP TỤC</span>
                </div>
              </Link>
            );
          })}
          {courseList.status === 'ready' && enrolled.length === 0 && (
            <div className="rounded-[14px] border border-dashed border-[#dcdce5] bg-white p-4 text-center text-[11px] font-medium text-[#8a8d96]">Bạn chưa tham gia khóa học nào.</div>
          )}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[.05em] text-[#34353b]">Khám phá khóa học</h2>
          <Link to="/app/enrollments" className="text-[10px] font-semibold text-[#858893]">Xem tất cả ›</Link>
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {levels.slice(0, 5).map((item) => (
            <button key={item} type="button" onClick={() => setLevel(item)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold ${level === item ? 'border-[#bca8ee] bg-[#f5f1ff] text-[#6840ce]' : 'border-[#e5e5ec] bg-white text-[#6d7079]'}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a3ac]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khóa học..." className="h-9 w-full rounded-xl border border-[#e5e5ec] bg-white pl-9 pr-3 text-[11px] font-medium text-[#33343a] outline-none focus:border-[#b9a4ec]" />
        </div>

        <div className="space-y-2.5">
          {filteredDiscover.slice(0, 4).map((course, index) => {
            const colors = ['bg-[#e9eef8] text-[#6079b2]', 'bg-[#eef3e6] text-[#6f8b55]', 'bg-[#f7ece6] text-[#b97950]', 'bg-[#eee9f8] text-[#795eac]'];
            return (
              <Link key={course.id} to="/app/enrollments" className="flex min-h-[94px] items-center gap-3 rounded-[14px] border border-[#e8e8ef] bg-white p-3 shadow-[0_3px_12px_rgba(20,20,35,.035)]">
                <span className={`flex h-[66px] w-[82px] shrink-0 items-center justify-center rounded-xl ${colors[index % colors.length]}`}><BookOpen size={24} /></span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[12px] font-extrabold text-[#25262c]">{course.title}</strong>
                  <small className="mt-1 block line-clamp-1 text-[9px] font-medium text-[#8f929c]">{course.description || `${course.totalLessons} bài học`}</small>
                  <span className="mt-2 inline-flex items-center rounded-md border border-[#d9cff4] bg-[#faf8ff] px-2 py-1 text-[9px] font-extrabold text-[#7048d4]">XEM CHI TIẾT <ChevronRight size={11} /></span>
                </span>
              </Link>
            );
          })}
          {courseList.status === 'ready' && filteredDiscover.length === 0 && (
            <div className="rounded-[14px] border border-[#e8e8ef] bg-white p-4 text-center text-[11px] text-[#90929a]">Không có khóa phù hợp bộ lọc hiện tại.</div>
          )}
        </div>
      </section>
    </div>
  );
}

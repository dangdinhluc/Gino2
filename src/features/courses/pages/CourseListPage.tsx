import { useMemo, useState } from 'react';
import { ActiveCourseCard } from '@/src/features/courses/components/ActiveCourseCard';
import { CourseHeader } from '@/src/features/courses/components/CourseHeader';
import { ExploreCourses } from '@/src/features/courses/components/ExploreCourses';
import { MyCoursesList } from '@/src/features/courses/components/MyCoursesList';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import { useCourseStats } from '@/src/features/courses/hooks/useCourseStats';

const ALL = 'Tất cả';

export default function CourseListPage() {
  const courseList = useCourseList();
  const courseStats = useCourseStats();
  const [category, setCategory] = useState(ALL);

  const enrolled = useMemo(() => courseList.data.filter((course) => course.isEnrolled === true), [courseList.data]);
  const discover = useMemo(() => courseList.data.filter((course) => course.isEnrolled !== true), [courseList.data]);
  const activeCourse = useMemo(() => {
    return enrolled.find((course) => course.progress > 0 && course.progress < 100) ?? enrolled[0] ?? null;
  }, [enrolled]);
  const categories = useMemo(() => [ALL, ...Array.from(new Set(discover.map(courseCategory)))], [discover]);
  const filteredDiscover = useMemo(
    () => category === ALL ? discover : discover.filter((course) => courseCategory(course) === category),
    [category, discover],
  );

  return (
    <div className="min-h-full bg-[#fbfaff] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
      <div className="mx-auto w-full max-w-[760px] space-y-6">
        {courseList.status === 'error' && (
          <p role="alert" className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {courseList.error ?? 'Không thể tải danh sách khóa học.'}
          </p>
        )}

        <CourseHeader
          courseCount={courseList.status === 'loading' ? null : enrolled.length}
          streak={courseStats.data?.currentStreak ?? null}
          loading={courseList.status === 'loading' || courseStats.loading}
        />

        <ActiveCourseCard course={activeCourse} loading={courseList.status === 'loading'} />
        <MyCoursesList courses={courseList.data} activeCourseId={activeCourse?.id} loading={courseList.status === 'loading'} />
        <ExploreCourses
          courses={filteredDiscover}
          categories={categories}
          activeCategory={category}
          onSelectCategory={setCategory}
          loading={courseList.status === 'loading'}
        />
      </div>
    </div>
  );
}

function courseCategory(course: CourseListEntry): string {
  const searchable = `${course.title} ${course.description}`.toLowerCase();
  if (/(tokutei|ginou|ssw)/.test(searchable)) return 'Tokutei';
  if (/(giao tiếp|kaiwa|speaking|hội thoại)/.test(searchable)) return 'Giao tiếp';
  if (/(ngữ pháp|grammar)/.test(searchable)) return 'Ngữ pháp';
  if (/(kanji|漢字)/.test(searchable)) return 'Kanji';
  return course.level || 'Khác';
}

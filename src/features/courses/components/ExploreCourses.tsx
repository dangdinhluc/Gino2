import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { CourseCategoryFilter } from './CourseCategoryFilter';
import { getCourseThumbnail } from './CourseCard';
import { CourseListItem } from './CourseListItem';

interface ExploreCoursesProps {
  courses: CourseListEntry[];
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  loading?: boolean;
}

export function ExploreCourses({ courses, categories, activeCategory, onSelectCategory, loading = false }: ExploreCoursesProps) {
  return (
    <section aria-labelledby="explore-courses-title">
      <div className="flex items-end justify-between gap-3">
        <h2 id="explore-courses-title" className="text-[19px] font-black tracking-[-.03em] text-[#201b36]">Khám phá khóa học</h2>
        <Link to="/app/enrollments" className="inline-flex items-center gap-0.5 text-[10px] font-black text-[#6f45d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]">
          Xem tất cả <ArrowRight size={13} />
        </Link>
      </div>

      <CourseCategoryFilter categories={categories} activeCategory={activeCategory} onSelect={onSelectCategory} />

      {loading ? (
        <div className="mt-3 space-y-2.5" aria-busy="true" aria-label="Đang tải khóa học khám phá">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[112px] animate-pulse rounded-[18px] bg-white" />)}
        </div>
      ) : courses.length > 0 ? (
        <ul className="mt-3 space-y-2.5" aria-label="Khóa học đề xuất">
          {courses.map((course, index) => (
            <CourseListItem
              key={course.id}
              image={getCourseThumbnail(course)}
              title={course.title}
              description={course.description}
              lessons={course.totalLessons}
              level={course.level}
              rating={null}
              to="/app/enrollments"
              index={index}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-[18px] border border-dashed border-[#d8ccef] bg-white p-5 text-center">
          <p className="text-[12px] font-semibold text-[#777181]">Không có khóa học phù hợp.</p>
          <Link to="/app/enrollments" className="mt-3 inline-flex rounded-full border border-[#cdb9f5] px-4 py-2 text-[10px] font-black text-[#6f45d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]">Xem toàn bộ khóa học</Link>
        </div>
      )}
    </section>
  );
}

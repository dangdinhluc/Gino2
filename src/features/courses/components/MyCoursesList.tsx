import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { getCourseThumbnail } from './CourseCard';
import { CourseListItem } from './CourseListItem';

interface MyCoursesListProps {
  courses: CourseListEntry[];
  activeCourseId?: string | null;
  loading?: boolean;
}

export function MyCoursesList({ courses, activeCourseId = null, loading = false }: MyCoursesListProps) {
  const enrolled = courses.filter((course) => course.isEnrolled === true);

  return (
    <section aria-labelledby="my-courses-title">
      <h2 id="my-courses-title" className="text-[19px] font-black tracking-[-.03em] text-[#201b36]">Khóa của bạn</h2>

      {loading ? (
        <div className="mt-3 space-y-2.5" aria-busy="true" aria-label="Đang tải khóa học của bạn">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[76px] animate-pulse rounded-[18px] bg-white" />)}
        </div>
      ) : enrolled.length > 0 ? (
        <ul className="mt-3 space-y-2.5" aria-label="Các khóa học đã tham gia">
          {enrolled.map((course, index) => (
            <CourseListItem
              key={course.id}
              image={getCourseThumbnail(course)}
              title={course.title}
              description={course.description}
              lessons={course.totalLessons}
              level={course.level}
              rating={null}
              progress={course.progress}
              variant="owned"
              active={course.id === activeCourseId}
              to={`/app/courses/${course.id}/learn`}
              index={index}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-[18px] border border-dashed border-[#d8ccef] bg-white p-5 text-center">
          <p className="text-[12px] font-semibold text-[#777181]">Bạn chưa tham gia khóa học nào.</p>
          <Link to="/app/enrollments" className="mt-3 inline-flex rounded-full border border-[#cdb9f5] px-4 py-2 text-[10px] font-black text-[#6f45d8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]">Xem khóa học</Link>
        </div>
      )}
    </section>
  );
}

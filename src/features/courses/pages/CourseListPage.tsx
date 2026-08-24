import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CourseHeader } from '@/src/features/courses/components/CourseHeader';
import { CourseMarketplace } from '@/src/features/courses/components/CourseMarketplace';
import { CourseSelector } from '@/src/features/courses/components/CourseSelector';
import { CourseSwitcher } from '@/src/features/courses/components/CourseSwitcher';
import { MyCourses } from '@/src/features/courses/components/MyCourses';
import { enrollInFreeCourse } from '@/src/features/courses/repositories/activeCourseRepository';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { useActiveCourse } from '@/src/features/courses/hooks/useActiveCourse';
import { useCourseList } from '@/src/features/courses/hooks/useCourseList';
import { useCourseStats } from '@/src/features/courses/hooks/useCourseStats';

const ALL = 'Tất cả';

function courseCategory(course: CourseListEntry): string {
  const searchable = (course.title + ' ' + course.description).toLowerCase();
  if (/(tokutei|ginou|ssw)/.test(searchable)) return 'Tokutei';
  if (/(giao tiếp|kaiwa|speaking|hội thoại)/.test(searchable)) return 'Giao tiếp';
  if (/(ngữ pháp|grammar)/.test(searchable)) return 'Ngữ pháp';
  if (/(kanji|漢字)/.test(searchable)) return 'Kanji';
  return course.level || 'Khác';
}

function enrollmentErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (message.includes('COURSE_REQUIRES_PACKAGE')) return 'Khóa này cần được đăng ký qua gói học. Mở mục Gói học để xem lựa chọn phù hợp.';
  if (message.includes('COURSE_NOT_AVAILABLE')) return 'Khóa học này hiện chưa mở đăng ký.';
  return message || 'Không thể đăng ký khóa học.';
}

export default function CourseListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseList = useCourseList();
  const courseStats = useCourseStats();
  const activeCourse = useActiveCourse();
  const [category, setCategory] = useState(ALL);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [busyCourseId, setBusyCourseId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const enrolled = useMemo(() => courseList.data.filter((course) => course.isEnrolled === true), [courseList.data]);
  const discover = useMemo(() => courseList.data.filter((course) => course.isEnrolled !== true), [courseList.data]);
  const categories = useMemo(() => [ALL, ...Array.from(new Set(discover.map(courseCategory)))], [discover]);
  const filteredDiscover = useMemo(
    () => category === ALL ? discover : discover.filter((course) => courseCategory(course) === category),
    [category, discover],
  );
  const activeCourseId = activeCourse.activeCourseId ?? enrolled[0]?.id ?? null;
  const shouldShowSelector = activeCourse.status === 'ready'
    && (enrolled.length === 0 || searchParams.get('mode') === 'select');

  async function handleEnroll(course: CourseListEntry): Promise<void> {
    setBusyCourseId(course.id);
    setActionError(null);
    try {
      if (course.isEnrolled) {
        await activeCourse.selectCourse(course.id);
      } else {
        await enrollInFreeCourse(course.id);
      }
      activeCourse.setLocalCourse(course.id);
      navigate('/app/dashboard', { replace: true });
    } catch (error: unknown) {
      setActionError(enrollmentErrorMessage(error));
    } finally {
      setBusyCourseId(null);
    }
  }

  async function handleSwitch(courseId: string): Promise<void> {
    setBusyCourseId(courseId);
    setActionError(null);
    try {
      await activeCourse.selectCourse(courseId);
      navigate('/app/dashboard', { replace: true });
    } catch (error: unknown) {
      setActionError(enrollmentErrorMessage(error));
    } finally {
      setBusyCourseId(null);
    }
  }

  if (activeCourse.status !== 'ready' || courseList.status === 'loading') {
    return <main className="grid min-h-[55vh] place-items-center text-sm font-bold text-[#5F6B7C]">Đang tải khóa học…</main>;
  }

  if (shouldShowSelector) {
    return (
      <CourseSelector
        courses={courseList.data}
        selectedCourseId={selectedCourseId}
        busy={busyCourseId !== null}
        error={actionError ?? (courseList.status === 'error' ? courseList.error : null)}
        onSelect={setSelectedCourseId}
        onContinue={() => {
          const course = courseList.data.find((item) => item.id === selectedCourseId);
          if (course) void handleEnroll(course);
        }}
      />
    );
  }

  return (
    <div className="min-h-full bg-[#fbfaff] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
      <div className="mx-auto w-full max-w-[760px] space-y-6">
        {(courseList.status === 'error' || actionError) && (
          <p role="alert" className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">
            {actionError ?? courseList.error ?? 'Không thể tải danh sách khóa học.'}
          </p>
        )}

        <CourseHeader
          courseCount={enrolled.length}
          streak={courseStats.data?.currentStreak ?? null}
          loading={courseStats.loading}
        />

        <MyCourses
          courses={enrolled}
          activeCourseId={activeCourseId}
          switchingCourseId={busyCourseId}
          onSwitch={(courseId) => void handleSwitch(courseId)}
        />
        <CourseSwitcher
          courses={enrolled}
          activeCourseId={activeCourseId}
          busy={busyCourseId !== null}
          onSwitch={(courseId) => void handleSwitch(courseId)}
        />
        <CourseMarketplace
          courses={filteredDiscover}
          categories={categories}
          activeCategory={category}
          onSelectCategory={setCategory}
          busyCourseId={busyCourseId}
          onEnroll={(course) => void handleEnroll(course)}
        />
      </div>
    </div>
  );
}

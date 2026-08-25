import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import type { Course } from '@/src/features/courses/types';

export interface SupabaseCourseRow {
  id: string;
  title: string;
  level: string;
  description: string;
  status: string;
  theme_color: string | null;
  order_index: number;
  lessons?: Array<{ count: number }> | null;
}

export interface CourseListEntry extends Course {
  themeColor: string | null;
  isEnrolled?: boolean;
}

const COURSE_LIST_SELECT = 'id, title, level, description, status, theme_color, order_index, lessons(count)';

export function mapCourseRowToEntry(row: SupabaseCourseRow, progress = 0, isEnrolled = false): CourseListEntry {
  const totalLessons = row.lessons?.[0]?.count ?? 0;
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    description: row.description,
    progress: Math.max(0, Math.min(100, Math.round(progress))),
    totalLessons,
    image: '',
    themeColor: row.theme_color,
    isEnrolled,
  };
}

export async function fetchPublishedCourseForLearner(userId: string, courseId: string): Promise<CourseListEntry | null> {
  const client = requireSupabase();
  const [{ data: course, error: courseError }, { data: enrollment, error: enrollmentError }] = await Promise.all([
    client
      .from('courses')
      .select(COURSE_LIST_SELECT)
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    client
      .from('enrollments')
      .select('progress_percent')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('status', ['active', 'completed'])
      .maybeSingle(),
  ]);

  if (courseError) throw new Error(courseError.message);
  if (enrollmentError) throw new Error(enrollmentError.message);
  if (!course || !enrollment) return null;

  return mapCourseRowToEntry(
    course as unknown as SupabaseCourseRow,
    Number(enrollment.progress_percent),
    true,
  );
}

export async function fetchPublishedCourses(userId?: string): Promise<CourseListEntry[]> {
  const client = requireSupabase();
  const authenticatedUserId = userId ?? await requireUserId(client);
  const { data, error } = await client
    .from('courses')
    .select(COURSE_LIST_SELECT)
    .eq('status', 'published')
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const progressByCourse = new Map<string, number>();
  const enrollmentByCourse = new Set<string>();

  const { data: enrollments, error: enrollmentError } = await client
    .from('enrollments')
    .select('course_id, progress_percent')
    .eq('user_id', authenticatedUserId)
    .in('status', ['active', 'completed']);
  if (enrollmentError) throw new Error(enrollmentError.message);
  for (const enrollment of enrollments ?? []) {
    progressByCourse.set(enrollment.course_id, Number(enrollment.progress_percent));
    enrollmentByCourse.add(enrollment.course_id);
  }

  return (data ?? []).map((row) => {
    const courseRow = row as unknown as SupabaseCourseRow;
    return mapCourseRowToEntry(courseRow, progressByCourse.get(courseRow.id), enrollmentByCourse.has(courseRow.id));
  });
}

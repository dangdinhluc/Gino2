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

export async function fetchPublishedCourses(): Promise<CourseListEntry[]> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client
    .from('courses')
    .select('id, title, level, description, status, theme_color, order_index, lessons(count)')
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
    .eq('user_id', userId);
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

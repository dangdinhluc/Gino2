import { supabase, supabaseConfig } from '@/src/features/supabase/lib/supabaseClient';
import type { Course } from '@/src/features/courses/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400';

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
}

export function mapCourseRowToEntry(row: SupabaseCourseRow, progress = 0): CourseListEntry {
  const totalLessons = row.lessons?.[0]?.count ?? 0;
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    description: row.description,
    progress: Math.max(0, Math.min(100, Math.round(progress))),
    totalLessons,
    image: FALLBACK_IMAGE,
    themeColor: row.theme_color,
  };
}

export function isSupabaseCoursesEnabled(): boolean {
  return supabaseConfig.isConfigured;
}

/**
 * Fetch published courses ordered by curated `order_index`. Returns `null`
 * when Supabase isn't configured so callers can fall back to mock content.
 */
export async function fetchPublishedCourses(): Promise<CourseListEntry[] | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('courses')
    .select('id, title, level, description, status, theme_color, order_index, lessons(count)')
    .eq('status', 'published')
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const { data: authData } = await supabase.auth.getUser();
  const progressByCourse = new Map<string, number>();

  if (authData.user) {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('course_id, progress_percent')
      .eq('user_id', authData.user.id);

    if (enrollmentError) throw new Error(enrollmentError.message);
    for (const enrollment of enrollments ?? []) {
      progressByCourse.set(enrollment.course_id, Number(enrollment.progress_percent));
    }
  }

  return (data ?? []).map((row) => {
    const courseRow = row as unknown as SupabaseCourseRow;
    return mapCourseRowToEntry(courseRow, progressByCourse.get(courseRow.id));
  });
}

import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

export interface ActiveCourseEnrollment {
  courseId: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
}

export interface ActiveCourseContext {
  activeCourseId: string | null;
  enrollments: ActiveCourseEnrollment[];
  usedPersistedSelection: boolean;
}

export async function fetchActiveCourseContext(userId: string): Promise<ActiveCourseContext> {
  const client = requireSupabase();
  const [{ data: profile, error: profileError }, { data: enrollments, error: enrollmentError }] = await Promise.all([
    client.from('profiles').select('active_course_id').eq('user_id', userId).maybeSingle(),
    client
      .from('enrollments')
      .select('course_id, status, progress_percent, enrolled_at')
      .eq('user_id', userId)
      .in('status', ['active', 'completed'])
      .order('progress_percent', { ascending: false })
      .order('enrolled_at', { ascending: false }),
  ]);

  if (profileError) throw new Error(profileError.message);
  if (enrollmentError) throw new Error(enrollmentError.message);

  const mappedEnrollments = (enrollments ?? []).map((enrollment) => ({
    courseId: enrollment.course_id,
    status: enrollment.status,
    progressPercent: Number(enrollment.progress_percent),
    enrolledAt: enrollment.enrolled_at,
  }));
  const enrolledIds = new Set(mappedEnrollments.map((enrollment) => enrollment.courseId));
  const persistedId = profile?.active_course_id && enrolledIds.has(profile.active_course_id)
    ? profile.active_course_id
    : null;

  return {
    activeCourseId: persistedId ?? mappedEnrollments[0]?.courseId ?? null,
    enrollments: mappedEnrollments,
    usedPersistedSelection: persistedId !== null,
  };
}

export async function persistActiveCourse(courseId: string): Promise<void> {
  const { error } = await requireSupabase().rpc('set_active_course', { target_course_id: courseId });
  if (error) throw new Error(error.message);
}

export async function enrollInFreeCourse(courseId: string): Promise<void> {
  const { data, error } = await requireSupabase().rpc('enroll_in_free_course', { target_course_id: courseId });
  if (error) throw new Error(error.message);
  if (!data?.some((enrollment) => enrollment.course_id === courseId)) {
    throw new Error('Không tạo được đăng ký khóa học.');
  }
}

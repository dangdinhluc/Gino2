import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';

export interface PackageCourseSummary {
  id: string;
  title: string;
  level: string;
  description: string;
}

export interface PackageCatalogItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  aiMonthlyQuota: number;
  courses: PackageCourseSummary[];
}

export interface LearnerEnrollment {
  id: string;
  packageId: string | null;
  courseId: string;
  status: string;
  progressPercent: number;
  course: PackageCourseSummary | null;
}

export async function fetchPackageCatalog(): Promise<PackageCatalogItem[]> {
  const client = requireSupabase();
  const [{ data: packages, error: packageError }, { data: links, error: linkError }] = await Promise.all([
    client.from('packages').select('id, name, description, price_cents, currency, ai_monthly_quota').eq('status', 'active').order('created_at'),
    client.from('package_courses').select('package_id, course_id'),
  ]);
  if (packageError) throw new Error(packageError.message);
  if (linkError) throw new Error(linkError.message);

  const courseIds = [...new Set((links ?? []).map((link) => link.course_id))];
  const { data: courses, error: courseError } = courseIds.length
    ? await client.from('courses').select('id, title, level, description').in('id', courseIds).eq('status', 'published')
    : { data: [], error: null };
  if (courseError) throw new Error(courseError.message);

  const courseById = new Map((courses ?? []).map((course) => [course.id, course]));
  return (packages ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    priceCents: item.price_cents,
    currency: item.currency,
    aiMonthlyQuota: item.ai_monthly_quota,
    courses: (links ?? [])
      .filter((link) => link.package_id === item.id)
      .map((link) => courseById.get(link.course_id))
      .filter((course): course is NonNullable<typeof course> => Boolean(course)),
  }));
}

export async function fetchMyEnrollments(): Promise<LearnerEnrollment[]> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data: enrollments, error } = await client
    .from('enrollments')
    .select('id, package_id, course_id, status, progress_percent')
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });
  if (error) throw new Error(error.message);

  const courseIds = [...new Set((enrollments ?? []).map((enrollment) => enrollment.course_id))];
  const { data: courses, error: courseError } = courseIds.length
    ? await client.from('courses').select('id, title, level, description').in('id', courseIds)
    : { data: [], error: null };
  if (courseError) throw new Error(courseError.message);
  const courseById = new Map((courses ?? []).map((course) => [course.id, course]));

  return (enrollments ?? []).map((enrollment) => ({
    id: enrollment.id,
    packageId: enrollment.package_id,
    courseId: enrollment.course_id,
    status: enrollment.status,
    progressPercent: Number(enrollment.progress_percent),
    course: courseById.get(enrollment.course_id) ?? null,
  }));
}

export async function enrollInFreePackage(packageId: string): Promise<LearnerEnrollment[]> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('enroll_in_free_package', { target_package_id: packageId });
  if (error) throw new Error(error.message);
  return (data ?? []).map((enrollment) => ({
    id: enrollment.id,
    packageId: enrollment.package_id,
    courseId: enrollment.course_id,
    status: enrollment.status,
    progressPercent: Number(enrollment.progress_percent),
    course: null,
  }));
}

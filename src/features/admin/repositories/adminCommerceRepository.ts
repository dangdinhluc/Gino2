import type { Tables, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, type AdminDraft } from './adminRepositoryCore';

type Package = Tables<'packages'>;
type Prompt = Tables<'ai_prompts'>;
type PackageCourse = Tables<'package_courses'>;
type Enrollment = Tables<'enrollments'>;

export async function listAdminPackages(): Promise<Package[]> {
  const { data, error } = await (await requireAdmin()).from('packages').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminPackage(input: AdminDraft<'packages'>): Promise<Package> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('packages').update(payload as TablesUpdate<'packages'>).eq('id', id).select('*').single()
    : await client.from('packages').insert(insertDraft<'packages'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminPackage(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('packages').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminPackageCourses(): Promise<PackageCourse[]> {
  const { data, error } = await (await requireAdmin()).from('package_courses').select('*').order('package_id');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceAdminPackageCourses(packageId: string, courseIds: string[]): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_replace_package_courses', {
    target_package_id: packageId,
    target_course_ids: [...new Set(courseIds.filter(Boolean))],
  });
  if (error) throw new Error(error.message);
}

export async function listAdminPrompts(): Promise<Prompt[]> {
  const { data, error } = await (await requireAdmin()).from('ai_prompts').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminPrompt(input: AdminDraft<'ai_prompts'>): Promise<Prompt> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('ai_prompts').update(payload as TablesUpdate<'ai_prompts'>).eq('id', id).select('*').single()
    : await client.from('ai_prompts').insert(insertDraft<'ai_prompts'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminPrompt(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('ai_prompts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminEnrollments(): Promise<Enrollment[]> {
  const { data, error } = await (await requireAdmin()).from('enrollments').select('*').order('enrolled_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function grantAdminEnrollment(userId: string, courseId: string, packageId?: string): Promise<Enrollment> {
  const { data, error } = await (await requireAdmin()).rpc('admin_grant_enrollment', {
    target_user_id: userId,
    target_course_id: courseId,
    ...(packageId ? { target_package_id: packageId } : {}),
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Không nhận được enrollment sau khi cấp quyền.');
  return data;
}

export async function revokeAdminEnrollment(userId: string, courseId: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_revoke_enrollment', { target_user_id: userId, target_course_id: courseId });
  if (error) throw new Error(error.message);
}

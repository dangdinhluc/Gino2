import type { Json, Tables, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { requireAdmin, type AdminLearnerDetail, type AdminStaffMember, type AdminStaffRole } from './adminRepositoryCore';

type Student = Tables<'profiles'>;
type StaffRoleRow = Tables<'admin_roles'>;

function jsonRecord(value: Json | null | undefined): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : {};
}

function jsonRows(value: Json | null | undefined): Record<string, Json>[] {
  return Array.isArray(value) ? value.flatMap((item) => item && typeof item === 'object' && !Array.isArray(item) ? [item as Record<string, Json>] : []) : [];
}

export async function listAdminStudents(): Promise<Student[]> {
  const { data, error } = await (await requireAdmin()).from('profiles').select('*').eq('profile_role', 'learner').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAdminLearnerDetail(userId: string): Promise<AdminLearnerDetail> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_learner_detail', { target_learner_id: userId });
  if (error) throw new Error(error.message);
  const value = jsonRecord(data);
  const settings = jsonRecord(value.settings);
  const lessonProgress = jsonRecord(value.lessonProgress);
  const vocabulary = jsonRecord(value.vocabulary);
  const assessments = jsonRecord(value.assessments);
  return {
    settings: {
      dailyGoalMinutes: Number(settings.dailyGoalMinutes) || 20,
      timezone: String(settings.timezone ?? 'Asia/Tokyo'),
      reminderTime: typeof settings.reminderTime === 'string' ? settings.reminderTime : null,
      emailNotifications: settings.emailNotifications === true,
      aiConcise: settings.aiConcise === true,
      ttsEnabled: settings.ttsEnabled === true,
      inAppNotifications: settings.inAppNotifications === true,
    },
    enrollments: jsonRows(value.enrollments).map((item) => ({
      courseId: String(item.courseId ?? ''), courseTitle: String(item.courseTitle ?? 'Không rõ khóa học'), status: String(item.status ?? ''), progressPercent: Number(item.progressPercent) || 0, enrolledAt: String(item.enrolledAt ?? ''),
    })),
    lessonProgress: {
      completed: Number(lessonProgress.completed) || 0,
      total: Number(lessonProgress.total) || 0,
      recent: jsonRows(lessonProgress.recent).map((item) => ({ lessonId: String(item.lessonId ?? ''), title: String(item.title ?? ''), status: String(item.status ?? ''), score: typeof item.score === 'number' ? item.score : null, updatedAt: String(item.updatedAt ?? '') })),
    },
    vocabulary: { reviewed: Number(vocabulary.reviewed) || 0, mastered: Number(vocabulary.mastered) || 0, due: Number(vocabulary.due) || 0 },
    assessments: {
      attempts: Number(assessments.attempts) || 0,
      passRate: Number(assessments.passRate) || 0,
      recent: jsonRows(assessments.recent).map((item) => ({ assessmentId: String(item.assessmentId ?? ''), title: String(item.title ?? ''), score: Number(item.score) || 0, passed: item.passed === true, attemptedAt: String(item.attemptedAt ?? '') })),
    },
    activity: jsonRows(value.activity).map((item) => ({ eventType: String(item.eventType ?? ''), eventLabel: String(item.eventLabel ?? ''), courseId: typeof item.courseId === 'string' ? item.courseId : null, occurredAt: String(item.occurredAt ?? '') })),
    notes: jsonRows(value.notes).map((item) => ({ id: String(item.id ?? ''), body: String(item.body ?? ''), staffId: String(item.staffId ?? ''), createdAt: String(item.createdAt ?? '') })),
  };
}

export async function listAdminStaff(): Promise<AdminStaffMember[]> {
  const client = await requireAdmin();
  const [{ data: roles, error: roleError }, { data: profiles, error: profileError }] = await Promise.all([
    client.from('admin_roles').select('*').order('granted_at', { ascending: false }),
    client.from('profiles').select('user_id, display_name, email'),
  ]);
  if (roleError) throw new Error(roleError.message);
  if (profileError) throw new Error(profileError.message);
  const profilesById = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
  return (roles ?? []).map((role) => ({
    ...role,
    displayName: profilesById.get(role.user_id)?.display_name ?? 'Chưa có hồ sơ',
    email: profilesById.get(role.user_id)?.email ?? role.user_id,
  }));
}

export async function setAdminStaffRole(userId: string, role: AdminStaffRole): Promise<StaffRoleRow> {
  const { data, error } = await (await requireAdmin()).rpc('admin_set_staff_role', {
    target_user_id: userId,
    target_role: role,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Không cập nhật được vai trò nhân sự.');
  return data;
}

export async function removeAdminStaffRole(userId: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_remove_staff_role', { target_user_id: userId });
  if (error) throw new Error(error.message);
}

export async function inviteAdminStaff(email: string, role: Exclude<AdminStaffRole, 'owner'>): Promise<{ userId: string; email: string; role: string }> {
  const { data, error } = await (await requireAdmin()).functions.invoke('admin-invite-user', { body: { email, role } });
  if (error) throw new Error(error.message);
  if (!data || typeof data !== 'object' || typeof data.userId !== 'string') throw new Error('Không nhận được xác nhận lời mời nhân sự.');
  return data as { userId: string; email: string; role: string };
}

export async function uploadAdminCourseAsset(courseId: string, contentId: string, file: File): Promise<string> {
  if (!courseId || !contentId || !file.name) throw new Error('Thiếu khóa học, nội dung hoặc tệp tải lên.');
  if (file.size <= 0 || file.size > 50 * 1024 * 1024) throw new Error('Tệp phải có dung lượng từ 1 byte đến 50 MB.');
  const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
  const path = `content/${courseId}/${contentId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await (await requireAdmin()).storage.from('course-assets').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

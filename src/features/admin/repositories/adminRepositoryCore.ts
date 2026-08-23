import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import type { Database, Tables, TablesInsert } from '@/src/features/supabase/lib/database.types';

export type AdminDraft<T extends keyof Database['public']['Tables']> = Partial<Tables<T>> & { id?: string; isNew?: boolean };

export function insertDraft<T extends keyof Database['public']['Tables']>(id: string | undefined, payload: Partial<Tables<T>>): TablesInsert<T> {
  return { ...(id ? { id } : {}), ...payload } as TablesInsert<T>;
}

export type AdminReviewOption = Database['public']['Functions']['get_admin_review_options']['Returns'][number];
export type AdminLessonExercise = Database['public']['Functions']['get_admin_lesson_exercises']['Returns'][number];

export type AdminStaffRole = 'owner' | 'content_editor' | 'instructor_support' | 'analyst';

export interface AdminWeakTopic {
  title: string;
  courseId: string;
  attempts: number;
  passRate: number;
}

export interface AdminContentReadiness {
  publishedCourses: number;
  totalCourses: number;
  publishedLessons: number;
  totalLessons: number;
  publishedDocuments: number;
  totalDocuments: number;
  publishedAssessments: number;
  totalAssessments: number;
  percent: number;
}

export interface AdminEmailDelivery {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
}

export interface AdminAnalytics {
  verifiedUsers: number;
  activeLearners: number;
  activeEnrollments: number;
  weeklyActiveLearners: number;
  courseCompletion: number;
  masteredVocabulary: number;
  dueVocabulary: number;
  currentStreakLearners: number;
  examAttempts: number;
  examPassRate: number;
  weakTopics: AdminWeakTopic[];
  cohortRetention: { day7: number; day30: number };
  aiRequestsThisMonth: number;
  aiErrorsThisMonth: number;
  aiQuotaConsumed: number;
  aiQuotaCapacity: number;
  contentReadiness: AdminContentReadiness;
  emailDelivery: AdminEmailDelivery;
  pendingEmail: number;
}

export interface AdminStaffMember extends Tables<'admin_roles'> {
  displayName: string;
  email: string;
}

export interface AdminLearnerDetail {
  settings: { dailyGoalMinutes: number; timezone: string; reminderTime: string | null; emailNotifications: boolean; aiConcise: boolean; ttsEnabled: boolean; inAppNotifications: boolean };
  enrollments: Array<{ courseId: string; courseTitle: string; status: string; progressPercent: number; enrolledAt: string }>;
  lessonProgress: { completed: number; total: number; recent: Array<{ lessonId: string; title: string; status: string; score: number | null; updatedAt: string }> };
  vocabulary: { reviewed: number; mastered: number; due: number };
  assessments: { attempts: number; passRate: number; recent: Array<{ assessmentId: string; title: string; score: number; passed: boolean; attemptedAt: string }> };
  activity: Array<{ eventType: string; eventLabel: string; courseId: string | null; occurredAt: string }>;
  notes: Array<{ id: string; body: string; staffId: string; createdAt: string }>;
}

const STAFF_ROLES: ReadonlySet<AdminStaffRole> = new Set(['owner', 'content_editor', 'instructor_support', 'analyst']);

function normalizeStaffRole(value: string | null | undefined): AdminStaffRole | null {
  return STAFF_ROLES.has(value as AdminStaffRole) ? (value as AdminStaffRole) : null;
}

export async function requireAdmin() {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client.from('admin_roles').select('role').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!normalizeStaffRole(data?.role)) throw new Error('Tài khoản chưa có quyền admin.');
  return client;
}

export async function getCurrentAdminRole(): Promise<AdminStaffRole> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client.from('admin_roles').select('role').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  const role = normalizeStaffRole(data?.role);
  if (!role) throw new Error('Tài khoản chưa có quyền admin.');
  return role;
}

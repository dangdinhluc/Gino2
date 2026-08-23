import { requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import type { Tables, TablesInsert, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, type AdminAnalytics, type AdminDraft } from './adminRepositoryCore';

type Alert = Tables<'admin_alerts'>;
type SitePage = Tables<'site_pages'>;
type DashboardHeroSlot = Tables<'dashboard_hero_slots'>;
type Announcement = Tables<'announcements'>;
type InterventionNote = Tables<'learner_intervention_notes'>;
type ActivityLog = Tables<'admin_activity_logs'>;

export async function listAdminDashboardHeroSlots(): Promise<DashboardHeroSlot[]> {
  const { data, error } = await (await requireAdmin()).from('dashboard_hero_slots').select('*').order('sort_order').order('start_time');
  if (error) {
    if (/dashboard_hero_slots|schema cache|does not exist/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveAdminDashboardHeroSlot(input: AdminDraft<'dashboard_hero_slots'>): Promise<DashboardHeroSlot> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('dashboard_hero_slots').update(payload as TablesUpdate<'dashboard_hero_slots'>).eq('id', id).select('*').single()
    : await client.from('dashboard_hero_slots').insert(insertDraft<'dashboard_hero_slots'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminDashboardHeroSlot(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('dashboard_hero_slots').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminAlerts(): Promise<Alert[]> {
  const { data, error } = await (await requireAdmin()).from('admin_alerts').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAlert(input: AdminDraft<'admin_alerts'>): Promise<Alert> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('admin_alerts').update(payload as TablesUpdate<'admin_alerts'>).eq('id', id).select('*').single()
    : await client.from('admin_alerts').insert(insertDraft<'admin_alerts'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminAlert(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('admin_alerts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminSitePages(): Promise<SitePage[]> {
  const { data, error } = await (await requireAdmin()).from('site_pages').select('*').order('slug');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminSitePage(input: AdminDraft<'site_pages'>): Promise<SitePage> {
  const client = await requireAdmin();
  const userId = await requireUserId(client);
  const { id, isNew, ...payload } = input;
  const values = { ...payload, updated_by: userId } as TablesInsert<'site_pages'>;
  const result = id && !isNew
    ? await client.from('site_pages').update(values).eq('slug', id).select('*').single()
    : await client.from('site_pages').insert(values).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminSitePage(slug: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('site_pages').delete().eq('slug', slug);
  if (error) throw new Error(error.message);
}

export async function listAdminApiKeyMetadata() {
  const { data, error } = await (await requireAdmin()).from('api_key_metadata').select('*').order('provider');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAdminAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await (await requireAdmin()).from('announcements').select('*').order('published_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAdminAnnouncement(input: {
  title: string;
  body: string;
  audience: 'all_learners' | 'active_learners' | 'course_learners';
  courseId?: string;
  actionUrl?: string;
}): Promise<string> {
  const { data, error } = await (await requireAdmin()).rpc('create_announcement', {
    target_title: input.title.trim(),
    target_body: input.body.trim(),
    target_audience: input.audience,
    ...(input.courseId ? { target_course_id: input.courseId } : {}),
    ...(input.actionUrl ? { target_action_url: input.actionUrl } : {}),
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function archiveAdminAnnouncement(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('archive_announcement', { target_announcement_id: id });
  if (error) throw new Error(error.message);
}

export async function listAdminInterventionNotes(learnerId?: string): Promise<InterventionNote[]> {
  let query = (await requireAdmin()).from('learner_intervention_notes').select('*').order('created_at', { ascending: false });
  if (learnerId) query = query.eq('learner_id', learnerId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAdminInterventionNote(learnerId: string, body: string): Promise<InterventionNote> {
  const { data, error } = await (await requireAdmin()).rpc('admin_create_intervention_note', {
    target_learner_id: learnerId,
    target_body: body,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Không lưu được ghi chú can thiệp.');
  return data;
}

export async function listAdminActivityLogs(limit = 100): Promise<ActivityLog[]> {
  const { data, error } = await (await requireAdmin())
    .from('admin_activity_logs')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 250)));
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_analytics');
  if (error) throw new Error(error.message);
  const value = data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : {};
  const numberAt = (key: string) => Number(value[key]) || 0;
  const objectAt = (key: string): Record<string, unknown> => {
    const item = value[key];
    return item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : {};
  };
  const content = objectAt('contentReadiness');
  const retention = objectAt('cohortRetention');
  const email = objectAt('emailDelivery');
  const weakTopics = Array.isArray(value.weakTopics) ? value.weakTopics.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    return [{ title: String(row.title ?? ''), courseId: String(row.courseId ?? ''), attempts: Number(row.attempts) || 0, passRate: Number(row.passRate) || 0 }];
  }) : [];
  return {
    verifiedUsers: numberAt('verifiedUsers'),
    activeLearners: numberAt('activeLearners'),
    activeEnrollments: numberAt('activeEnrollments'),
    weeklyActiveLearners: numberAt('weeklyActiveLearners'),
    courseCompletion: numberAt('courseCompletion'),
    masteredVocabulary: numberAt('masteredVocabulary'),
    dueVocabulary: numberAt('dueVocabulary'),
    currentStreakLearners: numberAt('currentStreakLearners'),
    examAttempts: numberAt('examAttempts'),
    examPassRate: numberAt('examPassRate'),
    weakTopics,
    cohortRetention: { day7: Number(retention.day7) || 0, day30: Number(retention.day30) || 0 },
    aiRequestsThisMonth: numberAt('aiRequestsThisMonth'),
    aiErrorsThisMonth: numberAt('aiErrorsThisMonth'),
    aiQuotaConsumed: numberAt('aiQuotaConsumed'),
    aiQuotaCapacity: numberAt('aiQuotaCapacity'),
    contentReadiness: {
      publishedCourses: Number(content.publishedCourses) || 0,
      totalCourses: Number(content.totalCourses) || 0,
      publishedLessons: Number(content.publishedLessons) || 0,
      totalLessons: Number(content.totalLessons) || 0,
      publishedDocuments: Number(content.publishedDocuments) || 0,
      totalDocuments: Number(content.totalDocuments) || 0,
      publishedAssessments: Number(content.publishedAssessments) || 0,
      totalAssessments: Number(content.totalAssessments) || 0,
      percent: Number(content.percent) || 0,
    },
    emailDelivery: {
      pending: Number(email.pending) || 0,
      processing: Number(email.processing) || 0,
      sent: Number(email.sent) || 0,
      failed: Number(email.failed) || 0,
    },
    pendingEmail: numberAt('pendingEmail'),
  };
}

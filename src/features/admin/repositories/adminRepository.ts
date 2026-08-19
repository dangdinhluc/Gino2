import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import type { Database, Json, Tables, TablesInsert, TablesUpdate } from '@/src/features/supabase/lib/database.types';

type AdminDraft<T extends keyof Database['public']['Tables']> = Partial<Tables<T>> & { id?: string; isNew?: boolean };

function insertDraft<T extends keyof Database['public']['Tables']>(id: string | undefined, payload: Partial<Tables<T>>): TablesInsert<T> {
  return { ...(id ? { id } : {}), ...payload } as TablesInsert<T>;
}

type Course = Tables<'courses'>;
type Module = Tables<'course_modules'>;
type Lesson = Tables<'lessons'>;
type VocabularyItem = Tables<'vocabulary_items'>;
type Assessment = Tables<'assessments'>;
type Document = Tables<'documents'>;
type Podcast = Tables<'podcast_episodes'>;
type Package = Tables<'packages'>;
type Prompt = Tables<'ai_prompts'>;
type Alert = Tables<'admin_alerts'>;
type Student = Tables<'profiles'>;
type Enrollment = Tables<'enrollments'>;
type Announcement = Tables<'announcements'>;
type InterventionNote = Tables<'learner_intervention_notes'>;
type ActivityLog = Tables<'admin_activity_logs'>;
type PackageCourse = Tables<'package_courses'>;
type ContentRevision = Tables<'content_revisions'>;
type DashboardHeroSlot = Tables<'dashboard_hero_slots'>;
type StaffRoleRow = Tables<'admin_roles'>;
type SitePage = Tables<'site_pages'>;
type GrammarTopic = Tables<'grammar_topics'>;
type GrammarRule = Tables<'grammar_rules'>;
type GrammarExample = Tables<'grammar_examples'>;
type ReviewQuestion = Tables<'review_questions'>;
type LessonAsset = Tables<'lesson_assets'>;
type LessonVocabulary = Tables<'lesson_vocabulary'>;
type SpeakingPrompt = Tables<'speaking_prompts'>;

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

export interface AdminStaffMember extends StaffRoleRow {
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

async function requireAdmin() {
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

export async function listAdminCourses(): Promise<Course[]> {
  const { data, error } = await (await requireAdmin()).from('courses').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAdminCourse(input: TablesInsert<'courses'>): Promise<Course> {
  const { data, error } = await (await requireAdmin()).from('courses').insert(input).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminCourse(id: string, input: TablesUpdate<'courses'>): Promise<Course> {
  const { data, error } = await (await requireAdmin()).from('courses').update(input).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAdminCourse(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('courses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminModules(courseId?: string): Promise<Module[]> {
  let query = (await requireAdmin()).from('course_modules').select('*').order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminModule(input: AdminDraft<'course_modules'>): Promise<Module> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('course_modules').update(payload as TablesUpdate<'course_modules'>).eq('id', id).select('*').single()
    : await client.from('course_modules').insert(insertDraft<'course_modules'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminModule(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('course_modules').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessons(courseId?: string): Promise<Lesson[]> {
  let query = (await requireAdmin()).from('lessons').select('*').order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminLesson(input: AdminDraft<'lessons'>): Promise<Lesson> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lessons').update(payload as TablesUpdate<'lessons'>).eq('id', id).select('*').single()
    : await client.from('lessons').insert(insertDraft<'lessons'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminLesson(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lessons').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminVocabulary(): Promise<VocabularyItem[]> {
  const { data, error } = await (await requireAdmin()).from('vocabulary_items').select('*').order('term');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminVocabulary(input: AdminDraft<'vocabulary_items'>): Promise<VocabularyItem> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('vocabulary_items').update(payload as TablesUpdate<'vocabulary_items'>).eq('id', id).select('*').single()
    : await client.from('vocabulary_items').insert(insertDraft<'vocabulary_items'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminVocabulary(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('vocabulary_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminAssessments(courseId?: string): Promise<Assessment[]> {
  let query = (await requireAdmin()).from('assessments').select('*').order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAssessment(input: AdminDraft<'assessments'>): Promise<Assessment> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('assessments').update(payload as TablesUpdate<'assessments'>).eq('id', id).select('*').single()
    : await client.from('assessments').insert(insertDraft<'assessments'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function listAdminAssessmentQuestions() {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_assessment_questions');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAssessmentQuestion(input: AdminDraft<'assessment_questions'>) {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('assessment_questions').update(payload as TablesUpdate<'assessment_questions'>).eq('id', id).select('id, assessment_id, prompt, options, correct_answer, explanation, order_index, created_at, updated_at').single()
    : await client.from('assessment_questions').insert(insertDraft<'assessment_questions'>(id, payload)).select('id, assessment_id, prompt, options, correct_answer, explanation, order_index, created_at, updated_at').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminAssessment(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('assessments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAdminAssessmentQuestion(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('assessment_questions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminDocuments(courseId?: string): Promise<Document[]> {
  let query = (await requireAdmin()).from('documents').select('*').order('created_at', { ascending: false });
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminDocument(input: AdminDraft<'documents'>): Promise<Document> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('documents').update(payload as TablesUpdate<'documents'>).eq('id', id).select('*').single()
    : await client.from('documents').insert(insertDraft<'documents'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminDocument(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminAudio(courseId?: string): Promise<Podcast[]> {
  let query = (await requireAdmin()).from('podcast_episodes').select('*').order('created_at', { ascending: false });
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAudio(input: AdminDraft<'podcast_episodes'>): Promise<Podcast> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('podcast_episodes').update(payload as TablesUpdate<'podcast_episodes'>).eq('id', id).select('*').single()
    : await client.from('podcast_episodes').insert(insertDraft<'podcast_episodes'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminAudio(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('podcast_episodes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessonAssets(): Promise<LessonAsset[]> {
  const { data, error } = await (await requireAdmin()).from('lesson_assets').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminLessonAsset(input: AdminDraft<'lesson_assets'>): Promise<LessonAsset> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lesson_assets').update(payload as TablesUpdate<'lesson_assets'>).eq('id', id).select('*').single()
    : await client.from('lesson_assets').insert(insertDraft<'lesson_assets'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminLessonAsset(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lesson_assets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessonExercises(): Promise<AdminLessonExercise[]> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_lesson_exercises');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminLessonExercise(input: AdminDraft<'lesson_exercises'>): Promise<void> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lesson_exercises').update(payload as TablesUpdate<'lesson_exercises'>).eq('id', id)
    : await client.from('lesson_exercises').insert(insertDraft<'lesson_exercises'>(id, payload));
  if (result.error) throw new Error(result.error.message);
}

export async function deleteAdminLessonExercise(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lesson_exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessonVocabulary(): Promise<LessonVocabulary[]> {
  const { data, error } = await (await requireAdmin()).from('lesson_vocabulary').select('*').order('lesson_id').order('position');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceAdminLessonVocabulary(lessonId: string, vocabularyIds: string[]): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_replace_lesson_vocabulary', {
    target_lesson_id: lessonId,
    target_vocabulary_ids: [...new Set(vocabularyIds.filter(Boolean))],
  });
  if (error) throw new Error(error.message);
}

export async function listAdminReviewQuestions(): Promise<ReviewQuestion[]> {
  const { data, error } = await (await requireAdmin()).from('review_questions').select('*').order('lesson_id').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAdminReviewOptions(): Promise<AdminReviewOption[]> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_review_options');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminReviewQuestion(input: {
  id?: string;
  lessonId: string;
  prompt: string;
  explanation?: string | null;
  orderIndex?: number;
  options: string[];
  correctIndex: number;
}): Promise<string> {
  const { data, error } = await (await requireAdmin()).rpc('admin_save_review_question', {
    target_question_id: input.id ?? '',
    target_lesson_id: input.lessonId,
    target_prompt: input.prompt,
    target_explanation: input.explanation ?? '',
    target_order_index: input.orderIndex ?? 0,
    target_options: input.options,
    target_correct_index: input.correctIndex,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAdminReviewQuestion(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_delete_review_question', { target_question_id: id });
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarTopics(): Promise<GrammarTopic[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_topics').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminGrammarTopic(input: AdminDraft<'grammar_topics'>): Promise<GrammarTopic> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('grammar_topics').update(payload as TablesUpdate<'grammar_topics'>).eq('id', id).select('*').single()
    : await client.from('grammar_topics').insert(insertDraft<'grammar_topics'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminGrammarTopic(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('grammar_topics').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarRules(): Promise<GrammarRule[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_rules').select('*').order('topic_id').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminGrammarRule(input: AdminDraft<'grammar_rules'>): Promise<GrammarRule> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('grammar_rules').update(payload as TablesUpdate<'grammar_rules'>).eq('id', id).select('*').single()
    : await client.from('grammar_rules').insert(insertDraft<'grammar_rules'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminGrammarRule(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('grammar_rules').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarExamples(): Promise<GrammarExample[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_examples').select('*').order('topic_id').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminGrammarExample(input: AdminDraft<'grammar_examples'>): Promise<GrammarExample> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('grammar_examples').update(payload as TablesUpdate<'grammar_examples'>).eq('id', id).select('*').single()
    : await client.from('grammar_examples').insert(insertDraft<'grammar_examples'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminGrammarExample(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('grammar_examples').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarTopicCourses(): Promise<Tables<'grammar_topic_courses'>[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_topic_courses').select('*').order('topic_id');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceAdminGrammarTopicCourses(topicId: string, courseIds: string[]): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_replace_grammar_topic_courses', {
    target_topic_id: topicId,
    target_course_ids: [...new Set(courseIds.filter(Boolean))],
  });
  if (error) throw new Error(error.message);
}

export async function listAdminSpeakingPrompts(): Promise<SpeakingPrompt[]> {
  const { data, error } = await (await requireAdmin()).from('speaking_prompts').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminSpeakingPrompt(input: AdminDraft<'speaking_prompts'>): Promise<SpeakingPrompt> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('speaking_prompts').update(payload as TablesUpdate<'speaking_prompts'>).eq('id', id).select('*').single()
    : await client.from('speaking_prompts').insert(insertDraft<'speaking_prompts'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminSpeakingPrompt(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('speaking_prompts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

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

export async function listAdminStudents(): Promise<Student[]> {
  const { data, error } = await (await requireAdmin()).from('profiles').select('*').eq('profile_role', 'learner').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

function jsonRecord(value: Json | null | undefined): Record<string, Json> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, Json> : {};
}

function jsonRows(value: Json | null | undefined): Record<string, Json>[] {
  return Array.isArray(value) ? value.flatMap((item) => item && typeof item === 'object' && !Array.isArray(item) ? [item as Record<string, Json>] : []) : [];
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

export async function listAdminApiKeyMetadata() {
  const { data, error } = await (await requireAdmin()).from('api_key_metadata').select('*').order('provider');
  if (error) throw new Error(error.message);
  return data ?? [];
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

export async function publishAdminContent(entityType: string, entityId: string, status: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('publish_content_revision', {
    target_entity_type: entityType,
    target_entity_id: entityId,
    target_status: status,
  });
  if (error) throw new Error(error.message);
}

export async function rollbackAdminContentRevision(revisionId: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('rollback_content_revision', { target_revision_id: revisionId });
  if (error) throw new Error(error.message);
}

export async function listAdminContentRevisions(limit = 100): Promise<ContentRevision[]> {
  const { data, error } = await (await requireAdmin())
    .from('content_revisions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 250)));
  if (error) throw new Error(error.message);
  return data ?? [];
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

import type { Database } from '@/src/features/supabase/lib/database.types';
import {
  fetchAdminAnalytics,
  listAdminActivityLogs,
  listAdminAlerts,
  listAdminAssessments,
  listAdminCourses,
  listAdminEnrollments,
  listAdminGrammarTopicCourses,
  listAdminGrammarTopics,
  listAdminLessonVocabulary,
  listAdminLessons,
  listAdminModules,
  listAdminPackageCourses,
  listAdminPackages,
  listAdminReviewOptions,
  listAdminStaff,
  listAdminTablePage,
  listAdminVocabulary,
  type AdminLessonExercise,
  type AdminStaffRole,
} from '@/src/features/admin/repositories/adminRepository';
import { emptyProductionData, type AssessmentQuestion, type ProductionData, type SectionId } from './adminProductionTypes';
import { PAGE_SIZE, sectionsFor } from './adminProductionConfig';

type AdminTableName = keyof Database['public']['Tables'];

function tablePage<T extends AdminTableName>(table: T, page: number, query: string, orderBy: string, searchColumns: readonly string[], options?: { ascending?: boolean; filters?: readonly { column: string; value: string }[] }) {
  return listAdminTablePage(table, { page, pageSize: PAGE_SIZE, search: query, orderBy, searchColumns, ...options });
}

export async function loadProductionData(role: AdminStaffRole, section: SectionId, page: number, query: string): Promise<ProductionData> {
  const data = emptyProductionData();
  if (!sectionsFor(role).some((item) => item.id === section)) return data;
  switch (section) {
    case 'overview': {
      const [analytics, alerts, activity] = await Promise.all([fetchAdminAnalytics(), listAdminAlerts(), listAdminActivityLogs()]);
      data.analytics = analytics; data.alerts = alerts; data.activity = activity; data.counts.alerts = alerts.length; data.counts.activity = activity.length; return data;
    }
    case 'courses': { const result = await tablePage('courses', page, query, 'order_index', ['slug', 'title', 'level', 'description', 'status'], { ascending: true }); data.courses = result.rows; data.counts.courses = result.total; return data; }
    case 'modules': { const [courses, result] = await Promise.all([listAdminCourses(), tablePage('course_modules', page, query, 'order_index', ['title', 'description', 'level', 'status'], { ascending: true })]); data.courses = courses; data.modules = result.rows; data.counts.modules = result.total; return data; }
    case 'lessons': { const [courses, modules, result] = await Promise.all([listAdminCourses(), listAdminModules(), tablePage('lessons', page, query, 'order_index', ['title', 'description', 'lesson_type', 'status'], { ascending: true })]); data.courses = courses; data.modules = modules; data.lessons = result.rows; data.counts.lessons = result.total; return data; }
    case 'vocabulary': { const result = await tablePage('vocabulary_items', page, query, 'term', ['term', 'reading', 'translation', 'level', 'pronunciation'], { ascending: true }); data.vocabulary = result.rows; data.counts.vocabulary = result.total; return data; }
    case 'assessments': { const [courses, result] = await Promise.all([listAdminCourses(), tablePage('assessments', page, query, 'order_index', ['title', 'assessment_type', 'status'], { ascending: true })]); data.courses = courses; data.assessments = result.rows; data.counts.assessments = result.total; return data; }
    case 'questions': { const [assessments, result] = await Promise.all([listAdminAssessments(), tablePage('assessment_questions', page, query, 'order_index', ['prompt', 'correct_answer', 'explanation'], { ascending: true })]); data.assessments = assessments; data.questions = result.rows as unknown as AssessmentQuestion[]; data.counts.questions = result.total; return data; }
    case 'documents': { const [courses, result] = await Promise.all([listAdminCourses(), tablePage('documents', page, query, 'created_at', ['title', 'summary', 'document_type', 'status'])]); data.courses = courses; data.documents = result.rows; data.counts.documents = result.total; return data; }
    case 'audio': { const [courses, lessons, result] = await Promise.all([listAdminCourses(), listAdminLessons(), tablePage('podcast_episodes', page, query, 'created_at', ['title', 'summary', 'status'])]); data.courses = courses; data.lessons = lessons; data.audio = result.rows; data.counts.audio = result.total; return data; }
    case 'lessonAssets': { const [lessons, result] = await Promise.all([listAdminLessons(), tablePage('lesson_assets', page, query, 'created_at', ['title', 'description', 'asset_type'])]); data.lessons = lessons; data.lessonAssets = result.rows; data.counts.lessonAssets = result.total; return data; }
    case 'lessonExercises': { const [lessons, result] = await Promise.all([listAdminLessons(), tablePage('lesson_exercises', page, query, 'order_index', ['prompt', 'exercise_type', 'answer'], { ascending: true })]); data.lessons = lessons; data.lessonExercises = result.rows as unknown as AdminLessonExercise[]; data.counts.lessonExercises = result.total; return data; }
    case 'lessonVocabulary': { const [lessons, vocabulary, lessonVocabulary] = await Promise.all([listAdminLessons(), listAdminVocabulary(), listAdminLessonVocabulary()]); data.lessons = lessons; data.vocabulary = vocabulary; data.lessonVocabulary = lessonVocabulary; data.counts.lessonVocabulary = lessons.length; return data; }
    case 'reviewQuestions': { const [lessons, reviewOptions, result] = await Promise.all([listAdminLessons(), listAdminReviewOptions(), tablePage('review_questions', page, query, 'order_index', ['prompt', 'explanation'], { ascending: true })]); data.lessons = lessons; data.reviewOptions = reviewOptions; data.reviewQuestions = result.rows; data.counts.reviewQuestions = result.total; return data; }
    case 'grammarTopics': { const [courses, topicCourses, result] = await Promise.all([listAdminCourses(), listAdminGrammarTopicCourses(), tablePage('grammar_topics', page, query, 'order_index', ['slug', 'title', 'level', 'category', 'summary', 'status'], { ascending: true })]); data.courses = courses; data.grammarTopicCourses = topicCourses; data.grammarTopics = result.rows; data.counts.grammarTopics = result.total; return data; }
    case 'grammarRules': { const [topics, result] = await Promise.all([listAdminGrammarTopics(), tablePage('grammar_rules', page, query, 'order_index', ['title', 'body_markdown'], { ascending: true })]); data.grammarTopics = topics; data.grammarRules = result.rows; data.counts.grammarRules = result.total; return data; }
    case 'grammarExamples': { const [topics, result] = await Promise.all([listAdminGrammarTopics(), tablePage('grammar_examples', page, query, 'order_index', ['japanese_text', 'vietnamese_text', 'explanation'], { ascending: true })]); data.grammarTopics = topics; data.grammarExamples = result.rows; data.counts.grammarExamples = result.total; return data; }
    case 'speakingPrompts': { const [courses, result] = await Promise.all([listAdminCourses(), tablePage('speaking_prompts', page, query, 'order_index', ['title', 'instructions', 'status'], { ascending: true })]); data.courses = courses; data.speakingPrompts = result.rows; data.counts.speakingPrompts = result.total; return data; }
    case 'packages': { const [courses, packageCourses, result] = await Promise.all([listAdminCourses(), listAdminPackageCourses(), tablePage('packages', page, query, 'created_at', ['name', 'description', 'status'])]); data.courses = courses; data.packageCourses = packageCourses; data.packages = result.rows; data.counts.packages = result.total; return data; }
    case 'prompts': { const result = await tablePage('ai_prompts', page, query, 'created_at', ['name', 'provider', 'purpose', 'prompt_body', 'status']); data.prompts = result.rows; data.counts.prompts = result.total; return data; }
    case 'sitePages': { const result = await tablePage('site_pages', page, query, 'slug', ['slug', 'title', 'body_markdown', 'status'], { ascending: true }); data.sitePages = result.rows; data.counts.sitePages = result.total; return data; }
    case 'dashboardHero': { const result = await tablePage('dashboard_hero_slots', page, query, 'sort_order', ['label', 'asset_key', 'alt_text'], { ascending: true }); data.dashboardHero = result.rows; data.counts.dashboardHero = result.total; return data; }
    case 'students': { const [courses, packages, enrollments, result] = await Promise.all([listAdminCourses(), listAdminPackages(), listAdminEnrollments(), tablePage('profiles', page, query, 'created_at', ['display_name', 'email'], { filters: [{ column: 'profile_role', value: 'learner' }] })]); data.courses = courses; data.packages = packages; data.enrollments = enrollments; data.students = result.rows; data.counts.students = result.total; return data; }
    case 'announcements': { const [courses, result] = await Promise.all([listAdminCourses(), tablePage('announcements', page, query, 'published_at', ['title', 'body', 'audience'])]); data.courses = courses; data.announcements = result.rows; data.counts.announcements = result.total; return data; }
    case 'staff': { const staff = await listAdminStaff(); data.staff = staff; data.counts.staff = staff.length; return data; }
    case 'alerts': { const result = await tablePage('admin_alerts', page, query, 'created_at', ['severity', 'title', 'body', 'status']); data.alerts = result.rows; data.counts.alerts = result.total; return data; }
    case 'apiKeys': { const result = await tablePage('api_key_metadata', page, query, 'provider', ['provider', 'owner_name', 'masked_key', 'status'], { ascending: true }); data.apiKeys = result.rows; data.counts.apiKeys = result.total; return data; }
    case 'revisions': { const result = await tablePage('content_revisions', page, query, 'created_at', ['entity_type', 'action']); data.revisions = result.rows; data.counts.revisions = result.total; return data; }
    case 'activity': { const result = await tablePage('admin_activity_logs', page, query, 'occurred_at', ['action', 'entity_type', 'entity_id']); data.activity = result.rows; data.counts.activity = result.total; return data; }
    default: return data;
  }
}

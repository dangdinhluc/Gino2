import type { Tables } from '@/src/features/supabase/lib/database.types';
import type { AdminLessonExercise, AdminReviewOption, AdminStaffMember, AdminAnalytics } from '@/src/features/admin/repositories/adminRepository';

export type SectionId =
  | 'overview'
  | 'courses'
  | 'modules'
  | 'lessons'
  | 'vocabulary'
  | 'assessments'
  | 'questions'
  | 'documents'
  | 'audio'
  | 'lessonAssets'
  | 'lessonExercises'
  | 'lessonVocabulary'
  | 'reviewQuestions'
  | 'grammarTopics'
  | 'grammarRules'
  | 'grammarExamples'
  | 'speakingPrompts'
  | 'packages'
  | 'prompts'
  | 'sitePages'
  | 'dashboardHero'
  | 'students'
  | 'announcements'
  | 'staff'
  | 'alerts'
  | 'apiKeys'
  | 'revisions'
  | 'activity';

export type FormKind = 'text' | 'textarea' | 'number' | 'time' | 'select' | 'multi';

export interface CmsField {
  key: string;
  label: string;
  kind?: FormKind;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  hint?: string;
}

export type AssessmentQuestion = { id?: string; assessment_id?: string; prompt?: string; options?: string[] | unknown; correct_answer?: string; explanation?: string | null; order_index?: number | null; [key: string]: unknown };
export type ReviewQuestionRow = Tables<'review_questions'>;

export type Row = Record<string, unknown>;

export interface ProductionData {
  courses: Tables<'courses'>[];
  modules: Tables<'course_modules'>[];
  lessons: Tables<'lessons'>[];
  vocabulary: Tables<'vocabulary_items'>[];
  assessments: Tables<'assessments'>[];
  questions: AssessmentQuestion[];
  documents: Tables<'documents'>[];
  audio: Tables<'podcast_episodes'>[];
  lessonAssets: Tables<'lesson_assets'>[];
  lessonExercises: AdminLessonExercise[];
  lessonVocabulary: Tables<'lesson_vocabulary'>[];
  reviewQuestions: ReviewQuestionRow[];
  reviewOptions: AdminReviewOption[];
  grammarTopics: Tables<'grammar_topics'>[];
  grammarRules: Tables<'grammar_rules'>[];
  grammarExamples: Tables<'grammar_examples'>[];
  grammarTopicCourses: Tables<'grammar_topic_courses'>[];
  speakingPrompts: Tables<'speaking_prompts'>[];
  packages: Tables<'packages'>[];
  packageCourses: Tables<'package_courses'>[];
  prompts: Tables<'ai_prompts'>[];
  sitePages: Tables<'site_pages'>[];
  dashboardHero: Tables<'dashboard_hero_slots'>[];
  students: Tables<'profiles'>[];
  enrollments: Tables<'enrollments'>[];
  announcements: Tables<'announcements'>[];
  staff: AdminStaffMember[];
  alerts: Tables<'admin_alerts'>[];
  apiKeys: Tables<'api_key_metadata'>[];
  revisions: Tables<'content_revisions'>[];
  activity: Tables<'admin_activity_logs'>[];
  analytics: AdminAnalytics | null;
}

export const emptyProductionData = (): ProductionData => ({
  courses: [], modules: [], lessons: [], vocabulary: [], assessments: [], questions: [], documents: [], audio: [], lessonAssets: [], lessonExercises: [], lessonVocabulary: [], reviewQuestions: [], reviewOptions: [], grammarTopics: [], grammarRules: [], grammarExamples: [], grammarTopicCourses: [], speakingPrompts: [],
  packages: [], packageCourses: [], prompts: [], sitePages: [], dashboardHero: [], students: [], enrollments: [], announcements: [], staff: [], alerts: [],
  apiKeys: [], revisions: [], activity: [], analytics: null,
});

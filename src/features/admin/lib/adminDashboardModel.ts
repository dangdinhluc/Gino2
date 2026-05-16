import { useMemo } from 'react';
import {
  BarChart3,
  BookOpen,
  Bot,
  ClipboardList,
  FileText,
  GraduationCap,
  KeyRound,
  Layers3,
  LayoutDashboard,
  Package,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  adminAiPrompts,
  adminApiKeys,
  adminAssessments,
  adminAudioContent,
  adminCourseLessons,
  adminCourseModules,
  adminCourses,
  adminDocuments,
  adminLessonAssets,
  adminLessonExercises,
  adminPackages,
  adminStudents,
  adminVocabulary,
  type AdminAiPrompt,
  type AdminAiPromptPurpose,
  type AdminAiPromptStatus,
  type AdminAiProvider,
  type AdminApiKeyRecord,
  type AdminApiKeyStatus,
  type AdminApiProvider,
  type AdminAssessment,
  type AdminAudioContent,
  type AdminContentStatus,
  type AdminCourse,
  type AdminCourseLesson,
  type AdminCourseLessonType,
  type AdminCourseModule,
  type AdminCourseStatus,
  type AdminDocument,
  type AdminLessonAsset,
  type AdminLessonExercise,
  type AdminEnvironment,
  type AdminLevel,
  type AdminPackage,
  type AdminPackageStatus,
  type AdminReviewStatus,
  type AdminRiskStatus,
  type AdminStudent,
  type AdminVocabularyItem,
} from '@/src/data/admin';

export type AdminSection =
  | 'overview'
  | 'courses'
  | 'students'
  | 'vocabulary'
  | 'assessments'
  | 'content'
  | 'course-content'
  | 'packages'
  | 'ai-prompts'
  | 'api-keys'
  | 'reports';

export type FilterValue =
  | 'all'
  | 'high-error'
  | 'missing-assets'
  | AdminLevel
  | AdminRiskStatus
  | AdminCourseStatus
  | AdminContentStatus
  | AdminReviewStatus
  | AdminCourseLessonType
  | AdminPackageStatus
  | AdminAiProvider
  | AdminAiPromptPurpose
  | AdminAiPromptStatus
  | AdminApiProvider
  | AdminApiKeyStatus
  | AdminEnvironment;

export type DetailEntity =
  | { type: 'course'; item: AdminCourse }
  | { type: 'student'; item: AdminStudent }
  | { type: 'vocabulary'; item: AdminVocabularyItem }
  | { type: 'assessment'; item: AdminAssessment }
  | { type: 'document'; item: AdminDocument }
  | { type: 'audio'; item: AdminAudioContent }
  | { type: 'course-module'; item: AdminCourseModule }
  | { type: 'course-lesson'; item: AdminCourseLesson }
  | { type: 'package'; item: AdminPackage }
  | { type: 'ai-prompt'; item: AdminAiPrompt }
  | { type: 'api-key'; item: AdminApiKeyRecord }
  | null;

export type ProgressTone = 'blue' | 'green' | 'orange' | 'red';

export interface SectionConfig {
  id: AdminSection;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface FilterOption {
  label: string;
  value: FilterValue;
}

export interface FilteredAdminData {
  section: AdminSection;
  courses: AdminCourse[];
  students: AdminStudent[];
  vocabulary: AdminVocabularyItem[];
  assessments: AdminAssessment[];
  documents: AdminDocument[];
  audio: AdminAudioContent[];
  courseModules: AdminCourseModule[];
  courseLessons: AdminCourseLesson[];
  lessonAssets: AdminLessonAsset[];
  lessonExercises: AdminLessonExercise[];
  packages: AdminPackage[];
  aiPrompts: AdminAiPrompt[];
  apiKeys: AdminApiKeyRecord[];
}

export const sectionConfigs: SectionConfig[] = [
  { id: 'overview', label: 'Overview', description: 'Tổng quan vận hành', icon: LayoutDashboard },
  { id: 'courses', label: 'Khóa học', description: 'Course quality & revenue', icon: GraduationCap },
  { id: 'students', label: 'Học viên', description: 'Progress & risk', icon: Users },
  { id: 'vocabulary', label: 'Từ vựng', description: 'Audio, ví dụ, lỗi sai', icon: BookOpen },
  { id: 'assessments', label: 'Bài kiểm tra', description: 'Quiz & mock exam', icon: ClipboardList },
  { id: 'content', label: 'Content', description: 'Docs & audio assets', icon: FileText },
  { id: 'course-content', label: 'Course content', description: 'Lessons, assets, drills', icon: Layers3 },
  { id: 'packages', label: 'Gói học', description: 'Pricing & quota mock', icon: Package },
  { id: 'ai-prompts', label: 'AI prompts', description: 'Prompt library', icon: Bot },
  { id: 'api-keys', label: 'API keys', description: 'Masked metadata only', icon: KeyRound },
  { id: 'reports', label: 'Reports', description: 'Insights & action plan', icon: BarChart3 },
];

const baseFilters: FilterOption[] = [{ label: 'Tất cả', value: 'all' }];

export const sectionFilters: Record<AdminSection, FilterOption[]> = {
  overview: baseFilters,
  courses: [
    ...baseFilters,
    { label: 'A1', value: 'A1' },
    { label: 'A2', value: 'A2' },
    { label: 'B1', value: 'B1' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ],
  students: [
    ...baseFilters,
    { label: 'Healthy', value: 'healthy' },
    { label: 'Watch', value: 'watch' },
    { label: 'At risk', value: 'at-risk' },
    { label: 'Paused', value: 'paused' },
    { label: 'Completed', value: 'completed' },
  ],
  vocabulary: [
    ...baseFilters,
    { label: 'Needs review', value: 'needs-review' },
    { label: 'Missing audio', value: 'missing-audio' },
    { label: 'Missing example', value: 'missing-example' },
    { label: 'High error', value: 'high-error' },
  ],
  assessments: [
    ...baseFilters,
    { label: 'Published', value: 'published' },
    { label: 'Pending', value: 'pending-review' },
    { label: 'Draft', value: 'draft' },
  ],
  content: [
    ...baseFilters,
    { label: 'Published', value: 'published' },
    { label: 'Pending', value: 'pending-review' },
    { label: 'Draft', value: 'draft' },
  ],
  'course-content': [
    ...baseFilters,
    { label: 'Published', value: 'published' },
    { label: 'Pending', value: 'pending-review' },
    { label: 'Draft', value: 'draft' },
    { label: 'Missing assets', value: 'missing-assets' },
    { label: 'Grammar', value: 'grammar' },
    { label: 'Listening', value: 'listening' },
    { label: 'Speaking', value: 'speaking' },
    { label: 'Vocabulary', value: 'vocabulary' },
    { label: 'Exam prep', value: 'exam-prep' },
  ],
  packages: [
    ...baseFilters,
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ],
  'ai-prompts': [
    ...baseFilters,
    { label: 'Active', value: 'active' },
    { label: 'Testing', value: 'testing' },
    { label: 'Draft', value: 'draft' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'Mock', value: 'mock' },
    { label: 'Tutor chat', value: 'tutor-chat' },
    { label: 'Writing', value: 'writing-feedback' },
    { label: 'Speaking', value: 'speaking-coach' },
  ],
  'api-keys': [
    ...baseFilters,
    { label: 'Connected', value: 'connected' },
    { label: 'Missing', value: 'missing' },
    { label: 'Expiring', value: 'expiring' },
    { label: 'Disabled', value: 'disabled' },
    { label: 'Development', value: 'development' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'production' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
  ],
  reports: baseFilters,
};

const statusLabels: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
  healthy: 'Healthy',
  watch: 'Watch',
  'at-risk': 'At risk',
  paused: 'Paused',
  completed: 'Completed',
  approved: 'Approved',
  'needs-review': 'Needs review',
  'missing-audio': 'Missing audio',
  'missing-example': 'Missing example',
  'pending-review': 'Pending review',
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
  good: 'Good',
  active: 'Active',
  testing: 'Testing',
  connected: 'Connected',
  missing: 'Missing',
  expiring: 'Expiring soon',
  disabled: 'Disabled',
  development: 'Development',
  staging: 'Staging',
  production: 'Production',
  mock: 'Mock',
  gemini: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  other: 'Other',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  listening: 'Listening',
  speaking: 'Speaking',
  'exam-prep': 'Exam prep',
  'tutor-chat': 'Tutor chat',
  'writing-feedback': 'Writing feedback',
  'speaking-coach': 'Speaking coach',
  'vocabulary-generator': 'Vocabulary generator',
  'exam-helper': 'Exam helper',
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseAdminDate(value: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!dateOnlyMatch) {
    return new Date(value);
  }

  const [, year, month, day] = dateOnlyMatch;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'short',
    day: '2-digit',
  }).format(parseAdminDate(value));
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function matchesSearch(values: string[], query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function getCourseTitle(courseId: string): string {
  return adminCourses.find((course) => course.id === courseId)?.title ?? 'Unknown course';
}

export function getStatusLabel(value: string): string {
  return statusLabels[value] ?? value;
}

export function getStatusClass(value: string): string {
  const variants: Record<string, string> = {
    published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    connected: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    completed: 'border-[#315C73]/20 bg-[#315C73]/10 text-[#315C73]',
    testing: 'border-blue-200 bg-blue-50 text-blue-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
    development: 'border-blue-200 bg-blue-50 text-blue-700',
    staging: 'border-[#6F4AA8]/20 bg-[#6F4AA8]/10 text-[#6F4AA8]',
    production: 'border-orange-200 bg-orange-50 text-orange-700',
    draft: 'border-slate-200 bg-slate-50 text-slate-600',
    archived: 'border-slate-200 bg-slate-100 text-slate-500',
    disabled: 'border-slate-200 bg-slate-100 text-slate-500',
    mock: 'border-slate-200 bg-slate-50 text-slate-600',
    other: 'border-slate-200 bg-slate-50 text-slate-600',
    watch: 'border-amber-200 bg-amber-50 text-amber-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    expiring: 'border-amber-200 bg-amber-50 text-amber-700',
    'pending-review': 'border-amber-200 bg-amber-50 text-amber-700',
    'needs-review': 'border-amber-200 bg-amber-50 text-amber-700',
    paused: 'border-orange-200 bg-orange-50 text-orange-700',
    'missing-audio': 'border-orange-200 bg-orange-50 text-orange-700',
    'missing-example': 'border-orange-200 bg-orange-50 text-orange-700',
    missing: 'border-red-200 bg-red-50 text-red-700',
    critical: 'border-red-200 bg-red-50 text-red-700',
    'at-risk': 'border-red-200 bg-red-50 text-red-700',
    gemini: 'border-[#315C73]/20 bg-[#315C73]/10 text-[#315C73]',
    openai: 'border-slate-300 bg-slate-100 text-slate-700',
    anthropic: 'border-[#C96A1B]/20 bg-[#C96A1B]/10 text-[#C96A1B]',
  };

  return variants[value] ?? 'border-slate-200 bg-slate-50 text-slate-600';
}

export function getProgressTone(value: number): ProgressTone {
  if (value >= 80) {
    return 'green';
  }

  if (value >= 60) {
    return 'blue';
  }

  if (value >= 45) {
    return 'orange';
  }

  return 'red';
}

export function filterAdminData(section: AdminSection, query: string, filter: FilterValue): FilteredAdminData {
    const courseTitleById = new Map(adminCourses.map((course) => [course.id, course.title]));
    const resolveCourseTitle = (courseId: string) => courseTitleById.get(courseId) ?? 'Unknown course';

    const courses = adminCourses.filter((course) => {
      const matchesFilter = filter === 'all' || course.level === filter || course.status === filter;
      return matchesFilter && matchesSearch([course.title, course.owner, course.weakArea, course.nextAction], query);
    });

    const students = adminStudents.filter((student) => {
      const matchesFilter = filter === 'all' || student.level === filter || student.riskStatus === filter;
      return matchesFilter && matchesSearch([student.name, student.email, resolveCourseTitle(student.activeCourseId), student.riskReason], query);
    });

    const vocabulary = adminVocabulary.filter((item) => {
      const matchesFilter = filter === 'all' || item.level === filter || item.reviewStatus === filter || (filter === 'high-error' && item.errorRate >= 30);
      return matchesFilter && matchesSearch([item.term, item.translation, item.topic, item.commonMistake], query);
    });

    const assessments = adminAssessments.filter((assessment) => {
      const matchesFilter = filter === 'all' || assessment.status === filter;
      return matchesFilter && matchesSearch([assessment.title, assessment.type, assessment.weakestSkill, resolveCourseTitle(assessment.courseId)], query);
    });

    const documents = adminDocuments.filter((document) => {
      const matchesFilter = filter === 'all' || document.status === filter || document.level === filter;
      return matchesFilter && matchesSearch([document.title, document.type, resolveCourseTitle(document.courseId)], query);
    });

    const audio = adminAudioContent.filter((item) => {
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesFilter && matchesSearch([item.title, resolveCourseTitle(item.courseId)], query);
    });

    const lessonIdsMatchingChildSearch = new Set([
      ...adminLessonAssets.filter((asset) => matchesSearch([asset.title, asset.type, asset.missingReason], query)).map((asset) => asset.lessonId),
      ...adminLessonExercises.filter((exercise) => matchesSearch([exercise.prompt, exercise.type], query)).map((exercise) => exercise.lessonId),
    ]);

    const courseLessons = adminCourseLessons.filter((lesson) => {
      const matchesFilter =
        filter === 'all' ||
        lesson.status === filter ||
        lesson.type === filter ||
        (filter === 'missing-assets' && lesson.missingAssets.length > 0);
      const matchesQuery =
        matchesSearch([lesson.title, lesson.type, resolveCourseTitle(lesson.courseId), lesson.missingAssets.join(' ')], query) ||
        lessonIdsMatchingChildSearch.has(lesson.id);
      return matchesFilter && matchesQuery;
    });

    const visibleLessonIds = new Set(courseLessons.map((lesson) => lesson.id));
    const visibleModuleIds = new Set(courseLessons.map((lesson) => lesson.moduleId));

    const courseModules = adminCourseModules.filter((module) => {
      const hasVisibleLesson = visibleModuleIds.has(module.id);
      const matchesFilter = filter === 'all' || module.status === filter || hasVisibleLesson;
      return matchesFilter && (hasVisibleLesson || matchesSearch([module.title, module.owner, resolveCourseTitle(module.courseId)], query));
    });

    const lessonAssets = adminLessonAssets.filter((asset) => visibleLessonIds.has(asset.lessonId));

    const lessonExercises = adminLessonExercises.filter((exercise) => visibleLessonIds.has(exercise.lessonId));

    const packages = adminPackages.filter((packageItem) => {
      const includedCourseTitles = packageItem.includedCourseIds.map(resolveCourseTitle).join(' ');
      const matchesFilter = filter === 'all' || packageItem.status === filter;
      return matchesFilter && matchesSearch([packageItem.name, packageItem.targetAudience, packageItem.highlight, includedCourseTitles], query);
    });

    const aiPrompts = adminAiPrompts.filter((prompt) => {
      const matchesFilter = filter === 'all' || prompt.status === filter || prompt.provider === filter || prompt.purpose === filter;
      return matchesFilter && matchesSearch([prompt.name, prompt.purpose, prompt.modelLabel, prompt.promptBody, prompt.owner, ...prompt.guardrails], query);
    });

    const apiKeys = adminApiKeys.filter((apiKey) => {
      const matchesFilter = filter === 'all' || apiKey.status === filter || apiKey.provider === filter || apiKey.environment === filter;
      return matchesFilter && matchesSearch([apiKey.label, apiKey.provider, apiKey.environment, apiKey.owner], query);
    });

    return {
      section,
      courses,
      students,
      vocabulary,
      assessments,
      documents,
      audio,
      courseModules,
      courseLessons,
      lessonAssets,
      lessonExercises,
      packages,
      aiPrompts,
      apiKeys,
    };
}

export function useFilteredAdminData(section: AdminSection, query: string, filter: FilterValue): FilteredAdminData {
  return useMemo(() => filterAdminData(section, query, filter), [filter, query, section]);
}

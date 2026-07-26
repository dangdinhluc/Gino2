export type AdminLevel = 'A1' | 'A2' | 'B1';

export type AdminCourseStatus = 'published' | 'draft' | 'archived';

export type AdminRiskStatus = 'healthy' | 'watch' | 'at-risk' | 'paused' | 'completed';

export type AdminReviewStatus = 'approved' | 'needs-review' | 'missing-audio' | 'missing-example';

export type AdminContentStatus = 'published' | 'draft' | 'pending-review' | 'archived';

export type AdminAlertSeverity = 'critical' | 'warning' | 'info' | 'good';

export type AdminEntityType =
  | 'course'
  | 'student'
  | 'vocabulary'
  | 'assessment'
  | 'document'
  | 'audio'
  | 'course-module'
  | 'course-lesson'
  | 'package'
  | 'ai-prompt'
  | 'api-key';

export type AdminCourseLessonType = 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'exam-prep';

export type AdminLessonAssetType = 'document' | 'audio' | 'image' | 'transcript' | 'worksheet';

export type AdminLessonExerciseType = 'multiple-choice' | 'fill-blank' | 'word-order' | 'matching' | 'speaking-prompt';

export type AdminPackageStatus = 'active' | 'draft' | 'archived';

export type AdminAiProvider = 'mock' | 'gemini' | 'openai' | 'anthropic';

export type AdminAiPromptPurpose = 'tutor-chat' | 'writing-feedback' | 'speaking-coach' | 'vocabulary-generator' | 'exam-helper';

export type AdminAiPromptStatus = 'active' | 'draft' | 'testing' | 'archived';

export type AdminApiProvider = 'gemini' | 'openai' | 'anthropic' | 'other';

export type AdminApiKeyStatus = 'connected' | 'missing' | 'expiring' | 'disabled';

export type AdminMaskedApiKey = `${string}••••${string}` | 'not configured';

export type AdminEnvironment = 'development' | 'staging' | 'production';

export interface AdminCourse {
  id: string;
  title: string;
  level: AdminLevel;
  status: AdminCourseStatus;
  lessonCount: number;
  enrolledCount: number;
  completionRate: number;
  averageScore: number;
  revenueMock: number;
  updatedAt: string;
  owner: string;
  weakArea: string;
  nextAction: string;
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  level: AdminLevel;
  activeCourseId: string;
  progress: number;
  streakDays: number;
  averageScore: number;
  vocabularyKnown: number;
  lastActiveAt: string;
  riskStatus: AdminRiskStatus;
  riskReason: string;
  recommendedAction: string;
}

export interface AdminVocabularyItem {
  id: string;
  term: string;
  translation: string;
  level: AdminLevel;
  topic: string;
  example: string;
  hasAudio: boolean;
  errorRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  reviewStatus: AdminReviewStatus;
  linkedCourseIds: string[];
  commonMistake: string;
}

export interface AdminAssessment {
  id: string;
  title: string;
  courseId: string;
  type: 'quiz' | 'mock-exam' | 'listening' | 'vocabulary';
  questionCount: number;
  averageScore: number;
  completionRate: number;
  status: AdminContentStatus;
  weakestSkill: string;
}

export interface AdminDocument {
  id: string;
  title: string;
  courseId: string;
  type: 'pdf' | 'worksheet' | 'grammar-note' | 'checklist';
  level: AdminLevel;
  viewCount: number;
  downloadCount: number;
  status: AdminContentStatus;
  updatedAt: string;
}

export interface AdminAudioContent {
  id: string;
  title: string;
  courseId: string;
  durationMinutes: number;
  plays: number;
  status: AdminContentStatus;
  missingTranscript: boolean;
}

export interface AdminCourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  status: AdminContentStatus;
  lessonCount: number;
  estimatedMinutes: number;
  owner: string;
  updatedAt: string;
}

export interface AdminCourseLesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  type: AdminCourseLessonType;
  status: AdminContentStatus;
  order: number;
  assetCount: number;
  exerciseCount: number;
  qualityScore: number;
  missingAssets: string[];
  updatedAt: string;
}

export interface AdminLessonAsset {
  id: string;
  lessonId: string;
  type: AdminLessonAssetType;
  title: string;
  status: AdminContentStatus;
  missingReason: string;
  updatedAt: string;
}

export interface AdminLessonExercise {
  id: string;
  lessonId: string;
  type: AdminLessonExerciseType;
  prompt: string;
  status: AdminContentStatus;
  errorRate: number;
  updatedAt: string;
}

export interface AdminPackage {
  id: string;
  name: string;
  status: AdminPackageStatus;
  price: number;
  durationDays: number;
  includedCourseIds: string[];
  aiMonthlyQuota: number;
  activeSubscribers: number;
  revenueMock: number;
  targetAudience: string;
  highlight: string;
  updatedAt: string;
}

export interface AdminAiPrompt {
  id: string;
  name: string;
  purpose: AdminAiPromptPurpose;
  provider: AdminAiProvider;
  modelLabel: string;
  status: AdminAiPromptStatus;
  version: string;
  promptBody: string;
  guardrails: string[];
  sampleInput: string;
  sampleOutput: string;
  owner: string;
  updatedAt: string;
}

export interface AdminApiKeyRecord {
  id: string;
  provider: AdminApiProvider;
  label: string;
  environment: AdminEnvironment;
  status: AdminApiKeyStatus;
  maskedKey: AdminMaskedApiKey;
  lastUsedAt?: string;
  monthlyQuotaUsed: number;
  monthlyQuotaLimit: number;
  owner: string;
  createdAt: string;
}

export interface AdminAlert {
  id: string;
  severity: AdminAlertSeverity;
  category:
    | 'student-risk'
    | 'course-quality'
    | 'content-review'
    | 'vocabulary-quality'
    | 'course-content-readiness'
    | 'package-pricing'
    | 'ai-prompt-review'
    | 'api-key-health';
  title: string;
  description: string;
  relatedEntityType: AdminEntityType;
  relatedEntityId: string;
  recommendedAction: string;
  createdAt: string;
}

export interface AdminActivity {
  id: string;
  actorName: string;
  action: string;
  entityType: AdminEntityType;
  entityTitle: string;
  createdAt: string;
}

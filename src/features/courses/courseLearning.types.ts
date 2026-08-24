import type { CourseFeatureFlags } from '@/src/features/courses/lib/courseCapabilities';

export type VocabularyStatus = 'new' | 'learning' | 'due' | 'remembered';
export type CourseDocumentKind = 'PDF' | 'DOC' | 'Post';
export type CourseExamStatus = 'ready' | 'in_progress' | 'completed' | 'locked';

export interface CourseLearningCourse {
  id: string;
  title: string;
  level: string;
  description: string;
  currentModule: string;
  progress: number;
}

export interface CourseVocabularyItem {
  id: string;
  word: string;
  article: string;
  meaning: string;
  pronunciation: string;
  kanji?: string;
  kana?: string;
  example: { jp: string; vi: string };
  status: VocabularyStatus;
  module: string;
  strength: number;
  tags: string[];
  audioUrl?: string | null;
  mnemonic?: string;
}

export interface CourseReviewQuestion {
  id: string;
  type: 'meaning' | 'article' | 'sentence' | 'listening';
  prompt: string;
  options: string[];
  optionIds?: Record<string, string>;
  explanation: string;
  source: string;
}

export interface CourseDocumentItem {
  id: string;
  title: string;
  kind: CourseDocumentKind;
  size: string;
  publishedAt: string;
  readTime: string;
  module: string;
  summary: string;
  preview: string;
  tags: string[];
  contentMarkdown?: string;
  externalUrl?: string | null;
  readTimeMinutes?: number;
  storagePath?: string | null;
}

export interface CourseGameItem {
  id: string;
  title: string;
  source: string;
  description: string;
  rounds: number;
  bestScore: number;
  duration: string;
  color: string;
}

export interface CourseExamItem {
  id: string;
  title: string;
  skills: string[];
  duration: string;
  status: CourseExamStatus;
  latestScore?: number;
  /** Chỉ đặt khi status === 'locked': nhãn mô tả điều kiện mở khóa. */
  unlockLabel?: string;
}

export interface CoursePodcastItem {
  id: string;
  title: string;
  episode: string;
  duration: string;
  summary: string;
  isNew: boolean;
  externalUrl?: string | null;
  storagePath?: string | null;
}

export interface CourseLearningWorkspaceData {
  course: CourseLearningCourse;
  vocabulary: CourseVocabularyItem[];
  reviewQuestions: CourseReviewQuestion[];
  documents: CourseDocumentItem[];
  games: CourseGameItem[];
  exams: CourseExamItem[];
  podcasts: CoursePodcastItem[];
  featureConfig: CourseFeatureFlags;
}

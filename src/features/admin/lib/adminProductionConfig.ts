import type { AdminStaffRole } from '@/src/features/admin/repositories/adminRepository';
import { BookOpen, Bell, CheckCircle2, FileAudio, FileText, Layers3, Package, ScrollText, ShieldCheck, Sparkles, UserCog, Users, Volume2 } from 'lucide-react';
import type { SectionId } from './adminProductionTypes';

export const PAGE_SIZE = 12;

export const CONTENT_ENTITY_TYPES: Partial<Record<SectionId, string>> = {
  courses: 'course', modules: 'module', lessons: 'lesson', assessments: 'assessment', documents: 'document', audio: 'podcast', grammarTopics: 'grammar_topic', speakingPrompts: 'speaking_prompt',
};

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'in_review', label: 'Chờ duyệt' },
];
export const PACKAGE_STATUS_OPTIONS = [{ value: 'draft', label: 'Nháp' }, { value: 'active', label: 'Đang mở' }, { value: 'archived', label: 'Lưu trữ' }];
export const ALERT_STATUS_OPTIONS = [{ value: 'open', label: 'Đang mở' }, { value: 'resolved', label: 'Đã xử lý' }];
export const PROMPT_STATUS_OPTIONS = [{ value: 'draft', label: 'Nháp' }, { value: 'active', label: 'Đang dùng' }, { value: 'archived', label: 'Lưu trữ' }];
export const SITE_PAGE_STATUS_OPTIONS = [{ value: 'draft', label: 'Nháp' }, { value: 'published', label: 'Đã công bố' }, { value: 'archived', label: 'Lưu trữ' }];

export function isContentRole(role: AdminStaffRole): boolean {
  return role === 'owner' || role === 'content_editor';
}

export function isLearnerRole(role: AdminStaffRole): boolean {
  return role === 'owner' || role === 'instructor_support';
}

export function isAnalyticsRole(role: AdminStaffRole): boolean {
  return role === 'owner' || role === 'analyst';
}

export function isAnnouncementRole(role: AdminStaffRole): boolean {
  return role === 'owner' || role === 'instructor_support';
}

export function sectionsFor(role: AdminStaffRole): Array<{ id: SectionId; label: string; icon: typeof Layers3 }> {
  const sections: Array<{ id: SectionId; label: string; icon: typeof Layers3 }> = [];
  if (isAnalyticsRole(role)) sections.push({ id: 'overview', label: 'Tổng quan', icon: Layers3 });
  if (isContentRole(role)) {
    sections.push(
      { id: 'courses', label: 'Khóa học', icon: Layers3 },
      { id: 'modules', label: 'Module', icon: Layers3 },
      { id: 'lessons', label: 'Bài học', icon: FileText },
      { id: 'vocabulary', label: 'Từ vựng', icon: Volume2 },
      { id: 'assessments', label: 'Bài kiểm tra', icon: CheckCircle2 },
      { id: 'questions', label: 'Câu hỏi thi', icon: CheckCircle2 },
      { id: 'documents', label: 'Tài liệu', icon: FileText },
      { id: 'audio', label: 'Audio', icon: FileAudio },
      { id: 'lessonAssets', label: 'Tệp bài học', icon: FileText },
      { id: 'lessonExercises', label: 'Bài tập', icon: CheckCircle2 },
      { id: 'lessonVocabulary', label: 'Gắn từ vào bài', icon: Volume2 },
      { id: 'reviewQuestions', label: 'Câu hỏi ôn', icon: CheckCircle2 },
      { id: 'grammarTopics', label: 'Ngữ pháp', icon: BookOpen },
      { id: 'grammarRules', label: 'Quy tắc ngữ pháp', icon: FileText },
      { id: 'grammarExamples', label: 'Ví dụ ngữ pháp', icon: FileText },
      { id: 'speakingPrompts', label: 'Đề Speaking', icon: FileAudio },
      { id: 'revisions', label: 'Lịch sử nội dung', icon: ScrollText },
    );
  }
  if (role === 'owner') {
    sections.push(
      { id: 'packages', label: 'Gói học', icon: Package },
      { id: 'prompts', label: 'Prompt AI', icon: Sparkles },
      { id: 'sitePages', label: 'Trang công khai', icon: FileText },
      { id: 'dashboardHero', label: 'Mascot dashboard', icon: Sparkles },
      { id: 'staff', label: 'Nhân sự', icon: UserCog },
      { id: 'alerts', label: 'Cảnh báo', icon: Bell },
      { id: 'apiKeys', label: 'API metadata', icon: ShieldCheck },
    );
  }
  if (isLearnerRole(role)) sections.push({ id: 'students', label: 'Học viên', icon: Users });
  if (role === 'analyst') sections.push({ id: 'alerts', label: 'Cảnh báo', icon: Bell });
  if (isAnnouncementRole(role) || role === 'analyst') sections.push({ id: 'announcements', label: 'Thông báo', icon: Bell });
  if (isAnalyticsRole(role)) sections.push({ id: 'activity', label: 'Audit', icon: ScrollText });
  return sections;
}

import {
  FileText,
  Gamepad2,
  GraduationCap,
  Layers,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';

export type CourseWorkspaceSection = 'vocabulary' | 'documents' | 'practice' | 'games' | 'exams';

export interface CourseWorkspaceTab {
  id: CourseWorkspaceSection;
  label: string;
  hint: string;
  icon: LucideIcon;
  imageIcon: string;
}

/** Default registry. Visible tabs are filtered by course feature_config. */
export const courseWorkspaceTabs: readonly CourseWorkspaceTab[] = [
  {
    id: 'vocabulary',
    label: 'Từ vựng',
    hint: 'Danh sách từ & Flashcards',
    icon: Layers,
    imageIcon: assets.courses.workspace.vocabulary,
  },
  {
    id: 'documents',
    label: 'Tài liệu',
    hint: 'Bài đọc, quy trình & hội thoại',
    icon: FileText,
    imageIcon: assets.courses.workspace.documents,
  },
  {
    id: 'practice',
    label: 'Luyện tập',
    hint: 'Phản xạ theo chủ đề & cấp độ',
    icon: Target,
    imageIcon: assets.courses.workspace.practice,
  },
  {
    id: 'games',
    label: 'Game',
    hint: 'Luyện phản xạ từ vựng',
    icon: Gamepad2,
    imageIcon: assets.courses.workspace.games,
  },
  {
    id: 'exams',
    label: 'Thi thử',
    hint: 'Đề thi theo cấu hình khóa học',
    icon: GraduationCap,
    imageIcon: assets.courses.workspace.exam,
  },
];

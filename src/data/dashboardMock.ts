import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileCheck,
  Gamepad2,
  Layers,
  LibraryBig,
  MessageSquareText,
  Mic,
  type LucideIcon,
} from 'lucide-react';

/**
 * Du lieu mau cho Dashboard.
 *
 * Tach khoi `DashboardPage.tsx` de component chi con lo hien thi. Khi co du lieu
 * that (nhiem vu theo user, XP that) chi can thay nguon tra ve dung shape nay.
 */

export interface DashboardTool {
  label: string;
  sub: string;
  icon: LucideIcon;
  /** Khoa mau nen icon, map sang toolAccentClass trong DashboardPage. */
  accent: 'book' | 'srs' | 'exam' | 'library' | 'game' | 'ai' | 'stats';
  path: string;
}

export interface DashboardTask {
  title: string;
  xp: string;
  status: string;
  icon: LucideIcon;
  path: string;
}

/** So cong cu hien mac dinh tren Dashboard. Phan con lai an sau nut "Xem tat ca". */
export const PRIMARY_TOOL_COUNT = 3;

/** Thu tu quan trong: 3 muc dau la duong vao chinh moi ngay. */
export const dashboardTools: DashboardTool[] = [
  {
    label: 'Lộ trình Tokutei',
    sub: 'JFT, workplace, interview',
    icon: BookOpen,
    accent: 'book',
    path: '/app/courses',
  },
  {
    label: 'Thẻ ôn nhanh',
    sub: 'Cụm từ, hồ sơ, tình huống',
    icon: Layers,
    accent: 'srs',
    path: '/app/review/flashcards',
  },
  {
    label: 'Đề mô phỏng',
    sub: 'JFT, hồ sơ, HR',
    icon: FileCheck,
    accent: 'exam',
    path: '/app/exams/e1/start',
  },
  {
    label: 'Thư viện Tokutei',
    sub: 'Checklist, tác phong, từ khóa',
    icon: LibraryBig,
    accent: 'library',
    path: '/app/grammar',
  },
  {
    label: 'Mini game ca làm',
    sub: 'Phản xạ 1-3 phút',
    icon: Gamepad2,
    accent: 'game',
    path: '/app/hub',
  },
  {
    label: 'Coach AI',
    sub: 'Sửa câu trả lời nhanh',
    icon: MessageSquareText,
    accent: 'ai',
    path: '/app/ai-chat',
  },
  {
    label: 'Thống kê',
    sub: 'Mức sẵn sàng của anh',
    icon: BarChart3,
    accent: 'stats',
    path: '/app/stats',
  },
];

export const dashboardTasks: DashboardTask[] = [
  {
    title: 'Ôn 8 cụm đầu ca',
    xp: '+12',
    status: '0/1',
    icon: Layers,
    path: '/app/review/flashcards',
  },
  {
    title: 'Shift Sprint',
    xp: '+25',
    status: '0/1',
    icon: Gamepad2,
    path: '/app/hub/gino-runner',
  },
  {
    title: 'Mock interview 3 câu',
    xp: '+20',
    status: '0/1',
    icon: Mic,
    path: '/app/ai-speak',
  },
  {
    title: 'Checklist hồ sơ',
    xp: '+10',
    status: '0/1',
    icon: ClipboardCheck,
    path: '/app/grammar',
  },
];

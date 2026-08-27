import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  FileAudio,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  Package,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Volume2,
} from 'lucide-react';
import type { AdminStaffRole } from '@/src/features/admin/repositories/adminRepository';

export type AdminNavigationArea = 'overview' | 'content' | 'learners' | 'communication' | 'ai' | 'system';

export interface AdminNavigationItem {
  area: AdminNavigationArea;
  label: string;
  to: string;
  icon: LucideIcon;
  roles: readonly AdminStaffRole[];
  end?: boolean;
}

export interface AdminNavigationGroup {
  label: string | null;
  items: readonly AdminNavigationItem[];
}

const owner: readonly AdminStaffRole[] = ['owner'];
const contentRoles: readonly AdminStaffRole[] = ['owner', 'content_editor'];
const learnerRoles: readonly AdminStaffRole[] = ['owner', 'instructor_support'];
const analyticsRoles: readonly AdminStaffRole[] = ['owner', 'analyst'];
const communicationRoles: readonly AdminStaffRole[] = ['owner', 'instructor_support', 'analyst'];

export const adminNavigationGroups: readonly AdminNavigationGroup[] = [
  {
    label: null,
    items: [{ area: 'overview', label: 'Tổng quan', to: '/admin', icon: LayoutDashboard, roles: analyticsRoles, end: true }],
  },
  {
    label: 'Nội dung',
    items: [
      { area: 'content', label: 'Khóa học', to: '/admin/content/courses', icon: GraduationCap, roles: contentRoles },
      { area: 'content', label: 'Từ vựng', to: '/admin/content/vocabulary', icon: Volume2, roles: contentRoles },
      { area: 'content', label: 'Ngữ pháp', to: '/admin/content/grammar', icon: BookOpen, roles: contentRoles },
      { area: 'content', label: 'Thi thử', to: '/admin/content/exams', icon: ScrollText, roles: contentRoles },
      { area: 'content', label: 'Tài liệu & media', to: '/admin/content/media', icon: FileAudio, roles: contentRoles },
    ],
  },
  {
    label: 'Học viên',
    items: [{ area: 'learners', label: 'Học viên', to: '/admin/learners', icon: Users, roles: learnerRoles }],
  },
  {
    label: 'Giao tiếp',
    items: [
      { area: 'communication', label: 'Thông báo', to: '/admin/communication/announcements', icon: Bell, roles: communicationRoles },
      { area: 'communication', label: 'Cảnh báo', to: '/admin/communication/alerts', icon: Bell, roles: analyticsRoles },
    ],
  },
  {
    label: 'AI & công cụ',
    items: [
      { area: 'ai', label: 'AI prompts', to: '/admin/ai/prompts', icon: Sparkles, roles: owner },
      { area: 'ai', label: 'Mascot dashboard', to: '/admin/ai/mascot', icon: Sparkles, roles: owner },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { area: 'system', label: 'Nhân sự', to: '/admin/system/staff', icon: UserCog, roles: owner },
      { area: 'system', label: 'Gói học', to: '/admin/system/packages', icon: Package, roles: owner },
      { area: 'system', label: 'Trang công khai', to: '/admin/system/pages', icon: FileText, roles: owner },
      { area: 'system', label: 'Lịch sử nội dung', to: '/admin/system/revisions', icon: History, roles: contentRoles },
      { area: 'system', label: 'Audit', to: '/admin/system/audit', icon: ShieldCheck, roles: analyticsRoles },
      { area: 'system', label: 'API metadata', to: '/admin/system/api-metadata', icon: Settings2, roles: owner },
    ],
  },
];

export function isAdminNavigationItemVisible(item: AdminNavigationItem, role: AdminStaffRole): boolean {
  return item.roles.includes(role);
}

export function getAdminNavigation(role: AdminStaffRole): AdminNavigationGroup[] {
  return adminNavigationGroups.flatMap((group) => {
    const items = group.items.filter((item) => isAdminNavigationItemVisible(item, role));
    return items.length ? [{ ...group, items }] : [];
  });
}

export function canAccessAdminArea(role: AdminStaffRole, area: AdminNavigationArea): boolean {
  return adminNavigationGroups.some((group) => group.items.some((item) => item.area === area && isAdminNavigationItemVisible(item, role)));
}

export function canAccessAdminPath(role: AdminStaffRole, path: string): boolean {
  return adminNavigationGroups.some((group) => group.items.some((item) => item.to === path && isAdminNavigationItemVisible(item, role)));
}

export function getAdminDefaultPath(role: AdminStaffRole): string {
  return getAdminNavigation(role)[0]?.items[0]?.to ?? '/admin';
}

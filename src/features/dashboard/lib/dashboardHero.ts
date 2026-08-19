import { assets } from '@/src/shared/lib/assets';

export const DASHBOARD_HERO_ASSET_OPTIONS = [
  { key: 'sleeping_meow', label: 'Mèo ngủ', src: assets.shared.mascots.sleepingMeow, alt: 'Mèo trợ lý đang nghỉ' },
  { key: 'meow', label: 'Mèo trợ lý', src: assets.shared.mascots.meow, alt: 'Mèo trợ lý Tokutei Gino' },
  { key: 'ai_tutor_tanuki', label: 'Tanuki AI Tutor', src: assets.shared.mascots.aiTutorTanuki, alt: 'Tanuki trợ giảng AI' },
  { key: 'brand', label: 'Mascot thương hiệu', src: assets.shared.mascots.brand, alt: 'Mascot Tokutei Gino' },
] as const;

export type DashboardHeroAssetKey = typeof DASHBOARD_HERO_ASSET_OPTIONS[number]['key'];

export interface DashboardHeroSlotLike {
  assetKey: string;
  startTime: string;
  endTime: string;
  altText?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface DashboardAnnouncementLike {
  type: string;
}

function timeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function isTimeInDashboardHeroSlot(currentMinutes: number, startTime: string, endTime: string): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start === null || end === null || currentMinutes < 0 || currentMinutes >= 24 * 60) return false;
  if (start === end) return true;
  return start < end ? currentMinutes >= start && currentMinutes < end : currentMinutes >= start || currentMinutes < end;
}

export function selectDashboardHeroSlot<T extends DashboardHeroSlotLike>(slots: readonly T[], now: Date = new Date()): T | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return [...slots]
    .filter((slot) => slot.isActive !== false)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .find((slot) => isTimeInDashboardHeroSlot(currentMinutes, slot.startTime, slot.endTime)) ?? null;
}

export function resolveDashboardHeroAsset(assetKey: string | null | undefined) {
  return DASHBOARD_HERO_ASSET_OPTIONS.find((option) => option.key === assetKey) ?? DASHBOARD_HERO_ASSET_OPTIONS[0];
}

export function pickRandomDashboardAnnouncement<T extends DashboardAnnouncementLike>(items: readonly T[], random = Math.random): T | null {
  const announcements = items.filter((item) => item.type === 'announcement');
  if (announcements.length === 0) return null;
  const index = Math.min(announcements.length - 1, Math.max(0, Math.floor(random() * announcements.length)));
  return announcements[index];
}

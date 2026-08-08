import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { assets } from '@/src/shared/lib/assets';

export const APP_BACKGROUNDS = [
  {
    id: 'sakura',
    label: 'Hoa anh đào',
    description: 'Nền chính của Tokutei Gino',
    preview: `url('${assets.shared.backgrounds.englishHero}') center / cover`,
  },
  {
    id: 'paper',
    label: 'Giấy sáng',
    description: 'Nhẹ mắt, tập trung vào nội dung',
    preview: 'linear-gradient(135deg, #fffaf6 0%, #f2e9dd 100%)',
  },
  {
    id: 'night',
    label: 'Đêm yên tĩnh',
    description: 'Nền tối dịu cho buổi học muộn',
    preview: `linear-gradient(135deg, rgba(27, 22, 27, 0.82), rgba(73, 45, 50, 0.8)), url('${assets.shared.backgrounds.dashboardLibrary}') center / cover`,
  },
] as const;

export type AppBackgroundId = (typeof APP_BACKGROUNDS)[number]['id'];

interface AppThemeContextValue {
  background: AppBackgroundId;
  setBackground: (background: AppBackgroundId) => void;
}

const STORAGE_KEY = 'tokutei-app-background';
const AppThemeContext = createContext<AppThemeContextValue | null>(null);

function getInitialBackground(): AppBackgroundId {
  if (typeof window === 'undefined') return 'sakura';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return APP_BACKGROUNDS.some((option) => option.id === saved) ? saved as AppBackgroundId : 'sakura';
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [background, setBackground] = useState<AppBackgroundId>(getInitialBackground);

  useEffect(() => {
    document.documentElement.style.setProperty('--asset-english-hero-background', `url("${assets.shared.backgrounds.englishHero}")`);
    document.documentElement.style.setProperty('--asset-dashboard-library-background', `url("${assets.shared.backgrounds.dashboardLibrary}")`);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.appBackground = background;
    window.localStorage.setItem(STORAGE_KEY, background);
  }, [background]);

  return <AppThemeContext.Provider value={{ background, setBackground }}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return context;
}

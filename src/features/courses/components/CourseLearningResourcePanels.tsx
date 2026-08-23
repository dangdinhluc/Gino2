import { type KeyboardEvent } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/coursePanelStyles';

export { focusRing } from '@/src/features/courses/components/coursePanelStyles';
export { panelClass, panelTitleClass, panelSubtitleClass, dividerListClass, searchFieldClass, searchInputClass, primaryButtonClass, emptyStateClass } from '@/src/features/courses/components/coursePanelStyles';
export { DocumentsPanel } from '@/src/features/courses/components/DocumentsPanel';
export { GamesPanel } from '@/src/features/courses/components/GamesPanel';
export { ExamsPanel } from '@/src/features/courses/components/ExamsPanel';

interface TabButtonProps<T extends string> {
  tab: { id: T; label: string; icon: LucideIcon; imageIcon?: string };
  activeTab: T;
  compact?: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, tab: T) => void;
  onSelect: (tab: T) => void;
}

export function TabButton<T extends string>({ tab, activeTab, compact = false, onKeyDown, onSelect }: TabButtonProps<T>) {
  const Icon = tab.icon;
  const isActive = activeTab === tab.id;

  return (
    <button
      id={`course-workspace-${compact ? 'compact' : 'rail'}-tab-${tab.id}`}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={isActive ? `course-workspace-panel-${tab.id}` : undefined}
      tabIndex={isActive ? 0 : -1}
      onKeyDown={(event) => onKeyDown(event, tab.id)}
      onClick={() => onSelect(tab.id)}
      className={cn(
        'flex items-center rounded-2xl transition-all duration-200',
        compact
          ? 'min-h-[3.35rem] w-full min-w-0 flex-col justify-center gap-0.5 px-0.5 py-1 text-[10px] sm:text-xs'
          : 'w-full gap-3 px-4 py-3 text-sm',
        isActive ? 'font-black text-[#d83a00]' : 'text-[#7b8796] hover:text-[#172033]',
        focusRing
      )}
    >
      {tab.imageIcon ? (
        <img
          src={tab.imageIcon}
          alt=""
          className={cn(
            'h-7 w-7 object-contain transition-transform duration-200 drop-shadow-2xs',
            isActive ? 'scale-110' : 'filter grayscale-[20%] opacity-85'
          )}
        />
      ) : (
        <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} aria-hidden="true" focusable="false" />
      )}
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
}

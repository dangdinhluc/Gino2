import { type KeyboardEvent } from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/coursePanelStyles';

export { focusRing } from '@/src/features/courses/components/coursePanelStyles';
export {
  panelClass,
  panelTitleClass,
  panelSubtitleClass,
  dividerListClass,
  searchFieldClass,
  searchInputClass,
  primaryButtonClass,
  emptyStateClass,
  learningStickyToolbarClass,
} from '@/src/features/courses/components/coursePanelStyles';
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
        'flex items-center transition-all duration-150',
        compact
          ? 'min-h-[3.35rem] w-full min-w-0 flex-col justify-center gap-0.5 px-0.5 py-1 text-[9px] sm:text-[10px]'
          : 'w-full gap-3 rounded-xl px-4 py-3 text-sm',
        isActive ? 'font-extrabold text-[#6f45d8]' : 'font-semibold text-[#6f727c] hover:text-[#303138]',
        focusRing
      )}
    >
      <span className={cn('flex items-center justify-center transition-colors', compact ? 'h-8 w-9 rounded-xl' : 'h-10 w-10 rounded-xl', isActive ? 'bg-[#f3efff]' : 'bg-transparent')}>
        {tab.imageIcon ? (
          <img
            src={tab.imageIcon}
            alt=""
            className={cn(
              'object-contain transition-all duration-150 drop-shadow-2xs',
              compact ? 'h-7 w-7' : 'h-8 w-8',
              isActive ? 'scale-110 opacity-100' : 'opacity-70 grayscale-[15%]'
            )}
          />
        ) : (
          <Icon size={compact ? 18 : 20} strokeWidth={isActive ? 2.2 : 1.7} aria-hidden="true" focusable="false" />
        )}
      </span>
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
}

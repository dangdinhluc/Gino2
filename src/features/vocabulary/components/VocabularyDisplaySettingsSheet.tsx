import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface VocabularyDisplaySettingsSheetProps {
  isOpen: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onClose: () => void;
}

export function VocabularyDisplaySettingsSheet({
  isOpen,
  showFurigana,
  showRomaji,
  onToggleFurigana,
  onToggleRomaji,
  onClose,
}: VocabularyDisplaySettingsSheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const scrollContainer = document.querySelector<HTMLElement>('.desktop-workspace-main');
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousScrollOverflow = scrollContainer?.style.overflowY;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollContainer) scrollContainer.style.overflowY = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      if (scrollContainer) scrollContainer.style.overflowY = previousScrollOverflow ?? '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[95] flex touch-none items-end justify-center bg-[#130f24]/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vocabulary-display-settings-title"
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90dvh] min-h-0 w-full max-w-[460px] flex-col overflow-hidden rounded-t-[28px] border border-[#e8e3f2] bg-[#f8f7fc] shadow-[0_-16px_50px_rgba(25,15,50,0.2)] sm:rounded-[28px]"
          >
            <div className="shrink-0 border-b border-[#e8e3f2] bg-white px-5 pb-4 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#cfc3ea] sm:hidden" />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Đóng cài đặt hiển thị từ vựng"
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e3f2] bg-white text-[#747084] transition-colors hover:bg-[#f5f0ff] hover:text-[#6f45d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d70dc]"
              >
                <X size={17} strokeWidth={2.4} />
              </button>
              <div className="pr-12">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f45d8]">Từ vựng</p>
                <h2 id="vocabulary-display-settings-title" className="mt-1 text-[18px] font-black tracking-tight text-[#252333]">Hiển thị từ vựng</h2>
                <p className="mt-1 text-[11px] font-medium text-[#858091]">Chọn cách hiển thị phù hợp khi học.</p>
              </div>
            </div>

            <div className="min-h-0 touch-pan-y overflow-y-auto overscroll-contain px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
              <DisplayOption
                label="Furigana (ふりがな)"
                description="Hiển thị cách đọc trên chữ Hán"
                checked={showFurigana}
                onToggle={onToggleFurigana}
              />
              <DisplayOption
                label="Romaji"
                description="Hiển thị cách đọc La-tinh"
                checked={showRomaji}
                onToggle={onToggleRomaji}
              />

              <button
                type="button"
                onClick={onClose}
                className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#6f45d8] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#5f37c6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d70dc] focus-visible:ring-offset-2"
              >
                Đóng
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DisplayOption({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl border border-[#e8e3f2] bg-white px-4 text-left transition-colors hover:border-[#d6c9f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d70dc] focus-visible:ring-offset-2"
    >
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-extrabold text-[#252333]">{label}</strong>
        <span className="mt-1 block text-xs font-medium text-[#858091]">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors',
          checked ? 'justify-end bg-[#6f45d8]' : 'justify-start bg-[#ded9e9]',
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
          {checked && <Check size={13} className="text-[#6f45d8]" strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}

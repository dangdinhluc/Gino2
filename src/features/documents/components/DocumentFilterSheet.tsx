import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type DocumentReadFilter = 'all' | 'saved' | 'unread';

interface DocumentFilterSheetProps {
  open: boolean;
  readFilter: DocumentReadFilter;
  selectedModule: string;
  modules: string[];
  onReadFilterChange: (filter: DocumentReadFilter) => void;
  onModuleChange: (module: string) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
}

const readFilterOptions: Array<{ id: DocumentReadFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'saved', label: 'Đã lưu' },
  { id: 'unread', label: 'Chưa đọc' },
];

export function DocumentFilterSheet({
  open,
  readFilter,
  selectedModule,
  modules,
  onReadFilterChange,
  onModuleChange,
  onReset,
  onApply,
  onClose,
}: DocumentFilterSheetProps) {
  const openerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select')?.focus());
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      openerRef.current?.focus();
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/40 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-filter-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#e8e3f2] bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_20px_60px_rgba(37,35,51,0.18)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#e8e3f2] pb-3">
              <div>
                <h2 id="document-filter-title" className="text-base font-black text-[#252333]">Bộ lọc tài liệu</h2>
                <p className="mt-1 text-xs font-medium text-[#858091]">Lọc theo trạng thái hoặc chủ đề có sẵn.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng bộ lọc"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#858091] hover:bg-[#f3efff] hover:text-[#6f45d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]"
              >
                <X size={18} />
              </button>
            </div>

            <fieldset className="mt-4">
              <legend className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#858091]">Trạng thái</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {readFilterOptions.map((option) => {
                  const isActive = readFilter === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => onReadFilterChange(option.id)}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]',
                        isActive
                          ? 'border-[#6f45d8] bg-[#6f45d8] text-white'
                          : 'border-[#e8e3f2] bg-white text-[#475467] hover:border-[#b8a5e8] hover:text-[#6f45d8]',
                      )}
                    >
                      {isActive && <Check size={14} />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {modules.length > 1 && (
              <fieldset className="mt-5">
                <legend className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#858091]">Chủ đề</legend>
                <div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
                  {modules.map((module) => {
                    const isActive = selectedModule === module;
                    return (
                      <button
                        key={module}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onModuleChange(module)}
                        className={cn(
                          'max-w-full truncate rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]',
                          isActive
                            ? 'border-[#6f45d8] bg-[#f3efff] text-[#6f45d8]'
                            : 'border-[#e8e3f2] bg-white text-[#475467] hover:border-[#b8a5e8] hover:text-[#6f45d8]',
                        )}
                      >
                        {module === 'all' ? 'Tất cả chủ đề' : module}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-5 flex gap-2 border-t border-[#e8e3f2] pt-4">
              <button
                type="button"
                onClick={onReset}
                className="min-h-11 flex-1 rounded-xl border border-[#e8e3f2] bg-white px-4 text-sm font-bold text-[#475467] hover:bg-[#f8f7fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={onApply}
                className="min-h-11 flex-1 rounded-xl bg-[#6f45d8] px-4 text-sm font-bold text-white hover:bg-[#5f37c6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8] focus-visible:ring-offset-2"
              >
                Áp dụng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { assets } from '@/src/shared/lib/assets';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const LazyAITutorChatContent = lazy(() => import('@/src/features/ai/components/AITutorChatContent'));

export function MobileAITutorPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (dialogRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((currentState) => {
          if (!currentState) setHasOpened(true);
          return !currentState;
        })}
        aria-label={isOpen ? 'Ẩn chat AI' : 'Mở chat AI Tokutei'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="floating-ai-tutor-popover"
        className={`mobile-ai-tutor-trigger fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-3 z-[60] flex items-center transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6 ${focusRing}`}
      >
        <motion.div
          animate={isOpen ? { y: 0, scale: 1 } : { y: [0, -6, 0], scale: 1 }}
          transition={isOpen ? { duration: 0.18, ease: 'easeOut' } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex flex-col items-center justify-center filter drop-shadow-[0_10px_20px_rgba(2,132,199,0.3)]"
        >
          {!isOpen && (
            <span className="absolute -right-0.5 -top-0.5 z-20 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-1 text-[9px] font-black text-white shadow-md border-2 border-white">
              1
            </span>
          )}

          {/* Pure 3D Tanuki Mascot Image without rectangular box */}
          <div className="relative h-13 w-13 shrink-0 overflow-visible flex items-center justify-center">
            <img
              src={assets.shared.mascots.aiTutorTanuki}
              alt="Tokutei AI Chat Mascot"
              decoding="async"
              className="h-full w-full object-contain scale-125"
            />
          </div>

          {/* AI CHAT Badge Floating Under Mascot */}
          <span className="mt-0.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md border border-white">
            AI CHAT
          </span>
        </motion.div>
      </button>

      {hasOpened && (
        <Suspense
          fallback={isOpen ? (
            <div ref={dialogRef} id="floating-ai-tutor-popover" role="dialog" tabIndex={-1} className="fixed bottom-[calc(10.4rem+env(safe-area-inset-bottom))] right-3 z-[70] hidden w-[calc(100vw-1.5rem)] max-w-sm rounded-[2rem] border border-[#e8dccb] bg-[#fffaf3] p-5 text-sm font-bold text-[#5f6b7c] min-[375px]:block md:bottom-24 md:right-5 lg:bottom-24 lg:right-6 lg:w-[24rem] lg:max-w-md xl:right-7 xl:w-[25rem]">
              Đang mở chat AI…
            </div>
          ) : null}
        >
          <LazyAITutorChatContent open={isOpen} dialogRef={dialogRef} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AITutorChatPanel } from '@/src/features/ai/components/AITutorChatPanel';
import { useMockTutorChat } from '@/src/features/ai/hooks/useMockTutorChat';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

export function MobileAITutorPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { draft, handleSubmit, messages, sendMessage, setDraft } = useMockTutorChat();
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

    dialogRef.current?.focus();

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
        onClick={() => setIsOpen((currentState) => !currentState)}
        aria-label={isOpen ? 'Ẩn chat AI' : 'Mở chat AI'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="floating-ai-tutor-popover"
        className={`fixed bottom-[5.4rem] right-3 z-[60] hidden min-h-11 min-[375px]:flex md:bottom-5 md:right-5 lg:bottom-6 lg:right-6 xl:right-7 ${focusRing}`}
      >
        <motion.div
          animate={isOpen ? { y: 0, scale: 1 } : { y: [0, -6, 0], scale: 1 }}
          transition={isOpen ? { duration: 0.18, ease: 'easeOut' } : { duration: 2, repeat: Infinity }}
          className="relative flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/95 p-2 shadow-[0_18px_38px_-30px_rgba(148,163,184,0.22)] lg:rounded-full lg:px-3 lg:py-2.5"
        >
          {!isOpen && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-black text-white shadow-sm">1</span>}
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 blur-md opacity-20" />
            <img
              src={`${import.meta.env.BASE_URL}mascot.png`}
              alt="Mascot"
              className="relative z-10 h-full w-full object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                event.currentTarget.parentElement!.innerHTML = '<span class="text-3xl relative">🐯</span>';
              }}
            />
          </div>
          <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-white shadow-sm">
            AI
          </div>
          <div className="hidden lg:block">
            <p className="text-[11px] font-black text-gray-900">Hỗ trợ học</p>
            <p className="text-[10px] font-semibold text-gray-500">Chat nhanh với AI</p>
          </div>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dialogRef}
            id="floating-ai-tutor-popover"
            role="dialog"
            aria-modal="false"
            tabIndex={-1}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-[calc(10.4rem+env(safe-area-inset-bottom))] right-3 z-[70] hidden w-[calc(100vw-1.5rem)] max-w-sm min-[375px]:block md:bottom-24 md:right-5 lg:bottom-24 lg:right-6 lg:w-[24rem] lg:max-w-md xl:right-7 xl:w-[25rem]"
          >
            <AITutorChatPanel
              className="h-[70dvh] min-h-[26rem] max-h-[36rem] rounded-[2rem] shadow-[0_30px_80px_-34px_rgba(17,24,39,0.34)] lg:h-[38rem] lg:max-h-[calc(100dvh-8rem)]"
              compactHeader
              draft={draft}
              messages={messages}
              onClose={() => setIsOpen(false)}
              onDraftChange={setDraft}
              onSendMessage={sendMessage}
              onSubmit={handleSubmit}
              showCloseButton
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

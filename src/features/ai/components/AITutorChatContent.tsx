import { useEffect, type RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AITutorChatPanel } from '@/src/features/ai/components/AITutorChatPanel';
import { useAiTutorChat } from '@/src/features/ai/hooks/useAiTutorChat';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

interface AITutorChatContentProps {
  open: boolean;
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export default function AITutorChatContent({ open, dialogRef, onClose }: AITutorChatContentProps) {
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const { draft, error, handleSubmit, isSending, messages, sendMessage, setDraft } = useAiTutorChat({ enabled: open, courseId: activeCourseId ?? undefined });

  useEffect(() => {
    if (!open) return undefined;
    const frameId = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.cancelAnimationFrame(frameId);
  }, [dialogRef, open]);

  return (
    <AnimatePresence>
      {open && (
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
            error={error}
            isSending={isSending}
            messages={messages}
            onClose={onClose}
            onDraftChange={setDraft}
            onSendMessage={sendMessage}
            onSubmit={handleSubmit}
            showCloseButton
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, X, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/coursePanelStyles';
import type { PracticeAnswer } from './types';

interface PracticeFeedbackSheetProps {
  answer: PracticeAnswer;
  isLastQuestion: boolean;
  onClose: () => void;
  onNext: () => void;
}

export function PracticeFeedbackSheet({ answer, isLastQuestion, onClose, onNext }: PracticeFeedbackSheetProps) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter') {
        event.preventDefault();
        onNext();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-2xs sm:items-center sm:p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Kết quả câu hỏi"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          onClick={(event) => event.stopPropagation()}
          className={cn('w-full max-w-lg space-y-4 rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-[28px] sm:p-6', answer.isCorrect ? 'border-emerald-200' : 'border-rose-200')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs', answer.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>
                {answer.isCorrect ? <CheckCircle2 size={24} strokeWidth={2.4} /> : <XCircle size={24} strokeWidth={2.4} />}
              </span>
              <div>
                <h3 className={cn('font-[var(--font-heading)] text-lg font-black tracking-tight', answer.isCorrect ? 'text-emerald-800' : 'text-rose-800')}>
                  {answer.isCorrect ? 'Chính xác! 🎉' : 'Cần xem lại! 💡'}
                </h3>
                <p className="text-xs font-semibold text-[#7b8796]">{answer.isCorrect ? 'Tuyệt vời, bạn làm rất tốt.' : 'Ghi nhớ đáp án chuẩn dưới đây nhé.'}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700" aria-label="Đóng bảng giải thích">
              <X size={16} />
            </button>
          </div>

          {!answer.isCorrect && answer.correctAnswer && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs font-medium text-emerald-950">
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-800">Đáp án đúng:</span>
              <strong className="mt-0.5 block text-sm font-black text-emerald-900">{answer.correctAnswer}</strong>
            </div>
          )}

          {answer.explanation && (
            <div className="rounded-xl border border-[#f5ece1] bg-[#fffaf5] p-3.5">
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#95a0af]">Giải thích:</span>
              <p className="mt-1 text-xs font-medium leading-relaxed text-[#5f6b7c]">{answer.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-white px-4 text-xs font-bold text-[#5f6b7c] shadow-2xs transition-all hover:bg-[#fffaf5] active:scale-95">Đóng</button>
            <button type="button" onClick={onNext} className={cn('inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-xs font-black text-white shadow-md transition-all hover:bg-orange-800 active:scale-95', focusRing)}>
              {isLastQuestion ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

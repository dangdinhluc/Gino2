import { type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, X } from 'lucide-react';
import type { AiChatMessage } from '@/src/features/ai/repositories/aiRepository';
import { cn } from '@/src/lib/utils';

const AI_PROMPT_CHIPS = ['Sửa câu', 'Giải thích ngữ pháp', 'Luyện hội thoại'];

interface AITutorChatPanelProps {
  className?: string;
  compactHeader?: boolean;
  draft: string;
  messages: AiChatMessage[];
  error?: string | null;
  isSending?: boolean;
  onClose?: () => void;
  onDraftChange: (value: string) => void;
  onSendMessage: (text: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  showCloseButton?: boolean;
}

export function AITutorChatPanel({
  className,
  compactHeader = false,
  draft,
  error,
  isSending = false,
  messages,
  onClose,
  onDraftChange,
  onSendMessage,
  onSubmit,
  showCloseButton = false,
}: AITutorChatPanelProps) {
  return (
    <section className={cn('flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e8dccb] bg-[#fffaf3]', className)}>
      <header className={cn('border-b border-[#e8dccb] bg-[#fffaf3] md:px-6', compactHeader ? 'px-4 py-3' : 'px-5 py-4')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {!compactHeader && <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Tokutei AI Coach</p>}
            <h2 className={cn('font-[var(--font-heading)] font-bold tracking-[-0.02em] text-[#172033]', compactHeader ? 'text-lg' : 'text-xl')}>Hỏi nhanh về Tokutei</h2>
          </div>

          <div className="flex items-center gap-2">
            {!compactHeader && <div className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">Edge Function</div>}
            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-orange-700',
                  compactHeader ? 'flex h-9 w-9 items-center justify-center rounded-lg' : 'flex h-10 w-10 items-center justify-center rounded-xl'
                )}
                aria-label="Đóng chat AI"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {!compactHeader && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {AI_PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSendMessage(chip)}
                className="shrink-0 rounded-lg border border-[#e8dccb] bg-[#fffdf8] px-3.5 py-2 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 md:px-6">
        {messages.length === 0 && <p className="rounded-xl border border-dashed border-[#e8dccb] px-4 py-6 text-center text-sm text-[#5f6b7c]">Chưa có hội thoại. Hãy gửi câu hỏi về việc học Tokutei.</p>}
        {messages.map((message, index) => {
          const isUser = message.role === 'user';

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[68%]',
                  isUser
                    ? 'bg-orange-700 text-white'
                    : 'border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]'
                )}
              >
                {message.text}
              </div>
            </motion.div>
          );
          })}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      </div>

      <form onSubmit={onSubmit} className="border-t border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
        <div className="flex gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-2">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Nhập câu trả lời, câu hỏi hồ sơ hoặc câu hỏi phỏng vấn của anh..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-[#172033] outline-none placeholder:text-[#95a0af]"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0 || isSending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-700 text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

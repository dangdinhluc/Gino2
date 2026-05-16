import { type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, X } from 'lucide-react';
import { aiPromptChips, type ChatMessage } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

interface AITutorChatPanelProps {
  className?: string;
  compactHeader?: boolean;
  draft: string;
  messages: ChatMessage[];
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
  messages,
  onClose,
  onDraftChange,
  onSendMessage,
  onSubmit,
  showCloseButton = false,
}: AITutorChatPanelProps) {
  return (
    <section className={cn('flex min-h-0 flex-col overflow-hidden rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)]', className)}>
      <header className={cn('border-b border-[#e6ddd1] bg-[#fffaf3]/95 backdrop-blur-md md:px-6', compactHeader ? 'px-4 py-3' : 'px-5 py-4')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {!compactHeader && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Tokutei AI Coach</p>}
            <h2 className={cn('font-black text-gray-900', compactHeader ? 'text-lg' : 'text-xl')}>Hỏi nhanh về Tokutei</h2>
          </div>

          <div className="flex items-center gap-2">
            {!compactHeader && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">Mock online</div>}
            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'shrink-0 border border-[#e1d8cb] bg-white text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-600',
                  compactHeader ? 'flex h-9 w-9 items-center justify-center rounded-xl' : 'flex h-10 w-10 items-center justify-center rounded-2xl'
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
            {aiPromptChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSendMessage(chip)}
                className="shrink-0 rounded-full border border-orange-100 bg-white px-4 py-2 text-xs font-bold text-orange-600 transition-all hover:border-orange-200 hover:bg-orange-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-6">
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
                  'max-w-[85%] rounded-[1.5rem] px-5 py-4 text-sm font-medium leading-relaxed md:max-w-[68%]',
                  isUser
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-100'
                    : 'border border-[#e6ddd1] bg-white text-gray-600'
                )}
              >
                {message.text}
              </div>
            </motion.div>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="border-t border-[#e6ddd1] bg-[#fffaf3]/95 p-4 md:p-5">
        <div className="flex gap-3 rounded-[1.75rem] border border-[#e1d8cb] bg-white p-2 shadow-[0_18px_34px_-30px_rgba(148,163,184,0.16)]">
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Nhập câu trả lời, câu hỏi hồ sơ hoặc câu hỏi phỏng vấn của anh..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-gray-700 outline-none"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-100 transition-all disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

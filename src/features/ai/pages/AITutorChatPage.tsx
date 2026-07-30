import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bot, CheckCircle2, Sparkles } from 'lucide-react';
import { AITutorChatPanel } from '@/src/features/ai/components/AITutorChatPanel';
import { useMockTutorChat } from '@/src/features/ai/hooks/useMockTutorChat';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

const quickTopics = [
  { label: 'Sửa câu', icon: CheckCircle2 },
  { label: 'Giải thích ngữ pháp', icon: BookOpen },
  { label: 'Luyện hội thoại', icon: Sparkles },
];

export default function AITutorChat() {
  const { draft, handleSubmit, messages, sendMessage, setDraft } = useMockTutorChat();

  return (
    <div className="mx-auto grid max-w-6xl gap-5 pb-24 lg:grid-cols-[0.32fr_1fr]">
      <aside className="space-y-4 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 lg:sticky lg:top-6 lg:h-fit">
        <Link to="/app/dashboard" className={`inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Bot size={24} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">Tokutei AI</p>
              <h1 className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Coach mock</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#5f6b7c]">Chat này đang dùng câu trả lời giả lập để chốt trải nghiệm Tokutei trước khi nối model thật.</p>
        </div>

        <div className="space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#95a0af]">Chủ đề nhanh</div>
          {quickTopics.map((item) => (
            <button key={item.label} onClick={() => sendMessage(item.label)} className={`flex w-full items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-left text-sm font-bold text-[#172033] transition-colors hover:bg-[#f6efe6] ${focusRing}`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <item.icon size={17} strokeWidth={1.8} />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      <AITutorChatPanel
        className="min-h-[calc(100dvh-8rem)]"
        draft={draft}
        messages={messages}
        onDraftChange={setDraft}
        onSendMessage={sendMessage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

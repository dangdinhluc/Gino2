import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bot, CheckCircle2, Sparkles } from 'lucide-react';
import { AITutorChatPanel } from '@/src/features/ai/components/AITutorChatPanel';
import { useMockTutorChat } from '@/src/features/ai/hooks/useMockTutorChat';
import { cn } from '@/src/lib/utils';

export default function AITutorChat() {
  const { draft, handleSubmit, messages, sendMessage, setDraft } = useMockTutorChat();

  return (
    <div className="mx-auto grid max-w-7xl gap-6 pb-24 lg:grid-cols-[0.32fr_1fr]">
      <aside className="space-y-4 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] lg:sticky lg:top-6 lg:h-fit">
        <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-2 text-sm font-black text-gray-600 transition-all hover:bg-orange-50">
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_100%)] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-100">
              <Bot size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">Tokutei AI</p>
              <h1 className="text-xl font-black text-gray-900">Coach mock</h1>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium leading-relaxed text-gray-500">Chat này đang dùng câu trả lời giả lập để chốt trải nghiệm Tokutei trước khi nối model thật.</p>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Chủ đề nhanh</div>
          {[
            { label: 'Sửa câu', icon: CheckCircle2, tone: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
            { label: 'Giải thích ngữ pháp', icon: BookOpen, tone: 'text-orange-500 bg-orange-50 border-orange-100' },
            { label: 'Luyện hội thoại', icon: Sparkles, tone: 'text-blue-500 bg-blue-50 border-blue-100' },
          ].map((item) => (
            <button key={item.label} onClick={() => sendMessage(item.label)} className="flex w-full items-center gap-3 rounded-[1.5rem] border border-[#e6ddd1] bg-white px-4 py-3 text-left text-sm font-black text-gray-700 transition-all hover:border-orange-200 hover:bg-orange-50">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-2xl border', item.tone)}>
                <item.icon size={18} />
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

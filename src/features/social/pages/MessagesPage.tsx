import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, MessageCircle, Send, Sparkles, Users } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { ThreadId } from '@/src/features/social/lib/autoReply';
import { THREADS, getAutoReply, getThreadMeta, replyDelayMs } from '@/src/features/social/lib/autoReply';
import { unreadCount, useCommunityStore } from '@/src/features/social/store/communityStore';

const threadIcons: Record<ThreadId, typeof MessageCircle> = {
  'group-restaurant': Users,
  mentor: Sparkles,
  'hr-room': GraduationCap,
};

function formatTime(at: number): string {
  const date = new Date(at);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  const hhmm = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return sameDay ? hhmm : `${date.getDate()}/${date.getMonth() + 1} ${hhmm}`;
}

export default function MessagesPage() {
  const messages = useCommunityStore((state) => state.messages);
  const lastReadAt = useCommunityStore((state) => state.lastReadAt);
  const sendMessage = useCommunityStore((state) => state.sendMessage);
  const receiveMessage = useCommunityStore((state) => state.receiveMessage);
  const markThreadRead = useCommunityStore((state) => state.markThreadRead);

  const [selectedId, setSelectedId] = useState<ThreadId>('group-restaurant');
  const [draft, setDraft] = useState('');
  const [typingThreads, setTypingThreads] = useState<ThreadId[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const selectedMeta = getThreadMeta(selectedId);
  const selectedMessages = messages[selectedId] ?? [];
  const totalUnread = useMemo(
    () => THREADS.reduce((sum, thread) => sum + unreadCount(messages[thread.id], lastReadAt[thread.id]), 0),
    [messages, lastReadAt],
  );

  useEffect(() => {
    markThreadRead(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selectedMessages.length]);

  const typingThread = typingThreads.includes(selectedId) ? selectedId : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [selectedId, selectedMessages.length, typingThread]);

  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      for (const timeout of timeouts) clearTimeout(timeout);
      timeouts.clear();
    };
  }, []);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const threadId = selectedId;
    sendMessage(threadId, text);
    setDraft('');
    setTypingThreads((current) => (current.includes(threadId) ? current : [...current, threadId]));
    const timeout = setTimeout(() => {
      timeoutsRef.current.delete(timeout);
      receiveMessage(threadId, getAutoReply(threadId, text));
      setTypingThreads((current) => current.filter((id) => id !== threadId));
    }, replyDelayMs(text));
    timeoutsRef.current.add(timeout);
  };

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px]">
              <MessageCircle size={14} />
              Tin nhắn
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Kênh học nhóm</h2>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
              Nhắn với nhóm học, mentor và phòng mock phỏng vấn. Tin nhắn lưu ngay trên máy anh, trả lời tự động theo ngữ cảnh học.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm font-black text-pink-600">
            <MessageCircle size={16} /> {totalUnread} tin chưa đọc
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Danh sách kênh */}
        <div className="space-y-3">
          {THREADS.map((thread) => {
            const Icon = threadIcons[thread.id];
            const threadMessages = messages[thread.id] ?? [];
            const lastMessage = threadMessages[threadMessages.length - 1];
            const unread = unreadCount(threadMessages, lastReadAt[thread.id]);
            const isActive = selectedId === thread.id;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setSelectedId(thread.id)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-[2rem] border p-4 text-left shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)] transition-all',
                  isActive ? 'border-orange-200 bg-orange-50/70' : 'border-[#e6ddd1] bg-[#fffaf3] hover:border-orange-200',
                )}
              >
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', isActive ? 'bg-orange-100 text-orange-500' : 'bg-blue-50 text-blue-500')}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-black text-gray-900">{thread.name}</h3>
                    <span className="shrink-0 text-[10px] font-bold text-gray-400">{lastMessage ? formatTime(lastMessage.at) : ''}</span>
                  </div>
                  <p className="truncate text-xs font-medium text-gray-500">
                    {typingThreads.includes(thread.id) ? 'Đang gõ…' : lastMessage?.text ?? thread.description}
                  </p>
                </div>
                {unread > 0 && <span className="shrink-0 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-white">{unread}</span>}
              </button>
            );
          })}

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-white/60 p-4 text-[11px] font-medium leading-relaxed text-gray-400">
            Các kênh chạy chế độ đồng hành tự động (offline) — mentor và nhóm sẽ luôn phản hồi để anh có môi trường luyện tập, kể cả khi chưa nối backend thật.
          </div>
        </div>

        {/* Cửa sổ chat */}
        <div className="flex min-h-[32rem] flex-col rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)] md:p-5">
          <div className="flex items-center gap-3 border-b border-[#eee5d8] pb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              {(() => {
                const Icon = threadIcons[selectedId];
                return <Icon size={20} />;
              })()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-gray-900">{selectedMeta.name}</h3>
              <p className="truncate text-xs font-medium text-gray-400">{selectedMeta.description}</p>
            </div>
          </div>

          <div ref={scrollRef} className="no-scrollbar mt-3 flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '26rem' }}>
            {selectedMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', message.from === 'me' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm font-medium leading-relaxed md:max-w-[75%]',
                    message.from === 'me' ? 'rounded-br-md bg-orange-500 font-bold text-white' : 'rounded-bl-md bg-blue-50 text-blue-900',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <p className={cn('mt-1 text-[9px] font-bold', message.from === 'me' ? 'text-orange-100' : 'text-blue-400')}>{formatTime(message.at)}</p>
                </div>
              </motion.div>
            ))}
            {typingThread === selectedId && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-[1.5rem] rounded-bl-md bg-blue-50 px-4 py-3">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-blue-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Nhắn cho ${selectedMeta.name}...`}
              className="min-w-0 flex-1 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-100"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-transform hover:scale-[1.02] disabled:opacity-45"
            >
              <Send size={15} /> Gửi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

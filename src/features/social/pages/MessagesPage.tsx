import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, MessageCircle, Send, Sparkles, Users } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { ThreadId } from '@/src/features/social/lib/autoReply';
import { THREADS, getAutoReply, getThreadMeta, replyDelayMs } from '@/src/features/social/lib/autoReply';
import { unreadCount, useCommunityStore } from '@/src/features/social/store/communityStore';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

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
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <MessageCircle size={14} /> Tin nhắn
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Kênh học nhóm</h1>
            <p className="max-w-2xl text-sm text-[#5f6b7c]">Nhắn với nhóm học, mentor và phòng mock phỏng vấn. Tin nhắn lưu ngay trên máy anh, trả lời tự động theo ngữ cảnh học.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-bold text-orange-700">
            <MessageCircle size={16} strokeWidth={1.8} /> {totalUnread} tin chưa đọc
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-2.5">
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
                  'flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors',
                  focusRing,
                  isActive ? 'border-orange-300 bg-orange-50/60' : 'border-[#e8dccb] bg-[#fffaf3] hover:bg-[#fffdf8]',
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <Icon size={21} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-bold text-[#172033]">{thread.name}</h3>
                    <span className="shrink-0 text-[10px] font-bold text-[#95a0af]">{lastMessage ? formatTime(lastMessage.at) : ''}</span>
                  </div>
                  <p className="truncate text-xs text-[#7b8796]">
                    {typingThreads.includes(thread.id) ? 'Đang gõ…' : lastMessage?.text ?? thread.description}
                  </p>
                </div>
                {unread > 0 && <span className="shrink-0 rounded-md bg-orange-700 px-2 py-1 text-[10px] font-bold text-white">{unread}</span>}
              </button>
            );
          })}

          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4 text-[11px] leading-relaxed text-[#95a0af]">
            Các kênh chạy chế độ đồng hành tự động (offline) — mentor và nhóm sẽ luôn phản hồi để anh có môi trường luyện tập, kể cả khi chưa nối backend thật.
          </div>
        </div>

        <div className="flex min-h-[32rem] flex-col rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
          <div className="flex items-center gap-3 border-b border-[#efe5d7] pb-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              {(() => {
                const Icon = threadIcons[selectedId];
                return <Icon size={20} strokeWidth={1.8} />;
              })()}
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-[#172033]">{selectedMeta.name}</h3>
              <p className="truncate text-xs text-[#95a0af]">{selectedMeta.description}</p>
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
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[75%]',
                    message.from === 'me' ? 'rounded-br-md bg-orange-700 font-medium text-white' : 'rounded-bl-md border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <p className={cn('mt-1 text-[9px] font-bold', message.from === 'me' ? 'text-orange-100' : 'text-[#95a0af]')}>{formatTime(message.at)}</p>
                </div>
              </motion.div>
            ))}
            {typingThread === selectedId && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#e8dccb] bg-[#fffdf8] px-4 py-3">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-orange-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2.5">
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
              className="min-w-0 flex-1 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-medium text-[#172033] outline-none placeholder:text-[#95a0af] focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              className={`inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 disabled:opacity-45 ${focusRing}`}
            >
              <Send size={15} /> Gửi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

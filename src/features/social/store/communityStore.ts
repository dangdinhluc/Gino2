import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThreadId } from '@/src/features/social/lib/autoReply';
import { THREADS } from '@/src/features/social/lib/autoReply';

export interface CommunityJournalEntry {
  id: string;
  title: string;
  content: string;
  prompt: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CommunityMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  at: number;
}

interface CommunityState {
  journal: CommunityJournalEntry[];
  messages: Record<string, CommunityMessage[]>;
  /** Thời điểm đọc gần nhất từng kênh — tính badge chưa đọc */
  lastReadAt: Record<string, number>;

  addJournalEntry: (input: { title: string; content: string; prompt?: string | null; tags?: string[] }) => string;
  updateJournalEntry: (id: string, patch: Partial<Pick<CommunityJournalEntry, 'title' | 'content' | 'tags'>>) => void;
  deleteJournalEntry: (id: string) => void;

  sendMessage: (threadId: ThreadId, text: string) => void;
  receiveMessage: (threadId: ThreadId, text: string) => void;
  markThreadRead: (threadId: ThreadId) => void;
}

let idCounter = 0;
function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function seedMessages(): Record<string, CommunityMessage[]> {
  const base = Date.now() - 2 * 3_600_000;
  const result: Record<string, CommunityMessage[]> = {};
  for (const thread of THREADS) {
    result[thread.id] = thread.seedMessages.map((message, index) => ({
      id: `${thread.id}-seed-${index}`,
      from: message.from,
      text: message.text,
      at: base + index * 60_000,
    }));
  }
  return result;
}

const memoryFallback = new Map<string, string>();
const safeStorage = createJSONStorage<unknown>(() => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryFallback.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryFallback.set(key, value);
    },
    removeItem: (key: string) => {
      memoryFallback.delete(key);
    },
  };
});

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      journal: [],
      messages: seedMessages(),
      lastReadAt: {},

      addJournalEntry: (input) => {
        const id = makeId('journal');
        const now = Date.now();
        set((state) => ({
          journal: [
            {
              id,
              title: input.title.trim() || 'Ghi chú không tiêu đề',
              content: input.content,
              prompt: input.prompt ?? null,
              tags: input.tags ?? [],
              createdAt: now,
              updatedAt: now,
            },
            ...state.journal,
          ],
        }));
        return id;
      },

      updateJournalEntry: (id, patch) =>
        set((state) => ({
          journal: state.journal.map((entry) =>
            entry.id === id ? { ...entry, ...patch, updatedAt: Date.now() } : entry,
          ),
        })),

      deleteJournalEntry: (id) =>
        set((state) => ({ journal: state.journal.filter((entry) => entry.id !== id) })),

      sendMessage: (threadId, text) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [threadId]: [
              ...(state.messages[threadId] ?? []),
              { id: makeId('msg'), from: 'me', text, at: Date.now() },
            ],
          },
          lastReadAt: { ...state.lastReadAt, [threadId]: Date.now() },
        })),

      receiveMessage: (threadId, text) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [threadId]: [
              ...(state.messages[threadId] ?? []),
              { id: makeId('msg'), from: 'them', text, at: Date.now() },
            ],
          },
        })),

      markThreadRead: (threadId) =>
        set((state) => ({ lastReadAt: { ...state.lastReadAt, [threadId]: Date.now() } })),
    }),
    {
      name: 'tokutei-gino-community',
      storage: safeStorage as never,
    },
  ),
);

export function unreadCount(
  messages: CommunityMessage[] | undefined,
  lastReadAt: number | undefined,
): number {
  if (!messages) return 0;
  const cutoff = lastReadAt ?? 0;
  return messages.filter((message) => message.from === 'them' && message.at > cutoff).length;
}

/** Chuỗi ngày viết nhật ký liên tục (tính cả hôm nay nếu đã viết). */
export function journalStreak(entries: CommunityJournalEntry[], now: number = Date.now()): number {
  if (entries.length === 0) return 0;
  const days = new Set(
    entries.map((entry) => {
      const date = new Date(entry.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }),
  );
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  let cursor = today.getTime();
  if (!days.has(cursor)) cursor -= 86_400_000; // hôm nay chưa viết thì đếm từ hôm qua
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 86_400_000;
  }
  return streak;
}

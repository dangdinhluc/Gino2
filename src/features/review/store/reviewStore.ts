import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SrsCardState, SrsRating } from '@/src/features/review/lib/srs';
import { createNewCardState, rateCard, xpForRating } from '@/src/features/review/lib/srs';

export interface ReviewLogEntry {
  at: number;
  cardId: string;
  rating: SrsRating;
  /** phase của thẻ TRƯỚC khi chấm — để tính retention chính xác */
  phase: SrsCardState['phase'];
}

export interface ReviewSettings {
  /** Số thẻ mới tối đa mỗi ngày */
  newPerDay: number;
}

interface ReviewState {
  states: Record<string, SrsCardState>;
  log: ReviewLogEntry[];
  settings: ReviewSettings;
  /** Ngày (yyyy-mm-dd) đã đưa thẻ mới vào học + số lượng trong ngày đó */
  newDay: string;
  newIntroducedToday: number;
  /** Tổng XP tích lũy từ ôn flashcard */
  totalReviewXp: number;
  totalSessions: number;

  rate: (cardId: string, rating: SrsRating, now?: number) => void;
  markSessionComplete: () => void;
  resetCard: (cardId: string) => void;
  setNewPerDay: (value: number) => void;
  /** Hoàn tác lần chấm gần nhất của một thẻ (dùng cho nút Undo trong phiên). */
  restoreCardState: (cardId: string, state: SrsCardState | undefined, logLength: number) => void;
}

const LOG_CAP = 4000;

function dayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Storage an toàn: dùng localStorage trên browser, in-memory khi chạy test node. */
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

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      states: {},
      log: [],
      settings: { newPerDay: 10 },
      newDay: dayKey(Date.now()),
      newIntroducedToday: 0,
      totalReviewXp: 0,
      totalSessions: 0,

      rate: (cardId, rating, now = Date.now()) =>
        set((state) => {
          const previous = state.states[cardId] ?? createNewCardState(now);
          const wasNew = previous.phase === 'new';
          const nextCardState = rateCard(previous, rating, now);
          const entry: ReviewLogEntry = { at: now, cardId, rating, phase: previous.phase };
          const log = [...state.log, entry];
          if (log.length > LOG_CAP) log.splice(0, log.length - LOG_CAP);

          const today = dayKey(now);
          const sameDay = state.newDay === today;
          return {
            states: { ...state.states, [cardId]: nextCardState },
            log,
            newDay: today,
            newIntroducedToday: (sameDay ? state.newIntroducedToday : 0) + (wasNew ? 1 : 0),
            totalReviewXp: state.totalReviewXp + xpForRating(rating),
          };
        }),

      markSessionComplete: () => set((state) => ({ totalSessions: state.totalSessions + 1 })),

      resetCard: (cardId) =>
        set((state) => {
          const states = { ...state.states };
          delete states[cardId];
          return { states };
        }),

      setNewPerDay: (value) =>
        set((state) => ({ settings: { ...state.settings, newPerDay: Math.max(0, Math.min(50, Math.round(value))) } })),

      restoreCardState: (cardId, cardState, logLength) =>
        set((state) => {
          const states = { ...state.states };
          if (cardState) states[cardId] = cardState;
          else delete states[cardId];
          return { states, log: state.log.slice(0, logLength) };
        }),
    }),
    {
      name: 'tokutei-gino-review',
      storage: safeStorage as never,
    },
  ),
);

import { create } from 'zustand';
import type { GameId, GameStatus, FeedbackState } from '@/src/features/games/types';

interface GameState {
  gameId: GameId | null;
  status: GameStatus;
  roundIndex: number;
  totalRounds: number;
  score: number;
  combo: number;
  maxCombo: number;
  correct: number;
  wrongIds: string[];
  /** Số hint đã dùng trong session hiện tại (Word Builder, có thể reuse cho game khác) */
  hintsUsed: number;
  feedback: FeedbackState;

  startGame: (gameId: GameId, totalRounds: number) => void;
  answerCorrect: (points?: number) => void;
  answerWrong: (roundId: string) => void;
  nextRound: () => void;
  showFeedback: (correct: boolean, message: string, detail?: string) => void;
  hideFeedback: () => void;
  completeGame: () => void;
  /** Trừ điểm thẳng (clamp về 0). Dùng cho hint penalty hoặc penalty khác. */
  deductPoints: (amount: number) => void;
  /** Combo: deduct 50 + tăng hintsUsed (tiện cho Word Builder hint flow). */
  registerHint: () => void;
  /** Push round vào SRS mà KHÔNG reset combo / KHÔNG đổi status. Dùng khi user dùng hint nhưng vẫn answer correct. */
  pushSrs: (roundId: string) => void;
  reset: () => void;
}

const initialFeedback: FeedbackState = { visible: false, correct: false, message: '' };

export const useGameStore = create<GameState>()((set) => ({
  gameId: null,
  status: 'idle',
  roundIndex: 0,
  totalRounds: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  correct: 0,
  wrongIds: [],
  hintsUsed: 0,
  feedback: initialFeedback,

  startGame: (gameId, totalRounds) =>
    set({
      gameId,
      status: 'playing',
      roundIndex: 0,
      totalRounds,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correct: 0,
      wrongIds: [],
      hintsUsed: 0,
      feedback: initialFeedback,
    }),

  answerCorrect: (points = 100) =>
    set((s) => {
      const combo = s.combo + 1;
      const bonus = Math.min(combo - 1, 5) * 20;
      return {
        score: s.score + points + bonus,
        combo,
        maxCombo: Math.max(s.maxCombo, combo),
        correct: s.correct + 1,
        status: 'feedback',
      };
    }),

  answerWrong: (roundId) =>
    set((s) => ({ combo: 0, wrongIds: [...s.wrongIds, roundId], status: 'feedback' })),

  nextRound: () =>
    set((s) => {
      if (s.roundIndex >= s.totalRounds - 1) return { status: 'complete' };
      return { roundIndex: s.roundIndex + 1, status: 'playing', feedback: initialFeedback };
    }),

  showFeedback: (correct, message, detail) =>
    set({ feedback: { visible: true, correct, message, detail } }),

  hideFeedback: () =>
    set({ feedback: initialFeedback }),

  completeGame: () => set({ status: 'complete' }),

  deductPoints: (amount) =>
    set((s) => ({ score: Math.max(0, s.score - amount) })),

  registerHint: () =>
    set((s) => ({
      score: Math.max(0, s.score - 50),
      hintsUsed: s.hintsUsed + 1,
    })),

  pushSrs: (roundId) =>
    set((s) => (s.wrongIds.includes(roundId) ? s : { wrongIds: [...s.wrongIds, roundId] })),

  reset: () =>
    set({
      gameId: null,
      status: 'idle',
      roundIndex: 0,
      totalRounds: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correct: 0,
      wrongIds: [],
      hintsUsed: 0,
      feedback: initialFeedback,
    }),
}));

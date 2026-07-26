import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '@/src/features/games/gameStore';
import type { GameId, GameRound } from '@/src/features/games/types';

interface UseGameSessionOptions {
  gameId: GameId;
  rounds: GameRound[];
}

export function useGameSession({ gameId, rounds }: UseGameSessionOptions) {
  const store = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (rounds.length > 0) {
      store.startGame(gameId, rounds.length);
      setReady(true);
    }
  }, []);

  const currentRound = rounds[store.roundIndex] ?? null;
  const progress = store.totalRounds > 0 ? ((store.roundIndex + 1) / store.totalRounds) * 100 : 0;

  const submitAnswer = useCallback((correct: boolean, roundId: string, message: string, detail?: string) => {
    if (correct) {
      store.answerCorrect();
    } else {
      store.answerWrong(roundId);
    }
    store.showFeedback(correct, message, detail);
  }, [store]);

  const advance = useCallback(() => {
    store.hideFeedback();
    store.nextRound();
  }, [store]);

  return {
    currentRound,
    roundIndex: store.roundIndex,
    totalRounds: store.totalRounds,
    score: store.score,
    combo: store.combo,
    maxCombo: store.maxCombo,
    correct: store.correct,
    wrongIds: store.wrongIds,
    status: store.status,
    feedback: store.feedback,
    progress,
    submitAnswer,
    advance,
    reset: store.reset,
  };
}

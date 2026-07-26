import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GameShell } from '@/src/features/games/GameShell';
import { useGameStore } from '@/src/features/games/gameStore';
import { GameResult } from '@/src/features/games/GameResult';
import { getShuffledSituationRounds, type SituationRound } from '@/src/features/games/data/situationData';

interface SituationGameProps {
  rounds?: SituationRound[];
  returnTo?: string;
  courseTitle?: string;
}

export function SituationGame({ rounds, returnTo, courseTitle }: SituationGameProps) {
  const sessionRounds = useMemo(() => (rounds && rounds.length > 0 ? rounds : getShuffledSituationRounds(8)), [rounds]);
  const store = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    store.startGame('situation-game', sessionRounds.length);
    setReady(true);
  }, []);

  const round = sessionRounds[store.roundIndex] as SituationRound | undefined;
  const progress = store.totalRounds > 0 ? ((store.roundIndex + 1) / store.totalRounds) * 100 : 0;

  if (!ready) return null;

  if (store.status === 'complete') {
    return (
      <GameResult
        title="Tình huống Tokutei"
        accent="#10B981"
        score={store.score}
        maxCombo={store.maxCombo}
        correct={store.correct}
        total={store.totalRounds}
        gameId="situation-game"
        wrongIds={store.wrongIds}
        returnTo={returnTo}
        returnLabel="Về khóa học"
        onRestart={() => { store.reset(); setReady(false); setTimeout(() => { store.startGame('situation-game', sessionRounds.length); setReady(true); }, 0); }}
      />
    );
  }

  if (!round) return null;

  const handleSelect = (option: string) => {
    if (store.status === 'feedback') return;
    const correct = option === round.data.answer;
    if (correct) {
      store.answerCorrect();
      store.showFeedback(true, 'Phản xạ tốt!', round.data.explanation);
    } else {
      store.answerWrong(round.id);
      store.showFeedback(false, 'Chưa đúng!', round.data.explanation);
    }
  };

  const handleAdvance = () => {
    store.hideFeedback();
    store.nextRound();
  };

  return (
    <GameShell
      title="Tình huống Tokutei"
      accent="#10B981"
      returnTo={returnTo}
      returnLabel={returnTo ? 'Khóa học' : 'Hub'}
      score={store.score}
      combo={store.combo}
      progress={progress}
      roundLabel={`${store.roundIndex + 1}/${store.totalRounds}`}
      feedback={store.feedback}
      onFeedbackDismiss={handleAdvance}
    >
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/10 bg-[#1A2332] p-5"
          >
            <p className="text-xs font-bold uppercase text-emerald-400/70">Tình huống</p>
            {courseTitle && <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">{courseTitle}</p>}
            <h3 className="mt-2 text-lg font-black leading-snug text-white">{round.prompt}</h3>
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-2">
          {round.data.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={store.status === 'feedback'}
              className={cn(
                'rounded-xl border border-white/10 bg-[#1A2332] px-4 py-3.5 text-left text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-60',
                'hover:border-emerald-500/50 hover:bg-[#1F2B3D]'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

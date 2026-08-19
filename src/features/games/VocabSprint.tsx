import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GameShell } from '@/src/features/games/GameShell';
import { useGameStore } from '@/src/features/games/gameStore';
import { GameResult } from '@/src/features/games/GameResult';
import { type VocabRound } from '@/src/features/games/data/vocabData';

interface VocabSprintProps {
  courseId?: string;
  rounds?: VocabRound[];
  returnTo?: string;
  courseTitle?: string;
}

export function VocabSprint({ courseId, rounds, returnTo, courseTitle }: VocabSprintProps) {
  const sessionRounds = useMemo(() => rounds ?? [], [rounds]);
  const store = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    store.startGame('vocab-sprint', sessionRounds.length);
    setReady(true);
  }, []);

  const round = sessionRounds[store.roundIndex] as VocabRound | undefined;
  const progress = store.totalRounds > 0 ? ((store.roundIndex + 1) / store.totalRounds) * 100 : 0;

  if (!ready) return null;

  if (store.status === 'complete') {
    return (
      <GameResult
        title="Vocab Sprint"
        accent="#3B82F6"
        score={store.score}
        maxCombo={store.maxCombo}
        correct={store.correct}
        total={store.totalRounds}
        courseId={courseId}
        gameId="vocab-sprint"
        returnTo={returnTo}
        returnLabel="Về khóa học"
        onRestart={() => { store.reset(); setReady(false); setTimeout(() => { store.startGame('vocab-sprint', sessionRounds.length); setReady(true); }, 0); }}
      />
    );
  }

  if (!round) return null;

  const handleSelect = (option: string) => {
    if (store.status === 'feedback') return;
    const correct = option === round.data.meaning;
    if (correct) {
      store.answerCorrect();
      store.showFeedback(true, 'Đúng rồi!', `${round.data.word} = ${round.data.meaning}`);
    } else {
      store.answerWrong(round.id);
      store.showFeedback(false, 'Sai rồi!', `${round.data.word} = ${round.data.meaning}`);
    }
  };

  const handleAdvance = () => {
    store.hideFeedback();
    store.nextRound();
  };

  return (
    <GameShell
      title="Vocab Sprint"
      accent="#3B82F6"
      returnTo={returnTo}
      returnLabel={returnTo ? 'Khóa học' : 'Hub'}
      score={store.score}
      combo={store.combo}
      progress={progress}
      roundLabel={`${store.roundIndex + 1}/${store.totalRounds}`}
      feedback={store.feedback}
      onFeedbackDismiss={handleAdvance}
    >
      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="w-full rounded-2xl border border-white/10 bg-[#1A2332] px-6 py-8 text-center"
          >
            {courseTitle && <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300/70">{courseTitle}</p>}
            <p className="text-sm text-white/50">Nghĩa của từ:</p>
            <span className="mt-2 block text-3xl font-black text-white">{round.data.word}</span>
          </motion.div>
        </AnimatePresence>

        <div className="grid w-full gap-2">
          {round.data.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={store.status === 'feedback'}
              className={cn(
                'rounded-xl border border-white/10 bg-[#1A2332] px-4 py-3.5 text-left text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60',
                'hover:border-blue-500/50 hover:bg-[#1F2B3D]'
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

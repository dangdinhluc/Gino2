import type { ReactNode, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { FeedbackState } from '@/src/features/games/types';

interface GameShellProps {
  title: string;
  accent: string;
  returnTo?: string;
  returnLabel?: string;
  score: number;
  combo: number;
  progress: number;
  roundLabel: string;
  feedback: FeedbackState;
  onFeedbackDismiss: () => void;
  children: ReactNode;
}

export function GameShell({ title, accent, returnTo = '/app/hub', returnLabel = 'Hub', score, combo, progress, roundLabel, feedback, onFeedbackDismiss, children }: GameShellProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0F1419]" style={{ '--game-accent': accent } as CSSProperties}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Link to={returnTo} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{returnLabel}</span>
        </Link>
        <span className="text-sm font-bold text-white/60">{title}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-white">⚡ {score}</span>
          {combo > 1 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400">
              <Flame size={12} className="fill-amber-400" /> x{combo}
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <span className="text-[11px] font-bold text-white/40">{roundLabel}</span>
        </div>
      </div>

      {/* Gameplay area */}
      <main className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6">
        <div className="w-full max-w-[640px]">
          {children}
        </div>
      </main>

      {/* Feedback bar */}
      <AnimatePresence>
        {feedback.visible && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'border-t-2 px-4 py-4 sm:px-6',
              feedback.correct ? 'border-emerald-500 bg-emerald-500/15' : 'border-red-500 bg-red-500/15'
            )}
          >
            <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {feedback.correct ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <XCircle size={20} className="text-red-400" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">{feedback.message}</p>
                  {feedback.detail && <p className="mt-0.5 text-xs text-white/60">{feedback.detail}</p>}
                </div>
              </div>
              <button
                onClick={onFeedbackDismiss}
                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
                style={{ backgroundColor: `${accent}33` }}
              >
                Tiếp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

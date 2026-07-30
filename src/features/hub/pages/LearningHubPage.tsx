import { Link } from 'react-router-dom';
import { Flame, Zap, Bird, Brain, Hammer } from 'lucide-react';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { GameCard } from '@/src/features/hub/components/GameCard';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

export default function LearningHub() {
  const { streak, weeklyXp } = useProgressStore();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-8">
      {/* Hero — Flappy Vocab */}
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Bird size={24} strokeWidth={1.8} />
            </span>
            <div>
              <h1 className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033] md:text-2xl">Flappy Vocab</h1>
              <p className="mt-1 max-w-sm text-sm text-[#5f6b7c]">Bay qua ống, trả lời nghĩa từ Tokutei khi va chạm. Càng bay xa, từ càng khó.</p>
            </div>
          </div>
          <Link
            to="/app/game/flappy-vocab"
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
          >
            Chơi ngay
          </Link>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="flex items-center justify-center gap-6 rounded-2xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-700" strokeWidth={1.8} />
          <span className="text-sm font-bold text-[#172033]">{streak} ngày streak</span>
        </div>
        <div className="h-4 w-px bg-[#e8dccb]" />
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-orange-700" strokeWidth={1.8} />
          <span className="text-sm font-bold text-[#172033]">{weeklyXp} XP tuần này</span>
        </div>
      </section>

      {/* Game grid — 2 game moi */}
      <section className="grid gap-3 md:grid-cols-2">
        <GameCard to="/app/game/memory-match" icon={Brain} title="Memory Match" subtitle="Lật bài ghép cặp từ vựng" level="A1 → A2" />
        <GameCard to="/app/game/word-builder" icon={Hammer} title="Word Builder" subtitle="Xếp chữ thành từ tiếng Nhật" level="A1 → A2" />
      </section>
    </div>
  );
}

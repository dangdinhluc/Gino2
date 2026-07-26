import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Flame, Zap, Sparkles, Bird, Brain, Hammer } from 'lucide-react';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { GameCard } from '@/src/features/hub/components/GameCard';

export default function LearningHub() {
  const { streak, weeklyXp } = useProgressStore();

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-5 pb-8">
      {/* Hero — Flappy Vocab */}
      <motion.section whileHover={{ y: -2 }} className="overflow-hidden rounded-3xl border border-[#E4D8C9] bg-gradient-to-br from-[#FFF9F2] to-[#FFF3E0] p-6 shadow-[0_16px_40px_-20px_rgba(96,70,42,0.15)] md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200/50">
              <Bird size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">Flappy Vocab</h2>
              <p className="mt-1 max-w-sm text-sm font-semibold text-gray-500">Bay qua ống, trả lời nghĩa từ Tokutei khi va chạm. Càng bay xa, từ càng khó!</p>
            </div>
          </div>
          <Link
            to="/app/game/flappy-vocab"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_12px_24px_-8px_rgba(245,158,11,0.4)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            <Sparkles size={16} />
            Chơi ngay
          </Link>
        </div>
      </motion.section>

      {/* Stats Strip */}
      <section className="flex items-center justify-center gap-6 rounded-[18px] border border-[#E4D8C9] bg-[#FFF9F2] px-5 py-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-[13px] font-bold text-gray-700">{streak} ngày streak</span>
        </div>
        <div className="h-4 w-px bg-[#E4D8C9]" />
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-500" />
          <span className="text-[13px] font-bold text-gray-700">{weeklyXp} XP tuần này</span>
        </div>
      </section>

      {/* Game grid — 2 game mới */}
      <section className="grid gap-4 md:grid-cols-2">
        <GameCard
          to="/app/game/memory-match"
          icon={Brain}
          title="Memory Match"
          subtitle="Lật bài ghép cặp từ vựng"
          accent="#A855F7"
          level="A1 → A2"
        />
        <GameCard
          to="/app/game/word-builder"
          icon={Hammer}
          title="Word Builder"
          subtitle="Xếp chữ thành từ tiếng Đức"
          accent="#F59E0B"
          level="A1 → A2"
        />
      </section>
    </div>
  );
}

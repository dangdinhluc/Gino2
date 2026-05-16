import { Info, Rocket, Zap, List, Volume2, GitBranch, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function LearningHub() {
  const games = [
    { id: 'gino-runner', title: 'Shift Sprint', sub: 'Trả lời quiz & giữ nhịp đầu ca', icon: Rocket, color: 'bg-blue-600' },
    { id: 'word-sprint', title: 'Word Sprint', sub: 'Chạy đua cụm từ Tokutei 60 giây', icon: Zap, color: 'bg-orange-600' },
    { id: 'fill-blank', title: 'Điền tình huống', sub: 'Điền phản xạ còn thiếu trong câu', icon: List, color: 'bg-blue-300' },
    { id: 'flashcard-audio', title: 'Luyện thẻ nhớ', sub: 'Nghe và lật thẻ đoán nghĩa', icon: Volume2, color: 'bg-purple-600' },
    { id: 'wortstellung', title: 'Interview Flow', sub: 'Chọn nhịp trả lời đúng khi phỏng vấn', icon: GitBranch, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] pb-4">
      <div className="mx-auto w-full max-w-[1380px] space-y-6">
        <section className="grid gap-3 md:gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_44px_-36px_rgba(96,70,42,0.18)] md:rounded-[2.25rem] md:p-6">
            <div className="flex items-start gap-3 rounded-[1.35rem] border border-blue-100 bg-blue-50/55 p-3 md:gap-4 md:rounded-[1.5rem] md:p-4">
              <div className="rounded-full bg-white p-2 text-blue-500 shadow-sm">
                <Info size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-blue-700">Track của anh: JFT + Tokutei Core</h4>
                <p className="text-xs font-bold text-blue-600/80">
                  Các trò chơi sẽ luyện cụm từ, phản xạ đầu ca và mock interview theo đúng track hiện tại.
                </p>
              </div>
            </div>

            <div className="mt-6 hidden space-y-3 md:block">
              <blockquote className="text-2xl font-black italic leading-tight text-gray-800">
                “Đi ngắn nhưng đều. Trước khi thi thật, phải quen nhịp việc thật.”
              </blockquote>
              <p className="text-sm font-bold text-gray-400">Hub này ưu tiên phiên ngắn, lặp đều và bám sát tình huống Tokutei.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff7ed_100%)] p-4 shadow-[0_18px_44px_-36px_rgba(96,70,42,0.18)] sm:flex-row sm:items-center sm:justify-between md:gap-6 md:rounded-[2.25rem] md:p-6">
            <div className="space-y-1 md:space-y-2">
              <p className="w-fit rounded-full border border-orange-100 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Bắt đầu nhanh</p>
              <h3 className="text-lg font-black tracking-tight text-gray-900 md:text-2xl">Chơi ngay một phiên ngắn</h3>
              <p className="max-w-sm text-[13px] font-bold leading-5 text-gray-500 md:text-sm">Chọn ngẫu nhiên một trò phù hợp track hiện tại để giữ nhịp Tokutei mỗi ngày.</p>
              <Link to="/app/hub/gino-runner" className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02] md:px-5 md:py-3">
                <Rocket size={16} />
                Bắt đầu
              </Link>
            </div>

            <div className="relative hidden shrink-0 lg:block">
              <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-100 shadow-xl shadow-orange-100/50 transition-transform hover:scale-105">
                <img
                  src="/mascot.png"
                  alt="Mascot"
                  className="h-full w-full object-cover animate-float"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-8xl">🐯</span>'; }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-xl border-2 border-white bg-blue-600 p-2 text-white shadow-lg">
                <Rocket size={24} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)] md:p-5">
          <h3 className="px-1 pb-4 text-lg font-black italic text-gray-800">Chọn trò chơi</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {games.map((game) => (
              <motion.div
                key={game.title}
                whileHover={{ y: -3 }}
                className="h-full"
              >
                <Link
                  to={`/app/hub/${game.id}`}
                  className="group flex h-full cursor-pointer items-start gap-4 rounded-2xl border border-[#e8ded0] bg-[#fffdf8] p-4 shadow-[0_12px_28px_-24px_rgba(96,70,42,0.22)] transition-all hover:border-orange-200 hover:bg-white hover:shadow-[0_18px_34px_-26px_rgba(249,115,22,0.28)] sm:items-center active:scale-98"
                >
                <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-4 ring-gray-50', game.color)}>
                  <game.icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black tracking-tight text-gray-800 md:text-base">{game.title}</h4>
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-relaxed text-gray-500">{game.sub}</p>
                </div>
                <div className="self-center rounded-full bg-gray-50 p-2 text-gray-300 transition-colors group-hover:bg-orange-50 group-hover:text-orange-500">
                  <ChevronRight size={16} />
                </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

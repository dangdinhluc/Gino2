import { BookText, Brain, ChevronRight, Flame, GitBranch, Info, List, Rocket, Sparkles, Volume2, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface FeaturedGame {
  id: string;
  title: string;
  sub: string;
  tag: string;
  hint: string;
  icon: LucideIcon;
  accentIcon: LucideIcon;
  gradient: string;
  shadow: string;
}

interface CompactGame {
  id: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  color: string;
}

const featuredGames: FeaturedGame[] = [
  {
    id: 'aisatsu-reflex',
    title: 'Aisatsu Reflex',
    sub: 'Chọn câu chào tiếng Nhật đúng tình huống trong 5 giây — combo lên thì điểm nhân.',
    tag: 'Reflex · 5s',
    hint: '3 mạng · 8 tình huống',
    icon: Flame,
    accentIcon: Sparkles,
    gradient: 'from-orange-500 to-amber-400',
    shadow: 'shadow-[0_22px_50px_-30px_rgba(249,115,22,0.6)]',
  },
  {
    id: 'profile-builder',
    title: 'Hồ sơ Builder',
    sub: 'Sắp xếp các từ thành câu giới thiệu Tokutei — đúng thứ tự để chốt phỏng vấn.',
    tag: 'Build · Tap',
    hint: '5 câu · không giới hạn thời gian',
    icon: BookText,
    accentIcon: Sparkles,
    gradient: 'from-blue-600 to-cyan-500',
    shadow: 'shadow-[0_22px_50px_-30px_rgba(37,99,235,0.55)]',
  },
  {
    id: 'tokutei-match',
    title: 'Tokutei Match',
    sub: 'Lật thẻ ghép từ tiếng Nhật ↔ nghĩa tiếng Việt — càng ít lượt càng điểm cao.',
    tag: 'Memory · 6 cặp',
    hint: 'Đếm số lượt + thời gian',
    icon: Brain,
    accentIcon: Sparkles,
    gradient: 'from-purple-600 to-pink-500',
    shadow: 'shadow-[0_22px_50px_-30px_rgba(168,85,247,0.55)]',
  },
];

const compactGames: CompactGame[] = [
  { id: 'gino-runner', title: 'Shift Sprint', sub: 'Quiz đầu ca, giữ nhịp ngày', icon: Rocket, color: 'bg-blue-600' },
  { id: 'word-sprint', title: 'Word Sprint', sub: 'Chạy đua cụm Tokutei 60s', icon: Zap, color: 'bg-orange-500' },
  { id: 'fill-blank', title: 'Điền tình huống', sub: 'Điền phản xạ còn thiếu', icon: List, color: 'bg-sky-500' },
  { id: 'flashcard-audio', title: 'Luyện thẻ nhớ', sub: 'Nghe và lật thẻ đoán nghĩa', icon: Volume2, color: 'bg-purple-600' },
  { id: 'wortstellung', title: 'Interview Flow', sub: 'Chọn nhịp trả lời khi phỏng vấn', icon: GitBranch, color: 'bg-amber-500' },
];

export default function LearningHub() {
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
                  Phiên ngắn – phản xạ chào hỏi, dựng câu hồ sơ, ghép cụm từ vựng để giữ nhịp Tokutei mỗi ngày.
                </p>
              </div>
            </div>

            <div className="mt-6 hidden space-y-3 md:block">
              <blockquote className="text-2xl font-black italic leading-tight text-gray-800">
                “Đi ngắn nhưng đều. Trước khi thi thật, phải quen nhịp việc thật.”
              </blockquote>
              <p className="text-sm font-bold text-gray-400">3 trò mới chơi được liền — không cần Supabase, có sẵn trong demo.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff7ed_100%)] p-4 shadow-[0_18px_44px_-36px_rgba(96,70,42,0.18)] sm:flex-row sm:items-center sm:justify-between md:gap-6 md:rounded-[2.25rem] md:p-6">
            <div className="space-y-1 md:space-y-2">
              <p className="w-fit rounded-full border border-orange-100 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Mới · chơi được luôn</p>
              <h3 className="text-lg font-black tracking-tight text-gray-900 md:text-2xl">3 phút phản xạ Tokutei</h3>
              <p className="max-w-sm text-[13px] font-bold leading-5 text-gray-500 md:text-sm">
                Aisatsu Reflex để khởi động — chọn câu chào đúng trong 5 giây, gom combo lấy điểm.
              </p>
              <Link
                to="/app/hub/aisatsu-reflex"
                className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02] md:px-5 md:py-3"
              >
                <Flame size={16} />
                Bắt đầu Reflex
              </Link>
            </div>

            <div className="relative hidden shrink-0 lg:block">
              <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-100 shadow-xl shadow-orange-100/50 transition-transform hover:scale-105">
                <img
                  src="/mascot.png"
                  alt="Mascot"
                  className="h-full w-full object-cover animate-float"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-8xl">🐯</span>';
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-xl border-2 border-white bg-blue-600 p-2 text-white shadow-lg">
                <Flame size={24} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)] md:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="px-1 text-lg font-black italic text-gray-800">Mini-game mới · chơi được liền</h3>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">3 trò mới</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featuredGames.map((game) => {
              const GameIcon = game.icon;
              const AccentIcon = game.accentIcon;
              return (
                <motion.div key={game.id} whileHover={{ y: -3 }} className="h-full">
                  <Link
                    to={`/app/hub/${game.id}`}
                    className={cn(
                      'group flex h-full flex-col justify-between gap-4 overflow-hidden rounded-[1.75rem] bg-gradient-to-br p-5 text-white transition-all active:scale-[0.99]',
                      game.gradient,
                      game.shadow,
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <GameIcon size={26} />
                      </div>
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] backdrop-blur-sm">
                        {game.tag}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-lg font-black tracking-tight md:text-xl">{game.title}</h4>
                      <p className="text-[12px] font-medium leading-relaxed text-white/85">{game.sub}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.16em] text-white/85">
                      <span className="inline-flex items-center gap-1">
                        <AccentIcon size={12} /> {game.hint}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur-sm">
                        Chơi <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)] md:p-5">
          <h3 className="px-1 pb-4 text-lg font-black italic text-gray-800">Mini-game kinh điển</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {compactGames.map((game) => {
              const GameIcon = game.icon;
              return (
                <motion.div key={game.id} whileHover={{ y: -3 }} className="h-full">
                  <Link
                    to={`/app/hub/${game.id}`}
                    className="group flex h-full cursor-pointer items-start gap-4 rounded-2xl border border-[#e8ded0] bg-[#fffdf8] p-4 shadow-[0_12px_28px_-24px_rgba(96,70,42,0.22)] transition-all hover:border-orange-200 hover:bg-white hover:shadow-[0_18px_34px_-26px_rgba(249,115,22,0.28)] sm:items-center active:scale-98"
                  >
                    <div className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-4 ring-gray-50', game.color)}>
                      <GameIcon size={24} />
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
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

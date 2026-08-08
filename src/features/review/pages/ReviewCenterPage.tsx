import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronRight,
  FileText,
  Flame,
  Layers,
  Mic,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TOKUTEI_TOPICS, TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import {
  computeDeckCounts,
  computeRetention,
  forecastDue,
  todayActivity,
} from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

export default function ReviewCenter() {
  const states = useReviewStore((state) => state.states);
  const log = useReviewStore((state) => state.log);
  const settings = useReviewStore((state) => state.settings);
  const newDay = useReviewStore((state) => state.newDay);
  const newIntroducedToday = useReviewStore((state) => state.newIntroducedToday);
  const totalReviewXp = useReviewStore((state) => state.totalReviewXp);
  const setNewPerDay = useReviewStore((state) => state.setNewPerDay);
  const streak = useProgressStore((state) => state.streak);

  const now = Date.now();
  const counts = useMemo(
    () => computeDeckCounts(states, now, settings.newPerDay, newDay, newIntroducedToday),
    [states, settings.newPerDay, newDay, newIntroducedToday],
  );

  const retention = useMemo(() => computeRetention(log, now), [log]);
  const forecast = useMemo(() => forecastDue(states, now), [states]);
  const activity = useMemo(() => todayActivity(log, now), [log]);
  const maxForecast = Math.max(1, ...forecast.map((day) => day.count));

  const topicProgress = useMemo(
    () =>
      TOKUTEI_TOPICS.map((topic) => {
        const cards = TOKUTEI_VOCAB.filter((card) => card.topicId === topic.id);
        const learned = cards.filter((card) => {
          const state = states[card.id];
          return state && state.phase !== 'new';
        }).length;
        return { topic, total: cards.length, learned };
      }),
    [states],
  );

  const heroStats = [
    { label: 'Tới hạn', value: counts.dueNow, sub: 'thẻ chờ ôn' },
    { label: 'Từ mới', value: counts.newAvailableToday, sub: 'còn hôm nay' },
    { label: 'Ghi nhớ', value: retention === null ? '—' : `${retention}%`, sub: '30 ngày qua' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-20">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] px-4 py-4.5 shadow-2xs sm:px-6 sm:py-6">
        {/* Watermark Kanji */}
        <div
          className="pointer-events-none absolute left-4 top-1 select-none text-4xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          復
        </div>

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#d83a00] shadow-2xs">
              <Brain size={13} className="text-amber-500 fill-amber-400" /> SPACED REPETITION SRS
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.03em] text-[#0f172a] sm:text-3xl">
              Trung tâm Ôn tập Từ vựng 🧠
            </h1>
            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm">
              Hệ thống thẻ nhớ SRS tự động xếp lịch đúng thời điểm chuẩn bị quên. Ôn đều mỗi ngày, phản xạ ca làm tự động chắc chắn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-2.5 flex-1 lg:flex-none">
              {heroStats.map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-2xl border border-[#f5ece1] bg-white p-3 text-center shadow-2xs">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#717d8f]">{stat.label}</div>
                  <div className="mt-1 font-[var(--font-heading)] text-xl font-black text-[#d83a00] sm:text-2xl">{stat.value}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-[#8c97a8]">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Right 3D Illustration */}
            <div className="relative shrink-0 hidden sm:block">
              <img
                src={assets.courses.workspace.vocabulary}
                alt="SRS Review Mascot"
                className="h-20 w-auto object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Primary Actions Grid */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Ôn thẻ tới hạn */}
        <div className="group rounded-[24px] border border-[#f5ece1] bg-white p-5 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff7f0] to-[#ffeedd] border border-orange-200/60 p-2 text-[#d83a00] shadow-2xs group-hover:scale-105 transition-transform">
                <RotateCcw size={22} />
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-[#c2410c] border border-orange-200/60">
                {counts.dueNow > 0 ? `${counts.dueNow} thẻ chờ` : 'Sạch hàng đợi'}
              </span>
            </div>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a] group-hover:text-[#d83a00] transition-colors">
                Ôn thẻ tới hạn
              </h2>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#5f6b7c]">
                Ưu tiên số một mỗi ngày: các thẻ đến hạn theo lịch SRS, kèm từ mới nếu còn suất.
              </p>
            </div>
          </div>

          <Link
            to="/app/review/flashcards?mode=due"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:shadow-md hover:brightness-110 active:scale-95"
          >
            <span>Ôn ngay</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Card 2: Học từ mới */}
        <div className="group rounded-[24px] border border-[#f5ece1] bg-white p-5 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff7f0] to-[#ffeedd] border border-orange-200/60 p-2 text-[#d83a00] shadow-2xs group-hover:scale-105 transition-transform">
                <BookOpen size={22} />
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-[#c2410c] border border-orange-200/60">
                {counts.newAvailableToday}/{settings.newPerDay} hôm nay
              </span>
            </div>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a] group-hover:text-[#d83a00] transition-colors">
                Học từ mới
              </h2>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#5f6b7c]">
                Nạp thẻ mới theo nhịp vừa sức. Chỉnh số thẻ mới mỗi ngày ngay tại đây.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setNewPerDay(settings.newPerDay - 5)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#eee3d5] bg-slate-50 text-[#5f6b7c] hover:bg-slate-100 hover:text-[#0f172a] active:scale-95"
              aria-label="Giảm số thẻ mới"
            >
              <Minus size={16} />
            </button>
            <div className="flex h-10 min-w-12 items-center justify-center rounded-2xl bg-orange-50 px-3 text-xs font-black text-[#d83a00] border border-orange-200/60">
              {settings.newPerDay}
            </div>
            <button
              type="button"
              onClick={() => setNewPerDay(settings.newPerDay + 5)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#eee3d5] bg-slate-50 text-[#5f6b7c] hover:bg-slate-100 hover:text-[#0f172a] active:scale-95"
              aria-label="Tăng số thẻ mới"
            >
              <Plus size={16} />
            </button>
            <Link
              to="/app/review/flashcards?mode=new"
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] text-xs font-extrabold text-white shadow-xs transition-all hover:brightness-110 active:scale-95 ml-1"
            >
              <span>Học ngay</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Card 3: Luyện nhanh (Cram) */}
        <div className="group rounded-[24px] border border-[#f5ece1] bg-white p-5 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff7f0] to-[#ffeedd] border border-orange-200/60 p-2 text-[#d83a00] shadow-2xs group-hover:scale-105 transition-transform">
                <Zap size={22} />
              </span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-[#c2410c] border border-orange-200/60">
                20 thẻ ngẫu nhiên
              </span>
            </div>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a] group-hover:text-[#d83a00] transition-colors">
                Luyện nhanh (Cram)
              </h2>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-[#5f6b7c]">
                Một lượt cram giữ phản xạ trước phỏng vấn hoặc ca làm việc.
              </p>
            </div>
          </div>

          <Link
            to="/app/review/flashcards?mode=cram"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#eee3d5] bg-[#fffcf9] text-xs font-extrabold text-[#0f172a] hover:bg-orange-50 hover:border-orange-300 hover:text-[#d83a00] transition-all active:scale-95"
          >
            <span>Bắt đầu cram</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 3. Forecast & Deck State Charts */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Forecast Chart */}
        <div className="rounded-[24px] border border-[#f5ece1] bg-white p-5 shadow-[0_6px_20px_rgba(217,74,19,0.05)] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]">
                <CalendarDays size={18} />
              </span>
              <div>
                <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">Dự báo 7 ngày tới</h2>
                <p className="text-xs font-semibold text-[#717d8f]">Số thẻ đến hạn mỗi ngày — ôn đều thì cột luôn thấp</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-[#c2410c] border border-orange-200/60">
              <Flame size={13} /> {streak} ngày streak
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {forecast.map((day, dayIndex) => (
              <div key={day.date} className="flex flex-col items-center gap-1.5">
                <div className="flex h-28 w-full items-end rounded-2xl bg-[#fff7f0] p-1 border border-orange-100">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, (day.count / maxForecast) * 100)}%` }}
                    transition={{ delay: dayIndex * 0.04 }}
                    className={cn(
                      'w-full rounded-xl',
                      dayIndex === 0
                        ? 'bg-gradient-to-t from-[#d83a00] to-[#f26522]'
                        : 'bg-gradient-to-t from-orange-300 to-orange-200'
                    )}
                  />
                </div>
                <span className="font-black text-[#0f172a] text-xs">{day.count}</span>
                <span className={cn('text-[10px] font-extrabold', dayIndex === 0 ? 'text-[#d83a00]' : 'text-[#8c97a8]')}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Deck State */}
        <div className="rounded-[24px] border border-[#f5ece1] bg-white p-5 shadow-[0_6px_20px_rgba(217,74,19,0.05)] space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]">
              <Layers size={18} />
            </span>
            <div>
              <h2 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">Bộ thẻ của anh</h2>
              <p className="text-xs font-semibold text-[#717d8f]">{counts.total} thẻ Tokutei · 8 chủ đề</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Chưa học', value: counts.newCount, tone: 'bg-slate-300' },
              { label: 'Đang học', value: counts.learning, tone: 'bg-amber-400' },
              { label: 'Ôn định kỳ', value: counts.review, tone: 'bg-gradient-to-r from-[#d83a00] to-[#f26522]' },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#5f6b7c]">
                  <span>{row.label}</span>
                  <span className="font-black text-[#0f172a]">{row.value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#eee5da]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((row.value / Math.max(1, counts.total)) * 100)}%` }}
                    className={cn('h-full rounded-full', row.tone)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-orange-200/80 bg-orange-50/60 p-3 text-xs font-semibold text-[#c2410c]">
            <Sparkles size={14} className="shrink-0 text-[#d83a00]" />
            Thẻ "Ôn định kỳ" có thời gian nhắc lại càng dài chứng tỏ anh nhớ càng sâu.
          </div>
        </div>
      </section>

      {/* 4. Topic Flashcard Decks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#d83a00]" />
            <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">Ôn theo chủ đề</h2>
          </div>
          <span className="hidden text-xs font-semibold text-[#8c97a8] sm:block">Phiên chủ đề vẫn tự động cập nhật lịch SRS</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topicProgress.map(({ topic, total, learned }) => {
            const percent = Math.round((learned / Math.max(1, total)) * 100);
            return (
              <Link
                key={topic.id}
                to={`/app/review/flashcards?mode=topic:${topic.id}`}
                className="group rounded-[24px] border border-[#f5ece1] bg-white p-4 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)] space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-orange-50 px-3 py-0.5 text-xs font-extrabold text-[#c2410c] border border-orange-200/60">
                    {topic.label}
                  </span>
                  <ChevronRight size={16} className="text-[#95a0af] transition-colors group-hover:text-[#d83a00]" />
                </div>
                <p className="line-clamp-2 text-xs font-semibold text-[#5f6b7c] min-h-[32px]">{topic.description}</p>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#717d8f]">
                    <span>{learned}/{total} thẻ</span>
                    <span className="font-extrabold text-[#d83a00]">{percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eee5da]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f27427]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Extra Channels */}
      <section className="grid gap-3 md:grid-cols-3">
        {[
          { title: 'Ngữ pháp & tác phong', sub: 'Đọc lại các chủ điểm Hō-Ren-Sō, 5S trước ca làm.', icon: FileText, path: '/app/grammar' },
          { title: 'Luyện nói theo mẫu', sub: 'Shadowing câu chào và câu trả lời phỏng vấn.', icon: Mic, path: '/app/ai-speak' },
          { title: 'Game phản xạ từ vựng', sub: 'Memory Match, Word Builder trong Learning Hub.', icon: Volume2, path: '/app/hub' },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="group flex items-center gap-3 rounded-[24px] border border-[#f5ece1] bg-white p-4 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]">
              <item.icon size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-black text-sm text-[#0f172a] group-hover:text-[#d83a00] transition-colors">{item.title}</div>
              <div className="truncate text-xs font-semibold text-[#5f6b7c]">{item.sub}</div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-[#d83a00]" />
          </Link>
        ))}
      </section>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  FileText,
  Flame,
  Layers,
  Mic,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { TokuteiTopicId } from '@/src/data/tokutei/vocabDeck';
import { TOKUTEI_TOPICS, TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import { cardStrength } from '@/src/features/review/lib/srs';
import {
  computeDeckCounts,
  computeRetention,
  forecastDue,
  todayActivity,
} from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

const toneChip: Record<string, string> = {
  orange: 'border-orange-100 bg-orange-50 text-orange-600',
  sky: 'border-sky-100 bg-sky-50 text-sky-600',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  rose: 'border-rose-100 bg-rose-50 text-rose-600',
  violet: 'border-violet-100 bg-violet-50 text-violet-600',
  amber: 'border-amber-100 bg-amber-50 text-amber-600',
  blue: 'border-blue-100 bg-blue-50 text-blue-600',
  pink: 'border-pink-100 bg-pink-50 text-pink-600',
};

const phaseLabel: Record<string, { label: string; className: string }> = {
  new: { label: 'Mới', className: 'bg-gray-100 text-gray-500' },
  learning: { label: 'Đang học', className: 'bg-amber-100 text-amber-700' },
  relearning: { label: 'Học lại', className: 'bg-rose-100 text-rose-600' },
  review: { label: 'Ôn định kỳ', className: 'bg-emerald-100 text-emerald-700' },
};

function dueLabel(due: number, phase: string, now: number): string {
  if (phase === 'new') return 'Chưa học';
  if (phase === 'learning' || phase === 'relearning') {
    return due <= now ? 'Tới hạn' : 'Trong phiên';
  }
  const diffDays = Math.ceil((due - now) / 86_400_000);
  if (diffDays <= 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  const date = new Date(due);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

export default function ReviewCenter() {
  const states = useReviewStore((state) => state.states);
  const log = useReviewStore((state) => state.log);
  const settings = useReviewStore((state) => state.settings);
  const newDay = useReviewStore((state) => state.newDay);
  const newIntroducedToday = useReviewStore((state) => state.newIntroducedToday);
  const totalReviewXp = useReviewStore((state) => state.totalReviewXp);
  const setNewPerDay = useReviewStore((state) => state.setNewPerDay);
  const streak = useProgressStore((state) => state.streak);

  const [query, setQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<TokuteiTopicId | 'all'>('all');

  const now = Date.now();
  const counts = useMemo(
    () => computeDeckCounts(states, now, settings.newPerDay, newDay, newIntroducedToday),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [states, settings.newPerDay, newDay, newIntroducedToday],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const retention = useMemo(() => computeRetention(log, now), [log]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const forecast = useMemo(() => forecastDue(states, now), [states]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activity = useMemo(() => todayActivity(log, now), [log]);
  const maxForecast = Math.max(1, ...forecast.map((day) => day.count));

  const filteredCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return TOKUTEI_VOCAB.filter((card) => {
      if (topicFilter !== 'all' && card.topicId !== topicFilter) return false;
      if (!normalized) return true;
      return [card.word, card.reading, card.romaji, card.meaning]
        .some((field) => field.toLowerCase().includes(normalized));
    });
  }, [query, topicFilter]);

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

  return (
    <div className="space-y-6 pb-16">
      {/* Hero + số liệu thật */}
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px] md:tracking-[0.2em]">
              <Brain size={14} />
              Spaced Repetition
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Trung tâm ôn tập</h2>
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
                Hệ thống thẻ nhớ SRS xếp lịch từng từ đúng lúc anh sắp quên. Ôn đều mỗi ngày, bộ nhớ tự chắc dần.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-orange-100 bg-orange-50 px-3 py-2.5 text-orange-600 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Tới hạn</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{counts.dueNow}</div>
              <div className="mt-1 text-[10px] font-medium leading-tight md:text-[11px]">thẻ chờ ôn</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-blue-600 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Từ mới</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{counts.newAvailableToday}</div>
              <div className="mt-1 text-[10px] font-medium leading-tight md:text-[11px]">còn hôm nay</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-emerald-600 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Ghi nhớ</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{retention === null ? '—' : `${retention}%`}</div>
              <div className="mt-1 text-[10px] font-medium leading-tight md:text-[11px]">30 ngày qua</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hàng hành động chính */}
      <section className="grid gap-4 md:grid-cols-3">
        <motion.div whileHover={{ y: -3 }} className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-[linear-gradient(135deg,#fff7ec_0%,#ffedd5_100%)] p-5 shadow-[0_22px_52px_-40px_rgba(180,138,91,0.4)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-white text-orange-500">
              <RotateCcw size={22} />
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-black text-orange-600">{counts.dueNow > 0 ? `${counts.dueNow} thẻ` : 'Sạch hàng đợi'}</span>
          </div>
          <h3 className="mt-4 text-lg font-black tracking-tight text-gray-900">Ôn thẻ tới hạn</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">Ưu tiên số một mỗi ngày: các thẻ đến hạn theo lịch SRS, kèm từ mới nếu còn suất.</p>
          <Link
            to="/app/review/flashcards?mode=due"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-transform hover:scale-[1.01]"
          >
            Ôn ngay <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-500">
              <BookOpen size={22} />
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-500">{counts.newAvailableToday}/{settings.newPerDay} hôm nay</span>
          </div>
          <h3 className="mt-4 text-lg font-black tracking-tight text-gray-900">Học từ mới</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">Nạp thẻ mới theo nhịp vừa sức. Chỉnh số thẻ mới mỗi ngày ngay tại đây.</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNewPerDay(settings.newPerDay - 5)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-white text-gray-600 hover:text-blue-600"
              aria-label="Giảm số thẻ mới mỗi ngày"
            >
              <Minus size={16} />
            </button>
            <div className="min-w-14 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-center text-sm font-black text-blue-600">{settings.newPerDay}</div>
            <button
              type="button"
              onClick={() => setNewPerDay(settings.newPerDay + 5)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-white text-gray-600 hover:text-blue-600"
              aria-label="Tăng số thẻ mới mỗi ngày"
            >
              <Plus size={16} />
            </button>
            <Link
              to="/app/review/flashcards?mode=new"
              className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-600 transition-colors hover:bg-blue-50"
            >
              Học <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-500">
              <Zap size={22} />
            </div>
            <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-500">20 thẻ ngẫu nhiên</span>
          </div>
          <h3 className="mt-4 text-lg font-black tracking-tight text-gray-900">Luyện nhanh</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">Một lượt cram giữ phản xạ trước phỏng vấn. Kết quả vẫn cập nhật lịch ôn.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[11px] font-bold text-gray-500">
            <div className="rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-2">
              <span className="block text-base font-black text-gray-900">{activity.reviews}</span>
              lượt hôm nay
            </div>
            <div className="rounded-2xl border border-[#e6ddd1] bg-white/70 px-3 py-2">
              <span className="block text-base font-black text-orange-600">{totalReviewXp}</span>
              XP tích lũy
            </div>
          </div>
          <Link
            to="/app/review/flashcards?mode=cram"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm font-black text-violet-600 transition-colors hover:bg-violet-50"
          >
            Bắt đầu cram <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Dự báo 7 ngày + trạng thái bộ thẻ */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-500">
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-gray-900">Dự báo 7 ngày tới</h3>
                <p className="text-xs font-medium text-gray-400">Số thẻ đến hạn từng ngày — ôn đều thì cột luôn thấp</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-600">
              <Flame size={13} className="fill-orange-500 text-orange-500" /> {streak} ngày
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {forecast.map((day, dayIndex) => (
              <div key={day.date} className="flex flex-col items-center gap-1.5">
                <div className="flex h-28 w-full items-end rounded-xl bg-[#f4ede2] p-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(6, (day.count / maxForecast) * 100)}%` }}
                    transition={{ delay: dayIndex * 0.04 }}
                    className={cn(
                      'w-full rounded-lg',
                      dayIndex === 0 ? 'bg-gradient-to-t from-orange-500 to-amber-400' : 'bg-gradient-to-t from-sky-400 to-cyan-300',
                    )}
                  />
                </div>
                <span className="text-sm font-black text-gray-800">{day.count}</span>
                <span className={cn('text-[10px] font-bold', dayIndex === 0 ? 'text-orange-500' : 'text-gray-400')}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-500">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-gray-900">Bộ thẻ của anh</h3>
              <p className="text-xs font-medium text-gray-400">{counts.total} thẻ Tokutei · 8 chủ đề</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Chưa học', value: counts.newCount, tone: 'bg-gray-300' },
              { label: 'Đang học', value: counts.learning, tone: 'bg-amber-400' },
              { label: 'Ôn định kỳ', value: counts.review, tone: 'bg-emerald-500' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>{row.label}</span>
                  <span className="text-gray-900">{row.value}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#efe7dc]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((row.value / Math.max(1, counts.total)) * 100)}%` }}
                    className={cn('h-full rounded-full', row.tone)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white/70 px-3.5 py-3 text-xs font-bold text-gray-500">
            <Sparkles size={14} className="shrink-0 text-orange-400" />
            Thẻ "Ôn định kỳ" có interval càng dài chứng tỏ anh nhớ càng chắc.
          </div>
        </div>
      </section>

      {/* Ôn theo chủ đề */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Target size={17} className="text-orange-500" />
            <h3 className="text-lg font-black tracking-tight text-gray-900">Ôn theo chủ đề</h3>
          </div>
          <span className="hidden text-xs font-bold text-gray-400 sm:block">Phiên chủ đề vẫn cập nhật lịch SRS</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topicProgress.map(({ topic, total, learned }) => (
            <Link
              key={topic.id}
              to={`/app/review/flashcards?mode=topic:${topic.id}`}
              className="group rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)] transition-all hover:-translate-y-0.5 hover:border-orange-200"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-black', toneChip[topic.tone])}>{topic.label}</span>
                <ChevronRight size={15} className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
              </div>
              <p className="mt-2.5 line-clamp-2 min-h-8 text-xs font-medium leading-relaxed text-gray-500">{topic.description}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>{learned}/{total} thẻ đã học</span>
                <span>{Math.round((learned / Math.max(1, total)) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe7dc]">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${Math.round((learned / Math.max(1, total)) * 100)}%` }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Duyệt toàn bộ thẻ */}
      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)] md:rounded-[2.5rem] md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-black tracking-tight text-gray-900">Duyệt bộ thẻ</h3>
            <p className="text-xs font-medium text-gray-400">Xem trạng thái từng từ · bấm vào từ để mở trang chi tiết</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kanji, romaji hoặc nghĩa..."
              className="w-full rounded-2xl border border-[#e1d8cb] bg-white py-3 pl-11 pr-10 text-sm font-medium outline-none transition-shadow focus:ring-2 focus:ring-orange-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600"
                aria-label="Xóa tìm kiếm"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTopicFilter('all')}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
              topicFilter === 'all' ? 'border-orange-200 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500',
            )}
          >
            Tất cả ({TOKUTEI_VOCAB.length})
          </button>
          {TOKUTEI_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setTopicFilter(topic.id)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all',
                topicFilter === topic.id ? 'border-orange-200 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500',
              )}
            >
              {topic.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {filteredCards.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#dccfbe] bg-white/60 px-4 py-8 text-center text-sm font-bold text-gray-400">
              Không tìm thấy thẻ nào khớp "{query}"
            </div>
          )}
          {filteredCards.map((card) => {
            const state = states[card.id];
            const phase = state?.phase ?? 'new';
            const strength = cardStrength(state);
            const info = phaseLabel[phase];
            return (
              <Link
                key={card.id}
                to={`/app/vocabulary/${card.id}`}
                className="group flex items-center gap-3 rounded-[1.5rem] border border-[#eee5d8] bg-white/65 px-3.5 py-3 transition-all hover:border-orange-200 hover:bg-white md:gap-4 md:px-4"
              >
                <div className="w-24 shrink-0 md:w-32">
                  <div lang="ja" className="truncate text-base font-black text-gray-900 md:text-lg">{card.word}</div>
                  <div className="truncate text-[11px] font-bold italic text-gray-400">{card.romaji}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-gray-700">{card.meaning}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#efe7dc] md:w-36">
                      <div
                        className={cn('h-full rounded-full', strength >= 70 ? 'bg-emerald-500' : strength >= 35 ? 'bg-amber-400' : 'bg-gray-300')}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <span className="hidden text-[10px] font-bold text-gray-400 md:block">{strength}%</span>
                  </div>
                </div>
                <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold text-gray-400 sm:flex">
                  <Clock3 size={12} />
                  {state ? dueLabel(state.due, phase, now) : 'Chưa học'}
                </div>
                <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black', info.className)}>{info.label}</span>
                <ChevronRight size={16} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Ôn đa kênh */}
      <section className="grid gap-3 md:grid-cols-3">
        {[
          { title: 'Ngữ pháp & tác phong', sub: 'Đọc lại các chủ điểm Hō-Ren-Sō, 5S trước ca làm.', icon: FileText, path: '/app/grammar', tone: 'blue' },
          { title: 'Luyện nói theo mẫu', sub: 'Shadowing câu chào và câu trả lời phỏng vấn.', icon: Mic, path: '/app/ai-speak', tone: 'emerald' },
          { title: 'Game phản xạ từ vựng', sub: 'Memory Match, Word Builder trong Learning Hub.', icon: Volume2, path: '/app/hub', tone: 'amber' },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="group flex items-center gap-3 rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.16)] transition-all hover:-translate-y-0.5 hover:border-orange-200"
          >
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border', toneChip[item.tone])}>
              <item.icon size={19} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-gray-900">{item.title}</div>
              <div className="truncate text-xs font-medium text-gray-400">{item.sub}</div>
            </div>
            <ChevronRight size={16} className="ml-auto shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
          </Link>
        ))}
      </section>
    </div>
  );
}

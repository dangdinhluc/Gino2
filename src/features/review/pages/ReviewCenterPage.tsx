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

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';
const sectionTitleClass = 'font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]';

const phaseLabel: Record<string, { label: string; className: string }> = {
  new: { label: 'Mới', className: 'bg-[#f0f2f5] text-[#5f6b7c]' },
  learning: { label: 'Đang học', className: 'bg-orange-50 text-orange-700' },
  relearning: { label: 'Học lại', className: 'bg-red-50 text-red-600' },
  review: { label: 'Ôn định kỳ', className: 'bg-emerald-50 text-emerald-700' },
};

function strengthColor(strength: number): string {
  if (strength >= 70) return 'bg-orange-700';
  if (strength >= 35) return 'bg-orange-400';
  return 'bg-[#d8ccbb]';
}

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

  const heroStats = [
    { label: 'Tới hạn', value: counts.dueNow, sub: 'thẻ chờ ôn' },
    { label: 'Từ mới', value: counts.newAvailableToday, sub: 'còn hôm nay' },
    { label: 'Ghi nhớ', value: retention === null ? '—' : `${retention}%`, sub: '30 ngày qua' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      {/* Hero + so lieu that */}
      <section className={panelClass}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <Brain size={14} /> Spaced Repetition
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Trung tâm ôn tập</h1>
            <p className="text-sm text-[#5f6b7c]">Hệ thống thẻ nhớ SRS xếp lịch từng từ đúng lúc anh sắp quên. Ôn đều mỗi ngày, bộ nhớ tự chắc dần.</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {heroStats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 md:min-w-[6rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">{stat.label}</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-xl font-bold leading-none text-[#172033] md:text-2xl">{stat.value}</div>
                <div className="mt-1 text-[11px] text-[#95a0af]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hang hanh dong chinh */}
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-700">
              <RotateCcw size={20} strokeWidth={1.8} />
            </span>
            <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-orange-700">{counts.dueNow > 0 ? `${counts.dueNow} thẻ` : 'Sạch hàng đợi'}</span>
          </div>
          <h2 className="mt-3.5 font-bold text-[#172033]">Ôn thẻ tới hạn</h2>
          <p className="mt-1 text-sm text-[#5f6b7c]">Ưu tiên số một mỗi ngày: các thẻ đến hạn theo lịch SRS, kèm từ mới nếu còn suất.</p>
          <Link
            to="/app/review/flashcards?mode=due"
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
          >
            Ôn ngay <ArrowRight size={16} />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <BookOpen size={20} strokeWidth={1.8} />
            </span>
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">{counts.newAvailableToday}/{settings.newPerDay} hôm nay</span>
          </div>
          <h2 className="mt-3.5 font-bold text-[#172033]">Học từ mới</h2>
          <p className="mt-1 text-sm text-[#5f6b7c]">Nạp thẻ mới theo nhịp vừa sức. Chỉnh số thẻ mới mỗi ngày ngay tại đây.</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNewPerDay(settings.newPerDay - 5)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}
              aria-label="Giảm số thẻ mới mỗi ngày"
            >
              <Minus size={16} />
            </button>
            <div className="min-w-14 rounded-xl bg-orange-50 px-3 py-2.5 text-center text-sm font-bold text-orange-700">{settings.newPerDay}</div>
            <button
              type="button"
              onClick={() => setNewPerDay(settings.newPerDay + 5)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}
              aria-label="Tăng số thẻ mới mỗi ngày"
            >
              <Plus size={16} />
            </button>
            <Link
              to="/app/review/flashcards?mode=new"
              className={`ml-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-bold text-[#172033] transition-colors hover:bg-[#f6efe6] ${focusRing}`}
            >
              Học <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Zap size={20} strokeWidth={1.8} />
            </span>
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">20 thẻ ngẫu nhiên</span>
          </div>
          <h2 className="mt-3.5 font-bold text-[#172033]">Luyện nhanh</h2>
          <p className="mt-1 text-sm text-[#5f6b7c]">Một lượt cram giữ phản xạ trước phỏng vấn. Kết quả vẫn cập nhật lịch ôn.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2">
              <span className="block font-[var(--font-heading)] text-base font-bold text-[#172033]">{activity.reviews}</span>
              <span className="text-[11px] text-[#7b8796]">lượt hôm nay</span>
            </div>
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2">
              <span className="block font-[var(--font-heading)] text-base font-bold text-orange-700">{totalReviewXp}</span>
              <span className="text-[11px] text-[#7b8796]">XP tích lũy</span>
            </div>
          </div>
          <Link
            to="/app/review/flashcards?mode=cram"
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-bold text-[#172033] transition-colors hover:bg-[#f6efe6] ${focusRing}`}
          >
            Bắt đầu cram <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Du bao 7 ngay + trang thai bo the */}
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={panelClass}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <CalendarDays size={18} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="font-bold text-[#172033]">Dự báo 7 ngày tới</h2>
                <p className="text-xs text-[#7b8796]">Số thẻ đến hạn từng ngày — ôn đều thì cột luôn thấp</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-orange-700">
              <Flame size={13} strokeWidth={1.8} /> {streak} ngày
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2">
            {forecast.map((day, dayIndex) => (
              <div key={day.date} className="flex flex-col items-center gap-1.5">
                <div className="flex h-28 w-full items-end rounded-lg bg-[#f4ede2] p-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(6, (day.count / maxForecast) * 100)}%` }}
                    transition={{ delay: dayIndex * 0.04 }}
                    className={cn('w-full rounded-md', dayIndex === 0 ? 'bg-orange-700' : 'bg-orange-300')}
                  />
                </div>
                <span className="font-bold text-[#172033]">{day.count}</span>
                <span className={cn('text-[10px] font-bold', dayIndex === 0 ? 'text-orange-700' : 'text-[#95a0af]')}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={panelClass}>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Layers size={18} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="font-bold text-[#172033]">Bộ thẻ của anh</h2>
              <p className="text-xs text-[#7b8796]">{counts.total} thẻ Tokutei · 8 chủ đề</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Chưa học', value: counts.newCount, tone: 'bg-[#d8ccbb]' },
              { label: 'Đang học', value: counts.learning, tone: 'bg-orange-400' },
              { label: 'Ôn định kỳ', value: counts.review, tone: 'bg-orange-700' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs font-bold text-[#5f6b7c]">
                  <span>{row.label}</span>
                  <span className="text-[#172033]">{row.value}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#efe5d7]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((row.value / Math.max(1, counts.total)) * 100)}%` }}
                    className={cn('h-full rounded-full', row.tone)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3.5 py-3 text-xs text-[#5f6b7c]">
            <Sparkles size={14} className="shrink-0 text-orange-700" strokeWidth={1.8} />
            Thẻ "Ôn định kỳ" có interval càng dài chứng tỏ anh nhớ càng chắc.
          </div>
        </div>
      </section>

      {/* On theo chu de */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Target size={17} className="text-orange-700" strokeWidth={1.8} />
            <h2 className={sectionTitleClass}>Ôn theo chủ đề</h2>
          </div>
          <span className="hidden text-xs text-[#95a0af] sm:block">Phiên chủ đề vẫn cập nhật lịch SRS</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {topicProgress.map(({ topic, total, learned }) => {
            const percent = Math.round((learned / Math.max(1, total)) * 100);
            return (
              <Link
                key={topic.id}
                to={`/app/review/flashcards?mode=topic:${topic.id}`}
                className={`group rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">{topic.label}</span>
                  <ChevronRight size={15} className="text-[#95a0af] transition-colors group-hover:text-orange-700" />
                </div>
                <p className="mt-2.5 line-clamp-2 min-h-8 text-xs text-[#7b8796]">{topic.description}</p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#5f6b7c]">
                  <span>{learned}/{total} thẻ đã học</span>
                  <span>{percent}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                  <div className="h-full rounded-full bg-orange-700" style={{ width: `${percent}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Duyet toan bo the */}
      <section className={panelClass}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={sectionTitleClass}>Duyệt bộ thẻ</h2>
            <p className="text-xs text-[#7b8796]">Xem trạng thái từng từ · bấm vào từ để mở trang chi tiết</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95a0af]" strokeWidth={1.8} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kanji, romaji hoặc nghĩa..."
              className="w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-3 pl-11 pr-10 text-sm font-medium text-[#172033] outline-none transition-shadow placeholder:text-[#95a0af] focus:ring-2 focus:ring-orange-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-[#95a0af] transition-colors hover:text-[#5f6b7c]"
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
              'rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors',
              topicFilter === 'all' ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-orange-700',
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
                'rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors',
                topicFilter === topic.id ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-orange-700',
              )}
            >
              {topic.label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[#e8dccb] bg-[#fffdf8]">
          {filteredCards.length === 0 && (
            <div className="px-4 py-8 text-center text-sm font-bold text-[#95a0af]">Không tìm thấy thẻ nào khớp "{query}"</div>
          )}
          <ul className="divide-y divide-[#efe5d7]">
            {filteredCards.map((card) => {
              const state = states[card.id];
              const phase = state?.phase ?? 'new';
              const strength = cardStrength(state);
              const info = phaseLabel[phase];
              return (
                <li key={card.id}>
                  <Link
                    to={`/app/vocabulary/${card.id}`}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#fffaf3] md:gap-4"
                  >
                    <div className="w-24 shrink-0 md:w-32">
                      <div lang="ja" className="truncate font-bold text-[#172033]">{card.word}</div>
                      <div className="truncate text-[11px] italic text-[#95a0af]">{card.romaji}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-[#5f6b7c]">{card.meaning}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#efe5d7] md:w-36">
                          <div className={cn('h-full rounded-full', strengthColor(strength))} style={{ width: `${strength}%` }} />
                        </div>
                        <span className="hidden text-[10px] font-bold text-[#95a0af] md:block">{strength}%</span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold text-[#95a0af] sm:flex">
                      <Clock3 size={12} />
                      {state ? dueLabel(state.due, phase, now) : 'Chưa học'}
                    </div>
                    <span className={cn('shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold', info.className)}>{info.label}</span>
                    <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* On da kenh */}
      <section className="grid gap-2.5 md:grid-cols-3">
        {[
          { title: 'Ngữ pháp & tác phong', sub: 'Đọc lại các chủ điểm Hō-Ren-Sō, 5S trước ca làm.', icon: FileText, path: '/app/grammar' },
          { title: 'Luyện nói theo mẫu', sub: 'Shadowing câu chào và câu trả lời phỏng vấn.', icon: Mic, path: '/app/ai-speak' },
          { title: 'Game phản xạ từ vựng', sub: 'Memory Match, Word Builder trong Learning Hub.', icon: Volume2, path: '/app/hub' },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className={`group flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <item.icon size={19} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <div className="truncate font-bold text-[#172033]">{item.title}</div>
              <div className="truncate text-xs text-[#7b8796]">{item.sub}</div>
            </div>
            <ChevronRight size={16} className="ml-auto shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
          </Link>
        ))}
      </section>
    </div>
  );
}

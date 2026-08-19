import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Flame,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  getDueVocabularyCards,
  getReviewSettings,
  updateReviewSettings,
  type DueVocabularyCard,
} from '@/src/features/courses/repositories/learningProgressRepository';
import { assets } from '@/src/shared/lib/assets';
import { cn } from '@/src/lib/utils';

interface ReviewSnapshot {
  cards: DueVocabularyCard[];
  newCardsPerDay: number;
}

const PRESET_GOALS = [5, 10, 15, 20];

export default function ReviewCenter() {
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cards, settings] = await Promise.all([getDueVocabularyCards(100), getReviewSettings()]);
      setSnapshot({ cards, newCardsPerDay: settings.newCardsPerDay });
    } catch (reason) {
      setSnapshot(null);
      setError(reason instanceof Error ? reason.message : 'Không tải được dữ liệu ôn tập.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const cards = snapshot?.cards ?? [];
    const due = cards.filter((card) => card.status !== 'new').length;
    const fresh = cards.filter((card) => card.status === 'new').length;
    const learning = cards.filter((card) => card.status === 'learning').length;
    const mastered = cards.filter((card) => card.status === 'mastered').length;
    const total = cards.length;
    return { due, fresh, learning, mastered, total };
  }, [snapshot]);

  const changeNewCardLimit = async (deltaOrValue: number, isAbsolute = false) => {
    if (!snapshot || isSavingSetting) return;
    const nextValue = isAbsolute ? deltaOrValue : snapshot.newCardsPerDay + deltaOrValue;
    const clamped = Math.max(1, Math.min(50, nextValue));
    if (clamped === snapshot.newCardsPerDay) return;

    setIsSavingSetting(true);
    setError(null);
    try {
      const settings = await updateReviewSettings(clamped);
      setSnapshot((current) => current && { ...current, newCardsPerDay: settings.newCardsPerDay });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được cài đặt SRS.');
    } finally {
      setIsSavingSetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 text-sm font-bold text-[#5f6b7c]">
        <RotateCcw className="mr-2 h-4 w-4 animate-spin text-[#d83a00]" />
        Đang tải trung tâm ôn tập…
      </div>
    );
  }

  if (!snapshot) {
    return (
      <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-xs">
        <h1 className="font-[var(--font-heading)] text-2xl font-black text-red-800">Không tải được dữ liệu SRS</h1>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800"
        >
          <RotateCcw size={15} /> Thử lại
        </button>
      </section>
    );
  }

  const cards = [
    {
      title: 'Thẻ tới hạn',
      badge: counts.due > 0 ? 'Ưu tiên' : 'Đã xong',
      badgeType: counts.due > 0 ? 'due' : 'done',
      value: counts.due,
      unit: 'thẻ đến hạn',
      description: counts.due > 0 ? 'Được lấy trực tiếp từ lịch SRS hôm nay của anh.' : 'Tuyệt vời! Anh đã hoàn thành tất cả thẻ đến hạn.',
      to: '/app/review/flashcards?mode=due',
      icon: RotateCcw,
      iconClass: 'bg-orange-50 text-[#d83a00] border-orange-100',
      primary: counts.due > 0,
      btnLabel: counts.due > 0 ? 'Ôn thẻ tới hạn' : 'Xem lại thẻ',
    },
    {
      title: 'Từ mới',
      badge: `Mục tiêu ${snapshot.newCardsPerDay}/ngày`,
      badgeType: 'new',
      value: counts.fresh,
      unit: 'thẻ sẵn sàng',
      description: `Khám phá từ vựng mới theo chuyên ngành Tokutei.`,
      to: '/app/review/flashcards?mode=new',
      icon: BookOpen,
      iconClass: 'bg-sky-50 text-sky-700 border-sky-100',
      primary: false,
      btnLabel: 'Học từ mới',
    },
    {
      title: 'Luyện nhanh',
      badge: 'Cấp tốc',
      badgeType: 'cram',
      value: Math.min(snapshot.cards.length, 20),
      unit: 'thẻ / phiên',
      description: 'Phiên ngắn 20 thẻ ngẫu nhiên để tăng phản xạ ca làm.',
      to: '/app/review/flashcards?mode=cram',
      icon: Zap,
      iconClass: 'bg-amber-50 text-amber-700 border-amber-100',
      primary: false,
      btnLabel: 'Bắt đầu luyện',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-24 sm:px-6">
      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 shadow-2xs sm:p-6">
        {/* Japanese Watermark Kanji */}
        <div
          className="pointer-events-none absolute left-4 top-1 select-none text-4xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          復
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="max-w-xl space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs">
              <Brain size={12} /> SRS dữ liệu thật
            </span>
            <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.02em] text-[#172033] sm:text-3xl">
              Trung tâm ôn tập
            </h1>
            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm">
              Lịch ôn, trạng thái thẻ và giới hạn từ mới được đồng bộ riêng cho tài khoản của anh.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-200/90 bg-white px-3.5 py-2 text-xs font-black text-[#c2410c] shadow-2xs transition-all hover:bg-orange-50 active:scale-95"
            >
              <RotateCcw size={14} /> Làm mới
            </button>
            <div className="hidden sm:block -my-3 -mr-1">
              <img
                src={assets.vocabulary.mascot}
                alt="Tokutei Tanuki Mascot"
                className="h-20 w-auto object-contain drop-shadow-xs md:h-24"
              />
            </div>
          </div>
        </div>
      </header>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      {/* 3 Action Cards */}
      <section className="grid gap-3.5 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className={cn(
                'group flex min-h-56 flex-col justify-between rounded-[22px] border bg-white p-5 shadow-2xs transition-all duration-200 hover:border-orange-300 hover:shadow-md gino-hover-lift',
                card.primary ? 'border-orange-200 bg-gradient-to-b from-[#fffcf9] to-white' : 'border-[#eedecf]'
              )}
            >
              <div>
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl border shadow-2xs transition-transform duration-200 group-hover:scale-105', card.iconClass)}>
                    <Icon size={20} strokeWidth={2.2} />
                  </span>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                      card.badgeType === 'due' && 'bg-orange-100 text-[#d83a00]',
                      card.badgeType === 'done' && 'bg-emerald-100 text-emerald-700',
                      card.badgeType === 'new' && 'bg-sky-50 text-sky-700 border border-sky-100',
                      card.badgeType === 'cram' && 'bg-amber-50 text-amber-700 border border-amber-100'
                    )}
                  >
                    {card.badgeType === 'due' && <Flame size={11} className="fill-orange-500 text-orange-500" />}
                    {card.badgeType === 'done' && <CheckCircle2 size={11} />}
                    {card.badge}
                  </span>
                </div>

                {/* Title & Value */}
                <p className="mt-3.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#8c97a8]">
                  {card.title}
                </p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <strong className="font-[var(--font-heading)] text-3xl font-black text-[#172033]">
                    {card.value}
                  </strong>
                  <span className="text-xs font-bold text-[#8c97a8]">{card.unit}</span>
                </div>

                <p className="mt-1.5 text-xs font-medium leading-5 text-[#5f6b7c]">
                  {card.description}
                </p>
              </div>

              {/* Bottom Action Button */}
              <Link
                to={card.to}
                className={cn(
                  'mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black shadow-2xs transition-all active:scale-[0.98]',
                  card.primary
                    ? 'bg-gradient-to-r from-[#d83a00] to-[#ea580c] text-white hover:brightness-110'
                    : 'border border-orange-200/90 bg-orange-50 text-[#c2410c] hover:bg-orange-100/80'
                )}
              >
                {card.btnLabel} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          );
        })}
      </section>

      {/* Bottom 2 Status & Setting Cards */}
      <section className="grid gap-3.5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Card: Trạng thái hàng đợi */}
        <article className="flex flex-col justify-between rounded-[22px] border border-[#eedecf] bg-white p-5 shadow-2xs">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-[#d83a00]">
                <Brain size={18} />
              </span>
              <div>
                <h2 className="font-[var(--font-heading)] text-base font-black text-[#172033]">
                  Trạng thái hàng đợi
                </h2>
                <p className="text-xs font-medium text-[#7b8796]">
                  Chỉ phản ánh thẻ hiện đến hạn hoặc sẵn sàng học.
                </p>
              </div>
            </div>

            {/* 3 Status Cards */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-amber-100 bg-[#fffcf5] p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-800">Đang học</p>
                </div>
                <p className="mt-1 font-[var(--font-heading)] text-2xl font-black text-[#172033]">{counts.learning}</p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-[#f4fdf8] p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-wide text-emerald-800">Đã nhớ</p>
                </div>
                <p className="mt-1 font-[var(--font-heading)] text-2xl font-black text-emerald-700">{counts.mastered}</p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-[#f4faff] p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <p className="text-[10px] font-black uppercase tracking-wide text-sky-800">Mới</p>
                </div>
                <p className="mt-1 font-[var(--font-heading)] text-2xl font-black text-sky-700">{counts.fresh}</p>
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between text-[11px] font-semibold text-[#8c97a8]">
            <span>Tổng số thẻ trong kho: <strong className="text-[#172033]">{counts.total}</strong></span>
            <span>Đồng bộ SRS tự động</span>
          </div>
        </article>

        {/* Card: Từ mới mỗi ngày */}
        <article className="flex flex-col justify-between rounded-[22px] border border-[#eedecf] bg-white p-5 shadow-2xs">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-[#d83a00]">
                <Settings2 size={18} />
              </span>
              <div>
                <h2 className="font-[var(--font-heading)] text-base font-black text-[#172033]">
                  Từ mới mỗi ngày
                </h2>
                <p className="text-xs font-medium text-[#7b8796]">
                  Lưu trực tiếp vào cài đặt học viên.
                </p>
              </div>
            </div>

            {/* Stepper with Controls */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isSavingSetting || snapshot.newCardsPerDay <= 1}
                onClick={() => void changeNewCardLimit(-1)}
                aria-label="Giảm 1 từ"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dccb] bg-white text-[#5f6b7c] shadow-2xs transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-[#d83a00] active:scale-95 disabled:opacity-40"
              >
                <Minus size={16} strokeWidth={2.4} />
              </button>

              <div className="min-w-16 text-center">
                <strong className="font-[var(--font-heading)] text-3xl font-black text-[#d83a00]">
                  {snapshot.newCardsPerDay}
                </strong>
                <p className="text-[10px] font-bold text-[#8c97a8]">từ / ngày</p>
              </div>

              <button
                type="button"
                disabled={isSavingSetting || snapshot.newCardsPerDay >= 50}
                onClick={() => void changeNewCardLimit(1)}
                aria-label="Tăng 1 từ"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dccb] bg-white text-[#5f6b7c] shadow-2xs transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-[#d83a00] active:scale-95 disabled:opacity-40"
              >
                <Plus size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-3.5 flex items-center justify-center gap-1.5 border-t border-[#f5ece1] pt-3">
            <span className="text-[10px] font-bold text-[#8c97a8] mr-1">Chọn nhanh:</span>
            {PRESET_GOALS.map((preset) => {
              const isSelected = snapshot.newCardsPerDay === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={isSavingSetting}
                  onClick={() => void changeNewCardLimit(preset, true)}
                  className={cn(
                    'rounded-lg px-2.5 py-0.5 text-xs font-extrabold transition-all active:scale-95',
                    isSelected
                      ? 'bg-[#d83a00] text-white shadow-2xs'
                      : 'border border-orange-200/80 bg-[#fffaf5] text-[#5f6b7c] hover:border-orange-400 hover:text-[#d83a00]'
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}


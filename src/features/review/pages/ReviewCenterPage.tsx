import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Minus, Plus, RotateCcw, Settings2, Zap } from 'lucide-react';
import {
  getDueVocabularyCards,
  getReviewSettings,
  updateReviewSettings,
  type DueVocabularyCard,
} from '@/src/features/courses/repositories/learningProgressRepository';

interface ReviewSnapshot {
  cards: DueVocabularyCard[];
  newCardsPerDay: number;
}

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
    return {
      due: cards.filter((card) => card.status !== 'new').length,
      fresh: cards.filter((card) => card.status === 'new').length,
      learning: cards.filter((card) => card.status === 'learning').length,
      mastered: cards.filter((card) => card.status === 'mastered').length,
    };
  }, [snapshot]);

  const changeNewCardLimit = async (delta: number) => {
    if (!snapshot || isSavingSetting) return;
    setIsSavingSetting(true);
    setError(null);
    try {
      const settings = await updateReviewSettings(snapshot.newCardsPerDay + delta);
      setSnapshot((current) => current && { ...current, newCardsPerDay: settings.newCardsPerDay });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được cài đặt SRS.');
    } finally {
      setIsSavingSetting(false);
    }
  };

  if (isLoading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 text-sm font-bold text-[#5f6b7c]">Đang tải trung tâm ôn tập…</div>;
  }

  if (!snapshot) {
    return (
      <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="font-[var(--font-heading)] text-2xl font-black text-red-800">Không tải được dữ liệu SRS</h1>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void load()} className="mt-5 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Thử lại</button>
      </section>
    );
  }

  const cards = [
    { title: 'Thẻ tới hạn', value: counts.due, description: 'Được lấy trực tiếp từ lịch SRS của anh.', to: '/app/review/flashcards?mode=due', icon: RotateCcw, primary: true },
    { title: 'Từ mới', value: counts.fresh, description: `Tối đa ${snapshot.newCardsPerDay} thẻ mới mỗi ngày.`, to: '/app/review/flashcards?mode=new', icon: BookOpen, primary: false },
    { title: 'Luyện nhanh', value: Math.min(snapshot.cards.length, 20), description: 'Phiên ngắn từ những thẻ hiện có thể ôn.', to: '/app/review/flashcards?mode=cram', icon: Zap, primary: false },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      <header className="rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]"><Brain size={13} /> SRS dữ liệu thật</p>
            <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-black tracking-[-0.03em] text-[#172033]">Trung tâm ôn tập</h1>
            <p className="mt-2 text-sm leading-6 text-[#5f6b7c]">Lịch ôn, trạng thái thẻ và giới hạn từ mới đều được lưu riêng cho tài khoản của anh.</p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-[#c2410c]"><RotateCcw size={15} /> Làm mới</button>
        </div>
      </header>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <section className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="flex min-h-52 flex-col rounded-3xl border border-[#f0e5d9] bg-white p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]"><Icon size={21} /></span>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#8c97a8]">{card.title}</p>
              <strong className="mt-1 font-[var(--font-heading)] text-4xl font-black text-[#172033]">{card.value}</strong>
              <p className="mt-2 flex-1 text-sm leading-5 text-[#5f6b7c]">{card.description}</p>
              <Link to={card.to} className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black ${card.primary ? 'bg-[#d83a00] text-white' : 'border border-orange-200 bg-orange-50 text-[#c2410c]'}`}>Bắt đầu <ArrowRight size={15} /></Link>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-[#f0e5d9] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]"><Brain size={19} /></span><div><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Trạng thái hàng đợi</h2><p className="text-xs text-[#7b8796]">Chỉ phản ánh thẻ hiện đến hạn hoặc sẵn sàng học.</p></div></div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['Đang học', counts.learning],
              ['Đã nhớ', counts.mastered],
              ['Mới', counts.fresh],
            ].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-[#fffaf5] p-3 text-center"><p className="text-[10px] font-black uppercase tracking-wide text-[#8c97a8]">{label}</p><p className="mt-1 text-2xl font-black text-[#172033]">{value}</p></div>)}
          </div>
        </article>

        <article className="rounded-3xl border border-[#f0e5d9] bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]"><Settings2 size={19} /></span><div><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Từ mới mỗi ngày</h2><p className="text-xs text-[#7b8796]">Lưu trực tiếp vào cài đặt học viên.</p></div></div>
          <div className="mt-6 flex items-center justify-center gap-3"><button type="button" disabled={isSavingSetting} onClick={() => void changeNewCardLimit(-1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] text-[#5f6b7c] disabled:opacity-50"><Minus size={17} /></button><strong className="min-w-18 text-center font-[var(--font-heading)] text-3xl font-black text-[#d83a00]">{snapshot.newCardsPerDay}</strong><button type="button" disabled={isSavingSetting} onClick={() => void changeNewCardLimit(1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] text-[#5f6b7c] disabled:opacity-50"><Plus size={17} /></button></div>
        </article>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight, Gamepad2, GraduationCap, MessageCircle, PenLine, RotateCcw, Target } from 'lucide-react';
import { getDueVocabularyCards } from '@/src/features/courses/repositories/learningProgressRepository';
import { assets } from '@/src/shared/lib/assets';

export default function PracticeHubPage() {
  const [dueCount, setDueCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDueVocabularyCards(100)
      .then((cards) => {
        if (!cancelled) setDueCount(cards.filter((card) => card.status !== 'new').length);
      })
      .catch(() => {
        if (!cancelled) setDueCount(0);
      });
    return () => { cancelled = true; };
  }, []);

  const actions = [
    { title: 'Ôn từ vựng', hint: 'Ôn từ đến hạn từ tất cả khóa đang học', icon: Brain, to: '/app/practice/review' },
    { title: 'Luyện câu hỏi', hint: 'Luyện theo chủ đề và nội dung đã học', icon: Target, to: '/app/practice/review' },
    { title: 'Thi thử', hint: 'Làm đề Tokutei mô phỏng', icon: GraduationCap, to: '/app/exams' },
    { title: 'Game', hint: 'Luyện phản xạ từ vựng qua trò chơi', icon: Gamepad2, to: '/app/hub' },
    { title: 'AI Writing', hint: 'Luyện viết và nhận góp ý từ AI', icon: PenLine, to: '/app/ai-lab' },
    { title: 'AI Speaking', hint: 'Luyện nói và phản xạ hội thoại', icon: MessageCircle, to: '/app/ai-speak' },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      <header className="relative overflow-hidden rounded-[28px] border border-[#fde0c7] bg-gradient-to-br from-[#fffaf3] via-[#fff3e6] to-[#ffe6cf] p-5 shadow-[0_14px_36px_rgba(217,74,19,0.08)] sm:p-7">
        <div className="relative grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]">Luyện tập tổng hợp</span>
            <h1 className="mt-3 font-[var(--font-heading)] text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">Hôm nay nên luyện gì?</h1>
            <p className="mt-1 max-w-xl text-sm font-semibold leading-relaxed text-[#687385]">Đây là khu luyện tập ngoài khóa học. Nội dung được tổng hợp từ tất cả khóa anh đang học.</p>
          </div>
          <img src={assets.vocabulary.mascot} alt="Tokutei practice mascot" className="mx-auto h-24 w-auto object-contain drop-shadow-md sm:h-28" />
        </div>
      </header>

      <section className="rounded-[24px] border border-orange-200 bg-gradient-to-r from-[#d83a00] to-[#ef6c24] p-5 text-white shadow-lg shadow-orange-200/40 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-100">Cần làm hôm nay</p>
            <h2 className="mt-1 font-[var(--font-heading)] text-2xl font-black">{dueCount === null ? 'Đang kiểm tra…' : `${dueCount} từ cần ôn`}</h2>
            <p className="mt-1 text-xs font-semibold text-orange-50/90">Tổng hợp từ các khóa đang học của anh.</p>
          </div>
          <RotateCcw size={34} className="shrink-0 opacity-90" />
        </div>
        <Link to="/app/review/flashcards?mode=due" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#d83a00] shadow-sm sm:w-auto">
          Ôn tất cả{typeof dueCount === 'number' && dueCount > 0 ? ` (${dueCount})` : ''} <ChevronRight size={17} />
        </Link>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]">Chọn cách luyện</p>
          <h2 className="font-[var(--font-heading)] text-xl font-black text-[#172033]">Mọi công cụ luyện tập ở một chỗ</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.to} className="group flex items-center gap-3 rounded-[22px] border border-[#eedecf] bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-[#d83a00]">
                  <Icon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm font-black text-[#172033] group-hover:text-[#d83a00]">{action.title}</strong>
                  <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#7b8796]">{action.hint}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#a0aab8] group-hover:text-[#d83a00]" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

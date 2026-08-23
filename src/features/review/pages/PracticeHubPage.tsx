import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight, Gamepad2, GraduationCap, MessageCircle, PenLine, RotateCcw, Target } from 'lucide-react';
import { getDueVocabularyCards } from '@/src/features/courses/repositories/learningProgressRepository';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

export default function PracticeHubPage() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const streak = useProgressStore((state) => state.streak);

  useEffect(() => {
    let cancelled = false;
    getDueVocabularyCards(100)
      .then((cards) => { if (!cancelled) setDueCount(cards.filter((card) => card.status !== 'new').length); })
      .catch(() => { if (!cancelled) setDueCount(0); });
    return () => { cancelled = true; };
  }, []);

  const actions = [
    { title: 'Ôn từ vựng', hint: 'Ôn theo phương pháp SRS', icon: Brain, to: '/app/practice/review', tone: 'bg-[#e5f8ea] text-[#3fac6c]' },
    { title: 'Luyện câu hỏi', hint: 'Luyện tập theo chủ đề', icon: Target, to: '/app/practice/review', tone: 'bg-[#e7f1ff] text-[#5389d8]' },
    { title: 'Thi thử', hint: 'Làm đề thi Tokutei', icon: GraduationCap, to: '/app/exams', tone: 'bg-[#ffe7e7] text-[#e25b5b]' },
    { title: 'Game', hint: 'Luyện phản xạ từ vựng', icon: Gamepad2, to: '/app/hub', tone: 'bg-[#e6f7f7] text-[#55aaa8]' },
    { title: 'AI Writing', hint: 'Chấm và sửa bài viết', icon: PenLine, to: '/app/ai-lab', tone: 'bg-[#eee6ff] text-[#7956d2]' },
    { title: 'AI Speaking', hint: 'Luyện nói với AI', icon: MessageCircle, to: '/app/ai-speak', tone: 'bg-[#e8eef8] text-[#344c71]' },
  ];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-[21px] font-extrabold tracking-[-0.02em] text-[#17181d]">Luyện tập</h1>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#ececf2] bg-white px-3 text-[11px] font-bold text-[#595b65] shadow-[0_2px_8px_rgba(25,25,40,.04)]">🔥 {streak} ngày</span>
      </header>

      <section>
        <h2 className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[.06em] text-[#3f4148]">Cần làm hôm nay</h2>
        <div className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(135deg,#7d4fe0_0%,#9a70e6_100%)] p-4 text-white shadow-[0_8px_18px_rgba(111,69,216,.22)]">
          <div className="relative z-10">
            <strong className="block text-[20px] font-extrabold">{dueCount === null ? 'Đang kiểm tra…' : `${dueCount} từ cần ôn`}</strong>
            <span className="mt-1 block text-[10px] font-medium text-white/80">Từ tất cả khóa học</span>
            <Link to="/app/review/flashcards?mode=due" className="mt-3 inline-flex h-9 min-w-[190px] items-center justify-center rounded-lg bg-white px-4 text-[10px] font-extrabold text-[#6f45d8] shadow-sm">
              ÔN TẤT CẢ{typeof dueCount === 'number' && dueCount > 0 ? ` (${dueCount})` : ''}
            </Link>
          </div>
          <img src={assets.shared.mascots.brand} alt="Tanuki" className="absolute -bottom-1 right-3 h-24 w-24 object-contain drop-shadow-md" />
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[15px] border border-[#e8e8ef] bg-white shadow-[0_3px_12px_rgba(20,20,35,.035)]">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.to} className={`flex min-h-[68px] items-center gap-3 px-3.5 py-3 ${index ? 'border-t border-[#eeeeF3]' : ''}`}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${action.tone}`}><Icon size={17} /></span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[12px] font-extrabold text-[#25262c]">{action.title}</strong>
                <small className="mt-0.5 block text-[10px] font-medium text-[#9799a3]">{action.hint}</small>
              </span>
              <ChevronRight size={16} className="text-[#a7a9b1]" />
            </Link>
          );
        })}
      </section>

      <Link to="/app/practice/review" className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[#ddd5ef] bg-[#faf8ff] px-4 py-3 text-[10px] font-extrabold text-[#7048d4]">
        <RotateCcw size={14} /> Xem lịch ôn chi tiết
      </Link>
    </div>
  );
}

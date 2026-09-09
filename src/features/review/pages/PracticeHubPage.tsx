import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight, Gamepad2, GraduationCap, MessageCircle, PenLine, RotateCcw, Target } from 'lucide-react';
import { fetchLearnerStats } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';
import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';
import { assets } from '@/src/shared/lib/assets';

type RpcResult = { data: unknown; error: { message: string } | null };
type SupabaseWithDueCountRpc = {
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<RpcResult>;
};

async function fetchDueVocabularyCount(courseId: string): Promise<number> {
  // The production RPC is newer than the checked-in generated types. Keep the
  // escape hatch local and preserve method binding by calling through client.
  const client = requireSupabase() as unknown as SupabaseWithDueCountRpc;
  const { data, error } = await client.rpc('get_due_vocabulary_count', { target_course_id: courseId });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export default function PracticeHubPage() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [dueError, setDueError] = useState<string | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const activeCourseStatus = useActiveCourseStore((state) => state.status);

  const loadDueCount = useCallback(async () => {
    if (activeCourseStatus !== 'ready' || !activeCourseId) {
      setDueCount(0);
      setDueError(null);
      return;
    }
    setDueCount(null);
    setDueError(null);
    try {
      setDueCount(await fetchDueVocabularyCount(activeCourseId));
    } catch (error: unknown) {
      setDueError(error instanceof Error ? error.message : 'Không tải được số từ cần ôn.');
    }
  }, [activeCourseId, activeCourseStatus]);

  useEffect(() => {
    void loadDueCount();
  }, [loadDueCount]);

  useEffect(() => {
    let cancelled = false;
    fetchLearnerStats()
      .then((stats) => { if (!cancelled) setStreak(stats.currentStreak); })
      .catch(() => { if (!cancelled) setStreak(null); });
    return () => { cancelled = true; };
  }, []);

  const actions = [
    { title: 'Ôn từ vựng', hint: 'Ôn theo phương pháp SRS', icon: Brain, to: '/app/practice/review', tone: 'bg-[#eee7ff] text-[#6f45d8]' },
    { title: 'Luyện câu hỏi', hint: 'Luyện tập theo chủ đề', icon: Target, to: '/app/practice/review', tone: 'bg-[#eee7ff] text-[#6f45d8]' },
    { title: 'Thi thử', hint: 'Làm đề thi Tokutei', icon: GraduationCap, to: '/app/exams', tone: 'bg-[#eee7ff] text-[#6f45d8]' },
    { title: 'Game', hint: 'Luyện phản xạ từ vựng', icon: Gamepad2, to: '/app/hub', tone: 'bg-[#eee7ff] text-[#6f45d8]' },
    { title: 'AI Writing', hint: 'Chấm và sửa bài viết', icon: PenLine, to: '/app/ai-lab', tone: 'bg-[#f3eefb] text-[#8a72c7]' },
    { title: 'AI Speaking', hint: 'Luyện nói với AI', icon: MessageCircle, to: '/app/ai-speak', tone: 'bg-[#f3eefb] text-[#8a72c7]' },
  ];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-[var(--font-heading)] text-[22px] font-bold tracking-[-0.025em] text-[#211b35]">Luyện tập</h1>
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#e5dcf2] bg-[#fffcff] px-3 text-[11px] font-semibold text-[#6f6880] shadow-[0_2px_8px_rgba(73,48,126,.05)]">🔥 {streak === null ? '—' : streak} ngày</span>
      </header>

      <section>
        <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#6f6880]">Cần làm hôm nay</h2>
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#6f45d8_0%,#5631b8_100%)] p-4 text-white shadow-[0_10px_26px_rgba(111,69,216,.2)] sm:p-5">
          <div className="relative z-10 max-w-[70%]">
            <strong className="block font-[var(--font-heading)] text-[21px] font-bold">
              {dueError ? 'Chưa tải được lịch ôn' : dueCount === null ? 'Đang kiểm tra…' : `${dueCount} từ cần ôn`}
            </strong>
            <span className="mt-1 block text-[11px] font-medium text-white/85">
              {dueError ? 'Dữ liệu hiện tại không bị thay bằng số 0.' : 'Từ đã học và đến hạn theo SRS'}
            </span>
            {dueError ? (
              <button type="button" onClick={() => void loadDueCount()} className="mt-4 inline-flex min-h-11 min-w-[150px] items-center justify-center rounded-[14px] bg-white px-4 text-[12px] font-bold text-[#5631b8] shadow-sm">
                Thử lại
              </button>
            ) : (
              <Link to="/app/review/flashcards?mode=due" className="mt-4 inline-flex min-h-11 min-w-[190px] items-center justify-center rounded-[14px] bg-white px-4 text-[12px] font-bold text-[#5631b8] shadow-sm transition hover:bg-[#faf7ff] focus-visible:outline-white">
                ÔN TẤT CẢ{typeof dueCount === 'number' && dueCount > 0 ? ` (${dueCount})` : ''}
              </Link>
            )}
          </div>
          <img src={assets.shared.mascots.brand} alt="Tanuki" className="absolute -bottom-1 right-3 h-24 w-24 object-contain drop-shadow-md sm:h-28 sm:w-28" />
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[24px] border border-[#e5dcf2] bg-[#fffcff] shadow-[0_6px_18px_rgba(73,48,126,.06)]">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.to} className={`flex min-h-[72px] items-center gap-3 px-4 py-3 transition hover:bg-[#faf7ff] ${index ? 'border-t border-[#e5dcf2]' : ''}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${action.tone}`}><Icon size={18} /></span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[13px] font-semibold text-[#211b35]">{action.title}</strong>
                <small className="mt-0.5 block text-[11px] font-medium text-[#6f6880]">{action.hint}</small>
              </span>
              <ChevronRight size={17} className="text-[#9189a0]" />
            </Link>
          );
        })}
      </section>

      <Link to="/app/practice/review" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-[#e5dcf2] bg-[#f4effb] px-4 py-3 text-[12px] font-bold text-[#6f45d8] transition hover:border-[#d6c8ea] hover:bg-[#fffcff]">
        <RotateCcw size={15} /> Xem lịch ôn chi tiết
      </Link>
    </div>
  );
}

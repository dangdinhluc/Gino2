import { Check, CheckCircle2, ClipboardCheck, Play, Shuffle, BookOpen, Target } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/CourseLearningResourcePanels';
import type { PracticeMode } from './types';

export function CoursePracticeSetup({
  courseTitle,
  mode,
  modeLabels,
  vocabularyCount,
  questionCount,
  availableCount,
  countOptions,
  selectedCount,
  error,
  onModeChange,
  onCountChange,
  onStart,
}: {
  courseTitle: string;
  mode: PracticeMode;
  modeLabels: Record<PracticeMode, string>;
  vocabularyCount: number;
  questionCount: number;
  availableCount: number;
  countOptions: number[];
  selectedCount: number;
  error: string | null;
  onModeChange: (mode: PracticeMode) => void;
  onCountChange: (count: number) => void;
  onStart: () => void;
}) {
  const modes: Array<{ id: PracticeMode; icon: typeof BookOpen; hint: string; count: number }> = [
    { id: 'vocabulary', icon: BookOpen, hint: 'Chọn nghĩa đúng của từ trong khóa.', count: vocabularyCount },
    { id: 'questions', icon: ClipboardCheck, hint: 'Phản xạ với câu hỏi trắc nghiệm.', count: questionCount },
    { id: 'mixed', icon: Shuffle, hint: 'Trộn từ vựng và câu hỏi trong một phiên.', count: vocabularyCount + questionCount },
  ];

  return (
    <div className="mx-auto w-full max-w-[1120px] space-y-4">
      <header className="relative overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-[#fffaf3] via-[#fff5eb] to-[#ffeedd] p-5 sm:p-7">
        <div className="relative z-10 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]"><Target size={13} /> Luyện tập theo khóa</p>
          <h1 className="mt-3 font-[var(--font-heading)] text-3xl font-black tracking-[-0.04em] text-[#172033] sm:text-4xl">Phản xạ nhanh với {courseTitle}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f6b7c]">Chọn nội dung, số câu rồi làm trắc nghiệm. Kết quả được chấm theo dữ liệu của chính khóa học này.</p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full border-[1.25rem] border-orange-200/35" aria-hidden="true" />
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 sm:p-5" aria-labelledby="course-practice-mode-title">
          <div className="flex items-start justify-between gap-3">
            <div><h2 id="course-practice-mode-title" className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">1. Chọn nội dung luyện</h2><p className="mt-1 text-sm text-[#5f6b7c]">Tập trung vào phần anh muốn củng cố.</p></div>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">{availableCount} câu có sẵn</span>
          </div>
          <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label="Loại nội dung luyện tập">
            {modes.map(({ id, icon: Icon, hint, count }) => {
              const isActive = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onModeChange(id)}
                  className={cn('flex min-h-16 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors', isActive ? 'border-orange-700 bg-orange-50 shadow-[0_0_0_1px_#c2410c]' : 'border-[#e8dccb] bg-white hover:border-orange-300 hover:bg-orange-50/50', focusRing)}
                >
                  <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', isActive ? 'bg-orange-700 text-white' : 'bg-orange-50 text-orange-700')}><Icon size={19} /></span>
                  <span className="min-w-0 flex-1"><strong className="block text-sm font-bold text-[#172033]">{modeLabels[id]}</strong><small className="mt-0.5 block text-xs text-[#7b8796]">{hint}</small></span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#7b8796]">{count} <CheckCircle2 size={15} className={isActive ? 'text-orange-700' : 'text-[#cbd5e1]'} /></span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8dccb] bg-white p-4 sm:p-5" aria-labelledby="course-practice-count-title">
          <div><h2 id="course-practice-count-title" className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">2. Chọn số câu</h2><p className="mt-1 text-sm text-[#5f6b7c]">Anh có thể làm theo từng phiên ngắn.</p></div>
          <div className="mt-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Số câu trong phiên luyện tập">
            {countOptions.map((count) => {
              const isActive = selectedCount === count;
              return <button key={count} type="button" role="radio" aria-checked={isActive} onClick={() => onCountChange(count)} className={cn('flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-colors', isActive ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-800', focusRing)}>{count} câu {isActive && <Check size={15} />}</button>;
            })}
          </div>
          <button type="button" onClick={onStart} disabled={!selectedCount || !availableCount} className={cn('mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50', focusRing)}><Play size={17} fill="currentColor" /> Bắt đầu luyện tập</button>
          {!availableCount && <p role="status" className="mt-3 text-center text-xs font-semibold text-amber-700">Khóa học chưa có đủ dữ liệu để tạo phiên luyện.</p>}
        </section>
      </div>

      <p className="flex items-center justify-center gap-2 px-3 text-center text-xs text-[#7b8796]"><CheckCircle2 size={14} className="text-emerald-600" /> Câu trả lời được ghi nhận theo khóa học, không lấy từ hàng đợi SRS ngoài menu chính.</p>
    </div>
  );
}

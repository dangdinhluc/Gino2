import { BookOpen, Check, ClipboardCheck, Play, Shuffle } from 'lucide-react';
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
  const modes: Array<{ id: PracticeMode; icon: typeof BookOpen; title: string; hint: string; count: number }> = [
    { id: 'mixed', icon: BookOpen, title: 'Luyện theo bài', hint: `Luyện tổng hợp từ ${courseTitle}`, count: vocabularyCount + questionCount },
    { id: 'questions', icon: ClipboardCheck, title: 'Luyện theo chủ đề', hint: 'Phân loại theo câu hỏi trong khóa', count: questionCount },
    { id: 'vocabulary', icon: Shuffle, title: 'Luyện nhanh', hint: '5–10 câu ngắn từ từ vựng', count: vocabularyCount },
  ];

  return (
    <div className="mx-auto w-full max-w-[620px] space-y-3 pb-24">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</p>}

      <div className="space-y-2.5" role="radiogroup" aria-label="Loại nội dung luyện tập">
        {modes.map(({ id, icon: Icon, title, hint, count }, index) => {
          const isActive = mode === id;
          const featured = index === 0;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onModeChange(id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-[13px] border px-3.5 py-3 text-left transition-all',
                isActive && featured
                  ? 'border-[#7b58d8] bg-[linear-gradient(135deg,#7953db,#6b46cf)] text-white shadow-[0_5px_14px_rgba(111,69,216,.18)]'
                  : isActive
                    ? 'border-[#cfc2ee] bg-[#f7f4ff]'
                    : 'border-[#e8e8ef] bg-white hover:border-[#d8d0e8]',
                focusRing
              )}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${isActive && featured ? 'bg-white/18 text-white' : 'bg-[#f4f1fb] text-[#7552cd]'}`}><Icon size={18} /></span>
              <span className="min-w-0 flex-1">
                <strong className={`block text-[12px] font-extrabold ${isActive && featured ? 'text-white' : 'text-[#303138]'}`}>{title}</strong>
                <small className={`mt-1 block text-[9px] font-medium ${isActive && featured ? 'text-white/78' : 'text-[#9597a0]'}`}>{hint}</small>
              </span>
              <span className={`text-[9px] font-bold ${isActive && featured ? 'text-white/85' : 'text-[#8d8f98]'}`}>{count} câu</span>
            </button>
          );
        })}
      </div>

      <section className="rounded-[13px] border border-[#e8e8ef] bg-white p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div><strong className="block text-[11px] font-extrabold text-[#303138]">Số câu trong phiên</strong><span className="text-[9px] font-medium text-[#989aa3]">Chọn phiên ngắn phù hợp</span></div>
          <span className="rounded-full bg-[#f4f0ff] px-2.5 py-1 text-[9px] font-bold text-[#6f45d8]">{availableCount} câu có sẵn</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Số câu trong phiên luyện tập">
          {countOptions.map((count) => {
            const isActive = selectedCount === count;
            return (
              <button key={count} type="button" role="radio" aria-checked={isActive} onClick={() => onCountChange(count)} className={cn('inline-flex h-9 min-w-[62px] items-center justify-center gap-1 rounded-lg border px-3 text-[10px] font-bold', isActive ? 'border-[#6f45d8] bg-[#6f45d8] text-white' : 'border-[#e5e5ec] bg-[#fafafa] text-[#686a73]', focusRing)}>
                {count} câu {isActive && <Check size={12} />}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onStart} disabled={!selectedCount || !availableCount} className={cn('mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6f45d8] px-4 text-[11px] font-extrabold text-white shadow-[0_4px_10px_rgba(111,69,216,.18)] disabled:cursor-not-allowed disabled:opacity-50', focusRing)}><Play size={14} fill="currentColor" /> BẮT ĐẦU LUYỆN</button>
      </section>

      {!availableCount && <p role="status" className="text-center text-[10px] font-medium text-[#9a7d2c]">Khóa học chưa có đủ dữ liệu để tạo phiên luyện.</p>}
      <span className="sr-only">Chế độ đang chọn: {modeLabels[mode]}</span>
    </div>
  );
}

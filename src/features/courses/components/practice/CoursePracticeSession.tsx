import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, HelpCircle, LoaderCircle, Target, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/CourseLearningResourcePanels';
import type { PracticeAnswer, PracticeQuestion } from './types';
import { PracticeFeedbackSheet } from './PracticeFeedbackSheet';

export function CoursePracticeSession({
  courseTitle,
  modeLabel,
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  answer,
  isChecking,
  combo,
  error,
  onExit,
  onSelect,
  onNext,
}: {
  courseTitle: string;
  modeLabel: string;
  question: PracticeQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  answer?: PracticeAnswer;
  isChecking: boolean;
  combo: number;
  error: string | null;
  onExit: () => void;
  onSelect: (answer: string) => void;
  onNext: () => void;
}) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const progress = Math.round(((questionIndex + (answer ? 1 : 0)) / totalQuestions) * 100);

  useEffect(() => {
    if (answer) {
      setShowFeedbackModal(true);
    } else {
      setShowFeedbackModal(false);
    }
  }, [answer]);

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-4 pb-6">
      <header className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><button type="button" onClick={onExit} className={cn('inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-[#5f6b7c] hover:bg-orange-50 hover:text-orange-800', focusRing)}><ArrowLeft size={16} /> Chọn lại</button><span className="text-xs font-bold text-[#7b8796]">{questionIndex + 1}/{totalQuestions}</span></div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold"><span className="inline-flex items-center gap-1.5 text-orange-800"><Target size={14} /> {modeLabel}</span><span className="truncate text-[#7b8796]" title={courseTitle}>{courseTitle}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efe5d7]" role="progressbar" aria-label="Tiến độ phiên luyện tập" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-orange-700 transition-all" style={{ width: `${progress}%` }} /></div>
        {combo >= 2 && (
          <div key={combo} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d83a00] to-[#e65100] px-3 py-1 text-xs font-black text-white shadow-xs" role="status">
            <Flame size={14} className="fill-white" />
            {combo >= 5 ? 'Đang vào form! 🔥' : `Combo x${combo} 🔥`}
          </div>
        )}
      </header>

      <main className="rounded-2xl border border-[#e8dccb] bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-800">{question.kind === 'vocabulary' ? 'Từ vựng' : 'Câu hỏi khóa học'}</span><span className="text-xs font-semibold text-[#95a0af]">{question.source}</span></div>
        <h1 className="mt-5 font-[var(--font-heading)] text-[clamp(1.5rem,4vw,2.15rem)] font-bold leading-tight tracking-[-0.03em] text-[#172033]">{question.prompt}</h1>
        {question.pronunciation && <p className="mt-2 text-sm font-semibold text-[#7b8796]">Cách đọc: {question.pronunciation}</p>}

        <div className="mt-7 grid gap-3" role="radiogroup" aria-label="Các đáp án">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = Boolean(answer?.correctAnswer && option === answer.correctAnswer);
            const isWrongSelected = Boolean(answer && isSelected && !answer.isCorrect);
            return (
              <button key={option} type="button" role="radio" aria-checked={isSelected} disabled={Boolean(answer) || isChecking} onClick={() => onSelect(option)} className={cn('flex min-h-14 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors', isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : isWrongSelected ? 'border-red-400 bg-red-50 text-red-900' : isSelected ? 'border-orange-700 bg-orange-50 text-orange-900 shadow-[0_0_0_1px_#c2410c]' : 'border-[#e8dccb] bg-[#fffdf8] text-[#172033] hover:border-orange-300 hover:bg-[#fffaf3]', focusRing)}>
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold', isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : isWrongSelected ? 'border-red-400 bg-red-400 text-white' : isSelected ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c]')}>{String.fromCharCode(65 + index)}</span>
                <span className="flex-1 text-sm font-semibold sm:text-base">{option}</span>
                {isCorrect && <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />}
                {isWrongSelected && <XCircle size={18} className="shrink-0 text-red-500" />}
              </button>
            );
          })}
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">{error}</p>}
        {isChecking && (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-[#c2410c]">
            <LoaderCircle size={17} className="animate-spin" /> Đang kiểm tra…
          </div>
        )}

        {answer ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f5ece1] pt-4">
            <button
              type="button"
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-[#c2410c] hover:bg-orange-100 transition-colors"
            >
              <HelpCircle size={14} /> Xem lại giải thích
            </button>
            <button
              type="button"
              onClick={onNext}
              className={cn(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-xs font-black text-white transition-all hover:bg-orange-800 active:scale-95 shadow-sm',
                focusRing
              )}
            >
              {questionIndex === totalQuestions - 1 ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          !isChecking && (
            <p className="mt-6 text-center text-xs font-semibold text-[#8c97a8]">
              💡 Chọn đáp án để kiểm tra kết quả ngay
            </p>
          )
        )}
      </main>

      {showFeedbackModal && answer && (
        <PracticeFeedbackSheet
          answer={answer}
          isLastQuestion={questionIndex === totalQuestions - 1}
          onClose={() => setShowFeedbackModal(false)}
          onNext={onNext}
        />
      )}
    </div>
  );
}

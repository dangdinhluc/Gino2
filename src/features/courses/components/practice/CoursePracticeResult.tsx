import { ArrowLeft, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/coursePanelStyles';
import { Confetti } from '@/src/shared/components/Confetti';
import type { PracticeAnswer, PracticeQuestion } from './types';

interface CoursePracticeResultProps {
  courseTitle: string;
  modeLabel: string;
  questions: PracticeQuestion[];
  answers: Record<string, PracticeAnswer>;
  onRetry: () => void;
  onExit: () => void;
}

export function CoursePracticeResult({ courseTitle, modeLabel, questions, answers, onRetry, onExit }: CoursePracticeResultProps) {
  const correctCount = questions.filter((question) => answers[question.id]?.isCorrect).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const vocabularyCount = questions.filter((question) => question.kind === 'vocabulary').length;
  const reviewCount = questions.filter((question) => question.kind === 'question').length;
  const sessionXp = vocabularyCount * 10 + reviewCount * 5;
  const resultMessage = score >= 80 ? 'Rất tốt, anh đang nắm khá chắc phần này.' : score >= 50 ? 'Đang có nền tảng, mình ôn lại các câu sai nhé.' : 'Mình làm thêm một lượt ngắn để nhớ chắc hơn nhé.';

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-4 pb-8 text-center">
      <section className="relative w-full overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-[#fffaf3] via-[#fff5eb] to-[#ffeedd] p-6 sm:p-9">
        {score >= 80 && <Confetti />}
        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-700 text-white"><CheckCircle2 size={28} /></span>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-orange-800">Đã hoàn thành phiên</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-black tracking-[-0.04em] text-[#172033]">Kết quả luyện tập</h1>
          <p className="mt-2 text-sm text-[#5f6b7c]">{courseTitle} · {modeLabel}</p>
          <div className="mx-auto mt-6 flex h-28 w-28 flex-col items-center justify-center rounded-full border-8 border-orange-100 bg-white"><strong className="font-[var(--font-heading)] text-3xl font-black text-orange-800">{score}%</strong><span className="text-xs font-bold text-[#7b8796]">{correctCount}/{questions.length} đúng</span></div>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#5f6b7c]">{resultMessage}</p>
          <div className="mx-auto mt-4 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-black text-amber-800"><Zap size={16} className="fill-amber-400 text-amber-600" /> +{sessionXp} XP đã cộng vào chuỗi học tập</div>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={onRetry} className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white hover:bg-orange-800', focusRing)}><RotateCcw size={16} /> Làm lại phiên này</button><button type="button" onClick={onExit} className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 text-sm font-bold text-orange-800 hover:bg-orange-50', focusRing)}><ArrowLeft size={16} /> Chọn nội dung khác</button></div>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, ChevronDown, ChevronLeft, Clock3, RotateCcw, Send, Sparkles, Trophy, X, XCircle } from 'lucide-react';
import type { CourseExamItem } from '@/src/features/courses/mock/courseLearningMock';
import { focusRing, primaryButtonClass } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { cn } from '@/src/lib/utils';

export interface CourseExamQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  skill: string;
}

interface CourseExamRunnerProps {
  exam: CourseExamItem;
  questions: CourseExamQuestion[];
  onExit: () => void;
  onGoToReview: () => void;
  onCompleted: (scorePercent: number) => void;
}

export function durationToSeconds(duration: string) {
  const minutes = Number.parseInt(duration, 10);
  return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 25 * 60;
}

export function formatCountdown(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export function CourseExamRunner({ exam, questions, onExit, onGoToReview, onCompleted }: CourseExamRunnerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<'doing' | 'result'>('doing');
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => durationToSeconds(exam.duration));

  const total = questions.length;
  const activeQuestion = questions[activeIndex] ?? questions[0];
  const answeredCount = Object.keys(answers).length;

  const correctCount = useMemo(
    () => questions.reduce((count, question) => count + (answers[question.id] === question.answer ? 1 : 0), 0),
    [answers, questions]
  );
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const skillBreakdown = useMemo(() => {
    const map = new Map<string, { skill: string; correct: number; total: number }>();
    questions.forEach((question) => {
      const entry = map.get(question.skill) ?? { skill: question.skill, correct: 0, total: 0 };
      entry.total += 1;
      if (answers[question.id] === question.answer) entry.correct += 1;
      map.set(question.skill, entry);
    });
    return Array.from(map.values());
  }, [answers, questions]);

  const wrongQuestions = useMemo(
    () => questions.filter((question) => answers[question.id] && answers[question.id] !== question.answer),
    [answers, questions]
  );

  const handleSubmit = () => {
    onCompleted(scorePercent);
    setPhase('result');
  };

  useEffect(() => {
    if (phase !== 'doing') return;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === 'doing' && timeLeft === 0) handleSubmit();
  }, [phase, timeLeft]); // Score is read from the latest render when time expires.

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: option }));
  };

  const handleRetry = () => {
    setAnswers({});
    setActiveIndex(0);
    setIsQuestionListOpen(false);
    setTimeLeft(durationToSeconds(exam.duration));
    setPhase('doing');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] overflow-y-auto bg-[#fbf6ef]"
      role="dialog"
      aria-modal="true"
      aria-label={`Thi thử: ${exam.title}`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-col">
        {phase === 'doing' && (
          <header className="sticky top-0 z-20 border-b border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExit}
                className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5f6b7c] transition-colors hover:bg-[#fffaf3] hover:text-[#172033]', focusRing)}
                aria-label="Đóng bài thi và quay lại khóa học"
              >
                <X size={20} aria-hidden="true" focusable="false" />
              </button>
              <button
                type="button"
                onClick={() => setIsQuestionListOpen((open) => !open)}
                aria-expanded={isQuestionListOpen}
                aria-controls="course-exam-question-list"
                className={cn('flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-2 text-sm font-bold text-[#172033] transition-colors hover:bg-[#fffaf3]', focusRing)}
              >
                Câu {activeIndex + 1}/{total}
                <ChevronDown className={cn('transition-transform', isQuestionListOpen && 'rotate-180')} size={16} aria-hidden="true" focusable="false" />
              </button>
              <span
                className={cn(
                  'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold tabular-nums',
                  timeLeft <= 5 * 60 ? 'bg-red-50 text-red-700' : 'bg-[#fffaf3] text-[#5f6b7c]'
                )}
                aria-label={`Còn ${formatCountdown(timeLeft)}`}
              >
                <Clock3 size={15} aria-hidden="true" focusable="false" />
                {formatCountdown(timeLeft)}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                className={cn('flex h-10 shrink-0 items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 text-xs font-bold text-orange-800 transition-colors hover:border-orange-700 hover:bg-orange-700 hover:text-white', focusRing)}
              >
                Nộp <Send size={14} aria-hidden="true" focusable="false" />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isQuestionListOpen && (
                <motion.div
                  id="course-exam-question-list"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 grid grid-cols-5 gap-2 border-t border-[#e8dccb] pt-3 sm:grid-cols-8">
                    {questions.map((question, index) => {
                      const isActive = index === activeIndex;
                      const isAnswered = Boolean(answers[question.id]);
                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => {
                            setActiveIndex(index);
                            setIsQuestionListOpen(false);
                          }}
                          aria-label={`Câu ${index + 1}${isAnswered ? ' (đã làm)' : ''}`}
                          className={cn(
                            'flex h-11 items-center justify-center rounded-xl border text-sm font-bold transition-colors',
                            isActive ? 'border-orange-700 bg-orange-700 text-white' : isAnswered ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#95a0af] hover:border-orange-300',
                            focusRing
                          )}
                        >
                          {isAnswered && !isActive ? <Check size={15} aria-hidden="true" focusable="false" /> : index + 1}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        )}

        <AnimatePresence mode="wait">
          {phase === 'doing' ? (
            <motion.div key="doing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }} className="flex flex-1 flex-col px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-7 sm:px-7">
              <main className="mx-auto w-full max-w-[680px]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{activeQuestion.skill}</p>
                <h1 className="mt-3 font-[var(--font-heading)] text-[clamp(1.5rem,5vw,2rem)] font-bold leading-[1.25] tracking-[-0.03em] text-[#172033]">{activeQuestion.prompt}</h1>

                <div className="mt-8 grid gap-3">
                  {activeQuestion.options.map((option, index) => {
                    const isSelected = answers[activeQuestion.id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(option)}
                        aria-pressed={isSelected}
                        className={cn(
                          'flex min-h-15 items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors',
                          isSelected ? 'border-orange-700 bg-orange-50 text-orange-800 shadow-[0_0_0_1px_#c2410c]' : 'border-[#e8dccb] text-[#172033] hover:border-orange-300 hover:bg-[#fffaf3]',
                          focusRing
                        )}
                      >
                        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold', isSelected ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c]')}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-base font-semibold">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </main>

              <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                    disabled={activeIndex === 0}
                    className={cn('flex h-12 min-w-29 items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-semibold text-[#5f6b7c] transition-colors hover:text-[#172033] disabled:opacity-45', focusRing)}
                  >
                    <ChevronLeft size={17} aria-hidden="true" focusable="false" /> Câu trước
                  </button>
                  {activeIndex === total - 1 ? (
                    <button type="button" onClick={handleSubmit} className={cn('flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800', focusRing)}>
                      Xem lại & nộp bài <Send size={16} aria-hidden="true" focusable="false" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveIndex((current) => Math.min(total - 1, current + 1))}
                      className={cn('flex h-12 min-w-29 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800', focusRing)}
                    >
                      Câu tiếp <ArrowRight size={17} aria-hidden="true" focusable="false" />
                    </button>
                  )}
                </div>
              </footer>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }} className="mt-4 space-y-4">
              <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-700 text-white">
                  <Trophy size={30} aria-hidden="true" focusable="false" />
                </div>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">Kết quả</p>
                <p className="mt-1 font-[var(--font-heading)] text-5xl font-bold text-orange-700">{scorePercent}%</p>
                <p className="mt-2 text-sm text-[#5f6b7c]">Đúng {correctCount}/{total} câu</p>
              </div>

              <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Theo kỹ năng</p>
                <ul className="mt-3 space-y-3">
                  {skillBreakdown.map((entry) => {
                    const percent = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
                    return (
                      <li key={entry.skill}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-[#172033]">{entry.skill}</span>
                          <span className="text-[#5f6b7c]">{entry.correct}/{entry.total}</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
                          <div className="h-full rounded-full bg-orange-700" style={{ width: `${percent}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {wrongQuestions.length > 0 && (
                <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                    <Sparkles size={13} aria-hidden="true" focusable="false" /> Câu cần xem lại
                  </p>
                  <ul className="mt-3 space-y-3">
                    {wrongQuestions.map((question) => (
                      <li key={question.id} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                        <p className="text-sm font-semibold text-[#172033]">{question.prompt}</p>
                        <p className="mt-2 flex items-start gap-1.5 text-sm text-red-600">
                          <XCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" focusable="false" /> Anh chọn: {answers[question.id]}
                        </p>
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-emerald-700">
                          <Check size={15} className="mt-0.5 shrink-0" aria-hidden="true" focusable="false" /> Đáp án: {question.answer}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#5f6b7c]">{question.explanation}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-3">
                <button type="button" onClick={handleRetry} className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-semibold text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}>
                  <RotateCcw size={15} aria-hidden="true" focusable="false" /> Làm lại
                </button>
                <button type="button" onClick={onGoToReview} className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-semibold text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}>
                  Ôn phần chưa chắc <ArrowRight size={15} aria-hidden="true" focusable="false" />
                </button>
                <button type="button" onClick={onExit} className={cn(primaryButtonClass, focusRing)}>
                  Xong <Check size={15} aria-hidden="true" focusable="false" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

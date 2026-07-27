import { type KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Brain, Check, Flame, Layers, RotateCcw, Sparkles, X } from 'lucide-react';
import type { CourseReviewQuestion, CourseVocabularyItem } from '@/src/features/courses/mock/courseLearningMock';
import type { ReviewMode } from '@/src/features/courses/lib/courseWorkspacePreferences';
import { buildReviewSession, summarizeReviewSession } from '@/src/features/courses/lib/reviewSession';
import { saveReviewAttempt, saveVocabularyReview } from '@/src/features/courses/repositories/learningProgressRepository';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { cn } from '@/src/lib/utils';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const reviewModes = [
  { id: 'vocabulary', label: 'Từ vựng', icon: Layers },
  { id: 'questions', label: 'Câu hỏi', icon: Brain },
] satisfies Array<{ id: ReviewMode; label: string; icon: typeof Layers }>;

/** Đúng thì tự sang câu sau; sai thì dừng lại để học viên kịp đọc đáp án đúng. */
const AUTO_ADVANCE_MS = 700;

interface CourseReviewSessionProps {
  courseId: string;
  reviewMode: ReviewMode;
  reviewQuestions: CourseReviewQuestion[];
  vocabulary: CourseVocabularyItem[];
  onFinish: () => void;
  onReviewModeChange: (mode: ReviewMode) => void;
}

export function CourseReviewSession({ courseId, reviewMode, reviewQuestions, vocabulary, onFinish, onReviewModeChange }: CourseReviewSessionProps) {
  const shouldReduceMotion = useReducedMotion();
  const rate = useReviewStore((state) => state.rate);
  const markSessionComplete = useReviewStore((state) => state.markSessionComplete);
  const recordGameComplete = useProgressStore((state) => state.recordGameComplete);
  const streak = useProgressStore((state) => state.streak);

  // Đổi vòng để dựng lại phiên mới khi bấm "Ôn tiếp".
  const [round, setRound] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const awardedRoundRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  const session = useMemo(
    () => buildReviewSession({ courseId, vocabulary, questions: reviewQuestions, mode: reviewMode }),
    // round nằm trong deps để "Ôn tiếp" dựng lại phiên từ đầu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courseId, reviewMode, reviewQuestions, round, vocabulary]
  );

  const resetSession = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
  }, []);

  // Đổi chế độ hoặc đổi khóa thì bắt đầu lại từ câu đầu.
  useEffect(() => {
    resetSession();
  }, [courseId, resetSession, reviewMode, round]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const isComplete = session.length > 0 && questionIndex >= session.length;
  const summary = useMemo(() => summarizeReviewSession(answers), [answers]);

  // Cộng XP và streak đúng một lần cho mỗi phiên.
  useEffect(() => {
    if (!isComplete || awardedRoundRef.current === round) return;
    awardedRoundRef.current = round;
    if (summary.xp > 0) recordGameComplete(summary.xp);
    markSessionComplete();
  }, [isComplete, markSessionComplete, recordGameComplete, round, summary.xp]);

  const activeQuestion = session[questionIndex];

  const goToNextQuestion = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setSelectedAnswer(null);
    setQuestionIndex((current) => current + 1);
  }, []);

  const handleAnswer = (option: string) => {
    if (selectedAnswer || !activeQuestion) return;

    const isCorrect = option === activeQuestion.answer;
    setSelectedAnswer(option);
    setAnswers((current) => [...current, isCorrect]);
    // Nối vào SRS dùng chung: đúng tính 'good', sai tính 'again' để từ đó quay lại sớm.
    rate(activeQuestion.cardId, isCorrect ? 'good' : 'again');

    // Ghi tiến độ lên Supabase — tự no-op khi chưa cấu hình hoặc chưa đăng nhập.
    const saveProgress = reviewMode === 'vocabulary' ? saveVocabularyReview : saveReviewAttempt;
    void saveProgress(activeQuestion.sourceId, isCorrect).catch((error: unknown) => {
      if (import.meta.env.DEV) console.error('[course-review] Không lưu được tiến độ', error);
    });

    if (isCorrect) {
      advanceTimerRef.current = window.setTimeout(goToNextQuestion, AUTO_ADVANCE_MS);
    }
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (selectedAnswer || !activeQuestion) return;

    let nextIndex = optionIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (optionIndex + 1) % activeQuestion.options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (optionIndex - 1 + activeQuestion.options.length) % activeQuestion.options.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = activeQuestion.options.length - 1;
    else return;

    event.preventDefault();
    window.requestAnimationFrame(() => {
      document.getElementById(`course-review-option-${questionIndex}-${nextIndex}`)?.focus();
    });
  };

  if (session.length === 0) {
    return (
      <div className="workspace-panel rounded-[2rem] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
          <Sparkles size={22} aria-hidden="true" focusable="false" />
        </div>
        <h3 className="mt-4 font-[var(--font-heading)] text-xl font-black tracking-[-0.03em] text-[#172033]">Chưa có câu hỏi để ôn</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-[#5f6b7c]">Khóa này chưa đủ dữ liệu cho chế độ đang chọn. Thử chế độ còn lại nhé.</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="workspace-panel rounded-[2.25rem] p-5 text-center md:p-7"
      >
        {/* Dưới 50% thì không dùng dấu tích — đó là lời khen sai chỗ. */}
        <div className={cn('mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] text-white', summary.accuracy >= 80 ? 'bg-emerald-600' : summary.accuracy >= 50 ? 'bg-orange-700' : 'bg-[#6f4aa8]')}>
          {summary.accuracy >= 50
            ? <Check size={30} aria-hidden="true" focusable="false" />
            : <RotateCcw size={28} aria-hidden="true" focusable="false" />}
        </div>

        <h3 className="mt-4 font-[var(--font-heading)] text-2xl font-black tracking-[-0.04em] text-[#172033]">
          Đúng {summary.correct}/{summary.total}
        </h3>
        <p className="mt-1.5 text-sm font-semibold text-[#5f6b7c]">{summary.message}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-orange-50 px-3.5 py-2 text-sm font-black text-orange-700">+{summary.xp} XP</span>
          {streak > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#fff2e8] px-3.5 py-2 text-sm font-black text-orange-700">
              <Flame size={15} aria-hidden="true" focusable="false" />
              {streak} ngày
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRound((current) => current + 1)}
            className={cn('flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-700 px-5 text-xs font-black uppercase tracking-[0.1em] text-white', focusRing)}
          >
            <RotateCcw size={15} aria-hidden="true" focusable="false" />
            Ôn tiếp
          </button>
          <button
            type="button"
            onClick={onFinish}
            className={cn('flex min-h-12 items-center justify-center rounded-2xl border border-[#e6ddd1] bg-white px-5 text-xs font-black uppercase tracking-[0.1em] text-[#5f6b7c] hover:bg-orange-50', focusRing)}
          >
            Xong
          </button>
        </div>
      </motion.div>
    );
  }

  const isAnswerCorrect = selectedAnswer === activeQuestion.answer;
  const answerFeedback = selectedAnswer
    ? isAnswerCorrect
      ? 'Chính xác.'
      : `Chưa đúng. Đáp án là ${activeQuestion.answer}.`
    : '';

  return (
    <div className="workspace-panel rounded-[2.25rem] p-3.5 md:p-6">
      <p className="sr-only" role="status" aria-live="polite">{answerFeedback}</p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Chế độ ôn tập" className="flex shrink-0 gap-1 rounded-2xl border border-[#e6ddd1] bg-white p-1">
          {reviewModes.map((mode) => {
            const isActive = reviewMode === mode.id;
            return (
              <button
                key={mode.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onReviewModeChange(mode.id)}
                className={cn(
                  'flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-black transition-colors',
                  isActive ? 'bg-orange-700 text-white shadow-[0_12px_24px_-18px_rgba(201,106,27,0.5)]' : 'text-[#5f6b7c] hover:bg-orange-50',
                  focusRing
                )}
              >
                <mode.icon size={15} aria-hidden="true" focusable="false" />
                {mode.label}
              </button>
            );
          })}
        </div>
        <span className="px-1 text-xs font-black text-[#8b93a1]">{questionIndex + 1}/{session.length}</span>
      </div>

      {/* Thanh đoạn cho thấy phiên có điểm dừng — học viên biết còn mấy câu nữa là xong. */}
      <div className="mt-2.5 flex gap-1" role="progressbar" aria-valuenow={questionIndex} aria-valuemin={0} aria-valuemax={session.length} aria-label={`Câu ${questionIndex + 1} trên ${session.length}`}>
        {session.map((question, index) => (
          <span
            key={question.cardId}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              index < answers.length ? (answers[index] ? 'bg-emerald-500' : 'bg-red-400') : index === questionIndex ? 'bg-orange-600' : 'bg-[#e8ddcd]'
            )}
          />
        ))}
      </div>

      <div className="mt-3 rounded-[1.75rem] border border-orange-100 bg-orange-50/55 p-4 md:p-6">
        <p className="text-lg font-black leading-snug text-[#172033] md:text-[1.5rem]">{activeQuestion.prompt}</p>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2" role="radiogroup" aria-label={activeQuestion.prompt}>
        {activeQuestion.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === activeQuestion.answer;
          const revealCorrect = Boolean(selectedAnswer) && isCorrectOption;

          return (
            <button
              id={`course-review-option-${questionIndex}-${optionIndex}`}
              key={option}
              onClick={() => handleAnswer(option)}
              onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (!selectedAnswer && optionIndex === 0) ? 0 : -1}
              disabled={Boolean(selectedAnswer)}
              className={cn(
                'flex min-h-[3.25rem] items-center justify-between gap-2 rounded-[1.25rem] border px-4 py-3 text-left text-sm font-black transition-all disabled:cursor-default',
                revealCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                isSelected && !isCorrectOption && 'border-red-300 bg-red-50 text-red-700',
                !revealCorrect && !isSelected && 'border-[#e6ddd1] bg-[#fffdf8] text-[#172033] hover:border-orange-200 hover:bg-orange-50/40',
                focusRing
              )}
            >
              <span>{option}</span>
              {revealCorrect && <Check size={17} className="shrink-0" aria-hidden="true" focusable="false" />}
              {isSelected && !isCorrectOption && <X size={17} className="shrink-0" aria-hidden="true" focusable="false" />}
            </button>
          );
        })}
      </div>

      {/* Sai thì giữ màn hình lại: hiện gợi ý và bắt bấm tiếp, để học viên thực sự đọc. */}
      {selectedAnswer && !isAnswerCorrect && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="mt-3 flex flex-col gap-3 rounded-[1.25rem] border border-orange-100 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="min-w-0 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{activeQuestion.hint}</p>
          <button
            type="button"
            onClick={goToNextQuestion}
            autoFocus
            className={cn('flex min-h-12 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-orange-700 px-5 text-xs font-black uppercase tracking-[0.1em] text-white', focusRing)}
          >
            Tiếp tục
            <ArrowRight size={15} aria-hidden="true" focusable="false" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

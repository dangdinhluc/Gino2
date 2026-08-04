import { type KeyboardEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, Layers, RotateCcw, Target } from 'lucide-react';
import {
  focusRing,
  panelClass,
  panelSubtitleClass,
  panelTitleClass,
  primaryButtonClass,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { type CourseReviewQuestion } from '@/src/features/courses/mock/courseLearningMock';
import { cn } from '@/src/lib/utils';

export type ReviewMode = 'vocabulary' | 'questions';

// Hai chế độ ôn, học viên chọn trước rồi mới vào phiên làm bài.
const modeCards = [
  {
    id: 'vocabulary' as ReviewMode,
    label: 'Ôn từ vựng',
    description: 'Nhìn từ tiếng Nhật rồi chọn nghĩa đúng. Phù hợp khi vừa học xong danh sách từ.',
    icon: Layers,
  },
  {
    id: 'questions' as ReviewMode,
    label: 'Ôn câu hỏi',
    description: 'Câu hỏi tình huống, nghe hiểu và phỏng vấn theo nội dung khóa học.',
    icon: Target,
  },
];

const modeLabels: Record<ReviewMode, string> = {
  vocabulary: 'Ôn từ vựng',
  questions: 'Ôn câu hỏi',
};

interface CourseReviewPanelProps {
  activeQuestion: CourseReviewQuestion;
  isSummaryOpen: boolean;
  questionIndex: number;
  questionsCount: number;
  questionsTotal: number;
  reviewMode: ReviewMode | null;
  selectedAnswer: string | null;
  stats: { answered: number; correct: number };
  vocabularyCount: number;
  onAnswer: (answer: string) => void;
  onExitSession: () => void;
  onFinishSession: () => void;
  onRestartSession: () => void;
  onSelectMode: (mode: ReviewMode) => void;
}

export function CourseReviewPanel({
  activeQuestion,
  isSummaryOpen,
  questionIndex,
  questionsCount,
  questionsTotal,
  reviewMode,
  selectedAnswer,
  stats,
  vocabularyCount,
  onAnswer,
  onExitSession,
  onFinishSession,
  onRestartSession,
  onSelectMode,
}: CourseReviewPanelProps) {
  const isAnswered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === activeQuestion.answer;
  const answerFeedback = selectedAnswer
    ? `Đã chọn ${selectedAnswer}. ${isCorrect ? 'Đúng' : `Đáp án đúng là ${activeQuestion.answer}`}.`
    : '';

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (isAnswered) {
      return;
    }

    let nextIndex = optionIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (optionIndex + 1) % activeQuestion.options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (optionIndex - 1 + activeQuestion.options.length) % activeQuestion.options.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = activeQuestion.options.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    window.requestAnimationFrame(() => {
      document.getElementById(`course-review-option-${questionIndex}-${nextIndex}`)?.focus();
    });
  };

  // Bước 1: chưa chọn chế độ thì chỉ hiện hai lựa chọn.
  if (reviewMode === null) {
    return (
      <section className={panelClass}>
        <h2 className={panelTitleClass}>Ôn tập</h2>
        <p className={cn('mt-1', panelSubtitleClass)}>Chọn chế độ để vào phiên ôn. Khi vào phiên, màn hình chỉ còn câu hỏi.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {modeCards.map((card) => {
            const count = card.id === 'vocabulary' ? vocabularyCount : questionsTotal;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectMode(card.id)}
                className={cn('group flex h-full flex-col rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4 text-left transition-colors hover:border-orange-300', focusRing)}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                    <card.icon size={20} aria-hidden="true" focusable="false" />
                  </span>
                  <span className="rounded-full border border-[#e8dccb] bg-[#fffaf3] px-2.5 py-1 text-xs font-semibold text-[#5f6b7c]">{count} câu</span>
                </span>
                <span className="mt-3 block font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">{card.label}</span>
                <span className="mt-1 block flex-1 text-sm leading-relaxed text-[#5f6b7c]">{card.description}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-orange-700">
                  Bắt đầu <ArrowRight size={15} aria-hidden="true" focusable="false" />
                </span>
              </button>
            );
          })}
        </div>

        {stats.answered > 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-[#e8dccb] px-4 py-3 text-center text-xs text-[#7b8796]">
            Phiên gần nhất: đúng {stats.correct}/{stats.answered} câu.
          </p>
        )}
      </section>
    );
  }

  // Bước 3: xem kết quả sau khi kết thúc phiên.
  if (isSummaryOpen) {
    return (
      <section className={cn(panelClass, 'text-center')}>
        <h2 className={panelTitleClass}>Kết quả phiên ôn</h2>
        <p className="mt-4 font-[var(--font-heading)] text-4xl font-bold text-orange-700">
          {stats.correct}/{stats.answered}
        </p>
        <p className={cn('mt-2', panelSubtitleClass)}>
          {stats.answered === 0 ? 'Chưa trả lời câu nào trong phiên này.' : `${modeLabels[reviewMode]}: đúng ${stats.correct} trên ${stats.answered} câu đã làm.`}
        </p>
        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={onRestartSession} className={cn(primaryButtonClass, focusRing)}>
            <RotateCcw size={15} aria-hidden="true" focusable="false" />
            Ôn lại chế độ này
          </button>
          <button
            type="button"
            onClick={onExitSession}
            className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
          >
            Chọn chế độ khác
          </button>
        </div>
      </section>
    );
  }

  // Bước 2: đang trong phiên ôn.
  const progressPercent = questionsCount > 0 ? Math.round((Math.min(questionIndex, questionsCount) / questionsCount) * 100) : 0;

  return (
    <section className={panelClass}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExitSession}
          aria-label="Thoát phiên, chọn chế độ khác"
          className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
        >
          <ChevronLeft size={18} aria-hidden="true" focusable="false" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#172033]">{modeLabels[reviewMode]}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#efe5d7]">
              <div className="h-full rounded-full bg-orange-700 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="shrink-0 text-xs text-[#95a0af]">Câu {Math.min(questionIndex + 1, questionsCount)}/{questionsCount}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#e8dccb] bg-[#fffdf8] px-2.5 py-1 text-xs font-semibold text-[#5f6b7c]">
          Đúng {stats.correct}/{stats.answered}
        </span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">{answerFeedback}</p>

      <p className="mt-6 font-[var(--font-heading)] text-xl font-bold leading-snug tracking-[-0.02em] text-[#172033]">{activeQuestion.prompt}</p>

      <div className="mt-4 grid gap-2 md:grid-cols-2" role="radiogroup" aria-label={activeQuestion.prompt}>
        {activeQuestion.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === activeQuestion.answer;
          const isFocusable = isSelected || (!isAnswered && optionIndex === 0);

          return (
            <button
              id={`course-review-option-${questionIndex}-${optionIndex}`}
              key={option}
              onClick={() => onAnswer(option)}
              onKeyDown={(event) => handleAnswerKeyDown(event, optionIndex)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isFocusable ? 0 : -1}
              disabled={isAnswered}
              className={cn(
                'min-h-13 rounded-xl border bg-white px-4 py-3 text-left text-base transition-colors disabled:cursor-default',
                isSelected && isCorrectOption && 'border-emerald-500 text-emerald-700',
                isSelected && !isCorrectOption && 'border-red-400 text-red-600',
                !isSelected && isAnswered && isCorrectOption && 'border-emerald-500 text-emerald-700',
                !isSelected && !(isAnswered && isCorrectOption) && 'border-[#e8dccb] text-[#172033] hover:border-orange-300',
                focusRing
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="mt-4">
          <p className={cn('text-base font-bold', isCorrect ? 'text-emerald-700' : 'text-red-600')}>
            {isCorrect ? 'Chính xác' : `Đáp án đúng: ${activeQuestion.answer}`}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{activeQuestion.explanation}</p>
          <button type="button" onClick={onFinishSession === undefined ? undefined : onRestartSession} className="sr-only" aria-hidden="true" tabIndex={-1} />
        </motion.div>
      )}

      {isAnswered && (
        <button type="button" onClick={onAnswer === undefined ? undefined : undefined} className="hidden" aria-hidden="true" tabIndex={-1} />
      )}

      <button
        type="button"
        onClick={onFinishSession}
        className={cn('mx-auto mt-6 block rounded-lg px-3 py-2 text-sm text-[#7b8796] underline-offset-4 hover:text-[#172033] hover:underline', focusRing)}
      >
        Kết thúc phiên
      </button>
    </section>
  );
}

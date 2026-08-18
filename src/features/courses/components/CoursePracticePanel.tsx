import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  LoaderCircle,
  Play,
  RotateCcw,
  Shuffle,
  Target,
  XCircle,
} from 'lucide-react';
import {
  submitReviewAnswer,
  submitVocabularyRating,
} from '@/src/features/courses/repositories/learningProgressRepository';
import type { CourseReviewQuestion, CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import { cn, vibrate } from '@/src/lib/utils';
import { focusRing } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { Confetti } from '@/src/shared/components/Confetti';

type PracticeMode = 'vocabulary' | 'questions' | 'mixed';
type PracticeStage = 'setup' | 'session' | 'result';

interface PracticeQuestion {
  id: string;
  kind: 'vocabulary' | 'question';
  prompt: string;
  options: string[];
  explanation: string;
  source: string;
  correctAnswer?: string;
  optionIds?: Record<string, string>;
  vocabularyId?: string;
  pronunciation?: string;
}

interface PracticeAnswer {
  selected: string;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
}

const modeLabels: Record<PracticeMode, string> = {
  vocabulary: 'Từ vựng',
  questions: 'Câu hỏi',
  mixed: 'Hỗn hợp',
};

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildVocabularyQuestions(vocabulary: CourseVocabularyItem[]): PracticeQuestion[] {
  const validVocabulary = vocabulary.filter((item) => item.meaning.trim());
  const meanings = uniqueValues(validVocabulary.map((item) => item.meaning));

  return validVocabulary.flatMap((item) => {
    const distractors = meanings.filter((meaning) => meaning !== item.meaning).slice(0, 3);
    if (distractors.length < 1) return [];
    return [{
      id: `vocabulary-${item.id}`,
      kind: 'vocabulary' as const,
      prompt: `“${item.kanji || item.word}” có nghĩa là gì?`,
      options: shuffle([item.meaning, ...distractors]),
      explanation: item.example.jp ? `Ví dụ: ${item.example.jp}` : `Từ này thuộc chủ đề ${item.module}.`,
      source: item.module,
      correctAnswer: item.meaning,
      vocabularyId: item.id,
      pronunciation: item.pronunciation,
    } satisfies PracticeQuestion];
  });
}

function buildReviewQuestions(reviewQuestions: CourseReviewQuestion[]): PracticeQuestion[] {
  return reviewQuestions.flatMap((question) => {
    if (question.options.length < 2 || !question.optionIds) return [];
    return [{
      id: `question-${question.id}`,
      kind: 'question' as const,
      prompt: question.prompt,
      options: shuffle(question.options),
      explanation: question.explanation,
      source: question.source,
      optionIds: question.optionIds,
    } satisfies PracticeQuestion];
  });
}

function getCountOptions(total: number): number[] {
  if (total <= 0) return [];
  return Array.from(new Set([5, 10, 15, 20].filter((value) => value <= total).concat(total))).sort((a, b) => a - b);
}

export function CoursePracticePanel({
  courseTitle,
  vocabulary,
  reviewQuestions,
}: {
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
  reviewQuestions: CourseReviewQuestion[];
}) {
  const vocabularyQuestions = useMemo(() => buildVocabularyQuestions(vocabulary), [vocabulary]);
  const questionQuestions = useMemo(() => buildReviewQuestions(reviewQuestions), [reviewQuestions]);
  const [mode, setMode] = useState<PracticeMode>('mixed');
  const [questionCount, setQuestionCount] = useState(5);
  const [stage, setStage] = useState<PracticeStage>('setup');
  const [sessionQuestions, setSessionQuestions] = useState<PracticeQuestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, PracticeAnswer>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);

  const availableQuestions = mode === 'vocabulary'
    ? vocabularyQuestions
    : mode === 'questions'
      ? questionQuestions
      : [...vocabularyQuestions, ...questionQuestions];
  const countOptions = useMemo(() => getCountOptions(availableQuestions.length), [availableQuestions.length]);

  useEffect(() => {
    setQuestionCount((current) => countOptions.includes(current) ? current : countOptions[0] ?? 0);
  }, [countOptions]);

  const activeQuestion = sessionQuestions[activeIndex];
  const activeAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;

  const startPractice = () => {
    if (!questionCount || availableQuestions.length === 0) return;
    setSessionQuestions(shuffle(availableQuestions).slice(0, questionCount));
    setActiveIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setCombo(0);
    setError(null);
    setStage('session');
  };

  const exitPractice = () => {
    setStage('setup');
    setSelectedAnswer(null);
    setCombo(0);
    setError(null);
  };

  const checkAnswer = async () => {
    if (!activeQuestion || !selectedAnswer || activeAnswer || isChecking) return;
    setIsChecking(true);
    setError(null);

    let isCorrect = false;
    try {
      if (activeQuestion.kind === 'vocabulary') {
        isCorrect = selectedAnswer === activeQuestion.correctAnswer;
        vibrate(isCorrect ? [20, 40, 60] : [60, 30, 60]);
        await submitVocabularyRating(activeQuestion.vocabularyId ?? '', isCorrect ? 'good' : 'again');
        setAnswers((current) => ({
          ...current,
          [activeQuestion.id]: {
            selected: selectedAnswer,
            isCorrect,
            explanation: activeQuestion.explanation,
            correctAnswer: activeQuestion.correctAnswer,
          },
        }));
      } else {
        const optionId = activeQuestion.optionIds?.[selectedAnswer];
        if (!optionId) throw new Error('Không xác định được lựa chọn của câu hỏi.');
        const result = await submitReviewAnswer(activeQuestion.id.replace(/^question-/, ''), optionId);
        isCorrect = result.isCorrect;
        vibrate(isCorrect ? [20, 40, 60] : [60, 30, 60]);
        setAnswers((current) => ({
          ...current,
          [activeQuestion.id]: {
            selected: selectedAnswer,
            isCorrect,
            explanation: result.explanation || activeQuestion.explanation,
          },
        }));
      }
      setCombo((current) => (isCorrect ? current + 1 : 0));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể chấm câu trả lời.');
    } finally {
      setIsChecking(false);
    }
  };

  const nextQuestion = () => {
    if (!activeQuestion || !answers[activeQuestion.id]) return;
    if (activeIndex >= sessionQuestions.length - 1) {
      setStage('result');
      return;
    }
    setActiveIndex((current) => current + 1);
    setSelectedAnswer(null);
    setError(null);
  };

  if (stage === 'session' && activeQuestion) {
    return (
      <CoursePracticeSession
        courseTitle={courseTitle}
        modeLabel={modeLabels[mode]}
        question={activeQuestion}
        questionIndex={activeIndex}
        totalQuestions={sessionQuestions.length}
        selectedAnswer={selectedAnswer}
        answer={activeAnswer}
        isChecking={isChecking}
        combo={combo}
        error={error}
        onExit={exitPractice}
        onSelect={setSelectedAnswer}
        onCheck={() => void checkAnswer()}
        onNext={nextQuestion}
      />
    );
  }

  if (stage === 'result') {
    return (
      <CoursePracticeResult
        courseTitle={courseTitle}
        modeLabel={modeLabels[mode]}
        questions={sessionQuestions}
        answers={answers}
        onRetry={startPractice}
        onExit={exitPractice}
      />
    );
  }

  return (
    <CoursePracticeSetup
      courseTitle={courseTitle}
      mode={mode}
      modeLabels={modeLabels}
      vocabularyCount={vocabularyQuestions.length}
      questionCount={questionQuestions.length}
      availableCount={availableQuestions.length}
      countOptions={countOptions}
      selectedCount={questionCount}
      error={error}
      onModeChange={setMode}
      onCountChange={setQuestionCount}
      onStart={startPractice}
    />
  );
}

function CoursePracticeSetup({
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

function CoursePracticeSession({
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
  onCheck,
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
  onCheck: () => void;
  onNext: () => void;
}) {
  const progress = Math.round(((questionIndex + (answer ? 1 : 0)) / totalQuestions) * 100);

  return (
    <div className="mx-auto w-full max-w-[820px] space-y-4 pb-6">
      <header className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><button type="button" onClick={onExit} className={cn('inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-[#5f6b7c] hover:bg-orange-50 hover:text-orange-800', focusRing)}><ArrowLeft size={16} /> Chọn lại</button><span className="text-xs font-bold text-[#7b8796]">{questionIndex + 1}/{totalQuestions}</span></div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold"><span className="inline-flex items-center gap-1.5 text-orange-800"><Target size={14} /> {modeLabel}</span><span className="truncate text-[#7b8796]" title={courseTitle}>{courseTitle}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#efe5d7]" role="progressbar" aria-label="Tiến độ phiên luyện tập" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-orange-700 transition-all" style={{ width: `${progress}%` }} /></div>
        {combo >= 2 && (
          <motion.div
            key={combo}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d83a00] to-[#e65100] px-3 py-1 text-xs font-black text-white shadow-xs"
            role="status"
          >
            <Flame size={14} className="fill-white" />
            {combo >= 5 ? 'Đang vào form! 🔥' : `Combo x${combo} 🔥`}
          </motion.div>
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
        {answer && <div role="status" className={cn('mt-5 rounded-xl border px-4 py-3.5', answer.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50')}><p className={cn('flex items-center gap-2 text-sm font-bold', answer.isCorrect ? 'text-emerald-800' : 'text-orange-900')}>{answer.isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />} {answer.isCorrect ? 'Chính xác!' : 'Cần xem lại'}</p><p className="mt-1 text-sm leading-6 text-[#5f6b7c]">{answer.explanation}</p>{answer.correctAnswer && !answer.isCorrect && <p className="mt-1 text-sm font-bold text-orange-900">Đáp án đúng: {answer.correctAnswer}</p>}</div>}

        <div className="mt-7 flex justify-end"><button type="button" onClick={answer ? onNext : onCheck} disabled={isChecking || (!answer && !selectedAnswer)} className={cn('inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50', focusRing)}>{isChecking ? <><LoaderCircle size={17} className="animate-spin" /> Đang chấm…</> : answer ? <>{questionIndex === totalQuestions - 1 ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight size={17} /></> : <>Kiểm tra đáp án <Check size={17} /></>}</button></div>
      </main>
    </div>
  );
}

function CoursePracticeResult({
  courseTitle,
  modeLabel,
  questions,
  answers,
  onRetry,
  onExit,
}: {
  courseTitle: string;
  modeLabel: string;
  questions: PracticeQuestion[];
  answers: Record<string, PracticeAnswer>;
  onRetry: () => void;
  onExit: () => void;
}) {
  const correctCount = questions.filter((question) => answers[question.id]?.isCorrect).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
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
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={onRetry} className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white hover:bg-orange-800', focusRing)}><RotateCcw size={16} /> Làm lại phiên này</button><button type="button" onClick={onExit} className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 text-sm font-bold text-orange-800 hover:bg-orange-50', focusRing)}><ArrowLeft size={16} /> Chọn nội dung khác</button></div>
        </div>
      </section>
    </div>
  );
}

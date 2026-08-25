import { useEffect, useMemo, useRef, useState } from 'react';
import { vibrate } from '@/src/lib/utils';
import {
  submitReviewAnswer,
  submitVocabularyRating,
} from '@/src/features/courses/repositories/learningProgressRepository';
import type { CourseReviewQuestion, CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import { invalidateCourseLearningCache } from '@/src/features/courses/lib/courseLearningCache';
import { CoursePracticeSetup } from './practice/CoursePracticeSetup';
import { CoursePracticeSession } from './practice/CoursePracticeSession';
import { CoursePracticeResult } from './practice/CoursePracticeResult';
import { buildReviewQuestions, buildVocabularyQuestions, getCountOptions, shuffle } from './practice/practiceSetupHelpers';
import type { PracticeAnswer, PracticeMode, PracticeQuestion, PracticeStage } from './practice/types';

const modeLabels: Record<PracticeMode, string> = {
  vocabulary: 'Từ vựng',
  questions: 'Câu hỏi',
  mixed: 'Hỗn hợp',
};

export function CoursePracticePanel({
  courseId,
  courseTitle,
  vocabulary,
  reviewQuestions,
}: {
  courseId: string;
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
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
  }, []);

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

  const handleSelectOption = async (option: string) => {
    if (!activeQuestion || answers[activeQuestion.id] || isChecking) return;
    setSelectedAnswer(option);
    setIsChecking(true);
    setError(null);

    let isCorrect = false;
    try {
      if (activeQuestion.kind === 'vocabulary') {
        isCorrect = option === activeQuestion.correctAnswer;
        vibrate(isCorrect ? [20, 40, 60] : [60, 30, 60]);
        await submitVocabularyRating(activeQuestion.vocabularyId ?? '', isCorrect ? 'good' : 'again');
        invalidateCourseLearningCache(courseId, 'vocabulary');
        setAnswers((current) => ({
          ...current,
          [activeQuestion.id]: {
            selected: option,
            isCorrect,
            explanation: activeQuestion.explanation,
            correctAnswer: activeQuestion.correctAnswer,
          },
        }));
      } else {
        const optionId = activeQuestion.optionIds?.[option];
        if (!optionId) throw new Error('Không xác định được lựa chọn của câu hỏi.');
        const result = await submitReviewAnswer(activeQuestion.id.replace(/^question-/, ''), optionId);
        invalidateCourseLearningCache(courseId, 'practice');
        isCorrect = result.isCorrect;
        vibrate(isCorrect ? [20, 40, 60] : [60, 30, 60]);
        setAnswers((current) => ({
          ...current,
          [activeQuestion.id]: {
            selected: option,
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
        onSelect={(option) => void handleSelectOption(option)}
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

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Sparkles, Trophy, Volume2, XCircle } from 'lucide-react';
import { lessonShell } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

export default function LessonPlayer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const totalExercises = lessonShell.exercises.length;
  const exercise = lessonShell.exercises[activeIndex];
  const progress = Math.round(((activeIndex + 1) / totalExercises) * 100);
  const isCorrect = selectedOption === exercise.answer;
  const isLastExercise = activeIndex === totalExercises - 1;
  const accuracy = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    if (option === exercise.answer) {
      setCorrectCount((count) => count + 1);
    }
  };

  const handleContinue = () => {
    if (isLastExercise) {
      setIsComplete(true);
      return;
    }

    setActiveIndex((currentIndex) => currentIndex + 1);
    setSelectedOption(null);
  };

  const handleRestart = () => {
    setActiveIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-center justify-center pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full overflow-hidden rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-7 text-center shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-9"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-xl shadow-orange-200">
            <Trophy size={38} />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Anh đã xong bài học</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-gray-500">
            {lessonShell.lessonTitle}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#e6ddd1] bg-white/80 px-4 py-4">
              <div className="text-xs font-bold text-gray-500">Số câu đúng</div>
              <div className="mt-2 text-2xl font-black text-gray-900">
                {correctCount}/{totalExercises}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4">
              <div className="text-xs font-bold text-emerald-600">Độ chính xác</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{accuracy}%</div>
            </div>
            <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/70 px-4 py-4">
              <div className="text-xs font-bold text-orange-600">XP nhận</div>
              <div className="mt-2 text-2xl font-black text-gray-900">+{lessonShell.xpReward}</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-orange-700 transition-colors hover:bg-orange-50"
            >
              Ôn lại bài này
            </button>
            <Link
              to={`/app/courses/${id ?? '1'}`}
              className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02]"
            >
              Về khóa học
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <section className="sticky top-0 z-40 -mx-4 border-b border-[#e6ddd1] bg-[#f8f4ee]/92 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:rounded-[2rem] md:border md:bg-[#fffaf3]/92 md:p-4 md:shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/app/courses/${id ?? '1'}/learn`)}
            aria-label="Quay lại khu học tập"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-[#fffaf3] text-gray-700 transition-colors hover:bg-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-orange-700">{lessonShell.courseTitle}</p>
            <h1 className="truncate text-base font-black text-gray-900 md:text-lg">{lessonShell.lessonTitle}</h1>
          </div>
          <div className="shrink-0 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
            +{lessonShell.xpReward} XP
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#efe5d7]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold text-gray-500">
            Câu {activeIndex + 1}/{totalExercises}
          </span>
        </div>
      </section>

      <section className="space-y-5 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-7">
        <div className="rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_100%)] p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              {exercise.type === 'listen' ? <Volume2 size={24} /> : <Sparkles size={24} />}
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-bold text-orange-700">{exercise.instruction}</p>
              <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">{exercise.prompt}</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {exercise.options.map((option) => {
            const isSelected = selectedOption === option;
            const shouldShowCorrect = selectedOption !== null && option === exercise.answer;
            const shouldShowWrong = isSelected && !isCorrect;

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectOption(option)}
                disabled={selectedOption !== null}
                className={cn(
                  'rounded-[1.5rem] border px-5 py-4 text-left text-sm font-black transition-all',
                  selectedOption === null &&
                    'border-[#e6ddd1] bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50',
                  shouldShowCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                  shouldShowWrong && 'border-red-300 bg-red-50 text-red-600',
                  selectedOption !== null &&
                    !shouldShowCorrect &&
                    !shouldShowWrong &&
                    'border-[#e6ddd1] bg-[#f8f1e6] text-gray-400'
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                'rounded-[2rem] border p-5',
                isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
              )}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white',
                      isCorrect ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-gray-900">
                      {isCorrect ? 'Đúng rồi anh' : `Đáp án đúng: ${exercise.answer}`}
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">{exercise.explanation}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  autoFocus
                  className="shrink-0 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02]"
                >
                  {isLastExercise ? 'Hoàn thành' : 'Tiếp tục'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

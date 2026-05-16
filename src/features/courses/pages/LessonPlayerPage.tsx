import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Heart, Lightbulb, Sparkles, Trophy, Volume2, XCircle } from 'lucide-react';
import { lessonShell } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

export default function LessonPlayer() {
  const navigate = useNavigate();
  const { id, lessonId } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const exercise = lessonShell.exercises[activeIndex];
  const progress = Math.round(((activeIndex + 1) / lessonShell.exercises.length) * 100);
  const isCorrect = selectedOption === exercise.answer;

  const lessonCode = useMemo(() => lessonId ?? 'lesson-1', [lessonId]);

  const handleContinue = () => {
    if (activeIndex === lessonShell.exercises.length - 1) {
      setIsComplete(true);
      return;
    }

    setActiveIndex((currentIndex) => currentIndex + 1);
    setSelectedOption(null);
  };

  if (isComplete) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center justify-center pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full overflow-hidden rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-7 text-center shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-10"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-xl shadow-orange-200">
            <Trophy size={44} />
          </div>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">Lesson Complete</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">Anh đã xong bài học</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-gray-500">
            {lessonShell.lessonTitle} đã được hoàn thành ở chế độ mock. Sau này màn này sẽ nối tiến độ thật và lưu XP vào hồ sơ học.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">XP nhận</div>
              <div className="mt-2 text-2xl font-black text-orange-600">+{lessonShell.xpReward}</div>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Độ chính xác</div>
              <div className="mt-2 text-2xl font-black text-gray-900">Tốt</div>
            </div>
            <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Từ mới</div>
              <div className="mt-2 text-2xl font-black text-gray-900">4</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => {
                setActiveIndex(0);
                setSelectedOption(null);
                setIsComplete(false);
              }}
              className="rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50"
            >
              Ôn lại bài này
            </button>
            <Link to={`/app/courses/${id ?? '1'}`} className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Về khóa học
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <section className="sticky top-0 z-40 -mx-4 border-b border-[#e6ddd1] bg-[#f8f4ee]/90 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:rounded-[2rem] md:border md:bg-[#fffaf3]/90 md:p-4 md:shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => navigate(`/app/courses/${id ?? '1'}/learn`)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-[#fffaf3] text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">{lessonShell.courseTitle}</p>
            <h1 className="truncate text-base font-black text-gray-900 md:text-xl">{lessonShell.lessonTitle}</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-red-500 sm:flex">
            {Array.from({ length: lessonShell.hearts }).map((_, index) => (
              <Heart key={index} size={15} className="fill-red-500" />
            ))}
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-black text-orange-600">+{lessonShell.xpReward} XP</div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" animate={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
        <div className="space-y-5 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
              Câu {activeIndex + 1}/{lessonShell.exercises.length} · {exercise.type}
            </span>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">{lessonCode}</span>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_100%)] p-5 md:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                {exercise.type === 'listen' ? <Volume2 size={24} /> : <Sparkles size={24} />}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-orange-600">{exercise.instruction}</p>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">{exercise.prompt}</h2>
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
                  onClick={() => setSelectedOption(option)}
                  disabled={selectedOption !== null}
                  className={cn(
                    'rounded-[1.5rem] border px-5 py-4 text-left text-sm font-black transition-all',
                    selectedOption === null && 'border-[#e6ddd1] bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50',
                    shouldShowCorrect && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    shouldShowWrong && 'border-red-200 bg-red-50 text-red-600',
                    selectedOption !== null && !shouldShowCorrect && !shouldShowWrong && 'border-[#e6ddd1] bg-[#f8f1e6] text-gray-400'
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
                className={cn('rounded-[2rem] border p-5', isCorrect ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50')}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-white', isCorrect ? 'text-emerald-500' : 'text-red-500')}>
                      {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900">{isCorrect ? 'Đúng rồi anh' : 'Chưa đúng, nhưng sửa được ngay'}</h3>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">{exercise.explanation}</p>
                    </div>
                  </div>
                  <button onClick={handleContinue} className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
                    {activeIndex === lessonShell.exercises.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <Lightbulb size={14} /> Gợi ý học
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">Ưu tiên câu ngắn, nhìn feedback sau mỗi lần chọn để nhớ mẫu câu tự nhiên hơn.</p>
          </div>
          <div className="rounded-[2rem] border border-blue-100 bg-blue-50/60 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Phiên mock</div>
            <div className="mt-2 text-2xl font-black text-gray-900">{progress}%</div>
            <p className="mt-1 text-xs font-medium text-blue-600">Sẽ nối tiến độ thật ở phase sau.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

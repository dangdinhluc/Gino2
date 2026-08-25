import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronLeft, Clock3, FileText, Lock, Send } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchAssessmentPaper, fetchAssessmentUnlockState, submitAssessment, type AssessmentPaper } from '@/src/features/exams/repositories/assessmentRepository';

const deadlineKey = (assessmentId: string) => `gino2:assessment-deadline:${assessmentId}`;

function formatRemainingTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function ExamRunner() {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams();
  const [paper, setPaper] = useState<AssessmentPaper | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);
  const [lockState, setLockState] = useState<{ locked: boolean; label?: string } | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setPaper(null);
    setLoadError(null);
    setActiveIndex(0);
    setSelectedAnswers({});
    setLockState(null);
    setRemainingSeconds(null);
    submittingRef.current = false;

    if (!assessmentId) {
      setLoadError('Thiếu mã đề thi. Vui lòng chọn đề từ trung tâm luyện thi.');
      return () => { cancelled = true; };
    }

    fetchAssessmentUnlockState(assessmentId)
      .then((unlock) => {
        if (cancelled) return;
        if (unlock.locked) {
          setLockState({ locked: true, label: unlock.unlockLabel });
          return;
        }
        return fetchAssessmentPaper(assessmentId).then((nextPaper) => {
          if (cancelled) return;
          if (!nextPaper || nextPaper.questions.length === 0) {
            setLoadError('Không tìm thấy đề thi khả dụng hoặc đề chưa có câu hỏi.');
            return;
          }
          setPaper(nextPaper);
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được đề thi.');
      });

    return () => { cancelled = true; };
  }, [assessmentId]);

  useEffect(() => {
    if (!paper || !assessmentId || !paper.config.durationMinutes) {
      setRemainingSeconds(null);
      return;
    }

    const key = deadlineKey(assessmentId);
    const durationMs = paper.config.durationMinutes * 60_000;
    const savedDeadline = Number(window.localStorage.getItem(key));
    const deadline = Number.isFinite(savedDeadline) && savedDeadline > 0
      ? savedDeadline
      : Date.now() + durationMs;

    if (!Number.isFinite(savedDeadline) || savedDeadline <= 0) {
      window.localStorage.setItem(key, String(deadline));
    }

    const tick = () => setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [assessmentId, paper]);

  const submitCurrentAnswers = async (forced = false) => {
    if (submittingRef.current || !assessmentId || !paper) return;

    const unanswered = paper.questions.length - Object.keys(selectedAnswers).length;
    if (!forced && unanswered > 0) {
      const shouldSubmit = window.confirm(
        `Bạn còn ${unanswered} câu chưa trả lời. Bạn vẫn muốn nộp bài ngay bây giờ?`,
      );
      if (!shouldSubmit) return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await submitAssessment(assessmentId, selectedAnswers);
      window.localStorage.removeItem(deadlineKey(assessmentId));
      navigate(`/app/exams/${assessmentId}/result`, { state: { result } });
    } catch (error: unknown) {
      submittingRef.current = false;
      setLoadError(error instanceof Error ? error.message : 'Không thể nộp bài.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (remainingSeconds !== 0 || !paper || submittingRef.current) return;
    void submitCurrentAnswers(true);
    // Auto-submit is intentionally triggered only when the countdown reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  const handleExit = () => {
    if (isSubmitting) return;
    if (!window.confirm('Bạn có chắc muốn thoát bài thi? Tiến độ chưa nộp sẽ không được chấm.')) return;
    navigate('/app/dashboard');
  };

  if (loadError) {
    return <PageState tone="error" message={loadError} />;
  }
  if (lockState?.locked) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-xl items-center justify-center px-5">
        <div className="w-full space-y-4 rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-6 text-center shadow-[0_18px_40px_-18px_rgba(111,54,33,0.4)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Lock size={30} />
          </div>
          <div>
            <p className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Đề thi chưa mở khóa</p>
            <p className="mt-2 text-sm font-semibold text-[#5f6b7c]">{lockState.label ?? 'Hãy hoàn thành đề trước để mở đề này.'}</p>
          </div>
          <Link to="/app/dashboard" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-700 px-6 text-sm font-bold text-white transition-colors hover:bg-orange-800">
            <ArrowLeft size={16} /> Về Hôm nay
          </Link>
        </div>
      </div>
    );
  }
  if (!paper) {
    return <PageState message="Đang tải đề thi…" />;
  }

  const activeQuestion = paper.questions[activeIndex];
  const selectedAnswer = selectedAnswers[activeQuestion.id];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = Math.round((answeredCount / paper.questions.length) * 100);
  const questionContext = [activeQuestion.metadata.domain, activeQuestion.metadata.section, activeQuestion.metadata.kind]
    .filter(Boolean)
    .join(' · ');

  const handleAnswer = (option: string) => {
    setSelectedAnswers((currentAnswers) => ({ ...currentAnswers, [activeQuestion.id]: option }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#fbf6ef]">
      <header className="sticky top-0 z-20 border-b border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[820px] items-center gap-2">
          <button type="button" onClick={handleExit} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5f6b7c] transition-colors hover:bg-[#fffaf3] hover:text-[#172033]" aria-label="Thoát bài thi">
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setIsQuestionListOpen((open) => !open)}
            aria-expanded={isQuestionListOpen}
            aria-controls="exam-question-list"
            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-2 text-sm font-bold text-[#172033] transition-colors hover:bg-[#fffaf3]"
          >
            Câu {activeIndex + 1}/{paper.questions.length}
            <ChevronDown className={cn('transition-transform', isQuestionListOpen && 'rotate-180')} size={16} />
          </button>
          {remainingSeconds !== null && (
            <span className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-black tabular-nums',
              remainingSeconds <= 300 ? 'bg-red-50 text-red-700' : 'bg-[#fffaf3] text-[#5f6b7c]',
            )} aria-label={`Thời gian còn lại ${formatRemainingTime(remainingSeconds)}`}>
              <Clock3 size={15} /> {formatRemainingTime(remainingSeconds)}
            </span>
          )}
          <span className="hidden h-10 max-w-[9rem] shrink-0 items-center gap-1.5 truncate rounded-xl bg-[#fffaf3] px-2.5 text-xs font-bold text-[#5f6b7c] sm:inline-flex" title={paper.title}>
            <FileText size={15} /> <span className="truncate">{paper.type}</span>
          </span>
          <button type="button" onClick={() => void submitCurrentAnswers()} disabled={isSubmitting} className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 text-xs font-bold text-orange-800 transition-colors hover:border-orange-700 hover:bg-orange-700 hover:text-white disabled:opacity-50">
            {isSubmitting ? 'Đang chấm…' : 'Nộp'} <Send size={14} />
          </button>
        </div>

        {isQuestionListOpen && (
          <div id="exam-question-list" className="mx-auto grid w-full max-w-[820px] grid-cols-5 gap-2 border-t border-[#e8dccb] pt-3 sm:grid-cols-8">
            {paper.questions.map((question, index) => {
              const isActive = activeIndex === index;
              const isAnswered = Boolean(selectedAnswers[question.id]);
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => { setActiveIndex(index); setIsQuestionListOpen(false); }}
                  aria-label={`Câu ${index + 1}${isAnswered ? ' (đã làm)' : ''}`}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors',
                    isActive ? 'border-orange-700 bg-orange-700 text-white' : isAnswered ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#95a0af] hover:border-orange-300',
                  )}
                >
                  {isAnswered && !isActive ? <CheckCircle2 size={15} /> : index + 1}
                </button>
              );
            })}
          </div>
        )}

        <div className="mx-auto mt-2 h-1.5 w-full max-w-[820px] overflow-hidden rounded-full bg-[#efe5d7]">
          <div className="h-full rounded-full bg-orange-700 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[680px] px-5 pb-28 pt-7 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{questionContext || paper.type}</p>
          <span className="text-xs font-bold text-[#95a0af]">{answeredCount}/{paper.questions.length} đã làm</span>
        </div>
        <h1 className="mt-3 font-[var(--font-heading)] text-[clamp(1.5rem,5vw,2rem)] font-bold leading-[1.25] tracking-[-0.03em] text-[#172033]">{activeQuestion.prompt}</h1>

        <div className="mt-8 grid gap-3">
          {activeQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={`${activeQuestion.id}-${index}`}
                type="button"
                onClick={() => handleAnswer(option)}
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-15 items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors',
                  isSelected ? 'border-orange-700 bg-orange-50 text-orange-800 shadow-[0_0_0_1px_#c2410c]' : 'border-[#e8dccb] text-[#172033] hover:border-orange-300 hover:bg-[#fffaf3]',
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
          <button type="button" onClick={() => setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))} disabled={activeIndex === 0} className="flex h-12 min-w-29 items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-semibold text-[#5f6b7c] transition-colors hover:text-[#172033] disabled:opacity-45">
            <ChevronLeft size={17} /> Câu trước
          </button>
          {activeIndex === paper.questions.length - 1 ? (
            <button type="button" onClick={() => void submitCurrentAnswers()} disabled={isSubmitting} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800 disabled:opacity-50">
              Nộp bài <Send size={16} />
            </button>
          ) : (
            <button type="button" onClick={() => setActiveIndex((currentIndex) => Math.min(paper.questions.length - 1, currentIndex + 1))} className="flex h-12 min-w-29 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800">
              Câu tiếp <ArrowRight size={17} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function PageState({ message, tone }: { message: string; tone?: 'error' }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-5"><div className={cn('w-full rounded-2xl border p-5 text-sm font-semibold', tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c]')}>{message}</div></div>;
}

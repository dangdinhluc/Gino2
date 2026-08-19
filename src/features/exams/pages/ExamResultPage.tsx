import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, CircleAlert, RotateCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  fetchAssessmentResultDetail,
  fetchLatestAssessmentResult,
  type AssessmentResult,
  type AssessmentResultDetail,
} from '@/src/features/exams/repositories/assessmentRepository';

export default function ExamResult() {
  const { id: assessmentId } = useParams();
  const location = useLocation();
  const navigationResult = (location.state as { result?: AssessmentResult } | null)?.result ?? null;
  const [result, setResult] = useState<AssessmentResult | null>(navigationResult);
  const [details, setDetails] = useState<AssessmentResultDetail[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!navigationResult);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    if (!assessmentId) {
      setLoadError('Thiếu mã đề thi.');
      setIsLoading(false);
      return () => { cancelled = true; };
    }
    if (navigationResult?.assessmentId === assessmentId) {
      setResult(navigationResult);
      setIsLoading(false);
      return () => { cancelled = true; };
    }

    setIsLoading(true);
    fetchLatestAssessmentResult(assessmentId)
      .then((nextResult) => {
        if (cancelled) return;
        if (!nextResult) setLoadError('Chưa có lần nộp bài nào cho đề thi này.');
        else setResult(nextResult);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được kết quả.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [assessmentId, navigationResult]);

  useEffect(() => {
    if (!result) return;
    let cancelled = false;
    fetchAssessmentResultDetail(result.attemptId)
      .then((nextDetails) => { if (!cancelled) setDetails(nextDetails); })
      .catch((error: unknown) => { if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được phân tích bài thi.'); });
    return () => { cancelled = true; };
  }, [result]);

  if (loadError) return <PageState tone="error" message={loadError} />;
  if (isLoading || !result) return <PageState message="Đang tải kết quả…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-6 md:p-8">
        <Link to="/app/exams" className="inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2 text-sm font-semibold text-[#5f6b7c]"><ArrowLeft size={16} /> Về trung tâm luyện thi</Link>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">Kết quả đã được máy chủ chấm</p>
            <h1 className="mt-2 text-3xl font-bold text-[#172033]">Bài thi đã hoàn thành</h1>
            <p className="mt-2 text-sm text-[#5f6b7c]">{result.correctAnswers}/{result.totalQuestions} câu đúng · {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.attemptedAt))}</p>
          </div>
          <div className="text-center"><div className="text-6xl font-black text-orange-700">{result.score}</div><div className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold', result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{result.passed ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}{result.passed ? 'Đạt' : 'Chưa đạt'}</div></div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <h2 className="text-lg font-bold text-[#172033]">Phân tích từng câu</h2>
        {details.length === 0 ? (
          <p className="mt-3 text-sm text-[#5f6b7c]">Đang tải phân tích bài làm…</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {details.map((detail) => (
              <li key={detail.questionId} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                <div className="flex items-start gap-3"><span className={cn('mt-0.5 inline-flex rounded-full px-2 py-1 text-xs font-bold', detail.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{detail.isCorrect ? 'Đúng' : 'Cần ôn lại'}</span><div className="min-w-0"><p className="font-semibold text-[#172033]">{detail.orderIndex + 1}. {detail.prompt}</p><p className="mt-2 text-sm text-[#5f6b7c]">Anh chọn: {detail.selectedAnswer || 'Chưa trả lời'}</p>{detail.explanation && <p className="mt-2 text-sm leading-6 text-[#5f6b7c]">{detail.explanation}</p>}</div></div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2"><Link to={`/app/exams/${assessmentId}/start`} className="flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#5f6b7c]"><RotateCcw size={16} /> Làm lại đề</Link><Link to="/app/review/flashcards?mode=due" className="flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white">Ôn thẻ đến hạn <ChevronRight size={16} /></Link></div>
    </div>
  );
}

function PageState({ message, tone }: { message: string; tone?: 'error' }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-5"><div className={cn('w-full rounded-2xl border p-5 text-sm font-semibold', tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c]')}>{message}</div></div>;
}

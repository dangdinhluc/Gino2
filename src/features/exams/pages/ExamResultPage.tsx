import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck, CheckCircle2, ChevronRight, CircleAlert, KeyRound, Lightbulb, ListChecks, RotateCcw, Target, TriangleAlert } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  fetchAssessmentResultDetail,
  fetchLatestAssessmentResult,
  type AssessmentResult,
  type AssessmentResultDetail,
  type AssessmentStrategy,
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
        <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2 text-sm font-semibold text-[#5f6b7c]"><ArrowLeft size={16} /> Về Hôm nay</Link>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">Kết quả đã được máy chủ chấm</p>
            <h1 className="mt-2 text-3xl font-bold text-[#172033]">Bài thi đã hoàn thành</h1>
            <p className="mt-2 text-sm text-[#5f6b7c]">{result.correctAnswers}/{result.totalQuestions} câu đúng · {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.attemptedAt))}</p>
            <p className="mt-1 text-xs font-semibold text-[#7b8797]">Điểm đạt: {result.passingPoints}/{result.totalPoints} · Tỷ lệ quy đổi: {result.score}%</p>
          </div>
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1 text-orange-700"><span className="text-6xl font-black">{result.pointsEarned}</span><span className="text-xl font-black">/{result.totalPoints}</span></div>
            <div className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold', result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{result.passed ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}{result.passed ? 'Đạt' : 'Chưa đạt'}</div>
          </div>
        </div>
      </section>

      {result.sectionBreakdown.length > 0 && (
        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
          <div className="flex items-center gap-2"><Target size={18} className="text-orange-700" /><h2 className="text-lg font-bold text-[#172033]">Điểm theo phần</h2></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {result.sectionBreakdown.map((section, index) => (
              <div key={`${section.domain}-${section.section}-${index}`} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-bold text-[#172033]">{section.domain}</p><p className="mt-0.5 text-xs font-semibold text-[#7b8797]">{section.section} · {section.correctAnswers}/{section.questions} câu đúng</p></div>
                  <span className="shrink-0 rounded-lg bg-orange-50 px-2.5 py-1 text-sm font-black text-orange-800">{section.pointsEarned}/{section.totalPoints}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#efe5d7]"><div className="h-full rounded-full bg-orange-700" style={{ width: `${section.totalPoints > 0 ? Math.min(100, Math.round(section.pointsEarned / section.totalPoints * 100)) : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <h2 className="text-lg font-bold text-[#172033]">Phân tích từng câu</h2>
        <p className="mt-1 text-xs font-semibold text-[#7b8797]">Mẹo và chiến thuật chỉ xuất hiện sau khi bài đã được nộp.</p>
        {details.length === 0 ? (
          <p className="mt-3 text-sm text-[#5f6b7c]">Đang tải phân tích bài làm…</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {details.map((detail) => (
              <li key={detail.questionId} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <span className={cn('mt-0.5 inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-bold', detail.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{detail.isCorrect ? 'Đúng' : 'Cần ôn lại'}</span>
                  <div className="min-w-0 flex-1">
                    {(detail.domain || detail.section || detail.kind) && <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-orange-700">{[detail.domain, detail.section, detail.kind].filter(Boolean).join(' · ')}</p>}
                    <p className="font-semibold leading-6 text-[#172033]">{detail.orderIndex + 1}. {detail.prompt}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#5f6b7c]"><span>Anh chọn: <strong>{detail.selectedAnswer || 'Chưa trả lời'}</strong></span><span>Điểm: <strong>{detail.pointsEarned}/{detail.points}</strong></span></div>
                    {!detail.isCorrect && detail.correctAnswer && <p className="mt-1 text-sm font-semibold text-emerald-700">Đáp án đúng: {detail.correctAnswer}</p>}
                    {detail.explanation && <div className="mt-3 rounded-xl bg-[#fff7ed] p-3 text-sm leading-6 text-[#5f493e]"><strong className="text-[#172033]">Giải thích: </strong>{detail.explanation}</div>}
                    <StrategyPanel strategy={detail.strategy} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2"><Link to={`/app/exams/${assessmentId}/start`} className="flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#5f6b7c]"><RotateCcw size={16} /> Làm lại đề</Link><Link to="/app/review/flashcards?mode=due" className="flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white">Ôn thẻ đến hạn <ChevronRight size={16} /></Link></div>
    </div>
  );
}

function StrategyPanel({ strategy }: { strategy: AssessmentStrategy }) {
  const hasContent = Boolean(
    strategy.questionPattern
    || strategy.signalWords.length
    || strategy.quickRule
    || strategy.answerReason
    || strategy.vocabClues.length
    || strategy.eliminationTips.length
    || strategy.trap
    || strategy.examSteps.length
    || strategy.memoryTip,
  );
  if (!hasContent) return null;

  return (
    <div className="mt-4 grid gap-2.5">
      {(strategy.questionPattern || strategy.quickRule) && (
        <StrategyCard icon={<Lightbulb size={16} />} title="Mẹo nhận dạng">
          {strategy.questionPattern && <p className="text-xs font-bold uppercase tracking-[0.08em] text-orange-700">{strategy.questionPattern}</p>}
          {strategy.quickRule && <p className="mt-1">{strategy.quickRule}</p>}
        </StrategyCard>
      )}
      {strategy.signalWords.length > 0 && (
        <StrategyCard icon={<KeyRound size={16} />} title="Từ khóa quyết định">
          <div className="flex flex-wrap gap-1.5">{strategy.signalWords.map((word) => <span key={word} className="rounded-lg bg-white px-2 py-1 font-bold text-orange-800">{word}</span>)}</div>
        </StrategyCard>
      )}
      {strategy.vocabClues.length > 0 && (
        <StrategyCard icon={<BookOpenCheck size={16} />} title="Từ vựng cần hiểu">
          <ul className="space-y-1.5">{strategy.vocabClues.map((clue, index) => <li key={`${clue.term}-${index}`}><strong>{clue.term}</strong>{clue.meaning ? ` — ${clue.meaning}` : ''}{clue.whenSeen ? <span className="block text-xs text-[#7b8797]">{clue.whenSeen}</span> : null}</li>)}</ul>
        </StrategyCard>
      )}
      {strategy.eliminationTips.length > 0 && (
        <StrategyCard icon={<ListChecks size={16} />} title="Cách loại đáp án">
          <ul className="list-disc space-y-1 pl-5">{strategy.eliminationTips.map((tip, index) => <li key={`${index}-${tip}`}>{tip}</li>)}</ul>
        </StrategyCard>
      )}
      {strategy.trap && (
        <StrategyCard icon={<TriangleAlert size={16} />} title="Bẫy thường gặp" tone="warning"><p>{strategy.trap}</p></StrategyCard>
      )}
      {strategy.examSteps.length > 0 && (
        <StrategyCard icon={<ListChecks size={16} />} title="Các bước làm câu tương tự">
          <ol className="list-decimal space-y-1 pl-5">{strategy.examSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
        </StrategyCard>
      )}
      {strategy.memoryTip && (
        <StrategyCard icon={<Target size={16} />} title="Quy tắc nhớ nhanh"><p className="font-semibold">{strategy.memoryTip}</p></StrategyCard>
      )}
    </div>
  );
}

function StrategyCard({ icon, title, tone, children }: { icon: ReactNode; title: string; tone?: 'warning'; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border p-3 text-sm leading-6', tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-[#eadfce] bg-[#fffaf3] text-[#5f493e]')}>
      <div className="mb-1.5 flex items-center gap-2 font-bold text-[#172033]">{icon}{title}</div>
      {children}
    </div>
  );
}

function PageState({ message, tone }: { message: string; tone?: 'error' }) {
  return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-5"><div className={cn('w-full rounded-2xl border p-5 text-sm font-semibold', tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c]')}>{message}</div></div>;
}

import React from 'react';
import { ArrowRight, CheckCircle2, Play, RotateCcw } from 'lucide-react';

export type PracticeType = 'vocab' | 'grammar' | 'listening' | 'situation';
export type PracticeDifficulty = 'Dễ' | 'Trung bình' | 'Khó';
export type PracticeStatus = 'not_started' | 'in_progress' | 'completed';

export interface PracticeItemData {
  id: string;
  title: string;
  type: PracticeType;
  typeLabel: string;
  questionCount: number;
  estimatedMinutes: number;
  difficulty: PracticeDifficulty;
  status: PracticeStatus;
  progressPercent?: number;
  scorePercent?: number;
  path: string;
}

interface PracticeListItemRowProps {
  // React consumes `key`; keeping this optional accepts callers that pass it explicitly.
  key?: React.Key;
  item: PracticeItemData;
  onAction: (item: PracticeItemData) => void;
}

const practiceVisualMap: Record<PracticeType, { icon: string; iconClassName: string; tagClassName: string }> = {
  vocab: {
    icon: '/assets/practice-icons/vocabulary-book.webp',
    iconClassName: 'bg-[#fff1df] border-[#f7d2a4]',
    tagClassName: 'bg-orange-50 text-[#c64a16] border-orange-200',
  },
  grammar: {
    icon: '/assets/practice-icons/worksheet-quiz.webp',
    iconClassName: 'bg-[#fff4e9] border-[#f2d5b4]',
    tagClassName: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  listening: {
    icon: '/assets/practice-icons/listening.webp',
    iconClassName: 'bg-[#edf4ff] border-[#ccdcf7]',
    tagClassName: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  situation: {
    icon: '/assets/practice-icons/goal.webp',
    iconClassName: 'bg-[#fff1e8] border-[#f6d0b6]',
    tagClassName: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export function PracticeListItemRow({ item, onAction }: PracticeListItemRowProps) {
  const isCompleted = item.status === 'completed';
  const isInProgress = item.status === 'in_progress';
  const visual = practiceVisualMap[item.type];

  return (
    <article className="group flex items-center gap-3 rounded-[22px] border border-[#eee2d2] bg-white p-3.5 shadow-[0_3px_12px_rgba(64,44,21,0.04)] transition hover:-translate-y-0.5 hover:border-[#efc897] hover:shadow-[0_8px_20px_rgba(126,78,20,0.08)]">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border p-1.5 ${visual.iconClassName}`}>
        <img src={visual.icon} alt="" className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1.5">
          <h3 className="min-w-0 flex-1 font-[var(--font-heading)] text-[15px] font-extrabold leading-snug text-[#172033] line-clamp-1">
            {item.title}
          </h3>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${visual.tagClassName}`}>
            {item.typeLabel}
          </span>
        </div>
        <p className="mt-1 text-xs font-semibold text-[#728092]">
          {item.questionCount} câu <span className="px-1 text-[#c5cbd4]">•</span> {item.estimatedMinutes} phút <span className="px-1 text-[#c5cbd4]">•</span> <span className="font-bold text-[#485569]">{item.difficulty}</span>
        </p>
        <div className="mt-2 flex min-h-4 items-center gap-2">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={13} aria-hidden="true" /> Đã hoàn thành · {item.scorePercent}%
            </span>
          )}
          {isInProgress && (
            <div className="flex w-full max-w-[190px] items-center gap-2">
              <span className="shrink-0 text-xs font-bold text-amber-700">Đang làm · {item.progressPercent}%</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                <div className="h-full rounded-full bg-[#ec9e19]" style={{ width: `${item.progressPercent}%` }} />
              </div>
            </div>
          )}
          {item.status === 'not_started' && <span className="text-xs font-semibold text-[#8c97a8]">Chưa làm</span>}
        </div>
      </div>

      {isCompleted ? (
        <button type="button" onClick={() => onAction(item)} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl border border-[#f0c996] bg-white px-2.5 text-xs font-bold text-[#c64a16] hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
          <RotateCcw size={13} aria-hidden="true" /> Làm lại
        </button>
      ) : (
        <button type="button" onClick={() => onAction(item)} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl bg-[#d94a13] px-2.5 text-xs font-extrabold text-white shadow-[0_3px_0_#b23a0c] transition hover:bg-[#c9400d] active:translate-y-px active:shadow-[0_2px_0_#b23a0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94a13] focus-visible:ring-offset-2">
          {isInProgress ? <>Tiếp tục <ArrowRight size={13} aria-hidden="true" /></> : <><Play size={13} fill="currentColor" aria-hidden="true" /> Bắt đầu</>}
        </button>
      )}
    </article>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { assetPath } from '@/src/shared/lib/assets';

export interface ContinuePracticeData {
  id: string;
  title: string;
  typeLabel: string;
  completedQuestions: number;
  totalQuestions: number;
  remainingMinutes: number;
  progressPercent: number;
}

interface ContinuePracticeCardProps {
  practice?: ContinuePracticeData;
  onContinue?: (id: string) => void;
}

const defaultPractice: ContinuePracticeData = {
  id: 'workplace-vocab-1',
  title: 'Ôn từ vựng tại nơi làm việc',
  typeLabel: 'Từ vựng',
  completedQuestions: 12,
  totalQuestions: 20,
  remainingMinutes: 5,
  progressPercent: 60,
};

export function ContinuePracticeCard({ practice = defaultPractice, onContinue }: ContinuePracticeCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#f0d5b5] bg-[#fffaf3] p-4 shadow-[0_5px_16px_rgba(116,72,22,0.05)] sm:p-5">
      <div className="pointer-events-none absolute -right-4 -top-8 h-24 w-24 rounded-full bg-[#ffe6c8]" aria-hidden="true" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#f4cea2] bg-[#fff0df] p-1.5">
          <img src={assetPath('assets/practice-icons/flashcards.webp')} alt="" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#ffead3] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.07em] text-[#bd4311]">Tiếp tục</span>
            <span className="text-[11px] font-bold text-[#9a6b31]">{practice.typeLabel}</span>
          </div>
          <h2 className="mt-1 font-[var(--font-heading)] text-[15px] font-extrabold text-[#172033] line-clamp-1">{practice.title}</h2>
          <p className="mt-0.5 text-xs font-medium text-[#718096]">{practice.completedQuestions}/{practice.totalQuestions} câu · còn khoảng {practice.remainingMinutes} phút</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f4e5d5]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#e06a16] to-[#eaa21c]" style={{ width: `${practice.progressPercent}%` }} />
            </div>
            <span className="text-xs font-extrabold text-[#b65317]">{practice.progressPercent}%</span>
          </div>
        </div>
        <button type="button" onClick={() => onContinue?.(practice.id)} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl bg-[#d94a13] px-3 text-xs font-extrabold text-white shadow-[0_3px_0_#b23a0c] transition hover:bg-[#c9400d] active:translate-y-px active:shadow-[0_2px_0_#b23a0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94a13] focus-visible:ring-offset-2">
          Tiếp tục <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

import React from 'react';
import { ArrowRight, Play, Zap } from 'lucide-react';

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

export function ContinuePracticeCard({
  practice = defaultPractice,
  onContinue,
}: ContinuePracticeCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#fde2cb] bg-gradient-to-r from-[#fffcf8] via-[#fff5eb] to-[#ffebd7] p-4 shadow-2xs sm:p-5">
      <div className="flex items-center justify-between gap-3.5">
        {/* Left Target 3D Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-2xs border border-orange-100">
          <img
            src="/assets/game-icons/icon_target.png"
            alt="Target"
            className="h-9 w-9 object-contain"
          />
        </div>

        {/* Center Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-block rounded-full bg-orange-100/90 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-orange-700 uppercase border border-orange-200/60">
              TIẾP TỤC LUYỆN TẬP
            </span>
            <span className="inline-block rounded-full bg-amber-100/70 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {practice.typeLabel}
            </span>
          </div>

          <h3 className="font-[var(--font-heading)] text-base font-extrabold text-[#172033] line-clamp-1">
            {practice.title}
          </h3>

          {/* Info Line */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#717d8f]">
            <span>{practice.completedQuestions}/{practice.totalQuestions} câu</span>
            <span>•</span>
            <span>~{practice.remainingMinutes} phút còn lại</span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f3e3d3]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#e65100]"
                style={{ width: `${practice.progressPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-extrabold text-orange-700">
              {practice.progressPercent}%
            </span>
          </div>
        </div>

        {/* Right Continue Button */}
        <div className="shrink-0 pl-1">
          <button
            type="button"
            onClick={() => onContinue?.(practice.id)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:from-[#c23400] hover:to-[#d84a00] active:scale-95"
          >
            <span>Tiếp tục</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

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
  key?: React.Key;
  item: PracticeItemData;
  onAction: (item: PracticeItemData) => void;
}

const typeTagStyleMap: Record<PracticeType, string> = {
  vocab: 'bg-orange-100/90 text-orange-700 border-orange-200',
  grammar: 'bg-purple-100/90 text-purple-700 border-purple-200',
  listening: 'bg-sky-100/90 text-sky-700 border-sky-200',
  situation: 'bg-emerald-100/90 text-emerald-700 border-emerald-200',
};

const typeIconMap: Record<PracticeType, string> = {
  vocab: '/assets/game-icons/icon_books.png',
  grammar: '/assets/game-icons/icon_checklist.png',
  listening: '/assets/game-icons/icon_target.png',
  situation: '/assets/thumb_situation.png',
};

export function PracticeListItemRow({ item, onAction }: PracticeListItemRowProps) {
  const isCompleted = item.status === 'completed';
  const isInProgress = item.status === 'in_progress';

  return (
    <article className="group relative flex items-center justify-between gap-3.5 rounded-[22px] border border-[#efe5d7] bg-white p-3.5 shadow-2xs transition-all duration-200 hover:border-orange-200 hover:shadow-xs">
      {/* Left Icon Thumbnail */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff9f3] p-1.5 border border-orange-100/80">
        <img
          src={typeIconMap[item.type]}
          alt={item.typeLabel}
          className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Center Main Info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-[var(--font-heading)] text-base font-extrabold text-[#172033] line-clamp-1">
            {item.title}
          </h3>
          <span
            className={`inline-block shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              typeTagStyleMap[item.type]
            }`}
          >
            {item.typeLabel}
          </span>
        </div>

        {/* Metadata Line */}
        <div className="flex items-center gap-1.5 text-xs text-[#717d8f] font-semibold">
          <span>{item.questionCount} câu</span>
          <span>•</span>
          <span>{item.estimatedMinutes} phút</span>
          <span>•</span>
          <span className="text-[#172033] font-bold">{item.difficulty}</span>
        </div>

        {/* Status / Progress Row */}
        <div className="flex items-center gap-2 pt-0.5">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 size={13} />
              Đã hoàn thành · <span className="text-emerald-700 font-extrabold">{item.scorePercent}%</span>
            </span>
          )}

          {isInProgress && (
            <div className="flex items-center gap-2 w-full max-w-[160px]">
              <span className="text-xs font-bold text-amber-700 shrink-0">
                Đang làm · {item.progressPercent}%
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {item.status === 'not_started' && (
            <span className="text-xs font-semibold text-[#8c97a8]">Chưa làm</span>
          )}
        </div>
      </div>

      {/* Right Action Button */}
      <div className="shrink-0 pl-1">
        {isCompleted ? (
          <button
            type="button"
            onClick={() => onAction(item)}
            className="flex min-w-[5rem] items-center justify-center gap-1 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-orange-600 shadow-2xs transition-all hover:bg-orange-50 active:scale-95"
          >
            <RotateCcw size={13} />
            <span>Làm lại</span>
          </button>
        ) : isInProgress ? (
          <button
            type="button"
            onClick={() => onAction(item)}
            className="flex min-w-[5.25rem] items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:from-[#c23400] hover:to-[#d84a00] active:scale-95"
          >
            <span>Tiếp tục</span>
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAction(item)}
            className="flex min-w-[5.25rem] items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:from-[#c23400] hover:to-[#d84a00] active:scale-95"
          >
            <Play size={13} fill="currentColor" />
            <span>Bắt đầu</span>
          </button>
        )}
      </div>
    </article>
  );
}

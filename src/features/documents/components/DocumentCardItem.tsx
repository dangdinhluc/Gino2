import React from 'react';
import { Bookmark, ChevronRight, Download, MoreVertical } from 'lucide-react';
import type { CourseDocumentItem } from '@/src/features/courses/mock/courseLearningMock';
import { assetPath } from '@/src/shared/lib/assets';

interface DocumentCardItemProps {
  key?: React.Key;
  document: CourseDocumentItem;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onDownload?: (id: string) => void;
  onMenu?: (id: string) => void;
}

export function DocumentCardItem({
  document,
  isSelected = false,
  onSelect,
  onDownload,
  onMenu,
}: DocumentCardItemProps) {
  const isPdf = document.kind === 'PDF';
  const iconSrc = assetPath(`assets/${isPdf ? 'icon_pdf.png' : 'icon_doc.png'}`);

  return (
    <article
      className={`group relative rounded-[22px] border bg-white p-4 shadow-2xs transition-all duration-200 ${
        isSelected ? 'border-orange-300 ring-2 ring-orange-400/20' : 'border-[#efe5d7] hover:border-orange-200'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Left 3D Icon Badge */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff8f2] p-1 border border-orange-100/70">
          <img
            src={iconSrc}
            alt={document.kind}
            className="h-11 w-11 object-contain drop-shadow-2xs transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Center Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onSelect(document.id)}
              className="font-[var(--font-heading)] text-base font-extrabold leading-snug text-[#172033] cursor-pointer hover:text-orange-700"
            >
              {document.title}
            </h3>

            {/* Top Right 3-dots Menu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMenu?.(document.id);
              }}
              aria-label="Mở menu tài liệu"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#95a0af] transition-colors hover:bg-gray-100 hover:text-[#172033]"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Metadata Line */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8c97a8]">
            <span className="text-[#d83a00]">{document.kind === 'PDF' ? 'PDF' : 'Bài đọc'}</span>
            <span>•</span>
            <span>{document.module}</span>
            <span>•</span>
            <span>{document.readTime}</span>
          </div>

          {/* Short Summary */}
          <p className="text-xs leading-relaxed text-[#5f6b7c] line-clamp-2 pt-0.5">
            {document.summary}
          </p>

          {/* Status Badge & Progress Line */}
          <div className="flex items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <Bookmark size={11} fill="currentColor" />
              Đã xem
            </span>

            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-500 w-full" />
            </div>

            <span className="shrink-0 text-[10px] font-bold text-emerald-700">100%</span>
          </div>
        </div>

        {/* Right Actions: Download & Chevron */}
        <div className="flex flex-col items-center justify-between gap-3 shrink-0 self-center pl-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownload?.(document.id);
            }}
            aria-label={`Tải xuống ${document.title}`}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-100 bg-[#fff9f3] text-orange-600 shadow-2xs transition-all hover:bg-orange-100/80 active:scale-95"
          >
            <Download size={18} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={() => onSelect(document.id)}
            aria-label={`Xem tài liệu ${document.title}`}
            className="flex h-6 w-6 items-center justify-center text-[#95a0af] transition-colors hover:text-[#172033]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Expanded Preview if Selected */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-[#efe5d7] text-xs leading-relaxed text-[#5f6b7c]">
          <p className="font-semibold text-[#172033]">Nội dung xem trước:</p>
          <p className="mt-1">{document.preview}</p>
        </div>
      )}
    </article>
  );
}

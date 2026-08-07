import React from 'react';
import { Bookmark, ChevronRight, Clock3, MoreVertical } from 'lucide-react';
import type { CourseDocumentItem } from '@/src/features/courses/mock/courseLearningMock';

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
  onMenu,
}: DocumentCardItemProps) {
  return (
    <article
      onClick={() => onSelect(document.id)}
      className={`group relative overflow-hidden rounded-[24px] border bg-white p-4 shadow-2xs transition-all duration-200 cursor-pointer hover:shadow-md ${
        isSelected
          ? 'border-[#d83a00] ring-2 ring-[#d83a00]/15'
          : 'border-[#f5ece1] hover:border-orange-300'
      }`}
    >
      {/* Top Accent Line if selected */}
      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d83a00] to-[#f27427]" />
      )}

      <div className="space-y-2">
        {/* Header Row: Kind, Module, ReadTime & 3-dots Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-black text-[#c2410c]">
              {document.kind === 'PDF' ? 'PDF' : 'Bài đọc'}
            </span>
            <span className="font-bold text-[#8c97a8]">·</span>
            <span className="font-bold text-[#475467]">{document.module}</span>
            <span className="font-bold text-[#8c97a8]">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#64748b]">
              <Clock3 size={12} className="text-[#d83a00]" /> {document.readTime}
            </span>
          </div>

          {/* Menu options */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenu?.(document.id);
            }}
            aria-label="Tùy chọn tài liệu"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#8c97a8] transition-colors hover:bg-slate-100 hover:text-[#0f172a]"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-[var(--font-heading)] text-base font-black leading-snug text-[#0f172a] transition-colors group-hover:text-[#d83a00]">
          {document.title}
        </h3>

        {/* Short Summary */}
        <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] line-clamp-2">
          {document.summary}
        </p>

        {/* Bottom Footer: Status & Single View Button (No Download Button) */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#f5ece1]">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-[#059669]">
            <Bookmark size={11} fill="currentColor" /> Đã xem 100%
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(document.id);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:shadow-md hover:brightness-110 active:scale-95"
          >
            <span>Xem ngay</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Expanded Preview if Selected */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-orange-200/60 bg-[#fffcf9] -mx-4 -mb-4 p-4 rounded-b-[24px] space-y-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#d83a00]">
            Nội dung xem trước:
          </p>
          <p className="text-xs font-semibold leading-relaxed text-[#334155]">
            {document.preview}
          </p>
        </div>
      )}
    </article>
  );
}

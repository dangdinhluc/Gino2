import React from 'react';
import { Bookmark, CheckCircle2, FileText, Headphones, MoreVertical } from 'lucide-react';
import type { CourseDocumentItem } from '@/src/features/courses/courseLearning.types';

interface DocumentCardItemProps {
  key?: React.Key;
  document: CourseDocumentItem;
  isSelected?: boolean;
  isRead?: boolean;
  isBookmarked?: boolean;
  onSelect: (id: string) => void;
  onMenu?: (id: string) => void;
}

export function DocumentCardItem({
  document,
  isSelected = false,
  isRead = false,
  isBookmarked = false,
  onSelect,
  onMenu,
}: DocumentCardItemProps) {
  const isAudio = document.kind !== 'PDF' && /audio|nghe|podcast/i.test(`${document.module} ${document.title}`);
  const Icon = isAudio ? Headphones : FileText;

  return (
    <article
      onClick={() => onSelect(document.id)}
      className={`flex min-h-[72px] cursor-pointer items-center gap-3 rounded-[13px] border bg-white px-3 py-2.5 transition-all ${
        isSelected ? 'border-[#cfc2ee] shadow-[0_0_0_1px_rgba(111,69,216,.08)]' : 'border-[#e9e9ef] hover:border-[#d9d2e8]'
      }`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${isAudio ? 'bg-[#eaf5ff] text-[#4c86c6]' : 'bg-[#f5f2fb] text-[#7652cc]'}`}>
        <Icon size={18} />
      </span>

      <button type="button" onClick={() => onSelect(document.id)} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]">
        <strong className="block truncate text-[11px] font-extrabold text-[#303138]">{document.title}</strong>
        <span className="mt-1 flex items-center gap-1.5 text-[9px] font-medium text-[#92949d]">
          <span>{document.module}</span><span>·</span><span>{document.kind}</span>
        </span>
        {isRead && <span className="mt-1 inline-flex items-center gap-1 text-[8px] font-bold text-[#43a56d]"><CheckCircle2 size={10} /> Đã xem</span>}
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {isBookmarked && <Bookmark size={13} className="fill-[#8a6ad5] text-[#8a6ad5]" aria-label="Đã lưu" />}
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onMenu?.(document.id); }}
          aria-label="Tùy chọn tài liệu"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#9b9da5] hover:bg-[#f5f4f8]"
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </article>
  );
}

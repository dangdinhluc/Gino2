import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Bookmark, ExternalLink, FileText, Headphones, MoreVertical } from 'lucide-react';
import type { CourseDocumentItem } from '@/src/features/courses/courseLearning.types';
import { MarkdownViewer } from '@/src/features/documents/components/MarkdownViewer';
import { createSignedDocumentUrl } from '@/src/features/documents/repositories/documentAnnotationRepository';

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
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readerUrl, setReaderUrl] = useState<string | null>(null);
  const [readerError, setReaderError] = useState<string | null>(null);
  const [isReaderLoading, setIsReaderLoading] = useState(false);

  const isAudio = document.kind !== 'PDF' && /audio|nghe|podcast/i.test(`${document.module} ${document.title}`);
  const Icon = isAudio ? Headphones : FileText;

  const openReader = () => {
    onSelect(document.id);
    setIsReaderOpen(true);
  };

  useEffect(() => {
    if (!isReaderOpen) return;

    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsReaderOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReaderOpen]);

  useEffect(() => {
    if (!isReaderOpen) return;

    setReaderError(null);
    setReaderUrl(document.externalUrl ?? null);
    if (!document.storagePath) return;

    let cancelled = false;
    setIsReaderLoading(true);
    createSignedDocumentUrl(document.storagePath)
      .then((url) => {
        if (!cancelled) setReaderUrl(url);
      })
      .catch((error: unknown) => {
        if (!cancelled) setReaderError(error instanceof Error ? error.message : 'Không mở được tài liệu.');
      })
      .finally(() => {
        if (!cancelled) setIsReaderLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [document.externalUrl, document.storagePath, isReaderOpen]);

  const reader = isReaderOpen && typeof window !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-[120] flex flex-col bg-[#f8f7fc]" role="dialog" aria-modal="true" aria-label={`Trình đọc ${document.title}`}>
          <header className="sticky top-0 z-10 flex min-h-[56px] items-center gap-2 border-b border-[#e8e3f2] bg-white px-3">
            <button
              type="button"
              onClick={() => setIsReaderOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#252333] hover:bg-[#f3efff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]"
              aria-label="Quay lại danh sách tài liệu"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[12px] font-extrabold text-[#252333]">{document.title}</strong>
              <span className="mt-0.5 block truncate text-[9px] font-medium text-[#858091]">{document.module} · {document.kind}</span>
            </div>

            {readerUrl && (
              <a
                href={readerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6f45d8] hover:bg-[#f4f0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]"
                aria-label="Mở tài liệu ở tab mới"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </header>

          <main className="min-h-0 flex-1 overflow-hidden">
            {isReaderLoading ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-[11px] font-semibold text-[#858893]">Đang mở tài liệu…</div>
            ) : readerError ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-[11px] font-semibold text-red-600">{readerError}</div>
            ) : document.kind === 'PDF' && readerUrl ? (
              <iframe
                title={`Trình xem PDF: ${document.title}`}
                src={readerUrl}
                className="h-full w-full border-0 bg-white"
              />
            ) : document.kind !== 'PDF' && document.contentMarkdown ? (
              <div className="h-full overflow-y-auto bg-white px-4 py-5 sm:px-6">
                <div className="mx-auto w-full max-w-[760px] rounded-[14px] border border-[#e9e9ef] bg-white p-4 sm:p-6">
                  <MarkdownViewer source={document.contentMarkdown} />
                </div>
              </div>
            ) : readerUrl ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <FileText size={28} className="text-[#6f45d8]" />
                <strong className="text-[12px] font-extrabold text-[#252333]">Tài liệu mở bằng trình xem ngoài</strong>
                <a href={readerUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6f45d8] px-4 text-[11px] font-extrabold text-white hover:bg-[#5f37c6]">
                  MỞ TÀI LIỆU <ExternalLink size={13} />
                </a>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-[11px] font-semibold text-[#858893]">Tài liệu này chưa có bản xem trực tuyến.</div>
            )}
          </main>
        </div>,
        window.document.body
      )
    : null;

  return (
    <>
      <article
        onClick={openReader}
        className={`group flex cursor-pointer items-start gap-3 rounded-[16px] border bg-white px-3 py-3 transition-colors ${
          isSelected ? 'border-[#6f45d8]' : 'border-[#e8e3f2] hover:border-[#cfc2ee]'
        }`}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isAudio ? 'bg-[#eaf5ff] text-[#4c86c6]' : 'bg-[#f3efff] text-[#6f45d8]'}`}>
          <Icon size={18} />
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openReader();
          }}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]"
        >
          <strong className="block truncate text-[12px] font-extrabold text-[#252333]">{document.title}</strong>
          <span className="mt-1 block truncate text-[10px] font-medium text-[#858091]">
            {document.summary || document.preview}
          </span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-[#858091]">
            <span>{document.module}</span><span>·</span><span>{document.kind}</span>
            {document.readTime && <span className="rounded-full bg-[#f3efff] px-2 py-1 text-[#6f45d8]">{document.readTime}</span>}
            {document.size && document.size !== 'Tài liệu' && <span className="rounded-full bg-[#f3efff] px-2 py-1 text-[#6f45d8]">{document.size}</span>}
            {isRead && <span className="rounded-full bg-[#f3efff] px-2 py-1 text-[#6f45d8]">Đã xem</span>}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {isBookmarked && <Bookmark size={15} className="fill-[#6f45d8] text-[#6f45d8]" aria-label="Đã lưu" />}
          <button
            type="button"
            onClick={(event) => { event.stopPropagation(); onMenu?.(document.id); }}
            aria-label="Tùy chọn tài liệu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#858091] hover:bg-[#f3efff]"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </article>
      {reader}
    </>
  );
}

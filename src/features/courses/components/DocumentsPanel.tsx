import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, Trash2 } from 'lucide-react';
import {
  type CourseDocumentItem,
} from '@/src/features/courses/courseLearning.types';
import { cn } from '@/src/lib/utils';
import { learningDesktopStickyViewerClass, learningStickyToolbarClass } from '@/src/features/courses/components/coursePanelStyles';

import { MarkdownViewer } from '@/src/features/documents/components/MarkdownViewer';
import { DocumentFilterSheet, type DocumentReadFilter } from '@/src/features/documents/components/DocumentFilterSheet';
import { DocumentSearchAndFilter } from '@/src/features/documents/components/DocumentSearchAndFilter';
import { DocumentCategoryBar } from '@/src/features/documents/components/DocumentCategoryBar';
import { DocumentCardItem } from '@/src/features/documents/components/DocumentCardItem';
import { DocumentEmptyState } from '@/src/features/documents/components/DocumentEmptyState';
import {
  createDocumentAnnotation,
  createSignedDocumentUrl,
  deleteDocumentAnnotation,
  listDocumentAnnotations,
  updateDocumentAnnotation,
  type DocumentAnnotation,
} from '@/src/features/documents/repositories/documentAnnotationRepository';
import {
  fetchReadDocumentIds,
  recordDocumentOpened,
} from '@/src/features/documents/repositories/documentProgressRepository';
import { fetchDocumentBookmarkIds, setDocumentBookmark } from '@/src/features/documents/repositories/documentBookmarkRepository';

interface DocumentsPanelProps {
  courseId: string;
  documents: CourseDocumentItem[];
  selectedDocument: CourseDocumentItem;
  onSelectDocument: (documentId: string) => void;
}

export function DocumentsPanel({ courseId, documents, selectedDocument, onSelectDocument }: DocumentsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [annotations, setAnnotations] = useState<DocumentAnnotation[]>([]);
  const [note, setNote] = useState('');
  const [noteColor, setNoteColor] = useState<DocumentAnnotation['color']>('yellow');
  const [annotationError, setAnnotationError] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [isAssetLoading, setIsAssetLoading] = useState(false);
  const [selectedText, setSelectedText] = useState<{ text: string; start: number; end: number } | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<DocumentAnnotation | null>(null);
  const [deletingAnnotation, setDeletingAnnotation] = useState<DocumentAnnotation | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [readDocumentIds, setReadDocumentIds] = useState<Set<string>>(new Set());
  const [bookmarkedDocumentIds, setBookmarkedDocumentIds] = useState<Set<string>>(new Set());
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<DocumentReadFilter>('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const documentContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReadDocumentIds(courseId)
      .then((ids) => { if (!cancelled) setReadDocumentIds(ids); })
      .catch(() => { /* tiến độ đọc là phụ trợ — thất bại không chặn tài liệu */ });
    return () => { cancelled = true; };
  }, [courseId]);

  useEffect(() => {
    let cancelled = false;
    fetchDocumentBookmarkIds()
      .then((ids) => { if (!cancelled) setBookmarkedDocumentIds(ids); })
      .catch(() => { /* bookmark là phụ trợ — không chặn trình xem */ });
    return () => { cancelled = true; };
  }, [courseId]);

  useEffect(() => {
    recordDocumentOpened({
      courseId,
      documentId: selectedDocument.id,
      documentTitle: selectedDocument.title,
    })
      .then(() => setReadDocumentIds((prev) => { const next = new Set(prev); next.add(selectedDocument.id); return next; }))
      .catch(() => { /* ghi tiến độ thất bại không ảnh hưởng xem tài liệu */ });
  }, [courseId, selectedDocument.id, selectedDocument.title]);

  useEffect(() => {
    let cancelled = false;
    listDocumentAnnotations(selectedDocument.id)
      .then((items) => { if (!cancelled) setAnnotations(items); })
      .catch((error: unknown) => { if (!cancelled) setAnnotationError(error instanceof Error ? error.message : 'Không tải được ghi chú.'); });
    return () => { cancelled = true; };
  }, [selectedDocument.id]);

  useEffect(() => {
    setSelectedText(null);
    setAssetUrl(null);
    setAssetError(null);
    setIsAssetLoading(false);
    if (!selectedDocument.storagePath) return;

    let cancelled = false;
    setIsAssetLoading(true);
    createSignedDocumentUrl(selectedDocument.storagePath)
      .then((url) => { if (!cancelled) setAssetUrl(url); })
      .catch((error: unknown) => { if (!cancelled) setAssetError(error instanceof Error ? error.message : 'Không mở được tài liệu riêng tư.'); })
      .finally(() => { if (!cancelled) setIsAssetLoading(false); });
    return () => { cancelled = true; };
  }, [selectedDocument.id, selectedDocument.storagePath]);

  function captureSelectedText(): void {
    const container = documentContentRef.current;
    const selection = window.getSelection();
    if (!container || !selection?.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return;
    const text = selection.toString().trim();
    if (!text) return;
    const offset = (node: Node, value: number) => {
      const prefix = document.createRange();
      prefix.selectNodeContents(container);
      prefix.setEnd(node, value);
      return prefix.toString().length;
    };
    setSelectedText({ text, start: offset(range.startContainer, range.startOffset), end: offset(range.endContainer, range.endOffset) });
  }

  async function handleSaveNote(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!note.trim()) return;
    setIsSavingNote(true);
    setAnnotationError(null);
    try {
      const created = await createDocumentAnnotation({
        documentId: selectedDocument.id,
        selectedText: selectedText?.text ?? '',
        note: note.trim(),
        color: noteColor,
        anchor: selectedText ? { start: selectedText.start, end: selectedText.end } : {},
      });
      setAnnotations((current) => [...current, created]);
      setNote('');
      setNoteColor('yellow');
      setSelectedText(null);
    } catch (error: unknown) {
      setAnnotationError(error instanceof Error ? error.message : 'Không lưu được ghi chú.');
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleSaveEditedNote(): Promise<void> {
    if (!editingAnnotation || !editDraft.trim() || isSavingNote) return;
    setIsSavingNote(true);
    setAnnotationError(null);
    try {
      const updated = await updateDocumentAnnotation(editingAnnotation.id, { note: editDraft.trim() });
      setAnnotations((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditingAnnotation(null);
    } catch (error: unknown) {
      setAnnotationError(error instanceof Error ? error.message : 'Không cập nhật được ghi chú.');
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deletingAnnotation) return;
    try {
      await deleteDocumentAnnotation(deletingAnnotation.id);
      setAnnotations((current) => current.filter((item) => item.id !== deletingAnnotation.id));
      setDeletingAnnotation(null);
    } catch (error: unknown) {
      setAnnotationError(error instanceof Error ? error.message : 'Không xóa được ghi chú.');
    }
  }

  const closeAnnotationSheet = () => {
    setEditingAnnotation(null);
    setDeletingAnnotation(null);
    setEditDraft('');
  };

  async function toggleBookmark(documentId: string): Promise<void> {
    const bookmarked = !bookmarkedDocumentIds.has(documentId);
    setBookmarkError(null);
    setBookmarkedDocumentIds((current) => {
      const next = new Set(current);
      if (bookmarked) next.add(documentId); else next.delete(documentId);
      return next;
    });
    try {
      await setDocumentBookmark(documentId, bookmarked);
    } catch (error: unknown) {
      setBookmarkedDocumentIds((current) => {
        const next = new Set(current);
        if (bookmarked) next.delete(documentId); else next.add(documentId);
        return next;
      });
      setBookmarkError(error instanceof Error ? error.message : 'Không cập nhật được tài liệu đã lưu.');
    }
  }

  const categories = useMemo(() => {
    const pdfCount = documents.filter((d) => d.kind === 'PDF').length;
    const docCount = documents.filter((d) => d.kind !== 'PDF').length;
    const profileCount = documents.filter((d) => d.module.includes('Hồ sơ')).length;

    return [
      { id: 'all', label: 'Tất cả', count: documents.length },
      { id: 'pdf', label: 'PDF', count: pdfCount },
      { id: 'doc', label: 'Bài đọc', count: docCount },
      { id: 'profile', label: 'Hồ sơ', count: profileCount },
    ];
  }, [documents]);

  const modules = useMemo(
    () => ['all', ...Array.from(new Set(documents.map((document) => document.module).filter(Boolean)))],
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return documents.filter((document) => {
      // Filter by category
      if (selectedCategory === 'pdf' && document.kind !== 'PDF') return false;
      if (selectedCategory === 'doc' && document.kind === 'PDF') return false;
      if (selectedCategory === 'profile' && !document.module.includes('Hồ sơ')) return false;
      if (selectedModule !== 'all' && document.module !== selectedModule) return false;
      if (readFilter === 'saved' && !bookmarkedDocumentIds.has(document.id)) return false;
      if (readFilter === 'unread' && readDocumentIds.has(document.id)) return false;

      // Filter by query
      if (!normalizedQuery) return true;
      const haystack = [
        document.title,
        document.kind,
        document.module,
        document.summary,
        document.preview,
        document.readTime,
        ...document.tags,
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [bookmarkedDocumentIds, documents, readDocumentIds, readFilter, searchQuery, selectedCategory, selectedModule]);

  const viewerUrl = selectedDocument.kind === 'PDF'
    ? assetUrl ?? selectedDocument.externalUrl
    : null;

  return (
    <div className="mx-auto w-full max-w-xl space-y-3 pb-4 lg:max-w-none">
      <div className={cn(learningStickyToolbarClass, 'space-y-2 rounded-[18px] border border-[#e8e3f2] bg-white p-1.5 shadow-2xs')}>
        <DocumentSearchAndFilter
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onToggleFilter={() => setIsFilterSheetOpen(true)}
          isFilterActive={readFilter !== 'all' || selectedModule !== 'all'}
        />
        <DocumentCategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <div className="space-y-3 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-4 lg:space-y-0">
        <div className="space-y-3">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <DocumentCardItem
                key={doc.id}
                document={doc}
                isSelected={selectedDocument.id === doc.id}
                isRead={readDocumentIds.has(doc.id)}
                isBookmarked={bookmarkedDocumentIds.has(doc.id)}
                onSelect={onSelectDocument}
                onMenu={() => void toggleBookmark(doc.id)}
              />
            ))
          ) : (
            <DocumentEmptyState
              onClearSearch={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            />
          )}
        </div>

        <section className={cn(learningDesktopStickyViewerClass, 'rounded-2xl border border-[#e8e3f2] bg-white p-4 lg:p-5')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f45d8]">Trình xem tài liệu</p>
              <h3 className="mt-1 text-base font-black text-[#252333]">{selectedDocument.title}</h3>
            </div>
            <button type="button" onClick={() => void toggleBookmark(selectedDocument.id)} aria-pressed={bookmarkedDocumentIds.has(selectedDocument.id)} className={cn('inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black', bookmarkedDocumentIds.has(selectedDocument.id) ? 'border-[#6f45d8] bg-[#f3efff] text-[#6f45d8]' : 'border-[#e8e3f2] bg-white text-[#858091] hover:border-[#b8a5e8] hover:text-[#6f45d8]')}><Bookmark size={15} className={bookmarkedDocumentIds.has(selectedDocument.id) ? 'fill-[#6f45d8]' : ''} />{bookmarkedDocumentIds.has(selectedDocument.id) ? 'Đã lưu' : 'Lưu tài liệu'}</button>
            {selectedDocument.kind === 'PDF' && viewerUrl && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                Đang xem trong app
              </span>
            )}
            {selectedDocument.kind !== 'PDF' && !assetUrl && selectedDocument.externalUrl && (
              <a href={selectedDocument.externalUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#b8a5e8] px-3 py-2 text-xs font-bold text-[#6f45d8] hover:bg-[#f3efff]">Mở tài liệu</a>
            )}
          </div>
          {isAssetLoading && <p className="mt-3 text-sm text-[#5f6b7c]">Đang tạo liên kết xem tài liệu…</p>}
          {assetError && <p className="mt-3 text-sm font-semibold text-red-700">{assetError}</p>}
          {bookmarkError && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{bookmarkError}</p>}
          {selectedDocument.kind === 'PDF' && viewerUrl ? (
            <iframe
              title={`Trình xem PDF: ${selectedDocument.title}`}
              src={viewerUrl}
              className="mt-3 h-[32rem] w-full rounded-xl border border-[#e8e3f2] bg-white lg:h-[min(70vh,48rem)]"
            />
          ) : selectedDocument.kind !== 'PDF' && selectedDocument.contentMarkdown ? (
            <div ref={documentContentRef} onMouseUp={captureSelectedText} onKeyUp={captureSelectedText} tabIndex={0} className="mt-3 max-h-[32rem] overflow-y-auto rounded-xl border border-[#e8e3f2] bg-white p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]">
              <MarkdownViewer source={selectedDocument.contentMarkdown} />
            </div>
          ) : !isAssetLoading && !assetError && (
            <p className="mt-3 rounded-xl bg-white p-4 text-sm text-[#5f6b7c]">Tài liệu này chưa có bản xem trực tuyến.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[#e8e3f2] bg-white p-4">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f45d8]">Ghi chú riêng</p><h3 className="mt-1 text-base font-black text-[#252333]">{selectedDocument.title}</h3></div><span className="text-xs font-bold text-[#858091]">{annotations.length} ghi chú</span></div>
        {selectedText && <p className="mt-3 rounded-xl bg-[#f3efff] px-3 py-2 text-xs font-semibold text-[#5f37c6]">Đoạn đã chọn: "{selectedText.text}"</p>}
        <form onSubmit={handleSaveNote} className="mt-3 flex flex-col gap-2">
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi lại điểm cần nhớ…" className="min-h-20 w-full rounded-xl border border-[#e8e3f2] bg-white px-3 py-2 text-sm text-[#252333] outline-none focus:border-[#6f45d8] focus:ring-2 focus:ring-[#6f45d8]/15" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Màu ghi chú">
              <span className="text-xs font-bold text-[#7b8796]">Màu:</span>
              {([
                { id: 'yellow' as const, cls: 'bg-yellow-200 border-yellow-400' },
                { id: 'green' as const, cls: 'bg-green-200 border-green-400' },
                { id: 'blue' as const, cls: 'bg-blue-200 border-blue-400' },
                { id: 'pink' as const, cls: 'bg-pink-200 border-pink-400' },
              ]).map((color) => (
                <button
                  key={color.id}
                  type="button"
                  role="radio"
                  aria-checked={noteColor === color.id}
                  aria-label={`Màu ${color.id}`}
                  onClick={() => setNoteColor(color.id)}
                  className={cn(
                    'h-7 w-7 rounded-full border-2 transition-transform',
                    color.cls,
                    noteColor === color.id ? 'scale-110 ring-2 ring-[#6f45d8] ring-offset-2' : 'opacity-70 hover:opacity-100',
                  )}
                />
              ))}
            </div>
            <button type="submit" disabled={!note.trim() || isSavingNote} className="rounded-xl bg-[#6f45d8] px-4 py-2 text-sm font-bold text-white hover:bg-[#5f37c6] disabled:opacity-50 sm:ml-auto">{isSavingNote ? 'Đang lưu…' : 'Lưu ghi chú'}</button>
          </div>
        </form>
        {annotationError && <p className="mt-2 text-xs font-semibold text-red-700">{annotationError}</p>}
        {annotations.length > 0 && <ul className="mt-3 space-y-2">{annotations.map((annotation) => <li key={annotation.id} className={cn('rounded-xl border-l-4 bg-[#f8f7fc] px-3 py-2 text-sm text-[#475467]', annotation.color === 'yellow' ? 'border-yellow-300' : annotation.color === 'green' ? 'border-green-300' : annotation.color === 'blue' ? 'border-blue-300' : 'border-pink-300')}><div className="flex items-start justify-between gap-3"><div>{annotation.selectedText && <p className="mb-1 text-xs font-bold text-[#5f37c6]">"{annotation.selectedText}"</p>}<p>{annotation.note}</p></div><div className="flex shrink-0 gap-2 text-xs font-bold"><button type="button" onClick={() => { setEditingAnnotation(annotation); setEditDraft(annotation.note); }} className="rounded-lg px-2 py-2 text-[#6f45d8] hover:bg-[#f3efff]">Sửa</button><button type="button" onClick={() => setDeletingAnnotation(annotation)} className="rounded-lg px-2 py-2 text-red-700 hover:bg-red-50">Xóa</button></div></div></li>)}</ul>}
      </section>

      <DocumentFilterSheet
        open={isFilterSheetOpen}
        readFilter={readFilter}
        selectedModule={selectedModule}
        modules={modules}
        onReadFilterChange={setReadFilter}
        onModuleChange={setSelectedModule}
        onReset={() => {
          setReadFilter('all');
          setSelectedModule('all');
        }}
        onApply={() => setIsFilterSheetOpen(false)}
        onClose={() => setIsFilterSheetOpen(false)}
      />

      {/* Bottom sheet sửa / xóa ghi chú */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {(editingAnnotation || deletingAnnotation) && (
              <motion.div
                className="fixed inset-0 z-[96] flex items-end bg-slate-900/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeAnnotationSheet}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="annotation-sheet-title"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full rounded-t-[28px] border-t border-[#e8e3f2] bg-white p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(37,35,51,0.18)]"
                >
                  <span aria-hidden="true" className="mx-auto block h-1.5 w-10 rounded-full bg-[#e8e3f2]" />
                  {editingAnnotation ? (
                    <>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f45d8]">Sửa ghi chú</p>
                          <h4 id="annotation-sheet-title" className="mt-0.5 font-[var(--font-heading)] text-lg font-black text-[#252333]">{selectedDocument.title}</h4>
                        </div>
                        <button type="button" onClick={closeAnnotationSheet} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e3f2] bg-white text-[#858091] hover:bg-[#f3efff] hover:text-[#6f45d8]">✕</button>
                      </div>
                      {editingAnnotation.selectedText && <p className="mt-3 rounded-xl bg-[#f3efff] px-3 py-2 text-xs font-semibold text-[#5f37c6]">"{editingAnnotation.selectedText}"</p>}
                      <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} placeholder="Ghi lại điểm cần nhớ…" className="mt-3 min-h-24 w-full rounded-xl border border-[#e8e3f2] bg-white px-3 py-2 text-sm text-[#252333] outline-none focus:border-[#6f45d8] focus:ring-2 focus:ring-[#6f45d8]/15" />
                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={closeAnnotationSheet} className="min-h-11 flex-1 rounded-xl border border-[#e8e3f2] bg-white px-4 text-sm font-bold text-[#475467] hover:bg-[#f8f7fc]">Hủy</button>
                        <button type="button" disabled={!editDraft.trim() || isSavingNote} onClick={() => void handleSaveEditedNote()} className="min-h-11 flex-1 rounded-xl bg-[#6f45d8] px-4 text-sm font-bold text-white hover:bg-[#5f37c6] disabled:opacity-50">{isSavingNote ? 'Đang lưu…' : 'Lưu ghi chú'}</button>
                      </div>
                    </>
                  ) : deletingAnnotation ? (
                    <>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600">Xóa ghi chú</p>
                          <h4 id="annotation-sheet-title" className="mt-0.5 font-[var(--font-heading)] text-lg font-black text-[#172033]">Xóa ghi chú này?</h4>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 size={18} /></span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#5f6b7c]">Hành động này không thể hoàn tác. Ghi chú sẽ bị xóa vĩnh viễn.</p>
                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={closeAnnotationSheet} className="min-h-11 flex-1 rounded-xl border border-[#e8e3f2] bg-white px-4 text-sm font-bold text-[#475467] hover:bg-[#f8f7fc]">Hủy</button>
                        <button type="button" onClick={() => void handleConfirmDelete()} className="min-h-11 flex-1 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Xóa</button>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

import { type CSSProperties, type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Award, BarChart3, Bird, BrainCircuit, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Headphones, Lock, Play, Trash2, type LucideIcon } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseExamItem,
  type CourseVocabularyItem,
} from '@/src/features/courses/courseLearning.types';
import type { CourseGameType } from '@/src/features/games/types';
import { cn } from '@/src/lib/utils';

/*
 * Hệ thống style dùng chung cho toàn khu học tập.
 *
 * Quy ước tối giản, mọi panel đều phải tuân theo:
 * - Bo góc: chỉ 2 mức. 16px (rounded-2xl) cho khung, 12px (rounded-xl) cho phần tử bên trong.
 * - Màu nhấn: chỉ orange-700. Emerald/red chỉ dùng cho đúng/sai vì đó là ngữ nghĩa.
 * - Chữ: 3 cấp. Tiêu đề (font-bold), nội dung chính (font-semibold), phụ trợ (thường, màu nhạt).
 * - Không lồng khung trong khung. Danh sách dùng đường kẻ ngang, không dùng thẻ có viền + bóng.
 */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
export const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5';
export const panelTitleClass = 'font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]';
export const panelSubtitleClass = 'text-sm text-[#5f6b7c]';
export const dividerListClass = 'divide-y divide-[#efe5d7]';
export const searchFieldClass =
  'flex min-h-12 items-center gap-3 rounded-xl border border-[#e8dccb] bg-white px-4 text-sm text-[#5f6b7c] transition-colors focus-within:border-orange-300';
export const searchInputClass = 'min-w-0 flex-1 bg-transparent py-2 text-sm text-[#172033] outline-none placeholder:text-[#95a0af]';
export const primaryButtonClass =
  'flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800';
export const emptyStateClass = 'rounded-xl border border-dashed border-[#e8dccb] px-4 py-8 text-center';

interface TabButtonProps<T extends string> {
  tab: { id: T; label: string; icon: LucideIcon; imageIcon?: string };
  activeTab: T;
  compact?: boolean;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, tab: T) => void;
  onSelect: (tab: T) => void;
}

export function TabButton<T extends string>({ tab, activeTab, compact = false, onKeyDown, onSelect }: TabButtonProps<T>) {
  const Icon = tab.icon;
  const isActive = activeTab === tab.id;

  return (
    <button
      id={`course-workspace-${compact ? 'compact' : 'rail'}-tab-${tab.id}`}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={isActive ? `course-workspace-panel-${tab.id}` : undefined}
      tabIndex={isActive ? 0 : -1}
      onKeyDown={(event) => onKeyDown(event, tab.id)}
      onClick={() => onSelect(tab.id)}
      className={cn(
        'flex items-center rounded-2xl transition-all duration-200',
        compact
          ? 'min-h-[3.35rem] w-full min-w-0 flex-col justify-center gap-0.5 px-0.5 py-1 text-[10px] sm:text-xs'
          : 'w-full gap-3 px-4 py-3 text-sm',
        isActive ? 'font-black text-[#d83a00]' : 'text-[#7b8796] hover:text-[#172033]',
        focusRing
      )}
    >
      {tab.imageIcon ? (
        <img
          src={tab.imageIcon}
          alt=""
          className={cn(
            'h-7 w-7 object-contain transition-transform duration-200 drop-shadow-2xs',
            isActive ? 'scale-110' : 'filter grayscale-[20%] opacity-85'
          )}
        />
      ) : (
        <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} aria-hidden="true" focusable="false" />
      )}
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
}

import { DocumentHero } from '@/src/features/documents/components/DocumentHero';
import { DocumentStats } from '@/src/features/documents/components/DocumentStats';
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
  const documentContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReadDocumentIds(courseId)
      .then((ids) => { if (!cancelled) setReadDocumentIds(ids); })
      .catch(() => { /* tiến độ đọc là phụ trợ — thất bại không chặn tài liệu */ });
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

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return documents.filter((document) => {
      // Filter by category
      if (selectedCategory === 'pdf' && document.kind !== 'PDF') return false;
      if (selectedCategory === 'doc' && document.kind === 'PDF') return false;
      if (selectedCategory === 'profile' && !document.module.includes('Hồ sơ')) return false;

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
  }, [documents, searchQuery, selectedCategory]);

  const viewerUrl = selectedDocument.kind === 'PDF'
    ? assetUrl ?? selectedDocument.externalUrl
    : null;

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalMinutes = documents.reduce((acc, doc) => acc + (doc.readTimeMinutes ?? 0), 0);
    const readCount = documents.reduce((acc, doc) => acc + (readDocumentIds.has(doc.id) ? 1 : 0), 0);

    return {
      totalDocs,
      totalMinutes,
      readCount,
    };
  }, [documents, readDocumentIds]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32 lg:max-w-none">
      {/* 1. Hero Section */}
      <DocumentHero totalCount={documents.length} />

      {/* 2. Card Thống kê tài liệu */}
      <DocumentStats stats={stats} />

      {/* 3 & 4. Sticky Search & Filter Bar */}
      <div className="sticky top-[68px] z-30 space-y-2 rounded-[20px] bg-[#fffaf3]/95 p-2 backdrop-blur-md transition-all border border-[#eedecf]/80 shadow-2xs">
        <DocumentSearchAndFilter query={searchQuery} onQueryChange={setSearchQuery} />
        <DocumentCategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <div className="space-y-3 lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-4 lg:space-y-0">
        {/* 5. Danh sách tài liệu */}
        <div className="space-y-3">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <DocumentCardItem
                key={doc.id}
                document={doc}
                isSelected={selectedDocument.id === doc.id}
                isRead={readDocumentIds.has(doc.id)}
                onSelect={onSelectDocument}
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

        <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 lg:sticky lg:top-[84px] lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">Trình xem tài liệu</p>
              <h3 className="mt-1 text-base font-black text-[#172033]">{selectedDocument.title}</h3>
            </div>
            {selectedDocument.kind === 'PDF' && viewerUrl && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
                Đang xem trong app
              </span>
            )}
            {selectedDocument.kind !== 'PDF' && !assetUrl && selectedDocument.externalUrl && (
              <a href={selectedDocument.externalUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50">Mở tài liệu</a>
            )}
          </div>
          {isAssetLoading && <p className="mt-3 text-sm text-[#5f6b7c]">Đang tạo liên kết xem tài liệu…</p>}
          {assetError && <p className="mt-3 text-sm font-semibold text-red-700">{assetError}</p>}
          {selectedDocument.kind === 'PDF' && viewerUrl ? (
            <iframe
              title={`Trình xem PDF: ${selectedDocument.title}`}
              src={viewerUrl}
              className="mt-3 h-[32rem] w-full rounded-xl border border-[#e8dccb] bg-white lg:h-[min(70vh,48rem)]"
            />
          ) : selectedDocument.kind !== 'PDF' && selectedDocument.contentMarkdown ? (
            <div ref={documentContentRef} onMouseUp={captureSelectedText} onKeyUp={captureSelectedText} tabIndex={0} className="mt-3 max-h-[32rem] overflow-y-auto rounded-xl border border-[#e8dccb] bg-white p-4 text-sm leading-7 whitespace-pre-wrap text-[#334155] outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
              {selectedDocument.contentMarkdown}
            </div>
          ) : !isAssetLoading && !assetError && (
            <p className="mt-3 rounded-xl bg-white p-4 text-sm text-[#5f6b7c]">Tài liệu này chưa có bản xem trực tuyến.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">Ghi chú riêng</p><h3 className="mt-1 text-base font-black text-[#172033]">{selectedDocument.title}</h3></div><span className="text-xs font-bold text-[#95a0af]">{annotations.length} ghi chú</span></div>
        {selectedText && <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">Đoạn đã chọn: “{selectedText.text}”</p>}
        <form onSubmit={handleSaveNote} className="mt-3 flex flex-col gap-2">
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi lại điểm cần nhớ…" className="min-h-20 w-full rounded-xl border border-[#e8dccb] bg-white px-3 py-2 text-sm text-[#172033] outline-none focus:border-orange-400" />
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
                    noteColor === color.id ? 'scale-110 ring-2 ring-orange-400 ring-offset-2' : 'opacity-70 hover:opacity-100',
                  )}
                />
              ))}
            </div>
            <button type="submit" disabled={!note.trim() || isSavingNote} className="rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 sm:ml-auto">{isSavingNote ? 'Đang lưu…' : 'Lưu ghi chú'}</button>
          </div>
        </form>
        {annotationError && <p className="mt-2 text-xs font-semibold text-red-700">{annotationError}</p>}
        {annotations.length > 0 && <ul className="mt-3 space-y-2">{annotations.map((annotation) => <li key={annotation.id} className={cn('rounded-xl border-l-4 bg-[#fffdf8] px-3 py-2 text-sm text-[#5f6b7c]', annotation.color === 'yellow' ? 'border-yellow-300' : annotation.color === 'green' ? 'border-green-300' : annotation.color === 'blue' ? 'border-blue-300' : 'border-pink-300')}><div className="flex items-start justify-between gap-3"><div>{annotation.selectedText && <p className="mb-1 text-xs font-bold text-orange-800">“{annotation.selectedText}”</p>}<p>{annotation.note}</p></div><div className="flex shrink-0 gap-2 text-xs font-bold"><button type="button" onClick={() => { setEditingAnnotation(annotation); setEditDraft(annotation.note); }} className="rounded-lg px-2 py-2 text-orange-700 hover:bg-orange-50">Sửa</button><button type="button" onClick={() => setDeletingAnnotation(annotation)} className="rounded-lg px-2 py-2 text-red-700 hover:bg-red-50">Xóa</button></div></div></li>)}</ul>}
      </section>

      {/* Bottom sheet sửa / xóa ghi chú */}
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
              className="w-full rounded-t-[28px] border-t border-orange-200/90 bg-[#fffaf5] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(15,23,42,0.25)]"
            >
              <span aria-hidden="true" className="mx-auto block h-1.5 w-10 rounded-full bg-[#e8dccb]" />
              {editingAnnotation ? (
                <>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">Sửa ghi chú</p>
                      <h4 id="annotation-sheet-title" className="mt-0.5 font-[var(--font-heading)] text-lg font-black text-[#172033]">{selectedDocument.title}</h4>
                    </div>
                    <button type="button" onClick={closeAnnotationSheet} aria-label="Đóng" className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-white text-[#7b8796] hover:text-[#d83a00]">✕</button>
                  </div>
                  {editingAnnotation.selectedText && <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">“{editingAnnotation.selectedText}”</p>}
                  <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} placeholder="Ghi lại điểm cần nhớ…" className="mt-3 min-h-24 w-full rounded-xl border border-[#e8dccb] bg-white px-3 py-2 text-sm text-[#172033] outline-none focus:border-orange-400" />
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={closeAnnotationSheet} className="min-h-11 flex-1 rounded-xl border border-[#e8dccb] bg-white px-4 text-sm font-bold text-[#5f6b7c] hover:bg-orange-50">Hủy</button>
                    <button type="button" disabled={!editDraft.trim() || isSavingNote} onClick={() => void handleSaveEditedNote()} className="min-h-11 flex-1 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white disabled:opacity-50">{isSavingNote ? 'Đang lưu…' : 'Lưu ghi chú'}</button>
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
                    <button type="button" onClick={closeAnnotationSheet} className="min-h-11 flex-1 rounded-xl border border-[#e8dccb] bg-white px-4 text-sm font-bold text-[#5f6b7c] hover:bg-orange-50">Hủy</button>
                    <button type="button" onClick={() => void handleConfirmDelete()} className="min-h-11 flex-1 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Xóa</button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CourseGameCard {
  type: CourseGameType;
  title: string;
  description: string;
  rounds: number;
  duration: string;
  icon: LucideIcon;
  /** Cặp màu riêng từng game (class tĩnh — Tailwind không nhận class động) */
  accent: 'sky' | 'amber' | 'purple' | 'emerald';
}

const gameAccentStyles = {
  sky: { icon: 'bg-sky-50 text-sky-600 border-sky-200', hover: 'hover:border-sky-300', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  amber: { icon: 'bg-amber-50 text-amber-600 border-amber-200', hover: 'hover:border-amber-300', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  purple: { icon: 'bg-purple-50 text-purple-600 border-purple-200', hover: 'hover:border-purple-300', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  emerald: { icon: 'bg-emerald-50 text-emerald-600 border-emerald-200', hover: 'hover:border-emerald-300', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
} as const;

function getAvailableCourseGames(vocabulary: CourseVocabularyItem[]): CourseGameCard[] {
  if (vocabulary.length < 4) return [];
  return [
    { type: 'flappy-vocab', title: 'Flappy Vocab', description: 'Bay qua thử thách và chọn đúng nghĩa của từ trong khóa học.', rounds: vocabulary.length, duration: '2 phút', icon: Bird, accent: 'sky' },
    { type: 'vocab-sprint', title: 'Vocab Sprint', description: 'Chọn nghĩa đúng thật nhanh để củng cố nhóm từ vừa học.', rounds: vocabulary.length, duration: '1 phút', icon: BrainCircuit, accent: 'amber' },
    { type: 'memory-match', title: 'Memory Match', description: 'Ghép mặt chữ và nghĩa từ vựng đã xuất bản trong khóa học.', rounds: vocabulary.length, duration: '3 phút', icon: CheckCircle2, accent: 'purple' },
    { type: 'word-builder', title: 'Word Builder', description: 'Xếp chữ romaji theo nghĩa từ vựng của khóa học.', rounds: vocabulary.length, duration: '3 phút', icon: ClipboardCheck, accent: 'emerald' },
  ];
}

interface GamesPanelProps {
  courseId: string;
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
}

export function GamesPanel({ courseId, courseTitle, vocabulary }: GamesPanelProps) {
  const navigate = useNavigate();
  const games = useMemo(() => getAvailableCourseGames(vocabulary), [vocabulary]);

  const handlePlayGameType = (gameType: CourseGameType) => {
    navigate(`/app/game/${gameType}?courseId=${encodeURIComponent(courseId)}`);
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32">
      <header className="relative overflow-hidden rounded-2xl border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5">
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full border-[1.1rem] border-orange-200/35" aria-hidden="true" />
        <p className="relative text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">Game từ nội dung khóa học</p>
        <h2 className="relative mt-1 font-[var(--font-heading)] text-xl font-black text-[#172033]">Luyện phản xạ: {courseTitle}</h2>
        <p className="relative mt-2 text-sm text-[#5f6b7c]">Mỗi game chỉ dùng {vocabulary.length} từ vựng đã xuất bản. XP được máy chủ xác nhận, không lấy điểm từ trình duyệt.</p>
      </header>
      {games.length === 0 ? (
        <p className={emptyStateClass}>Khóa học cần ít nhất 4 từ vựng đã xuất bản để mở game.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {games.map((game) => {
            const Icon = game.icon;
            const styles = gameAccentStyles[game.accent];
            return (
              <article key={game.type} className={`group flex flex-col rounded-2xl border border-[#e8dccb] bg-white p-4 transition-all duration-200 hover:shadow-md ${styles.hover}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${styles.icon}`}>
                    <Icon size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-[#172033]">{game.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[#5f6b7c]">{game.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${styles.badge}`}>{game.rounds} từ</span>
                  <span className="rounded-full border border-[#e8dccb] bg-[#fffaf3] px-2.5 py-0.5 text-[11px] font-black text-[#7b8796]">⏱ {game.duration}</span>
                </div>
                <button type="button" onClick={() => handlePlayGameType(game.type)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-sm font-black text-white shadow-xs transition-all hover:brightness-110 active:scale-95">
                  <Play size={15} fill="currentColor" /> Bắt đầu
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ExamsPanelProps {
  exams: CourseExamItem[];
  onStartExam: (examId: string) => void;
}

export function ExamsPanel({ exams, onStartExam }: ExamsPanelProps) {
  const statusLabels = {
    ready: 'Sẵn sàng',
    in_progress: 'Đang làm dở',
    completed: 'Đã hoàn thành',
    locked: 'Chưa mở khóa',
  } satisfies Record<CourseExamItem['status'], string>;
  const completedExams = exams.filter((exam) => exam.status === 'completed');
  const inProgressExam = exams.find((exam) => exam.status === 'in_progress');
  const recentExam = completedExams[completedExams.length - 1];

  return (
    <div className="course-exam-dashboard review-practice-page is-embedded course-exam-practice-page">
      <div className="review-practice-glow review-practice-glow-one" />
      <div className="review-practice-glow review-practice-glow-two" />

      <header className="course-exam-hero">
        <div className="course-exam-hero-icon"><ClipboardCheck size={30} aria-hidden="true" focusable="false" /></div>
        <div>
          <p className="course-exam-hero-eyebrow">Tokutei Foundation Sprint</p>
          <h1>THI THỬ TOKUTEI</h1>
          <p>Luyện đề – Làm quen áp lực – Tăng tự tin</p>
        </div>
        <div className="course-exam-hero-sakura" aria-hidden="true">✦</div>
      </header>

      {inProgressExam && (
        <section className="course-exam-continue" aria-label="Tiếp tục bài đang làm">
          <div className="course-exam-section-kicker"><Headphones size={16} aria-hidden="true" focusable="false" /> Tiếp tục bài đang làm <span>✦</span></div>
          <div className="course-exam-continue-body">
            <div className="course-exam-continue-icon"><Headphones size={26} aria-hidden="true" focusable="false" /></div>
            <div className="course-exam-continue-copy">
              <h2>{inProgressExam.title}</h2>
              <div className="course-exam-continue-meta">
                <span><Clock3 size={16} aria-hidden="true" focusable="false" /> {inProgressExam.duration}</span>
                {inProgressExam.latestScore !== undefined && <span><BarChart3 size={16} aria-hidden="true" focusable="false" /> Tiến độ <strong>{inProgressExam.latestScore}%</strong></span>}
              </div>
              {inProgressExam.latestScore !== undefined && (
                <div className="course-exam-progress" aria-label={`Tiến độ ${inProgressExam.latestScore}%`}>
                  <span style={{ width: `${inProgressExam.latestScore}%` }} />
                </div>
              )}
            </div>
            <button type="button" onClick={() => onStartExam(inProgressExam.id)} className={cn('course-exam-continue-button', focusRing)}>
              Tiếp tục <ChevronRight size={20} aria-hidden="true" focusable="false" />
            </button>
          </div>
        </section>
      )}

      <section className="course-exam-list-section" aria-label="Danh sách đề thi trong khóa học">
        <div className="course-exam-list-heading">
          <h2><ClipboardCheck size={22} aria-hidden="true" focusable="false" /> Danh sách đề thi</h2>
          <span>{exams.length} đề</span>
        </div>

        <div className="course-exam-card-grid">
          {exams.map((exam, index) => {
            const isLocked = exam.status === 'locked';
            return (
            <article key={exam.id} className={cn('course-exam-card', `is-${exam.status}`)}>
              <div className="course-exam-card-heading">
                <span className="course-exam-card-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="course-exam-card-status-icon">
                  {exam.status === 'completed' ? <CheckCircle2 size={21} aria-hidden="true" focusable="false" /> : exam.status === 'in_progress' ? <Headphones size={21} aria-hidden="true" focusable="false" /> : exam.status === 'locked' ? <Lock size={21} aria-hidden="true" focusable="false" /> : <ClipboardCheck size={21} aria-hidden="true" focusable="false" />}
                </span>
              </div>
              <div className="course-exam-card-content">
                <h2>{exam.title}</h2>
                <div className="course-exam-card-meta">
                  <span><Clock3 size={14} /> {exam.duration}</span>
                  {exam.status === 'in_progress' && exam.latestScore !== undefined && <span>Tiến độ <strong>{exam.latestScore}%</strong></span>}
                  {exam.status === 'completed' && exam.latestScore !== undefined && <span>Điểm cao nhất <strong>{exam.latestScore}%</strong></span>}
                  {isLocked && exam.unlockLabel && <span><Lock size={14} /> {exam.unlockLabel}</span>}
                </div>
                <span className="course-exam-status">{statusLabels[exam.status]}</span>
              </div>
              <button
                type="button"
                onClick={() => onStartExam(exam.id)}
                disabled={isLocked}
                className={cn('course-exam-start', focusRing)}
                aria-label={isLocked ? `Đề ${exam.title} chưa mở khóa` : exam.status === 'completed' ? `Làm lại đề ${exam.title}` : exam.status === 'in_progress' ? `Tiếp tục đề ${exam.title}` : `Làm đề ${exam.title}`}
              >
                <span>{isLocked ? 'Đang khóa' : exam.status === 'completed' ? 'Làm lại' : exam.status === 'in_progress' ? 'Tiếp tục' : 'Làm đề ngay'}</span>
                {isLocked ? <Lock size={15} aria-hidden="true" focusable="false" /> : <Play size={15} fill="currentColor" aria-hidden="true" focusable="false" />}
              </button>
            </article>
            );
          })}
        </div>
      </section>

      <div className="course-exam-stats" aria-label="Tổng quan đề thi">
        <div><span className="review-summary-icon review-summary-icon-red"><ClipboardCheck size={15} /></span><strong>{exams.length}</strong><small>đề trong khóa</small></div>
        <div><span className="review-summary-icon review-summary-icon-blue"><Clock3 size={15} /></span><strong>{exams[0]?.duration ?? '—'}</strong><small>đề khởi động</small></div>
        <div><span className="review-summary-icon review-summary-icon-gold"><Award size={15} /></span><strong>{completedExams.length}</strong><small>đã hoàn thành</small></div>
      </div>

      {recentExam?.latestScore !== undefined && (
        <section className="course-exam-recent" aria-label="Kết quả gần đây">
          <div className="course-exam-recent-heading"><h2><BarChart3 size={20} aria-hidden="true" focusable="false" /> Kết quả gần đây</h2><span>Hoàn thành</span></div>
          <div className="course-exam-recent-body">
            <div className={cn('course-exam-score-ring', recentExam.latestScore >= 80 && 'is-gold')} style={{ '--score': `${recentExam.latestScore}%` } as CSSProperties}><strong>{recentExam.latestScore}%</strong><small>{recentExam.latestScore >= 80 ? 'Xuất sắc' : 'Điểm cao nhất'}</small></div>
            <div className="course-exam-recent-copy"><h3>{recentExam.title}</h3><p><Clock3 size={15} aria-hidden="true" focusable="false" /> {recentExam.duration}</p><span><CheckCircle2 size={15} aria-hidden="true" focusable="false" /> Hoàn thành</span></div>
          </div>
        </section>
      )}
    </div>
  );
}

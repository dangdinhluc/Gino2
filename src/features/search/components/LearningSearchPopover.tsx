import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Languages, Search, X } from 'lucide-react';
import { searchLearningContent, type GlobalSearchResult } from '@/src/features/search/repositories/globalSearchRepository';

interface LearningSearchPopoverProps {
  open: boolean;
  onClose: () => void;
}

function ResultIcon({ type }: { type: string }) {
  if (type === 'vocabulary' || type === 'grammar') return <Languages aria-hidden="true" size={18} />;
  if (type === 'document') return <FileText aria-hidden="true" size={18} />;
  return <BookOpen aria-hidden="true" size={18} />;
}

function typeLabel(type: string): string {
  return { course: 'Khóa học', lesson: 'Bài học', vocabulary: 'Từ vựng', grammar: 'Ngữ pháp', document: 'Tài liệu' }[type] ?? 'Nội dung học';
}

export function LearningSearchPopover({ open, onClose }: LearningSearchPopoverProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (term: string): Promise<void> => {
    const normalized = term.trim().slice(0, 120);
    const requestId = ++requestIdRef.current;
    if (normalized.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const nextResults = await searchLearningContent(normalized);
      if (requestId === requestIdRef.current) setResults(nextResults);
    } catch (reason) {
      if (requestId === requestIdRef.current) setError(reason instanceof Error ? reason.message : 'Không tìm kiếm được nội dung.');
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      requestIdRef.current += 1;
      setQuery('');
      setResults([]);
      setError(null);
      setIsLoading(false);
      if (returnFocusRef.current) {
        returnFocusRef.current.focus();
        returnFocusRef.current = null;
      }
      return undefined;
    }

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const searchTimer = window.setTimeout(() => void runSearch(query), 220);
    return () => window.clearTimeout(searchTimer);
  }, [open, query, runSearch]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const hasEnoughQuery = query.trim().length >= 2;

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    void runSearch(query);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#3b2119]/35 backdrop-blur-[2px] sm:items-center sm:px-0"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-search-title"
        className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-orange-200/90 bg-[#fffaf5] shadow-[0_24px_80px_rgba(87,43,37,0.28)] sm:mx-auto sm:max-h-[min(78dvh,680px)] sm:w-full sm:max-w-2xl sm:rounded-[28px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span aria-hidden="true" className="mx-auto mt-2.5 block h-1.5 w-10 shrink-0 rounded-full bg-[#e8dccb] sm:hidden" />
        <header className="border-b border-[#f2e3d3] bg-gradient-to-br from-[#fffaf5] via-[#fff7ef] to-[#ffecd9] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#d83a00]">
                <Search aria-hidden="true" size={13} /> Tìm nhanh trong bài học
              </p>
              <h2 id="learning-search-title" className="mt-1 font-[var(--font-heading)] text-xl font-black tracking-tight text-[#172033] sm:text-2xl">Tìm nội dung học</h2>
              <p id="learning-search-hint" className="mt-1 text-xs font-semibold text-[#7b8796]">Khóa học, bài học, từ vựng, ngữ pháp và tài liệu anh được phép học.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Đóng tìm kiếm" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-orange-200 bg-white/80 text-[#7b8796] transition-colors hover:border-orange-400 hover:text-[#d83a00]">
              <X aria-hidden="true" size={17} />
            </button>
          </div>

          <form onSubmit={submit} className="mt-4">
            <label className="flex items-center gap-2 rounded-2xl border border-orange-200/90 bg-white px-3.5 py-3 shadow-2xs transition-colors focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
              <Search aria-hidden="true" className="shrink-0 text-[#d83a00]" size={19} />
              <span className="sr-only">Từ khóa tìm kiếm</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ví dụ: vệ sinh, 〜ながら, 介護"
                aria-describedby="learning-search-hint"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#172033] outline-none placeholder:font-semibold placeholder:text-[#a3aab5]"
              />
              {hasQuery && <button type="button" onClick={() => setQuery('')} aria-label="Xóa từ khóa" className="rounded-lg p-1 text-[#8c97a8] hover:bg-orange-50 hover:text-[#d83a00]"><X aria-hidden="true" size={15} /></button>}
              <kbd className="hidden shrink-0 rounded-lg border border-[#e8dccb] bg-[#fffaf5] px-2 py-1 text-[10px] font-black text-[#95a0af] sm:inline-block">⌘ K</kbd>
            </label>
          </form>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {isLoading && <div role="status" aria-live="polite" className="space-y-3"><span className="sr-only">Đang tìm kiếm…</span>{[1, 2, 3].map((item) => <div key={item} className="flex animate-pulse items-center gap-3 rounded-2xl border border-[#f2e6d9] bg-white p-3"><span className="h-10 w-10 rounded-xl bg-orange-100" /><span className="min-w-0 flex-1 space-y-2"><span className="block h-3 w-24 rounded-full bg-orange-100" /><span className="block h-3 w-3/4 rounded-full bg-[#f2e6d9]" /></span></div>)}</div>}

          {!isLoading && error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

          {!isLoading && !error && !hasEnoughQuery && <div className="grid place-items-center rounded-2xl border border-dashed border-[#dfd0c0] bg-[#fffdf8] px-5 py-12 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]"><Search aria-hidden="true" size={22} /></span><h3 className="mt-4 font-black text-[#172033]">Bắt đầu tìm kiếm</h3><p className="mt-1 max-w-sm text-xs font-semibold leading-5 text-[#7b8796]">Nhập ít nhất 2 ký tự để tìm trong nội dung đã được công bố cho tài khoản của anh.</p></div>}

          {!isLoading && !error && hasEnoughQuery && results.length === 0 && <div role="status" className="grid place-items-center rounded-2xl border border-dashed border-[#dfd0c0] bg-[#fffdf8] px-5 py-12 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]"><Search aria-hidden="true" size={22} /></span><h3 className="mt-4 font-black text-[#172033]">Chưa thấy kết quả phù hợp</h3><p className="mt-1 max-w-sm text-xs font-semibold leading-5 text-[#7b8796]">Thử từ khóa khác hoặc tìm bằng tiếng Nhật để có kết quả chính xác hơn.</p></div>}

          {!isLoading && !error && results.length > 0 && <div className="space-y-2" role="list" aria-label="Kết quả tìm kiếm">{results.map((result) => <Link key={`${result.result_type}-${result.id}`} to={result.route} onClick={onClose} role="listitem" className="group flex items-start gap-3 rounded-2xl border border-transparent bg-white p-3 transition-all hover:border-orange-200 hover:bg-[#fff7ef] hover:shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-400"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-200/70 bg-orange-50 text-[#d83a00] transition-transform group-hover:scale-105"><ResultIcon type={result.result_type} /></span><span className="min-w-0 flex-1"><span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#a0785f]">{typeLabel(result.result_type)}</span><strong className="mt-1 block truncate text-sm font-black text-[#172033] group-hover:text-[#d83a00]">{result.title}</strong><span className="mt-1 block line-clamp-2 text-xs font-semibold leading-5 text-[#7b8796]">{result.subtitle}</span></span><span className="mt-3 shrink-0 text-[#b5a494] transition-colors group-hover:text-[#d83a00]">→</span></Link>)}</div>}
        </div>

        <footer className="flex items-center justify-between border-t border-[#f2e3d3] bg-[#fffdf9] px-4 py-3 text-[10px] font-bold text-[#95a0af] sm:px-5">
          <span>Enter để tìm · Esc để đóng</span>
          <span>{hasEnoughQuery ? `${results.length} kết quả` : 'Tìm kiếm học tập'}</span>
        </footer>
      </section>
    </div>
  );
}

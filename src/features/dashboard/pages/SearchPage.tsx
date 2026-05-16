import { useDeferredValue, useMemo, useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search as SearchIcon,
  Sparkles,
  BookOpen,
  Bookmark,
  GraduationCap,
  Layout,
  Gamepad2,
  ChevronRight,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { COURSES } from '@/src/features/courses/mock/courses';
import { EXAMS } from '@/src/features/exams/mock/exams';
import { GRAMMAR } from '@/src/features/grammar/mock/grammar';
import { grammarTopics, vocabularyEntries } from '@/src/data/phaseTwoMock';
import { gameShells } from '@/src/data/phaseOneMock';

type ResultCategory = 'course' | 'exam' | 'grammar' | 'vocab' | 'game';

interface SearchResult {
  id: string;
  category: ResultCategory;
  title: string;
  subtitle: string;
  description?: string;
  to: string;
  badge?: string;
}

const CATEGORY_META: Record<
  ResultCategory,
  { label: string; tone: string; icon: LucideIcon }
> = {
  course: { label: 'Khóa học', tone: 'orange', icon: Layout },
  exam: { label: 'Luyện thi', tone: 'amber', icon: GraduationCap },
  grammar: { label: 'Ngữ pháp', tone: 'violet', icon: BookOpen },
  vocab: { label: 'Từ vựng', tone: 'blue', icon: Bookmark },
  game: { label: 'Mini game', tone: 'pink', icon: Gamepad2 },
};

const TONE_STYLES: Record<string, { chip: string; icon: string }> = {
  orange: { chip: 'bg-orange-50 text-orange-700 border-orange-100', icon: 'bg-orange-50 text-orange-600 border-orange-100' },
  amber: { chip: 'bg-amber-50 text-amber-700 border-amber-100', icon: 'bg-amber-50 text-amber-600 border-amber-100' },
  violet: { chip: 'bg-violet-50 text-violet-700 border-violet-100', icon: 'bg-violet-50 text-violet-600 border-violet-100' },
  blue: { chip: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'bg-blue-50 text-blue-600 border-blue-100' },
  pink: { chip: 'bg-pink-50 text-pink-700 border-pink-100', icon: 'bg-pink-50 text-pink-600 border-pink-100' },
};

const QUICK_QUERIES = [
  'phỏng vấn',
  'tự giới thiệu',
  'an toàn',
  'báo cáo',
  'hồ sơ',
  'shadowing',
  'JFT',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function buildIndex(): SearchResult[] {
  const items: SearchResult[] = [];

  for (const course of COURSES) {
    items.push({
      id: `course-${course.id}`,
      category: 'course',
      title: course.title,
      subtitle: course.level,
      description: course.description,
      badge: `${course.totalLessons} bài`,
      to: `/app/courses/${course.id}`,
    });
  }

  for (const exam of EXAMS) {
    items.push({
      id: `exam-${exam.id}`,
      category: 'exam',
      title: exam.title,
      subtitle: exam.type,
      description: exam.skills.join(' · '),
      to: `/app/exams/${exam.id}/start`,
    });
  }

  for (const lesson of GRAMMAR) {
    items.push({
      id: `grammar-${lesson.id}`,
      category: 'grammar',
      title: lesson.title,
      subtitle: `${lesson.level} · ${lesson.category}`,
      to: `/app/grammar/${lesson.id}`,
    });
  }

  for (const topic of grammarTopics) {
    items.push({
      id: `grammar-topic-${topic.id}`,
      category: 'grammar',
      title: topic.title,
      subtitle: `${topic.level} · ${topic.category}`,
      description: topic.summary,
      to: `/app/grammar/${topic.id}`,
    });
  }

  for (const word of vocabularyEntries) {
    items.push({
      id: `vocab-${word.id}`,
      category: 'vocab',
      title: word.word,
      subtitle: `${word.level} · ${word.meaning}`,
      description: word.examples[0]?.vi,
      to: `/app/vocabulary/${word.id}`,
    });
  }

  for (const game of gameShells) {
    items.push({
      id: `game-${game.id}`,
      category: 'game',
      title: game.title,
      subtitle: game.level,
      description: game.sub,
      to: `/app/hub/${game.id}`,
    });
  }

  return items;
}

const FILTERS: Array<{ key: 'all' | ResultCategory; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'course', label: 'Khóa học' },
  { key: 'exam', label: 'Đề thi' },
  { key: 'grammar', label: 'Ngữ pháp' },
  { key: 'vocab', label: 'Từ vựng' },
  { key: 'game', label: 'Mini game' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ResultCategory>('all');
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(buildIndex, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const raw = deferredQuery.trim();
    if (!raw) return [] as SearchResult[];
    const needles = normalize(raw).split(/\s+/).filter(Boolean);
    return index
      .map((item) => {
        const haystack = normalize([item.title, item.subtitle, item.description ?? ''].join(' '));
        const matchedAll = needles.every((needle) => haystack.includes(needle));
        if (!matchedAll) return null;
        const titleHit = normalize(item.title).includes(needles[0] ?? '');
        const score = (titleHit ? 0 : 1) + (item.description ? 0 : 0.2);
        return { item, score };
      })
      .filter((entry): entry is { item: SearchResult; score: number } => entry !== null)
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.item)
      .filter((item) => filter === 'all' || item.category === filter);
  }, [deferredQuery, index, filter]);

  const groupedResults = useMemo(() => {
    const groups = new Map<ResultCategory, SearchResult[]>();
    for (const item of results) {
      const current = groups.get(item.category) ?? [];
      current.push(item);
      groups.set(item.category, current);
    }
    return groups;
  }, [results]);

  const hasQuery = deferredQuery.trim().length > 0;
  const totalCount = results.length;

  return (
    <div className="space-y-5 pb-16 md:space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.96)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_24px_60px_-44px_rgba(180,138,91,0.22)] md:rounded-[2.25rem] md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-500 md:text-[11px]">
              <Sparkles size={12} /> Tìm kiếm
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 md:text-[11px]">
              {index.length} mục có thể tìm
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
            Tìm khóa, đề thi, ngữ pháp hay từ vựng đang cần ôn
          </h1>

          <div className="relative">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-orange-400"
            />
            <input
              ref={inputRef}
              type="search"
              autoComplete="off"
              inputMode="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: phỏng vấn, an toàn, tự giới thiệu, JFT..."
              className="w-full rounded-2xl border border-[#e1d8cb] bg-white/95 py-3.5 pl-12 pr-12 text-sm font-semibold text-gray-800 shadow-sm outline-none transition-all focus:border-orange-200 focus:ring-2 focus:ring-orange-100"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Xóa từ khóa"
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition-colors hover:bg-orange-100"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {!hasQuery && (
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUERIES.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setQuery(quick)}
                  className="rounded-full border border-[#e1d8cb] bg-white px-3 py-1.5 text-[11px] font-bold text-gray-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                >
                  {quick}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-2.5 shadow-[0_18px_40px_-34px_rgba(148,163,184,0.18)] md:rounded-[1.75rem] md:p-3">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTERS.map((option) => {
            const isActive = filter === option.key;
            const count =
              option.key === 'all'
                ? results.length
                : results.filter((item) => item.category === option.key).length;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-black transition-all',
                  isActive
                    ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'border-[#e6ddd1] bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                )}
              >
                <span>{option.label}</span>
                {hasQuery && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px]',
                      isActive ? 'bg-white/20 text-white' : 'bg-orange-50 text-orange-500'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {!hasQuery ? (
        <EmptyState
          title="Gõ thử một từ khóa"
          body="Tìm kiếm sẽ chạy ngay khi anh gõ. Có thể tìm theo tên khóa học, đề thi, cụm ngữ pháp hoặc từ vựng."
        />
      ) : totalCount === 0 ? (
        <EmptyState
          title={`Không có kết quả cho "${query.trim()}"`}
          body="Thử rút gọn từ khóa hoặc đổi sang bộ lọc khác. Anh cũng có thể thử một trong các gợi ý nhanh phía trên."
        />
      ) : (
        <div className="space-y-5 md:space-y-6">
          <AnimatePresence initial={false}>
            {(['course', 'exam', 'grammar', 'vocab', 'game'] as const).map((category) => {
              const items = groupedResults.get(category) ?? [];
              if (items.length === 0) return null;
              const meta = CATEGORY_META[category];
              const tone = TONE_STYLES[meta.tone];
              const Icon = meta.icon;
              return (
                <motion.section
                  key={category}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="space-y-3"
                >
                  <header className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex h-8 w-8 items-center justify-center rounded-xl border',
                          tone.icon,
                        )}
                      >
                        <Icon size={15} />
                      </span>
                      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-gray-700 md:text-base md:tracking-[0.18em]">
                        {meta.label}
                      </h2>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-500 ring-1 ring-[#e6ddd1]">
                      {items.length} kết quả
                    </span>
                  </header>

                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((entry) => {
                      const entryMeta = CATEGORY_META[entry.category];
                      const entryTone = TONE_STYLES[entryMeta.tone];
                      const EntryIcon = entryMeta.icon;
                      return (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                            <Link
                              to={entry.to}
                              className="group flex h-full items-start gap-3 rounded-2xl border border-[#e6ddd1] bg-[#fffaf3] p-3.5 shadow-[0_14px_32px_-28px_rgba(148,163,184,0.2)] transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:shadow-[0_20px_38px_-26px_rgba(249,115,22,0.32)]"
                            >
                              <span
                                className={cn(
                                  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg font-black shadow-sm',
                                  entryTone.icon,
                                )}
                              >
                                <EntryIcon size={16} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                  {entryMeta.label}
                                  {entry.badge ? (
                                    <span className="ml-2 font-bold text-gray-500">· {entry.badge}</span>
                                  ) : null}
                                </p>
                                <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-gray-900 transition-colors group-hover:text-orange-600">
                                  {renderHighlighted(entry.title, query)}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-xs font-semibold text-gray-500">
                                  {entry.subtitle}
                                </p>
                                {entry.description ? (
                                  <p className="mt-1 line-clamp-2 text-[11px] font-medium text-gray-400">
                                    {renderHighlighted(entry.description, query)}
                                  </p>
                                ) : null}
                              </div>
                              <ChevronRight
                                size={16}
                                className="mt-2 shrink-0 text-orange-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500"
                              />
                            </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#e1d8cb] bg-[#fffaf3]/70 px-5 py-12 text-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-white text-orange-400 shadow-sm">
        <SearchIcon size={20} />
      </div>
      <p className="mt-4 text-base font-black tracking-tight text-gray-800 md:text-lg">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-relaxed text-gray-500">{body}</p>
    </div>
  );
}

function renderHighlighted(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const needles = Array.from(new Set(trimmed.split(/\s+/).filter((part) => part.length > 0)));
  if (needles.length === 0) return text;
  const escaped = needles
    .map((needle) => needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const matcher = new RegExp(`(${escaped})`, 'gi');
  const exactMatcher = new RegExp(`^(?:${escaped})$`, 'i');
  const parts = text.split(matcher);
  return (
    <>
      {parts.map((part, index) => {
        const partKey = `${index}-${part}`;
        return exactMatcher.test(part) ? (
          <mark key={partKey} className="rounded bg-orange-100 px-0.5 text-orange-700">
            {part}
          </mark>
        ) : (
          <span key={partKey}>{part}</span>
        );
      })}
    </>
  );
}

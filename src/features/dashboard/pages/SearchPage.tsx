import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, FileText, GraduationCap, Layers, Search, Volume2, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TOKUTEI_TOPICS, getTopic, searchVocab } from '@/src/data/tokutei/vocabDeck';
import { grammarTopics } from '@/src/data/phaseTwoMock';
import { COURSES } from '@/src/features/courses/mock/courses';
import { cardStrength } from '@/src/features/review/lib/srs';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { speakJapanese } from '@/src/shared/lib/tts';

const SUGGESTIONS = ['houkoku', 'an toàn', '面接', 'chào', 'giấy tờ', 'kyuukei'];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';
const sectionTitleClass = 'font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]';
const resultCardClass =
  'group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] px-4 py-3 transition-colors hover:bg-[#fffdf8]';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const states = useReviewStore((state) => state.states);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const normalized = query.trim().toLowerCase();

  const vocabResults = useMemo(() => (normalized ? searchVocab(normalized).slice(0, 12) : []), [normalized]);
  const grammarResults = useMemo(
    () =>
      normalized
        ? grammarTopics.filter((topic) =>
            [topic.title, topic.summary, topic.category, ...topic.rules].some((field) => field.toLowerCase().includes(normalized)),
          )
        : [],
    [normalized],
  );
  const courseResults = useMemo(
    () =>
      normalized
        ? COURSES.filter((course) => [course.title, course.description, course.level].some((field) => field.toLowerCase().includes(normalized)))
        : [],
    [normalized],
  );

  const totalResults = vocabResults.length + grammarResults.length + courseResults.length;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-16">
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <div className="mx-auto max-w-xl space-y-4">
          <div>
            <h1 className={cn(sectionTitleClass, 'text-xl md:text-2xl')}>Tra cứu trong app</h1>
            <p className="mt-1 text-sm text-[#5f6b7c]">Gõ kanji, romaji hoặc tiếng Việt — kết quả gom từ vựng, ngữ pháp và khóa học.</p>
          </div>
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#95a0af]" strokeWidth={1.8} />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: houkoku, 報告, báo cáo..."
              className={cn(
                'w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-3 pl-11 pr-11 text-sm font-medium text-[#172033] outline-none transition-shadow placeholder:text-[#95a0af] focus:ring-2 focus:ring-orange-500',
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#95a0af] transition-colors hover:text-[#5f6b7c]"
                aria-label="Xóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {!normalized && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className={`rounded-lg border border-[#e8dccb] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#5f6b7c] transition-colors hover:border-orange-300 hover:text-orange-700 ${focusRing}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {!normalized && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Layers size={16} className="text-orange-700" strokeWidth={1.8} />
            <h2 className={sectionTitleClass}>Duyệt theo chủ đề</h2>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TOKUTEI_TOPICS.map((topic) => (
              <Link
                key={topic.id}
                to={`/app/review/flashcards?mode=topic:${topic.id}`}
                className={`group rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#172033]">{topic.label}</span>
                  <ChevronRight size={15} className="text-[#95a0af] transition-colors group-hover:text-orange-700" />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-[#7b8796]">{topic.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {normalized && totalResults === 0 && (
        <section className="rounded-2xl border border-dashed border-[#ddcfbc] bg-[#fffdf8] px-4 py-12 text-center">
          <p className="font-bold text-[#172033]">Không tìm thấy kết quả cho "{query}"</p>
          <p className="mt-1 text-sm text-[#7b8796]">Thử gõ romaji (houkoku) hoặc nghĩa tiếng Việt (báo cáo).</p>
        </section>
      )}

      {vocabResults.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <BookOpen size={16} className="text-orange-700" strokeWidth={1.8} />
            <h2 className={sectionTitleClass}>Từ vựng ({vocabResults.length})</h2>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {vocabResults.map((card) => {
              const strength = cardStrength(states[card.id]);
              return (
                <Link key={card.id} to={`/app/vocabulary/${card.id}`} className={resultCardClass}>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      speakJapanese(card.reading === card.word ? card.word : card.reading);
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100"
                    aria-label={`Nghe ${card.romaji}`}
                  >
                    <Volume2 size={15} strokeWidth={1.8} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span lang="ja" className="truncate font-bold text-[#172033]">{card.word}</span>
                      <span className="truncate text-[11px] italic text-[#95a0af]">{card.romaji}</span>
                    </div>
                    <div className="truncate text-xs text-[#7b8796]">{card.meaning} · {getTopic(card.topicId).label}</div>
                  </div>
                  <div className="hidden h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-[#efe5d7] sm:block">
                    <div
                      className={cn('h-full rounded-full', strength >= 70 ? 'bg-orange-700' : strength >= 35 ? 'bg-orange-400' : 'bg-[#d8ccbb]')}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <ChevronRight size={15} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {grammarResults.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <FileText size={16} className="text-orange-700" strokeWidth={1.8} />
            <h2 className={sectionTitleClass}>Ngữ pháp & tác phong ({grammarResults.length})</h2>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {grammarResults.map((topic) => (
              <Link key={topic.id} to={`/app/grammar/${topic.id}`} className={cn(resultCardClass, 'items-start')}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold text-[#172033]">{topic.title}</span>
                    <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">{topic.level}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#7b8796]">{topic.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {courseResults.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <GraduationCap size={16} className="text-orange-700" strokeWidth={1.8} />
            <h2 className={sectionTitleClass}>Khóa học ({courseResults.length})</h2>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {courseResults.map((course) => (
              <Link key={course.id} to={`/app/courses/${course.id}`} className={cn(resultCardClass, 'items-start')}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-bold text-[#172033]">{course.title}</span>
                    <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">{course.level}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#7b8796]">{course.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

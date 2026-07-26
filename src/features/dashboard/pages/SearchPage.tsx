import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ChevronRight, FileText, GraduationCap, Layers, Search, Volume2, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TOKUTEI_TOPICS, getTopic, searchVocab } from '@/src/data/tokutei/vocabDeck';
import { grammarTopics } from '@/src/data/phaseTwoMock';
import { COURSES } from '@/src/features/courses/mock/courses';
import { cardStrength } from '@/src/features/review/lib/srs';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { speakJapanese } from '@/src/shared/lib/tts';

const SUGGESTIONS = ['houkoku', 'an toàn', '面接', 'chào', 'giấy tờ', 'kyuukei'];

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
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 shadow-sm">
            <Search size={14} />
            Tìm kiếm
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Tra cứu mọi thứ trong app</h2>
          <p className="text-sm font-medium leading-relaxed text-gray-500">Gõ kanji, romaji hoặc tiếng Việt — kết quả gom từ vựng, ngữ pháp và khóa học.</p>
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: houkoku, 報告, báo cáo..."
              className="w-full rounded-[1.5rem] border border-[#e1d8cb] bg-white py-4 pl-13 pr-12 text-base font-bold outline-none transition-shadow focus:ring-2 focus:ring-orange-200"
              style={{ paddingLeft: '3.25rem' }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600"
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {!normalized && (
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-500 transition-all hover:border-orange-200 hover:text-orange-500"
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
            <Layers size={16} className="text-orange-500" />
            <h3 className="text-lg font-black tracking-tight text-gray-900">Duyệt theo chủ đề</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TOKUTEI_TOPICS.map((topic) => (
              <Link
                key={topic.id}
                to={`/app/review/flashcards?mode=topic:${topic.id}`}
                className="group rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.16)] transition-all hover:-translate-y-0.5 hover:border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-gray-900">{topic.label}</span>
                  <ChevronRight size={15} className="text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-gray-500">{topic.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {normalized && totalResults === 0 && (
        <section className="rounded-[2rem] border border-dashed border-[#dccfbe] bg-white/60 px-4 py-12 text-center">
          <p className="text-base font-black text-gray-700">Không tìm thấy kết quả cho "{query}"</p>
          <p className="mt-1 text-sm font-medium text-gray-400">Thử gõ romaji (houkoku) hoặc nghĩa tiếng Việt (báo cáo).</p>
        </section>
      )}

      {vocabResults.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <BookOpen size={16} className="text-orange-500" />
            <h3 className="text-lg font-black tracking-tight text-gray-900">Từ vựng ({vocabResults.length})</h3>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            {vocabResults.map((card, index) => {
              const strength = cardStrength(states[card.id]);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link
                    to={`/app/vocabulary/${card.id}`}
                    className="group flex items-center gap-3 rounded-[1.5rem] border border-[#eee5d8] bg-[#fffaf3] px-4 py-3 transition-all hover:border-orange-200 hover:bg-white"
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        speakJapanese(card.reading === card.word ? card.word : card.reading);
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500 transition-transform hover:scale-105"
                      aria-label={`Nghe ${card.romaji}`}
                    >
                      <Volume2 size={16} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span lang="ja" className="truncate text-base font-black text-gray-900">{card.word}</span>
                        <span className="truncate text-[11px] font-bold italic text-gray-400">{card.romaji}</span>
                      </div>
                      <div className="truncate text-xs font-bold text-gray-500">{card.meaning} · {getTopic(card.topicId).label}</div>
                    </div>
                    <div className="hidden h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[#efe7dc] sm:block">
                      <div
                        className={cn('h-full rounded-full', strength >= 70 ? 'bg-emerald-500' : strength >= 35 ? 'bg-amber-400' : 'bg-gray-300')}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                    <ChevronRight size={15} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {grammarResults.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <FileText size={16} className="text-blue-500" />
            <h3 className="text-lg font-black tracking-tight text-gray-900">Ngữ pháp & tác phong ({grammarResults.length})</h3>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            {grammarResults.map((topic) => (
              <Link
                key={topic.id}
                to={`/app/grammar/${topic.id}`}
                className="group rounded-[1.5rem] border border-[#eee5d8] bg-[#fffaf3] px-4 py-3.5 transition-all hover:border-blue-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-gray-900">{topic.title}</span>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-500">{topic.level}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-gray-500">{topic.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {courseResults.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <GraduationCap size={16} className="text-emerald-500" />
            <h3 className="text-lg font-black tracking-tight text-gray-900">Khóa học ({courseResults.length})</h3>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            {courseResults.map((course) => (
              <Link
                key={course.id}
                to={`/app/courses/${course.id}`}
                className="group rounded-[1.5rem] border border-[#eee5d8] bg-[#fffaf3] px-4 py-3.5 transition-all hover:border-emerald-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-gray-900">{course.title}</span>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">{course.level}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-gray-500">{course.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

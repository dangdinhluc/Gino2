import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronRight, Clock3, FileQuestion, Shuffle, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { FloatingAudioButton } from '@/src/features/games/components/FloatingAudioButton';

export interface PracticeSection {
  id: string;
  label: string;
  count: number;
}

interface PracticePageProps {
  embedded?: boolean;
  courseSections?: PracticeSection[];
}

type PracticeKind = 'vocabulary' | 'question';
type PracticeState = 'not_started' | 'in_progress' | 'completed';

type PracticeCardData = {
  id: string;
  kind: PracticeKind;
  title: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  questionCount: number;
  minutes: number;
  state: PracticeState;
  progress?: number;
  icon: string;
  iconTone: string;
  path: string;
};

const practiceCards: PracticeCardData[] = [
  { id: 'workplace-vocab', kind: 'vocabulary', title: 'Từ vựng Workplace cơ bản', difficulty: 'Dễ', questionCount: 20, minutes: 8, state: 'not_started', icon: '/assets/practice-icons/vocabulary-book.webp', iconTone: 'bg-[#eaf8e8]', path: '/app/review/flashcards?mode=cram&section=vocab-workplace' },
  { id: 'communication-vocab', kind: 'vocabulary', title: 'Từ vựng Giao tiếp cơ bản', difficulty: 'Trung bình', questionCount: 25, minutes: 10, state: 'in_progress', progress: 60, icon: '/assets/practice-icons/flashcards.webp', iconTone: 'bg-[#fff4d7]', path: '/app/review/flashcards?mode=cram&section=communication' },
  { id: 'advanced-vocab', kind: 'vocabulary', title: 'Từ vựng Nâng cao', difficulty: 'Khó', questionCount: 30, minutes: 12, state: 'completed', progress: 88, icon: '/assets/practice-icons/vocabulary-book.webp', iconTone: 'bg-[#e8f1ff]', path: '/app/review/flashcards?mode=cram&section=advanced-vocab' },
  { id: 'grammar-basic', kind: 'question', title: 'Ngữ pháp cơ bản', difficulty: 'Dễ', questionCount: 20, minutes: 8, state: 'not_started', icon: '/assets/practice-icons/worksheet-quiz.webp', iconTone: 'bg-[#f3edff]', path: '/app/review/flashcards?mode=cram&section=grammar-basic' },
  { id: 'reading', kind: 'question', title: 'Đọc hiểu văn bản', difficulty: 'Trung bình', questionCount: 15, minutes: 7, state: 'in_progress', progress: 40, icon: '/assets/practice-icons/guided-practice.webp', iconTone: 'bg-[#fff0e6]', path: '/app/exams' },
  { id: 'listening-dialogue', kind: 'question', title: 'Nghe hiểu hội thoại', difficulty: 'Khó', questionCount: 20, minutes: 10, state: 'completed', progress: 90, icon: '/assets/practice-icons/listening.webp', iconTone: 'bg-[#eaf3ff]', path: '/app/exams' },
];

const difficultyClass = {
  Dễ: 'text-emerald-600',
  'Trung bình': 'text-amber-600',
  Khó: 'text-rose-600',
};

function SectionHeading({ children, onViewAll }: { children: React.ReactNode; onViewAll?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-[var(--font-heading)] text-base font-extrabold tracking-[-0.02em] text-[#172033] sm:text-lg">{children}</h2>
      <button type="button" onClick={onViewAll} className="inline-flex min-h-8 shrink-0 items-center gap-0.5 text-xs font-bold text-[#d24a17] hover:text-[#af390d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
        Xem tất cả <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function ExerciseCard({ item, onStart }: { key?: React.Key; item: PracticeCardData; onStart: (item: PracticeCardData) => void | Promise<void> }) {
  return (
    <article className="flex min-h-[216px] flex-col rounded-[20px] border border-[#eee5d9] bg-white p-3 shadow-[0_3px_12px_rgba(63,45,24,0.04)]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconTone} p-1.5`}>
        <img src={item.icon} alt="" className="h-full w-full object-contain" />
      </div>
      <h3 className="mt-3 min-h-[40px] font-[var(--font-heading)] text-[13px] font-extrabold leading-snug text-[#172033] line-clamp-2 sm:text-sm">{item.title}</h3>
      <p className={`mt-1 text-[11px] font-extrabold ${difficultyClass[item.difficulty]}`}>{item.difficulty}</p>
      <p className="mt-1 text-[10px] font-semibold text-[#7c8796]">{item.questionCount} câu <span className="px-0.5">•</span> {item.minutes} phút</p>
      <div className="mt-auto pt-3">
        {item.state === 'not_started' && (
          <button type="button" onClick={() => onStart(item)} className="inline-flex min-h-8 w-full items-center justify-center gap-0.5 rounded-lg border border-[#e87643] px-1.5 text-[10px] font-extrabold text-[#d64a15] hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            Bắt đầu <ChevronRight size={12} aria-hidden="true" />
          </button>
        )}
        {item.state === 'in_progress' && (
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-[#d36421]"><span>Đang làm</span><span>{item.progress}%</span></div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#fae4d2]"><div className="h-full rounded-full bg-[#e56820]" style={{ width: `${item.progress}%` }} /></div>
          </div>
        )}
        {item.state === 'completed' && (
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600"><span className="inline-flex items-center gap-0.5"><Check size={11} aria-hidden="true" />Đã hoàn thành</span><span>{item.progress}%</span></div>
        )}
      </div>
    </article>
  );
}

export default function PracticePage({ embedded = false }: PracticePageProps) {
  const navigate = useNavigate();
  const streak = useProgressStore((state) => state.streak);
  const [selectedKind, setSelectedKind] = useState<'all' | PracticeKind>('vocabulary');

  const visibleSections = useMemo(() => {
    if (selectedKind === 'all') return [
      { kind: 'vocabulary' as const, title: 'Bài luyện từ vựng' },
      { kind: 'question' as const, title: 'Bài luyện câu hỏi' },
    ];
    return [{ kind: selectedKind, title: selectedKind === 'vocabulary' ? 'Bài luyện từ vựng' : 'Bài luyện câu hỏi' }];
  }, [selectedKind]);

  const goTo = (item: PracticeCardData) => navigate(item.path);

  return (
    <div className="mx-auto w-full max-w-[1080px] space-y-6 px-4 pb-32 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[24px] border border-[#f3dfcc] bg-[#fff0e3] p-5 shadow-[0_8px_24px_rgba(153,85,22,0.06)] sm:min-h-[156px] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#ffe3c5]" aria-hidden="true" />
        <div className="relative flex min-h-[116px] items-center justify-between gap-4">
          <div className="max-w-[52%] sm:max-w-[58%]">
            <h1 className="font-[var(--font-heading)] text-2xl font-extrabold tracking-[-0.035em] text-[#172033] sm:text-3xl">Luyện tập</h1>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#5f6b7c] sm:text-sm">Ôn tập từ vựng và làm câu hỏi<br className="hidden sm:block" /> để củng cố kiến thức mỗi ngày.</p>
          </div>
          <img src="/assets/practice-icons/hero-workbook.webp" alt="Sách bài tập, mục tiêu và bút chì" className="absolute -bottom-2 -right-2 w-[53%] max-w-[330px] object-contain sm:right-4 sm:w-[40%]" />
        </div>
      </section>

      <section className="rounded-[22px] border border-[#eee3d5] bg-white p-4 shadow-[0_4px_16px_rgba(63,45,24,0.04)] sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0df] p-1.5"><img src="/assets/practice-icons/flashcards.webp" alt="" className="h-full w-full object-contain" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#d24a17]">Tiếp tục luyện tập</p>
            <h2 className="mt-1 font-[var(--font-heading)] text-sm font-extrabold text-[#172033] sm:text-base">Ôn từ vựng tại nơi làm việc</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-[#748092]"><span className="font-bold text-[#d85a1a]">Từ vựng</span><span>12 / 20 câu</span><span className="inline-flex items-center gap-0.5"><Clock3 size={11} aria-hidden="true" />5 phút còn lại</span></div>
            <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f7e6d8]"><div className="h-full w-[60%] rounded-full bg-[#df5319]" /></div><span className="text-[11px] font-extrabold text-[#cc4917]">60%</span></div>
          </div>
          <button type="button" onClick={() => navigate('/app/review/flashcards?mode=cram&session=workplace-vocab-1')} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl bg-[#d94a13] px-3 text-xs font-extrabold text-white shadow-[0_3px_0_#b23a0c] transition hover:bg-[#c9400d] active:translate-y-px active:shadow-[0_2px_0_#b23a0c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94a13] focus-visible:ring-offset-2">Tiếp tục <ChevronRight size={14} aria-hidden="true" /></button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {[
          { value: '12', label: 'bài đã luyện', note: '↑ 2 so với hôm qua', icon: '/assets/practice-icons/completed.webp', tone: 'bg-[#fff0e6]', noteTone: 'text-emerald-600' },
          { value: '86%', label: 'độ chính xác', note: '↑ 6% so với hôm qua', icon: '/assets/practice-icons/goal.webp', tone: 'bg-[#eff9e8]', noteTone: 'text-emerald-600' },
          { value: String(streak || 5), label: 'ngày liên tiếp', note: 'Giữ vững phong độ!', icon: '/assets/practice-icons/streak.webp', tone: 'bg-[#fff3e7]', noteTone: 'text-[#dd621e]' },
        ].map((stat) => (
          <article key={stat.label} className="min-w-0 rounded-[18px] border border-[#eee5da] bg-white p-3 shadow-[0_3px_12px_rgba(63,45,24,0.03)] sm:p-3.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl p-1 ${stat.tone}`}><img src={stat.icon} alt="" className="h-full w-full object-contain" /></div>
            <div className="mt-2 font-[var(--font-heading)] text-lg font-extrabold leading-none text-[#172033] sm:text-xl">{stat.value}</div>
            <p className="mt-1 truncate text-[10px] font-medium text-[#748092] sm:text-[11px]">{stat.label}</p>
            <p className={`mt-2 hidden truncate text-[10px] font-bold sm:block ${stat.noteTone}`}>{stat.note}</p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="font-[var(--font-heading)] text-base font-extrabold tracking-[-0.02em] text-[#172033] sm:text-lg">Chọn loại luyện tập</h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
          {[
            { id: 'vocabulary' as const, label: 'Từ vựng', subLabel: 'Ôn tập từ và cụm từ', icon: Target },
            { id: 'question' as const, label: 'Câu hỏi', subLabel: 'Làm bài kiểm tra', icon: FileQuestion },
            { id: 'all' as const, label: 'Hỗn hợp', subLabel: 'Kết hợp cả hai', icon: Shuffle },
          ].map((option) => {
            const Icon = option.icon;
            const isActive = selectedKind === option.id;
            return <button key={option.id} type="button" onClick={() => setSelectedKind(option.id)} aria-pressed={isActive} className={`min-h-[88px] rounded-[18px] border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:p-3 ${isActive ? 'border-[#e46b33] bg-[#fff3e7] shadow-[0_3px_12px_rgba(211,88,17,0.08)]' : 'border-[#e7e1d9] bg-white hover:border-[#edc9a9]'}`}>
              <Icon size={19} className={isActive ? 'text-[#d95319]' : 'text-[#3e4b5e]'} aria-hidden="true" />
              <span className="mt-1.5 block text-xs font-extrabold text-[#172033] sm:text-sm">{option.label}</span>
              <span className="mt-0.5 hidden text-[10px] font-medium leading-snug text-[#778292] sm:block">{option.subLabel}</span>
            </button>;
          })}
        </div>
      </section>

      {visibleSections.map((section) => (
        <section key={section.kind}>
          <SectionHeading onViewAll={() => setSelectedKind(section.kind)}>{section.title}</SectionHeading>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {practiceCards.filter((item) => item.kind === section.kind).map((item) => <ExerciseCard key={item.id} item={item} onStart={goTo} />)}
          </div>
        </section>
      ))}

      <section>
        <SectionHeading onViewAll={() => navigate('/app/exams')}>Kết quả gần đây</SectionHeading>
        <div className="mt-3 overflow-hidden rounded-[22px] border border-[#ebe4da] bg-white shadow-[0_3px_12px_rgba(63,45,24,0.04)]">
          {[
            { title: 'Phản xạ phỏng vấn Tokutei', time: 'Hôm nay · 10:23', score: 88, detail: '13/15 câu đúng', minutes: '8 phút', icon: '/assets/practice-icons/goal.webp', tone: 'bg-[#edf9e9]', scoreTone: 'text-emerald-600' },
            { title: 'Nghe hiểu an toàn đầu ca', time: 'Hôm qua · 15:40', score: 76, detail: '19/25 câu đúng', minutes: '11 phút', icon: '/assets/practice-icons/listening.webp', tone: 'bg-[#f0edff]', scoreTone: 'text-amber-600' },
          ].map((result, index) => (
            <div key={result.title} className={`flex items-center gap-3 p-3.5 sm:p-4 ${index ? 'border-t border-[#f0e9df]' : ''}`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-1.5 ${result.tone}`}><img src={result.icon} alt="" className="h-full w-full object-contain" /></div>
              <div className="min-w-0 flex-1"><h3 className="font-[var(--font-heading)] text-[13px] font-extrabold text-[#172033] line-clamp-1 sm:text-sm">{result.title}</h3><p className="mt-0.5 text-[10px] text-[#8190a0]">{result.time}</p></div>
              <div className="hidden text-xs font-semibold text-[#677587] sm:block"><p>{result.detail}</p><p className="mt-0.5">{result.minutes}</p></div>
              <div className="shrink-0 text-right"><p className={`font-[var(--font-heading)] text-lg font-extrabold ${result.scoreTone}`}>{result.score}%</p><button type="button" onClick={() => navigate('/app/review/flashcards?mode=cram&replay=recent')} className="mt-1 inline-flex min-h-7 items-center gap-0.5 rounded-lg border border-[#eeab7a] px-1.5 text-[10px] font-bold text-[#cf4c16] hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">Làm lại <ArrowRight size={11} aria-hidden="true" /></button></div>
            </div>
          ))}
        </div>
      </section>

      {!embedded && <FloatingAudioButton />}
    </div>
  );
}

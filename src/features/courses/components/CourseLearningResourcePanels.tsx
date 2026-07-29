import { type KeyboardEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bird, BookOpen, BrainCircuit, FileText, Headphones, MessageSquareText, Play, Search, Sparkles, Target, type LucideIcon } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseDocumentKind,
  type CourseExamItem,
  type CoursePodcastItem,
  type CourseReviewQuestion,
  type CourseVocabularyItem,
  type NonEmptyArray,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseGameStore } from '@/src/features/games/courseGameStore';
import type { CourseGameType } from '@/src/features/games/types';
import { cn } from '@/src/lib/utils';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';
const headingClass = 'font-[var(--font-heading)] tracking-[-0.04em] text-[#172033]';

interface TabButtonProps<T extends string> {
  tab: { id: T; label: string; icon: LucideIcon };
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
        'flex items-center rounded-2xl font-bold transition-colors duration-200',
        compact
          ? 'min-h-[3.25rem] w-full min-w-0 flex-col justify-center gap-1 px-1 py-2 text-[11px] sm:text-[13px]'
          : 'w-full gap-3 px-4 py-3.5 text-sm',
        isActive ? 'bg-orange-50 text-[#c96a1b]' : 'text-[#5f6b7c] hover:bg-[#f6efe6] hover:text-[#172033]',
        focusRing
      )}
    >
      <Icon size={20} aria-hidden="true" focusable="false" />
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
}

function getDocumentIcon(document: CourseDocumentItem) {
  return document.kind === 'PDF' ? FileText : BookOpen;
}

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  tone: 'orange' | 'blue' | 'emerald';
}

export function MetricCard({ label, value, sub, tone }: MetricCardProps) {
  const toneClasses = {
    orange: 'border-orange-100 bg-orange-50/60 text-orange-700',
    blue: 'border-blue-100 bg-blue-50/60 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-700',
  } satisfies Record<MetricCardProps['tone'], string>;

  return (
    <div className={cn('workspace-item rounded-[1.8rem] px-4 py-4', toneClasses[tone])}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-75">{label}</p>
      <p className={cn('mt-2 text-2xl font-black', headingClass)}>{value}</p>
      <p className="text-xs font-semibold text-[#5f6b7c]">{sub}</p>
    </div>
  );
}

interface DocumentsPanelProps {
  documents: CourseDocumentItem[];
  selectedDocument: CourseDocumentItem;
  onSelectDocument: (documentId: string) => void;
}

type DocumentFilter = 'all' | CourseDocumentKind;

export function DocumentsPanel({ documents, selectedDocument, onSelectDocument }: DocumentsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState<DocumentFilter>('all');

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredByKind = documentFilter === 'all' ? documents : documents.filter((document) => document.kind === documentFilter);

    if (!normalizedQuery) {
      return filteredByKind;
    }

    return filteredByKind.filter((document) => {
      const haystack = [
        document.title,
        document.kind,
        document.module,
        document.summary,
        document.preview,
        document.size,
        document.readTime,
        ...document.tags,
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [documentFilter, documents, searchQuery]);

  return (
    <div className="workspace-panel space-y-4 rounded-[2rem] p-4 md:p-5">
      <div className="space-y-3">
        <h3 className={cn('text-2xl font-black', headingClass)}>Tài liệu trong khóa</h3>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-sm font-semibold text-[#5f6b7c] focus-within:border-orange-200 focus-within:ring-2 focus-within:ring-orange-100">
            <Search size={18} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
            <span className="sr-only">Tìm kiếm tài liệu</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tài liệu..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#172033] outline-none placeholder:text-[#95a0af]"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all' as DocumentFilter, label: 'Tất cả' },
              { id: 'PDF' as DocumentFilter, label: 'PDF' },
              { id: 'Post' as DocumentFilter, label: 'Bài đọc' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDocumentFilter(filter.id)}
                aria-current={documentFilter === filter.id ? 'true' : undefined}
                className={cn(
                  'min-h-11 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors',
                  documentFilter === filter.id ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:bg-orange-50',
                  focusRing
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredDocuments.length > 0 ? filteredDocuments.map((document) => {
          const Icon = getDocumentIcon(document);
          const isSelected = selectedDocument.id === document.id;

          return (
            <button
              key={document.id}
              onClick={() => onSelectDocument(document.id)}
              aria-current={isSelected ? 'true' : undefined}
              aria-expanded={isSelected}
              className={cn('workspace-item w-full rounded-[1.5rem] p-4 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/35', isSelected ? 'border-orange-200 bg-orange-50/55' : '', focusRing)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadccc] bg-white text-orange-700">
                  <Icon size={20} aria-hidden="true" focusable="false" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={cn('text-base font-black leading-snug', headingClass)}>{document.title}</h4>
                  <p className="mt-1 text-xs font-semibold text-[#95a0af]">{document.kind === 'PDF' ? 'PDF' : 'Bài đọc'} • {document.module} • {document.readTime}</p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 rounded-2xl border border-orange-100 bg-white px-4 py-3">
                  <p className="text-sm font-semibold leading-relaxed text-[#5f6b7c]">{document.summary}</p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{document.preview}</p>
                </div>
              )}
            </button>
          );
        }) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#e6ddd1] bg-[#fffdf8] p-6 text-center">
            <p className="text-sm font-black text-[#172033]">Không tìm thấy tài liệu phù hợp</p>
            <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">Thử đổi từ khóa hoặc chuyển bộ lọc khác.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CourseGameCard {
  type: CourseGameType;
  title: string;
  source: string;
  description: string;
  rounds: number;
  duration: string;
  color: string;
  icon: LucideIcon;
}

function getAvailableCourseGames(vocabulary: CourseVocabularyItem[], reviewQuestions: CourseReviewQuestion[]): CourseGameCard[] {
  const cards: CourseGameCard[] = [];

  if (vocabulary.length >= 4) {
    cards.push(
      {
        type: 'flappy-vocab',
        title: 'Flappy Vocab',
        source: `${vocabulary.length} từ trong khóa`,
        description: 'Bay qua thử thách và chọn đúng nghĩa của từ đang học.',
        rounds: vocabulary.length,
        duration: '2 phút',
        color: 'from-amber-500 to-orange-500',
        icon: Bird,
      },
      {
        type: 'vocab-sprint',
        title: 'Vocab Sprint',
        source: `${vocabulary.length} từ trong khóa`,
        description: 'Chọn nghĩa đúng thật nhanh để củng cố nhóm từ vừa học.',
        rounds: vocabulary.length,
        duration: '1 phút',
        color: 'from-blue-500 to-cyan-500',
        icon: BrainCircuit,
      }
    );
  }

  if (reviewQuestions.length > 0) {
    cards.push({
      type: 'situation-game',
      title: 'Tình huống',
      source: `${reviewQuestions.length} câu ôn tập`,
      description: 'Xử lý tình huống bằng câu hỏi ôn tập của khóa học này.',
      rounds: reviewQuestions.length,
      duration: '2 phút',
      color: 'from-emerald-500 to-teal-500',
      icon: MessageSquareText,
    });
  }

  return cards;
}

interface GamesPanelProps {
  activeGameType: CourseGameType;
  courseId: string;
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
  reviewQuestions: CourseReviewQuestion[];
  onSelectGame: (gameType: CourseGameType) => void;
}

export function GamesPanel({ activeGameType, courseId, courseTitle, vocabulary, reviewQuestions, onSelectGame }: GamesPanelProps) {
  const navigate = useNavigate();
  const setCourseGameContext = useCourseGameStore((state) => state.setCourseGameContext);
  const availableGames = useMemo(() => getAvailableCourseGames(vocabulary, reviewQuestions), [reviewQuestions, vocabulary]);
  const activeGame = availableGames.find((game) => game.type === activeGameType) ?? availableGames[0];
  const lockedMessage = vocabulary.length < 4 ? `Cần ít nhất 4 từ trong khóa để mở game từ vựng. Hiện có ${vocabulary.length} từ.` : null;

  const handlePlay = (game: CourseGameCard) => {
    onSelectGame(game.type);
    setCourseGameContext({
      courseId,
      courseTitle,
      vocabulary,
      reviewQuestions,
      returnPath: `/app/courses/${courseId}/learn`,
      selectedGameType: game.type,
    });
    navigate(`/app/game/${game.type}?courseId=${encodeURIComponent(courseId)}`);
  };

  if (!activeGame) {
    return (
      <div className="workspace-panel rounded-[2rem] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
          <Sparkles size={22} aria-hidden="true" focusable="false" />
        </div>
        <h3 className={cn('mt-4 text-2xl font-black', headingClass)}>Game sẽ mở khi khóa có thêm dữ liệu</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-[#5f6b7c]">
          {lockedMessage ?? 'Khóa này chưa có đủ từ vựng hoặc câu hỏi ôn tập để tạo vòng chơi.'}
        </p>
      </div>
    );
  }

  return (
    <div className="workspace-panel rounded-[2rem] p-4 md:p-5">
      <h3 className={cn('text-2xl font-black', headingClass)}>Chọn 1 game để luyện nhanh</h3>
      <p className="mt-1 text-sm font-semibold text-[#5f6b7c]">Game dùng đúng từ vựng và câu hỏi của khóa này.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {availableGames.map((game) => {
          const Icon = game.icon;

          return (
            <div key={game.type} className="workspace-item flex flex-col rounded-[1.5rem] p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white', game.color)}>
                  <Icon size={22} aria-hidden="true" focusable="false" />
                </div>
                <div className="min-w-0">
                  <h4 className={cn('text-lg font-black leading-snug', headingClass)}>{game.title}</h4>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{game.description}</p>
                  <p className="mt-2 text-xs font-semibold text-[#95a0af]">{game.rounds} vòng • {game.duration}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handlePlay(game)}
                className={cn('mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 px-5 py-3 text-sm font-black text-white transition-transform hover:scale-[1.01]', focusRing)}
                aria-label={`Chơi game ${game.title}`}
              >
                <Play size={16} aria-hidden="true" focusable="false" />
                Chơi ngay
              </button>
            </div>
          );
        })}
      </div>

      {lockedMessage && <p className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">{lockedMessage}</p>}
    </div>
  );
}

interface ExamsPanelProps {
  courseId: string;
  exams: NonEmptyArray<CourseExamItem>;
}

export function ExamsPanel({ courseId, exams }: ExamsPanelProps) {
  const statusLabels = {
    ready: 'Sẵn sàng',
    in_progress: 'Đang làm dở',
    completed: 'Đã hoàn thành',
  } satisfies Record<CourseExamItem['status'], string>;

  return (
    <div className="workspace-panel space-y-4 rounded-[2rem] p-4 md:p-5">
      <h3 className={cn('text-2xl font-black', headingClass)}>Thi thử của khóa</h3>

      {exams.map((exam) => (
        <div key={exam.id} className="workspace-item rounded-[1.5rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1">
              <h4 className={cn('text-xl font-black leading-snug', headingClass)}>{exam.title}</h4>
              <p className="text-sm font-semibold text-[#5f6b7c]">
                {exam.duration} • {statusLabels[exam.status]} • {exam.skills.join(' • ')}
                {exam.latestScore !== undefined ? ` • Điểm gần nhất ${exam.latestScore}%` : ''}
              </p>
            </div>
            <Link
              to={exam.status === 'completed' ? `/app/exams/${exam.id}/result` : `/app/exams/${exam.id}/start`}
              className={cn('flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-orange-700 px-6 py-3 text-sm font-black text-white', focusRing)}
              aria-label={exam.status === 'completed' ? `Xem kết quả ${exam.title}` : `Làm đề ${exam.title}`}
            >
              {exam.status === 'completed' ? 'Xem kết quả' : 'Làm đề'}
            </Link>
          </div>
          <p className="sr-only">Khóa {courseId}</p>
        </div>
      ))}
    </div>
  );
}

interface RightRailProps {
  activePodcast: CoursePodcastItem;
  dueCount: number;
  isPodcastOpen: boolean;
  onOpenPodcast: () => void;
}

export function RightRail({ activePodcast, dueCount, isPodcastOpen, onOpenPodcast }: RightRailProps) {
  return (
    <aside className="hidden space-y-4 xl:sticky xl:top-24 xl:block xl:self-start">
      <div className="workspace-panel rounded-[2rem] p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700"><Target size={14} aria-hidden="true" focusable="false" /> Hôm nay</div>
        <div className="mt-4 space-y-3">
          <RailItem label="Từ cần ôn" value={`${dueCount} từ`} tone="orange" />
          <RailItem label="Ôn tập" value="10 câu MCQ" tone="blue" />
          <RailItem label="Gợi ý" value="Nghe Episode 02" tone="emerald" />
        </div>
      </div>
      <button onClick={onOpenPodcast} className={cn('workspace-panel w-full rounded-[2rem] p-5 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/40', focusRing)} aria-haspopup="dialog" aria-expanded={isPodcastOpen} aria-controls="course-podcast-popover">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-700"><Headphones size={22} aria-hidden="true" focusable="false" /></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Podcast đang chọn</p>
            <h4 className={cn('mt-1 text-sm font-black', headingClass)}>{activePodcast.episode}</h4>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{activePodcast.title} • {activePodcast.duration}</p>
      </button>
    </aside>
  );
}

interface RailItemProps {
  label: string;
  value: string;
  tone: 'orange' | 'blue' | 'emerald';
}

function RailItem({ label, value, tone }: RailItemProps) {
  const toneClasses = {
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  } satisfies Record<RailItemProps['tone'], string>;

  return (
    <div className={cn('rounded-2xl px-4 py-3', toneClasses[tone])}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p className={cn('mt-1 text-sm font-black', headingClass)}>{value}</p>
    </div>
  );
}

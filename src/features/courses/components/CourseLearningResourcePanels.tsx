import { type KeyboardEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bird, BookOpen, BrainCircuit, ChevronDown, FileText, Headphones, MessageSquareText, Play, Search, Sparkles, Target, type LucideIcon } from 'lucide-react';
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
        'flex items-center rounded-[1.6rem] font-black transition-all duration-200',
        compact
          ? 'min-h-[3.35rem] w-full min-w-0 flex-col justify-center gap-1 px-1.5 py-2 text-[10px] sm:min-h-14 sm:px-2 sm:text-xs md:min-h-14 md:px-3'
          : 'w-full gap-3 px-4 py-3.5 text-sm',
        isActive
          ? 'workspace-item border-[rgba(201,106,27,0.18)] bg-[linear-gradient(135deg,rgba(255,245,235,0.98)_0%,rgba(255,250,244,0.98)_100%)] text-[#c96a1b] shadow-[0_20px_44px_-32px_rgba(201,106,27,0.38)]'
          : 'text-[#5f6b7c] hover:bg-[#f6efe6] hover:text-[#172033]',
        focusRing
      )}
    >
      <Icon size={18} aria-hidden="true" focusable="false" />
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
      <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className={cn('mt-2 text-2xl font-black', headingClass)}>{value}</p>
      <p className="text-xs font-bold text-[#5f6b7c]">{sub}</p>
    </div>
  );
}

interface DocumentsPanelProps {
  documents: CourseDocumentItem[];
  expandedDocumentId: string | null;
  onToggleDocument: (documentId: string) => void;
}

type DocumentFilter = 'all' | CourseDocumentKind;

export function DocumentsPanel({ documents, expandedDocumentId, onToggleDocument }: DocumentsPanelProps) {
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
    <div className="workspace-panel space-y-3 rounded-[2rem] p-3.5 md:p-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-sm font-bold text-[#5f6b7c] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] focus-within:border-orange-200 focus-within:ring-2 focus-within:ring-orange-100">
            <Search size={18} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
            <span className="sr-only">Tìm kiếm tài liệu</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm theo tiêu đề, nội dung, tag..."
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#172033] outline-none placeholder:text-[#95a0af]"
            />
          </label>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all' as DocumentFilter, label: 'Tất cả' },
              { id: 'PDF' as DocumentFilter, label: 'PDF' },
              { id: 'Post' as DocumentFilter, label: 'Post' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDocumentFilter(filter.id)}
                aria-current={documentFilter === filter.id ? 'true' : undefined}
                className={cn(
                  'min-h-11 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-black transition-colors',
                  documentFilter === filter.id ? 'border-orange-200 bg-orange-50 text-orange-700 shadow-[0_12px_24px_-18px_rgba(201,106,27,0.28)]' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:bg-orange-50',
                  focusRing
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="px-1 text-xs font-black text-[#8b93a1]" role="status" aria-live="polite">{filteredDocuments.length} tài liệu</p>

      <div className="space-y-2">
        {filteredDocuments.length > 0 ? filteredDocuments.map((document) => {
          const Icon = getDocumentIcon(document);
          const isExpanded = expandedDocumentId === document.id;
          const panelId = `course-document-preview-${document.id}`;

          return (
            <div key={document.id} className={cn('workspace-item rounded-[1.5rem] transition-colors', isExpanded ? 'border-orange-200 bg-orange-50/45' : '')}>
              <button
                type="button"
                onClick={() => onToggleDocument(document.id)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                className={cn('flex w-full items-center gap-3 rounded-[1.5rem] p-3 text-left transition-colors hover:bg-orange-50/40', focusRing)}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadccc] bg-white text-orange-700">
                  <Icon size={20} aria-hidden="true" focusable="false" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[0.95rem] font-black leading-snug', headingClass)}>{document.title}</span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-[#5f6b7c]">{document.kind} • {document.readTime} • {document.size}</span>
                </span>
                <span className={cn('flex min-h-11 shrink-0 items-center gap-1 rounded-xl px-2.5 text-[11px] font-black uppercase tracking-[0.1em]', isExpanded ? 'text-orange-700' : 'text-[#5f6b7c]')}>
                  <span className="hidden sm:inline">{isExpanded ? 'Thu gọn' : 'Xem trước'}</span>
                  <ChevronDown size={16} className={cn('transition-transform duration-200', isExpanded ? 'rotate-180' : '')} aria-hidden="true" focusable="false" />
                </span>
              </button>

              {isExpanded && (
                <div id={panelId} className="border-t border-orange-100 px-3 pb-3 pt-3">
                  <p className="text-sm font-semibold leading-relaxed text-[#5f6b7c]">{document.preview}</p>
                  {/* Bỏ tag trùng với loại tài liệu — dòng meta phía trên đã ghi PDF/Post rồi. */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {document.tags
                      .filter((tag) => tag.toLowerCase() !== document.kind.toLowerCase())
                      .map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black text-orange-700">{tag}</span>)}
                  </div>
                  <p className="mt-3 text-xs font-bold text-[#95a0af]">Đây là phần xem trước. Bản đầy đủ đang được bổ sung.</p>
                </div>
              )}
            </div>
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
        rounds: vocabulary.length,
        duration: '2 phút',
        color: 'from-amber-500 to-orange-500',
        icon: Bird,
      },
      {
        type: 'vocab-sprint',
        title: 'Vocab Sprint',
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
      rounds: reviewQuestions.length,
      duration: '2 phút',
      color: 'from-emerald-500 to-teal-500',
      icon: MessageSquareText,
    });
  }

  return cards;
}

interface GamesPanelProps {
  courseId: string;
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
  reviewQuestions: CourseReviewQuestion[];
}

export function GamesPanel({ courseId, courseTitle, vocabulary, reviewQuestions }: GamesPanelProps) {
  const navigate = useNavigate();
  const setCourseGameContext = useCourseGameStore((state) => state.setCourseGameContext);
  const availableGames = useMemo(() => getAvailableCourseGames(vocabulary, reviewQuestions), [reviewQuestions, vocabulary]);
  const lockedMessage = vocabulary.length < 4 ? `Cần ít nhất 4 từ trong khóa để mở game từ vựng. Hiện có ${vocabulary.length} từ.` : null;

  const handlePlay = (game: CourseGameCard) => {
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

  if (availableGames.length === 0) {
    return (
      <div className="workspace-panel rounded-[2rem] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
          <Sparkles size={22} aria-hidden="true" focusable="false" />
        </div>
        <h3 className={cn('mt-4 text-2xl font-black', headingClass)}>Game sẽ mở khi khóa có thêm dữ liệu</h3>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-[#5f6b7c]">
          {lockedMessage ?? 'Khóa này chưa có đủ từ vựng hoặc câu hỏi review để tạo vòng chơi.'}
        </p>
      </div>
    );
  }

  return (
    <div className="workspace-panel space-y-3 rounded-[2rem] p-3.5 md:p-5">
      {/* Nguồn dữ liệu giống nhau ở mọi game nên nói một lần ở đây, không lặp trong từng thẻ. */}
      <p className="px-1 text-xs font-black text-[#8b93a1]">Dữ liệu khóa này • {vocabulary.length} từ • {reviewQuestions.length} câu ôn</p>

      <ul className="space-y-2">
        {availableGames.map((game) => {
          const Icon = game.icon;

          return (
            <li key={game.type}>
              <button
                type="button"
                onClick={() => handlePlay(game)}
                className={cn('workspace-item flex w-full items-center gap-3 rounded-[1.5rem] p-3 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/40', focusRing)}
                aria-label={`Chơi ${game.title}, ${game.rounds} vòng, ${game.duration}`}
              >
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white', game.color)}>
                  <Icon size={20} aria-hidden="true" focusable="false" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[0.95rem] font-black leading-snug', headingClass)}>{game.title}</span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-[#5f6b7c]">{game.rounds} vòng • {game.duration}</span>
                </span>
                <span className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-orange-700 px-3.5 text-[11px] font-black uppercase tracking-[0.1em] text-white">
                  <Play size={13} aria-hidden="true" focusable="false" />
                  Chơi
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {lockedMessage && <p className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-bold text-orange-700">{lockedMessage}</p>}
    </div>
  );
}

interface ExamsPanelProps {
  exams: NonEmptyArray<CourseExamItem>;
}

const examStatusLabels = {
  ready: 'Sẵn sàng',
  in_progress: 'Đang làm dở',
  completed: 'Đã hoàn thành',
} satisfies Record<CourseExamItem['status'], string>;

const examStatusClasses = {
  ready: 'bg-orange-50 text-orange-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
} satisfies Record<CourseExamItem['status'], string>;

export function ExamsPanel({ exams }: ExamsPanelProps) {
  return (
    <div className="workspace-panel space-y-3 rounded-[2rem] p-3.5 md:p-5">
      <p className="px-1 text-xs font-black text-[#8b93a1]">{exams.length} đề thi thử</p>

      <ul className="space-y-2">
        {exams.map((exam) => (
          <li key={exam.id} className="workspace-item flex items-center gap-3 rounded-[1.5rem] p-3">
            <div className="min-w-0 flex-1">
              {/* Tiêu đề chiếm trọn dòng — chip trạng thái xuống dòng dưới để tên đề không bị cắt sớm. */}
              <h4 className={cn('truncate text-[0.95rem] font-black leading-snug', headingClass)}>{exam.title}</h4>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-bold text-[#5f6b7c]">
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black', examStatusClasses[exam.status])}>{examStatusLabels[exam.status]}</span>
                <span className="truncate">
                  {exam.duration}
                  {exam.latestScore !== undefined ? ` • Gần nhất ${exam.latestScore}%` : ''}
                </span>
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-[#8b93a1]">{exam.skills.join(' • ')}</p>
            </div>
            <Link
              to={exam.status === 'completed' ? `/app/exams/${exam.id}/result` : `/app/exams/${exam.id}/start`}
              className={cn('flex min-h-11 shrink-0 items-center rounded-xl bg-orange-700 px-3.5 text-[11px] font-black uppercase tracking-[0.1em] text-white', focusRing)}
              aria-label={exam.status === 'completed' ? `Xem kết quả ${exam.title}` : `Làm đề ${exam.title}`}
            >
              {exam.status === 'completed' ? 'Kết quả' : 'Làm đề'}
            </Link>
          </li>
        ))}
      </ul>
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
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-700"><Target size={14} aria-hidden="true" focusable="false" /> Hôm nay</div>
        <div className="mt-4 space-y-3">
          <RailItem label="Từ cần ôn" value={`${dueCount} từ`} tone="orange" />
          <RailItem label="Ôn tập" value="10 câu MCQ" tone="blue" />
          <RailItem label="Gợi ý" value="Nghe Episode 02" tone="emerald" />
        </div>
      </div>
      <button onClick={onOpenPodcast} className={cn('workspace-panel w-full rounded-[2rem] p-5 text-left transition-all hover:border-orange-200 hover:bg-orange-50/40', focusRing)} aria-haspopup="dialog" aria-expanded={isPodcastOpen} aria-controls="course-podcast-popover">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-700 shadow-[0_12px_24px_-20px_rgba(99,71,42,0.3)]"><Headphones size={22} aria-hidden="true" focusable="false" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Podcast đang chọn</p>
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
      <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className={cn('mt-1 text-sm font-black', headingClass)}>{value}</p>
    </div>
  );
}

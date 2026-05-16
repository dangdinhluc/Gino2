import { type KeyboardEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Headphones, Search, Target, type LucideIcon } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseDocumentKind,
  type CourseExamItem,
  type CourseGameItem,
  type CoursePodcastItem,
  type NonEmptyArray,
} from '@/src/features/courses/mock/courseLearningMock';
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
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Tài liệu trong khóa</p>
          <h3 className={cn('mt-1 text-2xl font-black', headingClass)}>Đọc nhanh PDF và bài đăng</h3>
        </div>

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

      <div className="space-y-4">
        {filteredDocuments.length > 0 ? filteredDocuments.map((document) => {
          const Icon = getDocumentIcon(document);
          const isSelected = selectedDocument.id === document.id;

          return (
            <button key={document.id} onClick={() => onSelectDocument(document.id)} aria-current={isSelected ? 'true' : undefined} className={cn('workspace-item w-full rounded-[1.75rem] p-4 text-left transition-all hover:border-orange-200 hover:bg-orange-50/35', isSelected ? 'border-orange-200 bg-orange-50/55 shadow-[0_20px_42px_-34px_rgba(201,106,27,0.35)]' : '', focusRing)}>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#eadccc] bg-white text-orange-700 shadow-[0_12px_24px_-20px_rgba(99,71,42,0.3)]">
                  <Icon size={23} aria-hidden="true" focusable="false" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="workspace-chip rounded-full px-2 py-0.5 text-[10px] font-black">{document.kind}</span>
                    <span className="rounded-full bg-[#eef1ff] px-2 py-0.5 text-[10px] font-black text-[#6f4aa8]">{document.module}</span>
                  </div>
                  <h4 className={cn('mt-2 text-base font-black leading-snug', headingClass)}>{document.title}</h4>
                  <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">{document.publishedAt} • {document.readTime} • {document.size}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{document.summary}</p>
              {isSelected && (
                <div className="mt-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 md:hidden">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">Preview nhanh</p>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{document.preview}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {document.tags.map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black text-orange-700">{tag}</span>)}
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <span className="text-xs font-black text-[#5f6b7c]">Dữ liệu thuộc khóa hiện tại</span>
                <span className="shrink-0 text-xs font-black uppercase tracking-[0.12em] text-orange-700">{isSelected ? 'Đang mở' : document.kind === 'PDF' ? 'Mở xem' : 'Đọc nhanh'}</span>
              </div>
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

interface GamesPanelProps {
  activeGame: CourseGameItem;
  games: CourseGameItem[];
  onSelectGame: (gameId: string) => void;
}

export function GamesPanel({ activeGame, games, onSelectGame }: GamesPanelProps) {
  return (
    <div className="space-y-5">
      <div className="relative hidden overflow-hidden rounded-[2.5rem] border border-[rgba(198,182,163,0.42)] bg-[linear-gradient(135deg,rgba(255,247,237,0.98)_0%,rgba(255,250,243,0.98)_56%,rgba(244,234,220,0.96)_100%)] p-6 shadow-[0_28px_58px_-40px_rgba(96,70,42,0.24)] md:block">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_48%)]" />
        <div className="relative z-10 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-700">Game tạo từ dữ liệu khóa này</p>
            <h3 className="mt-2 font-[var(--font-heading)] text-3xl font-black tracking-[-0.04em] text-[#172033] md:text-4xl">{activeGame.title}</h3>
            <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed text-[#5f6b7c]">{activeGame.description}</p>
          </div>
          <Link to={`/app/hub/${activeGame.id}`} className={cn('rounded-2xl bg-orange-700 px-5 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.5)] transition-transform hover:scale-[1.02]', focusRing)} aria-label={`Chơi game ${activeGame.title}`}>
            Chơi ngay
          </Link>
        </div>
      </div>

      <div className="workspace-panel rounded-[2rem] p-4 md:p-5">
        <div className="mb-4 md:hidden">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Game từ dữ liệu khóa</p>
          <h3 className={cn('mt-1 text-2xl font-black', headingClass)}>Chọn 1 game để luyện nhanh</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {games.map((game) => {
            const isActive = activeGame.id === game.id;

            return (
              <div key={game.id} aria-current={isActive ? 'true' : undefined} className={cn('workspace-item rounded-[1.75rem] p-4 transition-all md:p-5', isActive ? 'border-orange-200 bg-orange-50/55 shadow-[0_20px_42px_-34px_rgba(201,106,27,0.35)]' : '')}>
                <button type="button" onClick={() => onSelectGame(game.id)} className={cn('w-full rounded-2xl text-left', focusRing)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className={cn('text-lg font-black leading-snug', headingClass)}>{game.title}</h4>
                      <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{game.description}</p>
                    </div>
                    <span className="workspace-chip shrink-0 rounded-full px-3 py-1 text-[10px] font-black text-orange-700">{game.rounds} vòng</span>
                  </div>
                  <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#5f6b7c]">Nguồn: {game.source}</p>
                </button>
                <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">Điểm tốt</span>
                    <span className="text-base font-black text-[#172033]">{game.bestScore}%</span>
                  </span>
                  <span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">Thời gian</span>
                    <span className="text-base font-black text-[#172033]">{game.duration}</span>
                  </span>
                  <Link to={`/app/hub/${game.id}`} className={cn('rounded-2xl bg-orange-700 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white', focusRing)} aria-label={`Chơi game ${game.title}`}>
                    Chơi
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Thi thử của khóa</p>
        <h3 className={cn('mt-1 text-2xl font-black', headingClass)}>Làm đề theo đúng dữ liệu đang học</h3>
      </div>

      {exams.map((exam) => (
        <div key={exam.id} className="workspace-item rounded-[1.75rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef1ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#6f4aa8]">Khóa {courseId}</span>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">{exam.duration}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">{statusLabels[exam.status]}</span>
              </div>
              <h4 className={cn('text-xl font-black leading-snug', headingClass)}>{exam.title}</h4>
              <p className="text-sm font-semibold text-[#5f6b7c]">Kỹ năng: {exam.skills.join(' • ')}</p>
            </div>
            <div className="grid gap-2 md:flex md:items-center md:gap-3">
              {exam.latestScore !== undefined && <span className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700">Điểm gần nhất: {exam.latestScore}%</span>}
              <Link to={exam.status === 'completed' ? `/app/exams/${exam.id}/result` : `/app/exams/${exam.id}/start`} className={cn('flex min-h-12 items-center justify-center rounded-2xl bg-orange-700 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.55)]', focusRing)} aria-label={exam.status === 'completed' ? `Xem kết quả ${exam.title}` : `Làm đề ${exam.title}`}>
                {exam.status === 'completed' ? 'Xem kết quả' : 'Làm đề'}
              </Link>
            </div>
          </div>
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

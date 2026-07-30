import { type KeyboardEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bird, BookOpen, BrainCircuit, FileText, MessageSquareText, Play, Search, Sparkles, type LucideIcon } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseExamItem,
  type CourseReviewQuestion,
  type CourseVocabularyItem,
  type NonEmptyArray,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseGameStore } from '@/src/features/games/courseGameStore';
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
        'flex items-center rounded-xl transition-colors',
        compact
          ? 'min-h-[3.25rem] w-full min-w-0 flex-col justify-center gap-1 px-1 py-2 text-[11px] sm:text-xs'
          : 'w-full gap-3 px-4 py-3 text-sm',
        isActive ? 'font-bold text-orange-700' : 'text-[#7b8796] hover:text-[#172033]',
        focusRing
      )}
    >
      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} aria-hidden="true" focusable="false" />
      <span className="max-w-full truncate">{tab.label}</span>
    </button>
  );
}

function getDocumentIcon(document: CourseDocumentItem) {
  return document.kind === 'PDF' ? FileText : BookOpen;
}

interface DocumentsPanelProps {
  documents: CourseDocumentItem[];
  selectedDocument: CourseDocumentItem;
  onSelectDocument: (documentId: string) => void;
}

export function DocumentsPanel({ documents, selectedDocument, onSelectDocument }: DocumentsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return documents;
    }

    return documents.filter((document) => {
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
  }, [documents, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <section className={panelClass}>
      <h2 className={panelTitleClass}>Tài liệu</h2>
      <p className={cn('mt-1', panelSubtitleClass)}>
        {documents.length} tài liệu
        {isSearching ? ` · đang xem ${filteredDocuments.length}` : ''}
      </p>

      <label className={cn(searchFieldClass, 'mt-4')}>
        <Search size={18} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
        <span className="sr-only">Tìm tài liệu</span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Tìm tài liệu..."
          className={searchInputClass}
        />
      </label>

      {filteredDocuments.length > 0 ? (
        <ul className={cn('mt-2', dividerListClass)}>
          {filteredDocuments.map((document) => {
            const Icon = getDocumentIcon(document);
            const isSelected = selectedDocument.id === document.id;

            return (
              <li key={document.id}>
                <button
                  type="button"
                  onClick={() => onSelectDocument(document.id)}
                  aria-expanded={isSelected}
                  className={cn('flex w-full items-start gap-3 rounded-xl py-3.5 text-left', focusRing)}
                >
                  <Icon size={18} className="mt-0.5 shrink-0 text-orange-700" aria-hidden="true" focusable="false" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold leading-snug text-[#172033]">{document.title}</span>
                    <span className="mt-1 block text-xs text-[#95a0af]">
                      {document.kind === 'PDF' ? 'PDF' : 'Bài đọc'} · {document.module} · {document.readTime}
                    </span>
                  </span>
                </button>

                {isSelected && (
                  <div className="pb-4 pl-[1.875rem] text-sm leading-relaxed text-[#5f6b7c]">
                    <p>{document.summary}</p>
                    <p className="mt-2">{document.preview}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={cn(emptyStateClass, 'mt-4')}>
          <p className="text-sm font-semibold text-[#172033]">Không tìm thấy tài liệu</p>
          <p className="mt-1 text-xs text-[#95a0af]">Thử nhập từ khóa ngắn hơn.</p>
        </div>
      )}
    </section>
  );
}

interface CourseGameCard {
  type: CourseGameType;
  title: string;
  description: string;
  rounds: number;
  duration: string;
  icon: LucideIcon;
}

function getAvailableCourseGames(vocabulary: CourseVocabularyItem[], reviewQuestions: CourseReviewQuestion[]): CourseGameCard[] {
  const cards: CourseGameCard[] = [];

  if (vocabulary.length >= 4) {
    cards.push(
      {
        type: 'flappy-vocab',
        title: 'Flappy Vocab',
        description: 'Bay qua thử thách và chọn đúng nghĩa của từ đang học.',
        rounds: vocabulary.length,
        duration: '2 phút',
        icon: Bird,
      },
      {
        type: 'vocab-sprint',
        title: 'Vocab Sprint',
        description: 'Chọn nghĩa đúng thật nhanh để củng cố nhóm từ vừa học.',
        rounds: vocabulary.length,
        duration: '1 phút',
        icon: BrainCircuit,
      }
    );
  }

  if (reviewQuestions.length > 0) {
    cards.push({
      type: 'situation-game',
      title: 'Tình huống',
      description: 'Xử lý tình huống bằng câu hỏi ôn tập của khóa học này.',
      rounds: reviewQuestions.length,
      duration: '2 phút',
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
      <section className={cn(panelClass, 'text-center')}>
        <Sparkles size={22} className="mx-auto text-orange-700" aria-hidden="true" focusable="false" />
        <h2 className={cn('mt-3', panelTitleClass)}>Chưa mở được game</h2>
        <p className={cn('mx-auto mt-2 max-w-md leading-relaxed', panelSubtitleClass)}>
          {lockedMessage ?? 'Khóa này chưa có đủ từ vựng hoặc câu hỏi ôn tập để tạo vòng chơi.'}
        </p>
      </section>
    );
  }

  return (
    <section className={panelClass}>
      <h2 className={panelTitleClass}>Game luyện nhanh</h2>
      <p className={cn('mt-1', panelSubtitleClass)}>Dùng đúng từ vựng và câu hỏi của khóa này.</p>

      <ul className={cn('mt-2', dividerListClass)}>
        {availableGames.map((game) => {
          const Icon = game.icon;

          return (
            <li key={game.type} className="flex items-center gap-3 py-4">
              <Icon size={18} className="shrink-0 text-orange-700" aria-hidden="true" focusable="false" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-snug text-[#172033]">{game.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{game.description}</p>
                <p className="mt-1 text-xs text-[#95a0af]">{game.rounds} vòng · {game.duration}</p>
              </div>
              <button
                type="button"
                onClick={() => handlePlay(game)}
                className={cn(primaryButtonClass, 'shrink-0', focusRing)}
                aria-label={`Chơi game ${game.title}`}
              >
                <Play size={15} aria-hidden="true" focusable="false" />
                Chơi
              </button>
            </li>
          );
        })}
      </ul>

      {lockedMessage && <p className="mt-3 text-sm text-[#95a0af]">{lockedMessage}</p>}
    </section>
  );
}

interface ExamsPanelProps {
  exams: NonEmptyArray<CourseExamItem>;
}

export function ExamsPanel({ exams }: ExamsPanelProps) {
  const statusLabels = {
    ready: 'Sẵn sàng',
    in_progress: 'Đang làm dở',
    completed: 'Đã hoàn thành',
  } satisfies Record<CourseExamItem['status'], string>;

  return (
    <section className={panelClass}>
      <h2 className={panelTitleClass}>Thi thử</h2>
      <p className={cn('mt-1', panelSubtitleClass)}>{exams.length} đề trong khóa</p>

      <ul className={cn('mt-2', dividerListClass)}>
        {exams.map((exam) => (
          <li key={exam.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold leading-snug text-[#172033]">{exam.title}</p>
              <p className="mt-1 text-xs text-[#95a0af]">
                {exam.duration} · {statusLabels[exam.status]} · {exam.skills.join(' · ')}
                {exam.latestScore !== undefined ? ` · Gần nhất ${exam.latestScore}%` : ''}
              </p>
            </div>
            <Link
              to={exam.status === 'completed' ? `/app/exams/${exam.id}/result` : `/app/exams/${exam.id}/start`}
              className={cn(primaryButtonClass, 'shrink-0', focusRing)}
              aria-label={exam.status === 'completed' ? `Xem kết quả ${exam.title}` : `Làm đề ${exam.title}`}
            >
              {exam.status === 'completed' ? 'Xem kết quả' : 'Làm đề'}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

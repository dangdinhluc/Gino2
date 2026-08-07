import { type CSSProperties, type KeyboardEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BarChart3, Bird, BookOpen, BrainCircuit, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, FileText, Headphones, MessageSquareText, Play, Search, Sparkles, type LucideIcon } from 'lucide-react';
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
import { GameHeroBanner } from '@/src/features/games/components/GameHeroBanner';
import { DailyChallengeCard } from '@/src/features/games/components/DailyChallengeCard';
import { GameStatsGrid } from '@/src/features/games/components/GameStatsGrid';
import { GameListSection } from '@/src/features/games/components/GameListSection';
import { RecentGameResults } from '@/src/features/games/components/RecentGameResults';
import { FloatingAudioButton } from '@/src/features/games/components/FloatingAudioButton';

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

function getDocumentIcon(document: CourseDocumentItem) {
  return document.kind === 'PDF' ? FileText : BookOpen;
}

import { DocumentHero } from '@/src/features/documents/components/DocumentHero';
import { DocumentStats } from '@/src/features/documents/components/DocumentStats';
import { DocumentSearchAndFilter } from '@/src/features/documents/components/DocumentSearchAndFilter';
import { DocumentCategoryBar } from '@/src/features/documents/components/DocumentCategoryBar';
import { DocumentCardItem } from '@/src/features/documents/components/DocumentCardItem';
import { DocumentEmptyState } from '@/src/features/documents/components/DocumentEmptyState';

interface DocumentsPanelProps {
  documents: CourseDocumentItem[];
  selectedDocument: CourseDocumentItem;
  onSelectDocument: (documentId: string) => void;
}

export function DocumentsPanel({ documents, selectedDocument, onSelectDocument }: DocumentsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const pdfCount = documents.filter((d) => d.kind === 'PDF').length;
    const docCount = documents.filter((d) => d.kind === 'DOC').length;
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
      if (selectedCategory === 'doc' && document.kind !== 'DOC') return false;
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

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalMinutes = documents.reduce((acc, doc) => {
      const match = doc.readTime.match(/\d+/);
      return acc + (match ? parseInt(match[0], 10) : 5);
    }, 0);

    return {
      totalDocs,
      totalMinutes,
      viewedPercent: 100,
    };
  }, [documents]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32">
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

      {/* 5. Danh sách tài liệu */}
      <div className="space-y-3">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <DocumentCardItem
              key={doc.id}
              document={doc}
              isSelected={selectedDocument.id === doc.id}
              onSelect={onSelectDocument}
              onDownload={(id) => alert(`Tải xuống tài liệu ${id}`)}
              onMenu={(id) => console.log('Menu options for doc:', id)}
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

  const handlePlayGameType = (gameType: CourseGameType) => {
    onSelectGame(gameType);
    setCourseGameContext({
      courseId,
      courseTitle,
      vocabulary,
      reviewQuestions,
      returnPath: `/app/courses/${courseId}/learn`,
      selectedGameType: gameType,
    });
    navigate(`/app/game/${gameType}?courseId=${encodeURIComponent(courseId)}`);
  };

  const dailyChallenge = {
    title: 'Chơi 1 game bất kỳ',
    rewardXp: 20,
    progress: 70,
    target: 1,
  };

  const stats = {
    gamesCount: 3,
    totalPlays: 12,
    bestScorePercent: 92,
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32">
      {/* 1. Hero Banner */}
      <GameHeroBanner />

      {/* 2. Card thử thách hôm nay */}
      <DailyChallengeCard challenge={dailyChallenge} />

      {/* 3. Ba ô thống kê */}
      <GameStatsGrid stats={stats} />

      {/* 4. Danh sách game */}
      <GameListSection onPlayGame={handlePlayGameType} />

      {/* 5. Kết quả gần đây */}
      <RecentGameResults onReplay={handlePlayGameType} />
    </div>
  );
}

interface ExamsPanelProps {
  exams: NonEmptyArray<CourseExamItem>;
  onStartExam: (examId: string) => void;
}

export function ExamsPanel({ exams, onStartExam }: ExamsPanelProps) {
  const statusLabels = {
    ready: 'Sẵn sàng',
    in_progress: 'Đang làm dở',
    completed: 'Đã hoàn thành',
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
          {exams.map((exam, index) => (
            <article key={exam.id} className={cn('course-exam-card', `is-${exam.status}`)}>
              <div className="course-exam-card-heading">
                <span className="course-exam-card-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="course-exam-card-status-icon">
                  {exam.status === 'completed' ? <CheckCircle2 size={21} aria-hidden="true" focusable="false" /> : exam.status === 'in_progress' ? <Headphones size={21} aria-hidden="true" focusable="false" /> : <ClipboardCheck size={21} aria-hidden="true" focusable="false" />}
                </span>
              </div>
              <div className="course-exam-card-content">
                <h2>{exam.title}</h2>
                <div className="course-exam-card-meta">
                  <span><Clock3 size={14} /> {exam.duration}</span>
                  {exam.status === 'in_progress' && exam.latestScore !== undefined && <span>Tiến độ <strong>{exam.latestScore}%</strong></span>}
                  {exam.status === 'completed' && exam.latestScore !== undefined && <span>Điểm cao nhất <strong>{exam.latestScore}%</strong></span>}
                </div>
                <span className="course-exam-status">{statusLabels[exam.status]}</span>
              </div>
              <button
                type="button"
                onClick={() => onStartExam(exam.id)}
                className={cn('course-exam-start', focusRing)}
                aria-label={exam.status === 'completed' ? `Làm lại đề ${exam.title}` : exam.status === 'in_progress' ? `Tiếp tục đề ${exam.title}` : `Làm đề ${exam.title}`}
              >
                <span>{exam.status === 'completed' ? 'Làm lại' : exam.status === 'in_progress' ? 'Tiếp tục' : 'Làm đề ngay'}</span>
                <Play size={15} fill="currentColor" aria-hidden="true" focusable="false" />
              </button>
            </article>
          ))}
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
            <div className="course-exam-score-ring" style={{ '--score': `${recentExam.latestScore}%` } as CSSProperties}><strong>{recentExam.latestScore}%</strong><small>Điểm cao nhất</small></div>
            <div className="course-exam-recent-copy"><h3>{recentExam.title}</h3><p><Clock3 size={15} aria-hidden="true" focusable="false" /> {recentExam.duration}</p><span><CheckCircle2 size={15} aria-hidden="true" focusable="false" /> Hoàn thành</span></div>
          </div>
        </section>
      )}
    </div>
  );
}

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { DocumentsPanel, ExamsPanel, GamesPanel, TabButton } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { CourseReviewSession } from '@/src/features/courses/components/CourseReviewSession';
import { CourseWorkspaceHeader, DailyMissionCard } from '@/src/features/courses/components/CourseWorkspaceHeader';
import { Brain, ChevronLeft, ChevronRight, FileText, Gamepad2, GraduationCap, Layers, Lightbulb, MessageSquareQuote, RotateCcw, Search, Sparkles, Volume2, X, Zap } from 'lucide-react';
import {
  type CoursePodcastItem,
  type CourseVocabularyItem,
  type NonEmptyArray,
  type VocabularyScript,
  type VocabularyStatus,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { buildDailyMission, countReviewedToday } from '@/src/features/courses/lib/dailyMission';
import { type VocabularyFilter, countByFilter, matchesVocabularyFilter, vocabularyFilters } from '@/src/features/courses/lib/vocabularyFilters';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import {
  type ReviewMode,
  readStoredReviewMode,
  readStoredVocabularyScript,
  writeStoredReviewMode,
  writeStoredVocabularyScript,
} from '@/src/features/courses/lib/courseWorkspacePreferences';
import { cn } from '@/src/lib/utils';

type WorkspaceTab = 'vocabulary' | 'review' | 'documents' | 'games' | 'exams';
type VocabularyViewMode = 'list' | 'flashcard';

const workspaceTabs = [
  { id: 'vocabulary', label: 'Từ vựng', icon: Layers },
  { id: 'review', label: 'Ôn tập', icon: Zap },
  { id: 'documents', label: 'Tài liệu', icon: FileText },
  { id: 'games', label: 'Game', icon: Gamepad2 },
  { id: 'exams', label: 'Thi thử', icon: GraduationCap },
] satisfies Array<{ id: WorkspaceTab; label: string; icon: typeof Layers }>;

const statusLabels: Record<VocabularyStatus, string> = {
  new: 'Từ mới',
  learning: 'Đang học',
  due: 'Cần ôn',
  remembered: 'Đã nhớ',
};

const statusClasses: Record<VocabularyStatus, string> = {
  new: 'border-blue-100 bg-blue-50 text-blue-700',
  learning: 'border-orange-100 bg-orange-50 text-orange-700',
  due: 'border-red-100 bg-red-50 text-red-700',
  remembered: 'border-emerald-100 bg-emerald-50 text-emerald-700',
};

// Chấm màu chỉ để quét nhanh bằng mắt — trạng thái luôn kèm chữ bên cạnh để không phụ thuộc màu.
const statusDotClasses: Record<VocabularyStatus, string> = {
  new: 'bg-blue-400',
  learning: 'bg-orange-400',
  due: 'bg-red-400',
  remembered: 'bg-emerald-400',
};

const statusTextClasses: Record<VocabularyStatus, string> = {
  new: 'text-blue-700',
  learning: 'text-orange-700',
  due: 'text-red-600',
  remembered: 'text-emerald-700',
};

const vocabularyViewModes = [
  { id: 'list', label: 'Danh sách' },
  { id: 'flashcard', label: 'Flashcard' },
] satisfies Array<{ id: VocabularyViewMode; label: string }>;

const vocabularyScripts = [
  { id: 'romaji', label: 'A', name: 'Romaji' },
  { id: 'kana', label: 'あ', name: 'Kana (hiragana/katakana)' },
  { id: 'kanji', label: '漢', name: 'Kanji' },
] satisfies Array<{ id: VocabularyScript; label: string; name: string }>;

/** Chữ chính của từ theo chế độ đang chọn. Thiếu dữ liệu thì rơi dần kanji → kana → romaji. */
function getVocabularyScriptText(item: CourseVocabularyItem, script: VocabularyScript): string {
  if (script === 'kanji') return item.kanji || item.kana || getVocabularyDisplayName(item);
  if (script === 'kana') return item.kana || getVocabularyDisplayName(item);
  return getVocabularyDisplayName(item);
}

/** Dòng đọc kèm: xem kanji thì gợi kana, xem kana thì gợi romaji, còn lại là phiên âm. */
function getVocabularyReadingHint(item: CourseVocabularyItem, script: VocabularyScript): string {
  if (script === 'kanji' && item.kanji && item.kana) return item.kana;
  if (script === 'kana' && item.kana) return item.word;
  return item.pronunciation;
}

function getVocabularyExampleText(item: CourseVocabularyItem, script: VocabularyScript): string {
  if (script === 'kanji') return item.example.kanji || item.example.kana || item.example.jp;
  if (script === 'kana') return item.example.kana || item.example.jp;
  return item.example.jp;
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

function getInitialPodcast(podcasts: NonEmptyArray<CoursePodcastItem>): CoursePodcastItem {
  return podcasts[0];
}

function getVocabularyDisplayName(item: CourseVocabularyItem) {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
}

export default function CourseLearningWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workspace = useCourseLearningWorkspace(id);
  const { course, vocabulary, reviewQuestions, documents, exams, podcasts } = workspace;

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('vocabulary');
  const [vocabularyFilter, setVocabularyFilter] = useState<VocabularyFilter>('all');
  const [vocabularyScript, setVocabularyScript] = useState<VocabularyScript>(readStoredVocabularyScript);
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [selectedVocabularyId, setSelectedVocabularyId] = useState(vocabulary[0]?.id ?? '');
  const [detailVocabularyId, setDetailVocabularyId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>(readStoredReviewMode);
  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState(getInitialPodcast(podcasts).id);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [heardVocabularyId, setHeardVocabularyId] = useState<string | null>(null);
  const vocabularyAudioTimerRef = useRef<number | null>(null);

  const filteredVocabulary = useMemo(() => {
    const normalizedQuery = vocabularySearchQuery.trim().toLowerCase();
    const filteredByStatus = vocabulary.filter((item) => matchesVocabularyFilter(item.status, vocabularyFilter));

    if (!normalizedQuery) {
      return filteredByStatus;
    }

    return filteredByStatus.filter((item) => {
      const haystack = [
        item.word,
        item.article,
        item.meaning,
        item.pronunciation,
        item.module,
        item.example.jp,
        item.example.vi,
        ...item.tags,
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [vocabulary, vocabularyFilter, vocabularySearchQuery]);

  const selectedVocabulary = filteredVocabulary.find((item) => item.id === selectedVocabularyId) ?? filteredVocabulary[0] ?? vocabulary[0];
  const detailVocabulary = detailVocabularyId ? vocabulary.find((item) => item.id === detailVocabularyId) ?? null : null;
  const activePodcast = podcasts.find((podcast) => podcast.id === activePodcastId) ?? getInitialPodcast(podcasts);
  const dueVocabularyCount = vocabulary.filter((item) => item.status === 'due').length;

  // Nhiệm vụ hôm nay lấy từ log SRS thật, không phải số bịa.
  const streak = useProgressStore((state) => state.streak);
  const reviewLog = useReviewStore((state) => state.log);
  const reviewedToday = useMemo(() => countReviewedToday(reviewLog, course.id, Date.now()), [course.id, reviewLog]);
  const mission = useMemo(() => buildDailyMission({ vocabulary, reviewedToday }), [reviewedToday, vocabulary]);

  useEffect(() => {
    setActiveTab('vocabulary');
    setVocabularyFilter('all');
    setVocabularySearchQuery('');
    setSelectedVocabularyId(vocabulary[0]?.id ?? '');
    setDetailVocabularyId(null);
    // Chế độ ôn tập giữ theo lựa chọn đã lưu, không ép về từ vựng mỗi lần đổi khóa.
    setReviewMode(readStoredReviewMode());
    setExpandedDocumentId(null);
    setIsPodcastOpen(false);
    setActivePodcastId(getInitialPodcast(podcasts).id);
    setIsPodcastPlaying(false);
    setHeardVocabularyId(null);

    if (vocabularyAudioTimerRef.current !== null) {
      window.clearTimeout(vocabularyAudioTimerRef.current);
      vocabularyAudioTimerRef.current = null;
    }
  }, [course.id, documents, podcasts, vocabulary]);

  useEffect(() => {
    return () => {
      if (vocabularyAudioTimerRef.current !== null) {
        window.clearTimeout(vocabularyAudioTimerRef.current);
      }
    };
  }, []);

  const handleVocabularyAudio = (vocabularyId: string) => {
    if (vocabularyAudioTimerRef.current !== null) {
      window.clearTimeout(vocabularyAudioTimerRef.current);
    }

    setHeardVocabularyId(vocabularyId);
    vocabularyAudioTimerRef.current = window.setTimeout(() => {
      setHeardVocabularyId((currentId) => (currentId === vocabularyId ? null : currentId));
      vocabularyAudioTimerRef.current = null;
    }, 1200);
  };

  // Đổi chế độ ngay trong panel Ôn tập và nhớ cho lần sau — không còn modal chặn giữa đường.
  const handleReviewModeChange = (mode: ReviewMode) => {
    setReviewMode(mode);
    writeStoredReviewMode(mode);
  };

  const handleToggleDocument = (documentId: string) => {
    setExpandedDocumentId((currentId) => (currentId === documentId ? null : documentId));
  };

  const handleWorkspaceTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: WorkspaceTab) => {
    const currentIndex = workspaceTabs.findIndex((tab) => tab.id === currentTab);
    const tabVariant = 'compact';
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % workspaceTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + workspaceTabs.length) % workspaceTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = workspaceTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = workspaceTabs[nextIndex];
    setActiveTab(nextTab.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`course-workspace-${tabVariant}-tab-${nextTab.id}`)?.focus();
    });
  };

  const handleVocabularyScriptChange = (script: VocabularyScript) => {
    setVocabularyScript(script);
    writeStoredVocabularyScript(script);
  };

  const handleExitWorkspace = () => {
    // Luôn về danh sách khóa học. Workspace giờ là điểm vào trực tiếp (không còn trang
    // giới thiệu ở giữa) nên navigate(-1) không còn đoán được đích: tùy nơi vào mà nó
    // trả về dashboard, tìm kiếm, hoặc thậm chí ra ngoài app khi mở từ link ngoài.
    navigate('/app/courses');
  };

  const handleGoHome = () => {
    navigate('/app/dashboard');
  };

  const activeTabPanelLabelId = `course-workspace-compact-tab-${activeTab}`;

  return (
    <>
      <div data-course-workspace-background className="relative min-h-[calc(100dvh-1.5rem)] space-y-4 pb-[calc(7.25rem+env(safe-area-inset-bottom))] md:space-y-6 md:pb-[calc(7.75rem+env(safe-area-inset-bottom))]">
        <CourseWorkspaceHeader
          courseTitle={course.title}
          currentModule={course.currentModule}
          progress={course.progress}
          streak={streak}
          onExit={handleExitWorkspace}
          onGoHome={handleGoHome}
        />

      <section className="mx-auto w-full max-w-[980px] space-y-5 xl:max-w-[1040px] 2xl:max-w-[1120px]">
        <div className="space-y-4">
          {activeTab !== 'review' && <DailyMissionCard mission={mission} onStart={() => setActiveTab(mission.target)} />}

          <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-[1.7rem] border border-[rgba(198,182,163,0.5)] bg-[rgba(255,250,243,0.94)] p-2 shadow-[0_24px_60px_-34px_rgba(88,63,38,0.34)] backdrop-blur-xl md:inset-x-8 md:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] md:mx-auto md:max-w-3xl md:rounded-[2rem] lg:max-w-4xl xl:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="tablist" aria-label="Chọn khu vực học trong khóa" aria-orientation="horizontal">
              {workspaceTabs.map((tab) => (
                <div key={tab.id} className="min-w-0" role="presentation">
                  <TabButton tab={tab} activeTab={activeTab} onKeyDown={handleWorkspaceTabKeyDown} onSelect={setActiveTab} compact />
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} id={`course-workspace-panel-${activeTab}`} role="tabpanel" aria-labelledby={activeTabPanelLabelId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {activeTab === 'vocabulary' && (
                <VocabularyPanel
                  allVocabulary={vocabulary}
                  filteredVocabulary={filteredVocabulary}
                  heardVocabularyId={heardVocabularyId}
                  searchQuery={vocabularySearchQuery}
                  selectedVocabulary={selectedVocabulary}
                  vocabularyFilter={vocabularyFilter}
                  vocabularyScript={vocabularyScript}
                  onAudio={handleVocabularyAudio}
                  onFilterChange={setVocabularyFilter}
                  onOpenVocabularyDetail={(vocabularyId) => {
                    setSelectedVocabularyId(vocabularyId);
                    setDetailVocabularyId(vocabularyId);
                  }}
                  onScriptChange={handleVocabularyScriptChange}
                  onSearchChange={setVocabularySearchQuery}
                />
              )}
              {activeTab === 'review' && (
                <CourseReviewSession
                  courseId={course.id}
                  reviewMode={reviewMode}
                  reviewQuestions={reviewQuestions}
                  vocabulary={vocabulary}
                  onFinish={() => setActiveTab('vocabulary')}
                  onReviewModeChange={handleReviewModeChange}
                />
              )}
              {activeTab === 'documents' && <DocumentsPanel documents={documents} expandedDocumentId={expandedDocumentId} onToggleDocument={handleToggleDocument} />}
              {activeTab === 'games' && (
                <GamesPanel
                  courseId={course.id}
                  courseTitle={course.title}
                  vocabulary={vocabulary}
                  reviewQuestions={reviewQuestions}
                />
              )}
              {activeTab === 'exams' && <ExamsPanel exams={exams} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <CourseLearningPodcastPlayer
        activePodcast={activePodcast}
        isLauncherHidden={activeTab === 'review'}
        isOpen={isPodcastOpen}
        isPlaying={isPodcastPlaying}
        podcasts={podcasts}
        onClose={() => setIsPodcastOpen(false)}
        onOpen={() => setIsPodcastOpen(true)}
        onSelectPodcast={setActivePodcastId}
        onTogglePlay={() => setIsPodcastPlaying((currentValue) => !currentValue)}
      />
      </div>
      <VocabularyDetailDialog
        heardVocabularyId={heardVocabularyId}
        vocabulary={detailVocabulary}
        vocabularyScript={vocabularyScript}
        onAudio={handleVocabularyAudio}
        onClose={() => setDetailVocabularyId(null)}
      />
    </>
  );
}

interface VocabularyPanelProps {
  allVocabulary: CourseVocabularyItem[];
  filteredVocabulary: CourseVocabularyItem[];
  heardVocabularyId: string | null;
  searchQuery: string;
  selectedVocabulary: CourseVocabularyItem;
  vocabularyFilter: VocabularyFilter;
  vocabularyScript: VocabularyScript;
  onAudio: (vocabularyId: string) => void;
  onFilterChange: (filter: VocabularyFilter) => void;
  onOpenVocabularyDetail: (vocabularyId: string) => void;
  onScriptChange: (script: VocabularyScript) => void;
  onSearchChange: (query: string) => void;
}

function VocabularyPanel({ allVocabulary, filteredVocabulary, heardVocabularyId, searchQuery, selectedVocabulary, vocabularyFilter, vocabularyScript, onAudio, onFilterChange, onOpenVocabularyDetail, onScriptChange, onSearchChange }: VocabularyPanelProps) {
  const [viewMode, setViewMode] = useState<VocabularyViewMode>('list');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="workspace-panel space-y-3 rounded-[2.25rem] p-3.5 md:p-5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="Chế độ học từ vựng" className="flex shrink-0 gap-1 rounded-2xl border border-[#e6ddd1] bg-white p-1">
            {vocabularyViewModes.map((mode) => {
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setViewMode(mode.id)}
                  className={cn(
                    'flex min-h-11 items-center rounded-xl px-3 text-xs font-black transition-colors',
                    isActive ? 'bg-orange-700 text-white shadow-[0_12px_24px_-18px_rgba(201,106,27,0.5)]' : 'text-[#5f6b7c] hover:bg-orange-50',
                    focusRing
                  )}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div role="group" aria-label="Kiểu chữ hiển thị" className="flex shrink-0 gap-0.5 rounded-2xl border border-[#e6ddd1] bg-white p-1">
            {vocabularyScripts.map((script) => {
              const isActive = vocabularyScript === script.id;
              return (
                <button
                  key={script.id}
                  onClick={() => onScriptChange(script.id)}
                  aria-pressed={isActive}
                  title={script.name}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black leading-none transition-colors',
                    isActive ? 'bg-[#6f4aa8] text-white' : 'text-[#5f6b7c] hover:bg-[#f3eefb]',
                    focusRing
                  )}
                >
                  <span aria-hidden="true">{script.label}</span>
                  <span className="sr-only">{script.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 gap-1.5 overflow-x-auto no-scrollbar">
        {vocabularyFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            aria-current={vocabularyFilter === filter.id ? 'true' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-xs font-black transition-colors',
              vocabularyFilter === filter.id ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:bg-orange-50',
              focusRing
            )}
          >
            {filter.label}
            <span className="text-[11px] opacity-55">{countByFilter(allVocabulary, filter.id)}</span>
          </button>
        ))}
        </div>

        <button
          type="button"
          onClick={() => setIsSearchOpen((current) => !current)}
          aria-expanded={isSearchOpen}
          aria-label={isSearchOpen ? 'Đóng tìm kiếm từ vựng' : 'Tìm kiếm từ vựng'}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors',
            isSearchOpen || searchQuery ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:bg-orange-50',
            focusRing
          )}
        >
          <Search size={17} aria-hidden="true" focusable="false" />
        </button>
      </div>

      {isSearchOpen && (
        <label className="flex min-h-11 items-center gap-2.5 rounded-2xl border border-[#e6ddd1] bg-white px-3.5 text-sm font-bold text-[#5f6b7c] focus-within:border-orange-200 focus-within:ring-2 focus-within:ring-orange-100">
            <Search size={16} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
            <span className="sr-only">Tìm kiếm từ vựng</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm từ, nghĩa, ví dụ hoặc tag..."
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-bold text-[#172033] outline-none placeholder:text-[#95a0af]"
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')} className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[#95a0af]', focusRing)} aria-label="Xóa tìm kiếm">
                <X size={15} aria-hidden="true" focusable="false" />
              </button>
            )}
        </label>
      )}

      {viewMode === 'list' ? (
        <>

          {filteredVocabulary.length > 0 ? (
            <ul className="space-y-1.5">
              {filteredVocabulary.map((item) => (
                <li key={item.id}>
                  <div
                    className={cn(
                      'flex items-center gap-2.5 rounded-2xl border px-2.5 py-1.5 transition-colors',
                      selectedVocabulary.id === item.id
                        ? 'border-orange-200 bg-orange-50/60'
                        : 'border-[#e6ddd1] bg-white/70 hover:border-orange-200 hover:bg-orange-50/35'
                    )}
                  >
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', statusDotClasses[item.status])} aria-hidden="true" />
                    <button
                      onClick={() => onOpenVocabularyDetail(item.id)}
                      aria-current={selectedVocabulary.id === item.id ? 'true' : undefined}
                      className={cn('min-w-0 flex-1 rounded-xl py-1 text-left', focusRing)}
                    >
                      <span
                        className={cn(
                          'block truncate text-[15px] font-black leading-tight text-[#172033]',
                          vocabularyScript === 'romaji' ? 'italic' : 'text-base not-italic'
                        )}
                        lang={vocabularyScript === 'romaji' ? undefined : 'ja'}
                      >
                        {getVocabularyScriptText(item, vocabularyScript)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-semibold leading-tight text-[#5f6b7c]">
                        {item.meaning}
                        <span className="text-[#c9beb0]"> · </span>
                        <span className={statusTextClasses[item.status]}>{statusLabels[item.status]}</span>
                      </span>
                    </button>
                    <span className="shrink-0 text-[11px] font-black tabular-nums text-[#95a0af]" aria-label={`Độ chắc ${item.strength} phần trăm`}>
                      {item.strength}%
                    </span>
                    <button
                      onClick={() => onAudio(item.id)}
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors',
                        heardVocabularyId === item.id ? 'bg-orange-700 text-white' : 'text-[#95a0af] hover:bg-orange-50 hover:text-orange-700',
                        focusRing
                      )}
                      aria-label={`Nghe phát âm ${item.word}`}
                    >
                      <Volume2 size={17} aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#e6ddd1] bg-[#fffdf8] p-6 text-center">
              <p className="text-sm font-black text-[#172033]">Không tìm thấy từ phù hợp</p>
              <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">Thử đổi bộ lọc hoặc nhập từ khóa ngắn hơn.</p>
            </div>
          )}
        </>
      ) : (
        <VocabularyFlashcards
          heardVocabularyId={heardVocabularyId}
          items={filteredVocabulary}
          vocabularyScript={vocabularyScript}
          onAudio={onAudio}
          onOpenVocabularyDetail={onOpenVocabularyDetail}
        />
      )}
    </div>
  );
}

interface VocabularyFlashcardsProps {
  heardVocabularyId: string | null;
  items: CourseVocabularyItem[];
  vocabularyScript: VocabularyScript;
  onAudio: (vocabularyId: string) => void;
  onOpenVocabularyDetail: (vocabularyId: string) => void;
}

function VocabularyFlashcards({ heardVocabularyId, items, vocabularyScript, onAudio, onOpenVocabularyDetail }: VocabularyFlashcardsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Bộ lọc đổi thì danh sách ngắn lại — kéo con trỏ về đầu để không trỏ ra ngoài mảng.
  useEffect(() => {
    setIndex(0);
    setIsRevealed(false);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[#e6ddd1] bg-[#fffdf8] p-6 text-center">
        <p className="text-sm font-black text-[#172033]">Chưa có từ nào trong bộ lọc này</p>
        <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">Đổi bộ lọc để bắt đầu lật thẻ.</p>
      </div>
    );
  }

  const safeIndex = Math.min(index, items.length - 1);
  const card = items[safeIndex];

  const goTo = (nextIndex: number) => {
    setIndex((nextIndex + items.length) % items.length);
    setIsRevealed(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black tabular-nums text-[#5f6b7c]">
          Thẻ {safeIndex + 1}/{items.length}
        </span>
        <div className="flex min-w-0 flex-1 justify-end gap-1" aria-hidden="true">
          {items.slice(0, 12).map((item, dotIndex) => (
            <span
              key={item.id}
              className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotIndex === safeIndex ? 'bg-orange-700' : 'bg-[#e0d5c6]')}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => setIsRevealed((current) => !current)}
        aria-live="polite"
        aria-label={isRevealed ? `Nghĩa: ${card.meaning}. Chạm để lật lại mặt từ.` : `Từ ${getVocabularyScriptText(card, vocabularyScript)}. Chạm để lật xem nghĩa.`}
        className={cn('block w-full rounded-[1.75rem] [perspective:1200px]', focusRing)}
      >
        <motion.span
          className="relative block min-h-[13rem] w-full [transform-style:preserve-3d]"
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mặt trước: chỉ có từ, không lộ nghĩa — người học phải tự đoán trước khi lật. */}
          <span
            aria-hidden={isRevealed}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-[#e6ddd1] bg-white px-5 py-6 text-center [backface-visibility:hidden]"
          >
            <span
              className={cn('font-black leading-tight text-[#172033]', vocabularyScript === 'romaji' ? 'text-3xl italic' : 'text-4xl')}
              lang={vocabularyScript === 'romaji' ? undefined : 'ja'}
            >
              {getVocabularyScriptText(card, vocabularyScript)}
            </span>
            <span className="text-sm font-black text-orange-700" lang={vocabularyScript === 'kanji' ? 'ja' : undefined}>
              {vocabularyScript === 'romaji' ? `/${card.pronunciation}/` : getVocabularyReadingHint(card, vocabularyScript)}
            </span>
            <span className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#95a0af]">
              <RotateCcw size={13} aria-hidden="true" focusable="false" />
              Chạm để lật
            </span>
          </span>

          {/* Mặt sau: chỉ có nghĩa. Ví dụ và mẹo nhớ nằm ở nút chi tiết bên dưới. */}
          <span
            aria-hidden={!isRevealed}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-orange-200 bg-[#fffaf3] px-5 py-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Nghĩa</span>
            <span className="text-2xl font-black leading-tight text-[#172033]">{card.meaning}</span>
            <span className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#95a0af]">
              <RotateCcw size={13} aria-hidden="true" focusable="false" />
              Chạm để lật lại
            </span>
          </span>
        </motion.span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(safeIndex - 1)}
          className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e6ddd1] bg-white text-[#5f6b7c] transition-colors hover:text-orange-700', focusRing)}
          aria-label="Thẻ trước"
        >
          <ChevronLeft size={18} aria-hidden="true" focusable="false" />
        </button>
        <button
          onClick={() => onAudio(card.id)}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors',
            heardVocabularyId === card.id ? 'border-orange-200 bg-orange-700 text-white' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:text-orange-700',
            focusRing
          )}
          aria-label={`Nghe phát âm ${card.word}`}
        >
          <Volume2 size={18} aria-hidden="true" focusable="false" />
        </button>
        <button
          onClick={() => setIsRevealed((current) => !current)}
          className={cn('flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-700 px-4 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-orange-800', focusRing)}
        >
          <RotateCcw size={16} aria-hidden="true" focusable="false" />
          {isRevealed ? 'Xem lại từ' : 'Lật thẻ'}
        </button>
        <button
          onClick={() => goTo(safeIndex + 1)}
          className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e6ddd1] bg-white text-[#5f6b7c] transition-colors hover:text-orange-700', focusRing)}
          aria-label="Thẻ tiếp theo"
        >
          <ChevronRight size={18} aria-hidden="true" focusable="false" />
        </button>
      </div>

      <button
        onClick={() => onOpenVocabularyDetail(card.id)}
        className={cn('min-h-11 w-full rounded-2xl border border-[#e6ddd1] bg-white px-4 text-xs font-black text-[#5f6b7c] transition-colors hover:border-orange-200 hover:text-orange-700', focusRing)}
      >
        Xem giải thích, ví dụ và mẹo nhớ
      </button>
    </div>
  );
}

interface VocabularyDetailDialogProps {
  heardVocabularyId: string | null;
  vocabulary: CourseVocabularyItem | null;
  vocabularyScript: VocabularyScript;
  onAudio: (vocabularyId: string) => void;
  onClose: () => void;
}

function VocabularyDetailDialog({ heardVocabularyId, vocabulary, vocabularyScript, onAudio, onClose }: VocabularyDetailDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!vocabulary) {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    closeButtonRef.current?.focus();

    const backgroundElement = document.querySelector<HTMLElement>('[data-course-workspace-background]');
    backgroundElement?.setAttribute('inert', '');
    backgroundElement?.setAttribute('aria-hidden', 'true');

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((element): element is HTMLElement => element instanceof HTMLElement && element.offsetParent !== null);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      backgroundElement?.removeAttribute('inert');
      backgroundElement?.removeAttribute('aria-hidden');
    };
  }, [vocabulary]);

  return (
    <AnimatePresence>
      {vocabulary && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end bg-gray-950/28 px-3 pb-[calc(5.8rem+env(safe-area-inset-bottom))] pt-12 backdrop-blur-sm md:items-center md:justify-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-vocabulary-detail-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[calc(100dvh-8rem)] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_30px_80px_-36px_rgba(17,24,39,0.42)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Chi tiết từ vựng</p>
                <h3
                  id="course-vocabulary-detail-title"
                  className={cn('mt-2 font-black leading-tight text-[#172033]', vocabularyScript === 'romaji' ? 'text-3xl italic' : 'text-4xl')}
                  lang={vocabularyScript === 'romaji' ? undefined : 'ja'}
                >
                  {getVocabularyScriptText(vocabulary, vocabularyScript)}
                </h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-orange-700">/{vocabulary.pronunciation}/</p>
                  <button
                    onClick={() => onAudio(vocabulary.id)}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                      heardVocabularyId === vocabulary.id ? 'border-orange-200 bg-orange-700 text-white' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:text-orange-700',
                      focusRing
                    )}
                    aria-label={`Nghe phát âm ${vocabulary.word}`}
                  >
                    <Volume2 size={17} aria-hidden="true" focusable="false" />
                  </button>
                </div>
              </div>
              <button ref={closeButtonRef} onClick={onClose} className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5f6b7c] shadow-sm', focusRing)} aria-label="Đóng chi tiết từ vựng">
                <X size={18} aria-hidden="true" focusable="false" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <section className="rounded-2xl bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#95a0af]">Nghĩa</p>
                <p className="mt-1 text-xl font-black leading-snug text-[#172033]">{vocabulary.meaning}</p>
              </section>

              {/* Luôn liệt kê đủ dạng chữ có sẵn, không phụ thuộc chế độ đang chọn. */}
              <section className="rounded-2xl bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#95a0af]">Chữ viết</p>
                <dl className="mt-1.5 space-y-1">
                  {vocabulary.kanji && (
                    <div className="flex items-baseline gap-3">
                      <dt className="w-14 shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">Kanji</dt>
                      <dd className="text-lg font-black text-[#172033]" lang="ja">{vocabulary.kanji}</dd>
                    </div>
                  )}
                  {vocabulary.kana && (
                    <div className="flex items-baseline gap-3">
                      <dt className="w-14 shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">Kana</dt>
                      <dd className="text-lg font-black text-[#172033]" lang="ja">{vocabulary.kana}</dd>
                    </div>
                  )}
                  <div className="flex items-baseline gap-3">
                    <dt className="w-14 shrink-0 text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">Romaji</dt>
                    <dd className="text-lg font-black italic text-[#172033]">{getVocabularyDisplayName(vocabulary)}</dd>
                  </div>
                </dl>
              </section>

              {vocabulary.explanation && (
                <section className="rounded-2xl bg-white px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#95a0af]">
                    <Brain size={13} aria-hidden="true" focusable="false" />
                    Giải thích
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#3f4a5a]">{vocabulary.explanation}</p>
                </section>
              )}

              <section className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">
                  <MessageSquareQuote size={13} aria-hidden="true" focusable="false" />
                  Ví dụ
                </p>
                <p
                  className={cn('mt-1.5 font-black leading-snug text-[#172033]', vocabularyScript === 'romaji' ? 'text-sm' : 'text-base')}
                  lang={vocabularyScript === 'romaji' ? undefined : 'ja'}
                >
                  {getVocabularyExampleText(vocabulary, vocabularyScript)}
                </p>
                {vocabularyScript !== 'romaji' && (
                  <p className="mt-1 text-xs font-bold italic leading-snug text-[#95a0af]">{vocabulary.example.jp}</p>
                )}
                <p className="mt-1 text-sm font-semibold leading-snug text-[#5f6b7c]">{vocabulary.example.vi}</p>
              </section>

              {vocabulary.mnemonic && (
                <section className="rounded-2xl border border-[#ded2ee] bg-[#f7f3fd] px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#6f4aa8]">
                    <Lightbulb size={13} aria-hidden="true" focusable="false" />
                    Mẹo nhớ
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-relaxed text-[#3f4a5a]">{vocabulary.mnemonic}</p>
                </section>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]', statusClasses[vocabulary.status])}>{statusLabels[vocabulary.status]}</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">{vocabulary.module}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{vocabulary.strength}% chắc</span>
              {vocabulary.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#95a0af]">{tag}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

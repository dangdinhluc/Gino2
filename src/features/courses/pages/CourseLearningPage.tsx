import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningMenuSheet } from '@/src/features/courses/components/CourseLearningMenuSheet';
import { focusRing } from '@/src/features/courses/components/coursePanelStyles';
import { ArrowLeft, Flame, Headphones, LayoutGrid } from 'lucide-react';
import { type CourseLearningMeta, type CoursePodcastItem } from '@/src/features/courses/courseLearning.types';
import {
  useCourseDocuments,
  useCourseExams,
  useCourseGames,
  useCourseLearningMeta,
  useCoursePodcasts,
  useCoursePractice,
  useCourseVocabulary,
} from '@/src/features/courses/hooks/useCourseLearningModules';
import { CourseLearningSkeleton } from '@/src/features/courses/components/loading/CourseLearningSkeleton';
import { getVisibleCourseWorkspaceTabs } from '@/src/features/courses/lib/courseCapabilities';
import { useDelayedLoadingIndicator } from '@/src/features/courses/hooks/useDelayedLoadingIndicator';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { speakJapanese, stopSpeaking } from '@/src/shared/lib/tts';
import { cn } from '@/src/lib/utils';
import {
  courseWorkspaceTabs,
  type CourseWorkspaceSection,
} from '@/src/features/courses/lib/courseWorkspaceNavigation';

const LazyCourseLearningPodcastPlayer = lazy(() =>
  import('@/src/features/courses/components/CourseLearningPodcastPlayer').then(({ CourseLearningPodcastPlayer }) => ({ default: CourseLearningPodcastPlayer }))
);
const LazyCoursePracticePanel = lazy(() =>
  import('@/src/features/courses/components/CoursePracticePanel').then(({ CoursePracticePanel }) => ({ default: CoursePracticePanel }))
);
const LazyVocabularyPanel = lazy(() =>
  import('@/src/features/courses/components/CourseVocabularyPanel').then(({ VocabularyPanel }) => ({ default: VocabularyPanel }))
);
const LazyDocumentsPanel = lazy(() =>
  import('@/src/features/courses/components/DocumentsPanel').then(({ DocumentsPanel }) => ({ default: DocumentsPanel }))
);
const LazyGamesPanel = lazy(() =>
  import('@/src/features/courses/components/GamesPanel').then(({ GamesPanel }) => ({ default: GamesPanel }))
);
const LazyExamsPanel = lazy(() =>
  import('@/src/features/courses/components/ExamsPanel').then(({ ExamsPanel }) => ({ default: ExamsPanel }))
);

interface CourseLearningHeaderProps {
  activeTabLabel: string;
  activeTabPanelLabelId: string;
  courseTitle?: string | null;
  activePodcast?: CoursePodcastItem;
  hasPodcast?: boolean;
  isPodcastOpen: boolean;
  isPodcastPlaying: boolean;
  streak: number | null;
  statsError?: string | null;
  isModeSheetOpen: boolean;
  isModeSheetDisabled?: boolean;
  onOpenModeSheet?: () => void;
  onOpenPodcast?: () => void;
}

function CourseLearningHeader({
  activeTabLabel,
  activeTabPanelLabelId,
  courseTitle,
  activePodcast,
  hasPodcast = false,
  isPodcastOpen,
  isPodcastPlaying,
  streak,
  statsError,
  isModeSheetOpen,
  isModeSheetDisabled = false,
  onOpenModeSheet,
  onOpenPodcast,
}: CourseLearningHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="course-workspace-header learning-header -mx-3 border-b border-[#ececf2] bg-white px-3.5 py-2">
      <div className="mx-auto grid h-full w-full max-w-[760px] grid-cols-[40px_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/app/dashboard')}
          className={cn('flex h-11 w-11 items-center justify-center rounded-full text-[#35363d] hover:bg-[#f6f4fb]', focusRing)}
          aria-label="Thoát học và về Hôm nay"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0 text-center">
          <h1 id={activeTabPanelLabelId} className="truncate text-[14px] font-extrabold text-[#222329]">{activeTabLabel}</h1>
          <p className="truncate text-[9px] font-medium text-[#9799a3]">
            {courseTitle ?? (
              <>
                <span aria-hidden="true" className="gino2-skeleton-shimmer mx-auto block h-2.5 w-28 rounded-full" />
                <span className="sr-only">Đang tải tên khóa học</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenModeSheet?.()}
            disabled={isModeSheetDisabled}
            aria-haspopup="dialog"
            aria-expanded={isModeSheetDisabled ? undefined : isModeSheetOpen}
            aria-label="Đổi chế độ học"
            className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#ded6f3] bg-[#f5f0ff] text-[#6f45d8] transition-colors hover:bg-[#eee7ff] disabled:cursor-wait disabled:opacity-80', focusRing)}
          >
            <LayoutGrid size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
          {(activePodcast || hasPodcast) && (
            <button
              type="button"
              onClick={() => onOpenPodcast?.()}
              aria-haspopup="dialog"
              aria-expanded={isPodcastOpen}
              aria-label={isPodcastPlaying ? 'Mở audio đang phát' : 'Mở audio khóa học'}
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-full border transition-all',
                isPodcastPlaying
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-[#e7e3f0] bg-white text-[#6f45d8]',
                focusRing
              )}
            >
              <Headphones size={14} />
              {isPodcastPlaying && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500" />}
            </button>
          )}
          <span className="inline-flex h-11 items-center gap-1 rounded-full border border-[#ececf2] bg-white px-2 text-[10px] font-bold text-[#646771]" title={statsError ?? 'Chuỗi ngày học'}>
            <Flame size={12} className="fill-[#ff8559] text-[#ff8559]" /> {streak === null ? '—' : streak}
          </span>
        </div>
      </div>
    </header>
  );
}

function CourseLearningShell({ activeTab, children }: { activeTab: CourseWorkspaceSection; children: ReactNode }) {
  const activeTabDefinition = courseWorkspaceTabs.find((tab) => tab.id === activeTab);
  const activeTabPanelLabelId = `course-workspace-mode-${activeTab}`;

  return (
    <div data-course-workspace-background className="course-learning-workspace relative min-h-[100dvh] space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <CourseLearningHeader
        activeTabLabel={activeTabDefinition?.label ?? 'Từ vựng'}
        activeTabPanelLabelId={activeTabPanelLabelId}
        isPodcastOpen={false}
        isPodcastPlaying={false}
        isModeSheetOpen={false}
        isModeSheetDisabled
        streak={null}
      />
      <main className={cn('course-workspace-main mx-auto w-full max-w-[760px]', activeTab === 'practice' || activeTab === 'exams' ? 'lg:max-w-none' : '')}>
        {children}
      </main>
    </div>
  );
}

function CourseLearningModuleError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
      <p className="text-sm font-semibold text-red-700">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-full bg-white px-4 text-xs font-extrabold text-red-700 shadow-xs">Thử lại</button>
    </section>
  );
}

function CourseLearningPanelFallback({ activeTab }: { activeTab: CourseWorkspaceSection }) {
  return <CourseLearningSkeleton activeTab={activeTab} showDelayedMascot={false} />;
}

function CourseLearningWorkspaceContent({ meta }: { meta: CourseLearningMeta }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { course, featureConfig } = meta;
  const tabs = useMemo(() => {
    const visibleTabs = getVisibleCourseWorkspaceTabs(featureConfig);
    return visibleTabs.length > 0 ? visibleTabs : [...courseWorkspaceTabs];
  }, [featureConfig]);
  const requestedTab = tabs.find((tab) => tab.id === searchParams.get('tab'))?.id ?? null;

  const [activeTab, setActiveTab] = useState<CourseWorkspaceSection>(requestedTab ?? tabs[0]?.id ?? 'vocabulary');
  const vocabularyState = useCourseVocabulary(course.id, activeTab === 'vocabulary');
  const documentsState = useCourseDocuments(course.id, activeTab === 'documents');
  const practiceState = useCoursePractice(course.id, activeTab === 'practice');
  const gamesState = useCourseGames(course.id, activeTab === 'games');
  const examsState = useCourseExams(course.id, activeTab === 'exams');
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [vocabularyCategory, setVocabularyCategory] = useState('all');
  const [expandedVocabularyId, setExpandedVocabularyId] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const podcastsState = useCoursePodcasts(course.id, isPodcastOpen);
  const [activePodcastId, setActivePodcastId] = useState('');
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [isModeSheetOpen, setIsModeSheetOpen] = useState(false);
  const [heardVocabularyId, setHeardVocabularyId] = useState<string | null>(null);
  const [vocabularyAudioError, setVocabularyAudioError] = useState<string | null>(null);
  const [learnerStats, setLearnerStats] = useState<LearnerStatsSnapshot | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const vocabularyAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsTimerRef = useRef<number | null>(null);
  const streak = learnerStats?.currentStreak ?? null;
  const vocabulary = useMemo(() => vocabularyState.data?.vocabulary ?? [], [vocabularyState.data]);
  const documents = useMemo(() => documentsState.data?.documents ?? [], [documentsState.data]);
  const reviewQuestions = useMemo(() => practiceState.data?.reviewQuestions ?? [], [practiceState.data]);
  const practiceVocabulary = useMemo(() => practiceState.data?.vocabulary ?? [], [practiceState.data]);
  const gamesVocabulary = useMemo(() => gamesState.data?.vocabulary ?? [], [gamesState.data]);
  const exams = useMemo(() => examsState.data?.exams ?? [], [examsState.data]);
  const podcasts = useMemo(() => podcastsState.data?.podcasts ?? [], [podcastsState.data]);

  useEffect(() => {
    let cancelled = false;
    fetchLearnerStats()
      .then((stats) => { if (!cancelled) setLearnerStats(stats); })
      .catch((error: unknown) => { if (!cancelled) setStatsError(error instanceof Error ? error.message : 'Không đồng bộ được chỉ số học tập.'); });
    return () => { cancelled = true; };
  }, [course.id]);

  useEffect(() => {
    if (requestedTab) setActiveTab(requestedTab);
    else if (!tabs.some((tab) => tab.id === activeTab) && tabs[0]) setActiveTab(tabs[0].id);
  }, [activeTab, requestedTab, tabs]);

  const vocabularyCategories = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    vocabulary.forEach((item) => {
      categoryCounts.set(item.module, (categoryCounts.get(item.module) ?? 0) + 1);
    });
    return [
      { id: 'all', label: 'Tất cả', count: vocabulary.length },
      ...Array.from(categoryCounts, ([label, count]) => ({ id: label, label, count })),
    ];
  }, [vocabulary]);

  const categoryVocabulary = useMemo(() => {
    if (vocabularyCategory === 'all') return vocabulary;
    return vocabulary.filter((item) => item.module === vocabularyCategory);
  }, [vocabulary, vocabularyCategory]);

  const filteredVocabulary = useMemo(() => {
    const normalizedQuery = vocabularySearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return categoryVocabulary;

    return categoryVocabulary.filter((item) => {
      const haystack = [
        item.word,
        item.article,
        item.meaning,
        item.pronunciation,
        item.kanji ?? '',
        item.kana ?? '',
        item.module,
        item.example.jp,
        item.example.vi,
        ...item.tags,
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [categoryVocabulary, vocabularySearchQuery]);

  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? documents[0];
  const activePodcast = podcasts.find((podcast) => podcast.id === activePodcastId) ?? podcasts[0];
  const activeTabDefinition = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeModuleState = activeTab === 'vocabulary'
    ? vocabularyState
    : activeTab === 'documents'
      ? documentsState
      : activeTab === 'practice'
        ? practiceState
        : activeTab === 'games'
          ? gamesState
          : examsState;
  const activeModuleLoading = activeModuleState.isLoading || (!activeModuleState.data && !activeModuleState.loadError);
  const activeModuleError = activeModuleState.loadError;
  const retryActiveModule = activeModuleState.retry;
  const showDelayedMascot = useDelayedLoadingIndicator(activeModuleLoading, 400, activeTab);

  useEffect(() => {
    setVocabularySearchQuery('');
    setVocabularyCategory('all');
    setExpandedVocabularyId(null);
    setSelectedDocumentId('');
    setIsPodcastOpen(false);
    setActivePodcastId('');
    setIsPodcastPlaying(false);
    setHeardVocabularyId(null);

    vocabularyAudioRef.current?.pause();
    vocabularyAudioRef.current = null;
    if (ttsTimerRef.current) window.clearTimeout(ttsTimerRef.current);
    stopSpeaking();
  }, [course.id]);

  useEffect(() => {
    if (!selectedDocumentId && documents[0]) setSelectedDocumentId(documents[0].id);
  }, [documents, selectedDocumentId]);

  useEffect(() => {
    if (!activePodcastId && podcasts[0]) setActivePodcastId(podcasts[0].id);
  }, [activePodcastId, podcasts]);

  useEffect(() => {
    return () => {
      vocabularyAudioRef.current?.pause();
      if (ttsTimerRef.current) window.clearTimeout(ttsTimerRef.current);
      stopSpeaking();
    };
  }, []);

  const handleStartExam = (examId: string) => {
    navigate(`/app/exams/${examId}/start`);
  };

  const handleVocabularyAudio = (vocabularyId: string) => {
    const item = vocabulary.find((value) => value.id === vocabularyId);
    vocabularyAudioRef.current?.pause();
    vocabularyAudioRef.current = null;
    stopSpeaking();
    if (ttsTimerRef.current) window.clearTimeout(ttsTimerRef.current);
    setVocabularyAudioError(null);
    if (!item) return;

    if (!item.audioUrl) {
      setHeardVocabularyId(vocabularyId);
      speakJapanese(item.kanji ?? item.kana ?? item.word);
      ttsTimerRef.current = window.setTimeout(() => {
        setHeardVocabularyId((currentId) => currentId === vocabularyId ? null : currentId);
      }, 4000);
      return;
    }

    setHeardVocabularyId(vocabularyId);
    const audio = new Audio(item.audioUrl);
    vocabularyAudioRef.current = audio;
    audio.onended = () => setHeardVocabularyId((currentId) => currentId === vocabularyId ? null : currentId);
    audio.onerror = () => {
      setHeardVocabularyId((currentId) => currentId === vocabularyId ? null : currentId);
      setVocabularyAudioError('Không thể phát bản phát âm này.');
    };
    void audio.play().catch((error: unknown) => {
      setHeardVocabularyId((currentId) => currentId === vocabularyId ? null : currentId);
      setVocabularyAudioError(error instanceof Error ? error.message : 'Trình duyệt không thể phát bản phát âm này.');
    });
  };

  const handleWorkspaceTabSelect = (tab: CourseWorkspaceSection) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
    if (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 1023px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector<HTMLElement>('.desktop-workspace-main')?.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const activeTabPanelLabelId = `course-workspace-mode-${activeTab}`;

  return (
    <div
      data-course-workspace-background
      className="course-learning-workspace relative min-h-[100dvh] space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <CourseLearningHeader
        activeTabLabel={activeTabDefinition?.label ?? 'Từ vựng'}
        activeTabPanelLabelId={activeTabPanelLabelId}
        courseTitle={course.title}
        activePodcast={activePodcast}
        hasPodcast={meta.podcastCount > 0}
        isPodcastOpen={isPodcastOpen}
        isPodcastPlaying={isPodcastPlaying}
        streak={streak}
        statsError={statsError}
        isModeSheetOpen={isModeSheetOpen}
        onOpenModeSheet={() => setIsModeSheetOpen(true)}
        onOpenPodcast={() => setIsPodcastOpen(true)}
      />

      <CourseLearningMenuSheet
        activeSection={activeTab}
        courseTitle={course.title}
        isOpen={isModeSheetOpen}
        onClose={() => setIsModeSheetOpen(false)}
        onSelectSection={handleWorkspaceTabSelect}
        tabs={tabs}
      />

      <main className={cn('course-workspace-main mx-auto w-full max-w-[760px]', activeTab === 'practice' || activeTab === 'exams' ? 'lg:max-w-none' : '')}>
        <AnimatePresence initial={false}>
          {activeModuleLoading && (
            <motion.div
              key="course-learning-loading"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <CourseLearningSkeleton activeTab={activeTab} showDelayedMascot={showDelayedMascot} />
            </motion.div>
          )}
        </AnimatePresence>

        {!activeModuleLoading && (activeModuleError ? (
          <CourseLearningModuleError message={activeModuleError} onRetry={retryActiveModule} />
        ) : (
          <Suspense fallback={<CourseLearningPanelFallback activeTab={activeTab} />}>
            <AnimatePresence mode="wait">
              <motion.div
                className="course-workspace-panel"
                key={activeTab}
                id={`course-workspace-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={activeTabPanelLabelId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
              >
                {activeTab === 'vocabulary' && vocabularyState.data && (
                  <div className="space-y-3">
                    {vocabularyAudioError && <p role="status" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{vocabularyAudioError}</p>}
                    <LazyVocabularyPanel
                      courseId={course.id}
                      expandedVocabularyId={expandedVocabularyId}
                      filteredVocabulary={filteredVocabulary}
                      categoryOptions={vocabularyCategories}
                      selectedCategory={vocabularyCategory}
                      heardVocabularyId={heardVocabularyId}
                      searchQuery={vocabularySearchQuery}
                      showFurigana={showFurigana}
                      showRomaji={showRomaji}
                      onAudio={handleVocabularyAudio}
                      onSearchChange={setVocabularySearchQuery}
                      onCategoryChange={(categoryId) => {
                        setVocabularyCategory(categoryId);
                        setVocabularySearchQuery('');
                        setExpandedVocabularyId(null);
                      }}
                      onToggleFurigana={() => setShowFurigana((value) => !value)}
                      onToggleRomaji={() => setShowRomaji((value) => !value)}
                      onToggleVocabulary={(vocabularyId) => setExpandedVocabularyId((currentId) => (currentId === vocabularyId ? null : vocabularyId))}
                    />
                  </div>
                )}
                {activeTab === 'documents' && documentsState.data && selectedDocument && <LazyDocumentsPanel courseId={course.id} documents={documents} selectedDocument={selectedDocument} onSelectDocument={setSelectedDocumentId} />}
                {activeTab === 'documents' && documentsState.data && !selectedDocument && <div className="rounded-xl border border-dashed border-[#e6e2ec] bg-white px-4 py-8 text-center text-sm text-[#8b8e98]">Khóa học chưa có tài liệu.</div>}
                {activeTab === 'practice' && practiceState.data && <LazyCoursePracticePanel courseId={course.id} courseTitle={course.title} vocabulary={practiceVocabulary} reviewQuestions={reviewQuestions} />}
                {activeTab === 'games' && gamesState.data && <LazyGamesPanel courseId={course.id} courseTitle={course.title} vocabulary={gamesVocabulary} />}
                {activeTab === 'exams' && examsState.data && <LazyExamsPanel exams={exams} onStartExam={handleStartExam} />}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        ))}
      </main>

      {activePodcast && (
        <Suspense fallback={null}>
          <LazyCourseLearningPodcastPlayer
            activePodcast={activePodcast}
            isOpen={isPodcastOpen}
            podcasts={podcasts}
            onClose={() => setIsPodcastOpen(false)}
            onPlayingChange={setIsPodcastPlaying}
            onSelectPodcast={setActivePodcastId}
          />
        </Suspense>
      )}
    </div>
  );
}

function getLoadingTab(requestedTab: string | null): CourseWorkspaceSection {
  return courseWorkspaceTabs.some((tab) => tab.id === requestedTab) ? requestedTab as CourseWorkspaceSection : 'vocabulary';
}

export default function CourseLearningWorkspace() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const meta = useCourseLearningMeta(id);
  const loadingTab = getLoadingTab(searchParams.get('tab'));
  const showDelayedMascot = useDelayedLoadingIndicator(meta.isLoading, 400, loadingTab);

  if (meta.isLoading) {
    return (
      <CourseLearningShell activeTab={loadingTab}>
        <CourseLearningSkeleton activeTab={loadingTab} showDelayedMascot={showDelayedMascot} />
      </CourseLearningShell>
    );
  }
  if (meta.loadError || !meta.data) {
    return (
      <CourseLearningShell activeTab={loadingTab}>
        <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center text-sm font-semibold text-red-700">
          {meta.loadError ?? 'Không tải được thông tin khóa học.'}
        </section>
      </CourseLearningShell>
    );
  }

  return <CourseLearningWorkspaceContent meta={meta.data} />;
}

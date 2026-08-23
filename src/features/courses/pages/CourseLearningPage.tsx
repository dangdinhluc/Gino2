import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { CoursePracticePanel } from '@/src/features/courses/components/CoursePracticePanel';
import { VocabularyPanel } from '@/src/features/courses/components/CourseVocabularyPanel';
import {
  DocumentsPanel,
  ExamsPanel,
  GamesPanel,
  TabButton,
  focusRing,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { ArrowLeft, Flame, Headphones } from 'lucide-react';
import { type CourseLearningWorkspaceData } from '@/src/features/courses/courseLearning.types';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { speakJapanese, stopSpeaking } from '@/src/shared/lib/tts';
import { assets } from '@/src/shared/lib/assets';
import { cn } from '@/src/lib/utils';
import {
  courseWorkspaceTabs,
  type CourseWorkspaceSection,
} from '@/src/features/courses/lib/courseWorkspaceNavigation';

function requestedWorkspaceTab(value: string | null): CourseWorkspaceSection | null {
  return courseWorkspaceTabs.find((tab) => tab.id === value)?.id ?? null;
}

function CourseLearningWorkspaceContent({ workspace }: { workspace: CourseLearningWorkspaceData }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { course, vocabulary, reviewQuestions, documents, exams, podcasts } = workspace;
  const requestedTab = requestedWorkspaceTab(searchParams.get('tab'));

  const [activeTab, setActiveTab] = useState<CourseWorkspaceSection>(requestedTab ?? 'vocabulary');
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [vocabularyCategory, setVocabularyCategory] = useState('all');
  const [expandedVocabularyId, setExpandedVocabularyId] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(documents[0]?.id ?? '');
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState(podcasts[0]?.id ?? '');
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [heardVocabularyId, setHeardVocabularyId] = useState<string | null>(null);
  const [vocabularyAudioError, setVocabularyAudioError] = useState<string | null>(null);
  const [learnerStats, setLearnerStats] = useState<LearnerStatsSnapshot | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const vocabularyAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsTimerRef = useRef<number | null>(null);
  const streak = learnerStats?.currentStreak ?? null;

  useEffect(() => {
    let cancelled = false;
    fetchLearnerStats()
      .then((stats) => { if (!cancelled) setLearnerStats(stats); })
      .catch((error: unknown) => { if (!cancelled) setStatsError(error instanceof Error ? error.message : 'Không đồng bộ được chỉ số học tập.'); });
    return () => { cancelled = true; };
  }, [course.id]);

  useEffect(() => {
    if (requestedTab) setActiveTab(requestedTab);
  }, [requestedTab]);

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
  const activeTabDefinition = courseWorkspaceTabs.find((tab) => tab.id === activeTab) ?? courseWorkspaceTabs[0];

  useEffect(() => {
    setVocabularySearchQuery('');
    setVocabularyCategory('all');
    setExpandedVocabularyId(null);
    setSelectedDocumentId(documents[0]?.id ?? '');
    setIsPodcastOpen(false);
    setActivePodcastId(podcasts[0]?.id ?? '');
    setIsPodcastPlaying(false);
    setHeardVocabularyId(null);

    vocabularyAudioRef.current?.pause();
    vocabularyAudioRef.current = null;
    if (ttsTimerRef.current) window.clearTimeout(ttsTimerRef.current);
    stopSpeaking();
  }, [course.id, documents, podcasts, vocabulary]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkspaceTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: CourseWorkspaceSection) => {
    const currentIndex = courseWorkspaceTabs.findIndex((tab) => tab.id === currentTab);
    let nextIndex: number;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % courseWorkspaceTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + courseWorkspaceTabs.length) % courseWorkspaceTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = courseWorkspaceTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = courseWorkspaceTabs[nextIndex];
    handleWorkspaceTabSelect(nextTab.id);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`course-workspace-${event.currentTarget.id.includes('-rail-') ? 'rail' : 'compact'}-tab-${nextTab.id}`)
        ?.focus();
    });
  };

  const activeTabPanelLabelId = `course-workspace-compact-tab-${activeTab}`;
  const courseHomePath = `/app/courses/${course.id}/learn`;

  return (
    <div
      data-course-workspace-background
      className="course-learning-workspace relative min-h-[calc(100dvh-1.5rem)] space-y-3 pb-[calc(6.15rem+env(safe-area-inset-bottom))]"
    >
      <header className="course-workspace-header sticky top-0 z-40 -mx-3 border-b border-[#ececf2] bg-white/96 px-3.5 py-2 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-[760px] grid-cols-[40px_1fr_auto] items-center gap-2">
          <Link
            to={courseHomePath}
            className={cn('flex h-9 w-9 items-center justify-center rounded-full text-[#35363d] hover:bg-[#f6f4fb]', focusRing)}
            aria-label="Về tổng quan khóa học"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-[14px] font-extrabold text-[#222329]">{activeTabDefinition.label}</h1>
            <p className="truncate text-[9px] font-medium text-[#9799a3]">{course.title}</p>
          </div>

          <div className="flex items-center justify-end gap-1.5">
            {activePodcast && (
              <button
                type="button"
                onClick={() => setIsPodcastOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isPodcastOpen}
                aria-label={isPodcastPlaying ? 'Mở audio đang phát' : 'Mở audio khóa học'}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-full border transition-all',
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
            <span className="inline-flex h-8 items-center gap-1 rounded-full border border-[#ececf2] bg-white px-2.5 text-[10px] font-bold text-[#646771]" title={statsError ?? 'Chuỗi ngày học'}>
              <Flame size={12} className="fill-[#ff8559] text-[#ff8559]" /> {streak === null ? '—' : streak}
            </span>
          </div>
        </div>
      </header>

      <nav className="course-workspace-desktop-tabs" role="tablist" aria-label="Chọn khu vực học trong khóa">
        {courseWorkspaceTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`course-workspace-rail-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={isActive ? `course-workspace-panel-${tab.id}` : undefined}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(event) => handleWorkspaceTabKeyDown(event, tab.id)}
              onClick={() => handleWorkspaceTabSelect(tab.id)}
              className={cn('course-workspace-desktop-tab', isActive && 'is-active', focusRing)}
            >
              <span className="course-workspace-desktop-tab-icon"><img src={tab.imageIcon} alt="" /></span>
              <span className="course-workspace-desktop-tab-copy"><span>{tab.label}</span><small>{tab.hint}</small></span>
            </button>
          );
        })}
      </nav>

      <main className={cn('course-workspace-main mx-auto w-full max-w-[760px]', activeTab === 'practice' || activeTab === 'exams' ? 'lg:max-w-none' : '')}>
        <AnimatePresence mode="wait">
          <motion.div
            className="course-workspace-panel"
            key={activeTab}
            id={`course-workspace-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={activeTabPanelLabelId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            {activeTab === 'vocabulary' && (
              <div className="space-y-3">
                {vocabularyAudioError && <p role="status" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{vocabularyAudioError}</p>}
                <VocabularyPanel
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
            {activeTab === 'documents' && selectedDocument && <DocumentsPanel courseId={course.id} documents={documents} selectedDocument={selectedDocument} onSelectDocument={setSelectedDocumentId} />}
            {activeTab === 'documents' && !selectedDocument && <div className="rounded-xl border border-dashed border-[#e6e2ec] bg-white px-4 py-8 text-center text-sm text-[#8b8e98]">Khóa học chưa có tài liệu.</div>}
            {activeTab === 'practice' && <CoursePracticePanel courseTitle={course.title} vocabulary={vocabulary} reviewQuestions={reviewQuestions} />}
            {activeTab === 'games' && <GamesPanel courseId={course.id} courseTitle={course.title} vocabulary={vocabulary} />}
            {activeTab === 'exams' && <ExamsPanel exams={exams} onStartExam={handleStartExam} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="course-workspace-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-[#e8e8ef] bg-white/98 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-[760px] grid-cols-6 gap-0" role="tablist" aria-label="Điều hướng trong khóa học" aria-orientation="horizontal">
          <Link to={courseHomePath} className="flex min-h-[3.35rem] min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[9px] font-semibold text-[#6f727c]">
            <img src={assets.shared.navigation.home} alt="" className="h-6 w-6 object-contain opacity-70 grayscale-[15%]" />
            <span className="max-w-full truncate">Tổng quan</span>
          </Link>
          {courseWorkspaceTabs.map((tab) => (
            <div key={tab.id} className="min-w-0" role="presentation">
              <TabButton tab={tab} activeTab={activeTab} onKeyDown={handleWorkspaceTabKeyDown} onSelect={handleWorkspaceTabSelect} compact />
            </div>
          ))}
        </div>
      </nav>

      {activePodcast && (
        <CourseLearningPodcastPlayer
          activePodcast={activePodcast}
          isOpen={isPodcastOpen}
          podcasts={podcasts}
          onClose={() => setIsPodcastOpen(false)}
          onPlayingChange={setIsPodcastPlaying}
          onSelectPodcast={setActivePodcastId}
        />
      )}
    </div>
  );
}

export default function CourseLearningWorkspace() {
  const { id } = useParams();
  const workspace = useCourseLearningWorkspace(id);

  if (workspace.isLoading) {
    return <div className="mx-auto flex min-h-[60vh] items-center justify-center rounded-2xl border border-[#e8e8ef] bg-white px-5 text-sm font-bold text-[#6f727c]">Đang tải nội dung khóa học…</div>;
  }
  if (workspace.loadError || !workspace.data) {
    return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700">{workspace.loadError ?? 'Không tải được workspace khóa học.'}</div>;
  }

  return <CourseLearningWorkspaceContent workspace={workspace.data} />;
}

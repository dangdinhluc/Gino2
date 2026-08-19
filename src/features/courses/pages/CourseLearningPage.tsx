import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { CourseDailyQuest } from '@/src/features/courses/components/CourseDailyQuest';
import { CourseLearningMenuSheet } from '@/src/features/courses/components/CourseLearningMenuSheet';
import { CoursePracticePanel } from '@/src/features/courses/components/CoursePracticePanel';
import { VocabularyPanel } from '@/src/features/courses/components/CourseVocabularyPanel';
import {
  DocumentsPanel,
  ExamsPanel,
  GamesPanel,
  TabButton,
  focusRing,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { Bird, ChevronRight, Flame, Headphones, Zap } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseLearningWorkspaceData,
  type CoursePodcastItem,
} from '@/src/features/courses/courseLearning.types';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { speakJapanese, stopSpeaking } from '@/src/shared/lib/tts';
import { cn } from '@/src/lib/utils';
import {
  courseWorkspaceTabs,
  type CourseWorkspaceSection,
} from '@/src/features/courses/lib/courseWorkspaceNavigation';

function getInitialDocument(documents: CourseDocumentItem[]): CourseDocumentItem {
  const document = documents[0];
  if (!document) throw new Error('Khóa học chưa có tài liệu để hiển thị.');
  return document;
}

function getInitialPodcast(podcasts: CoursePodcastItem[]): CoursePodcastItem {
  const podcast = podcasts[0];
  if (!podcast) throw new Error('Khóa học chưa có audio để hiển thị.');
  return podcast;
}

function CourseLearningWorkspaceContent({ workspace }: { workspace: CourseLearningWorkspaceData }) {
  const navigate = useNavigate();
  const { course, vocabulary, reviewQuestions, documents, exams, podcasts } = workspace;

  const [activeTab, setActiveTab] = useState<CourseWorkspaceSection>('vocabulary');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuGuideVisible, setIsMenuGuideVisible] = useState(false);
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [vocabularyCategory, setVocabularyCategory] = useState('all');
  const [expandedVocabularyId, setExpandedVocabularyId] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState(getInitialDocument(documents).id);
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState(getInitialPodcast(podcasts).id);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [heardVocabularyId, setHeardVocabularyId] = useState<string | null>(null);
  const [vocabularyAudioError, setVocabularyAudioError] = useState<string | null>(null);
  const [learnerStats, setLearnerStats] = useState<LearnerStatsSnapshot | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const vocabularyAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsTimerRef = useRef<number | null>(null);
  const streak = learnerStats?.currentStreak ?? null;
  const learnerLevel = learnerStats ? Math.floor(learnerStats.totalXp / 500) + 1 : null;

  useEffect(() => {
    let cancelled = false;
    fetchLearnerStats()
      .then((stats) => { if (!cancelled) setLearnerStats(stats); })
      .catch((error: unknown) => { if (!cancelled) setStatsError(error instanceof Error ? error.message : 'Không đồng bộ được chỉ số học tập.'); });
    return () => { cancelled = true; };
  }, [course.id]);

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

    if (!normalizedQuery) {
      return categoryVocabulary;
    }

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

  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? getInitialDocument(documents);
  const activePodcast = podcasts.find((podcast) => podcast.id === activePodcastId) ?? getInitialPodcast(podcasts);

  useEffect(() => {
    const storageKey = `gino-course-menu-guide:${course.id}`;
    try {
      setIsMenuGuideVisible(window.localStorage.getItem(storageKey) !== 'seen');
    } catch {
      setIsMenuGuideVisible(true);
    }
  }, [course.id]);

  useEffect(() => {
    setActiveTab('vocabulary');
    setIsMenuOpen(false);
    setVocabularySearchQuery('');
    setVocabularyCategory('all');
    setExpandedVocabularyId(null);
    setSelectedDocumentId(getInitialDocument(documents).id);
    setIsPodcastOpen(false);
    setActivePodcastId(getInitialPodcast(podcasts).id);
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

    // Có file upload → phát file; không có → đọc bằng giọng máy (Web Speech API, không cần upload).
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
  };

  const dismissMenuGuide = () => {
    setIsMenuGuideVisible(false);
    try {
      window.localStorage.setItem(`gino-course-menu-guide:${course.id}`, 'seen');
    } catch {
      // localStorage có thể bị chặn trong chế độ riêng tư; tooltip vẫn đóng trong phiên hiện tại.
    }
  };

  const handleOpenCourseMenu = () => {
    dismissMenuGuide();
    setIsMenuOpen(true);
  };

  const handleWorkspaceTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: CourseWorkspaceSection) => {
    const currentIndex = courseWorkspaceTabs.findIndex((tab) => tab.id === currentTab);
    let nextIndex = currentIndex;

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
    setActiveTab(nextTab.id);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`course-workspace-${event.currentTarget.id.includes('-rail-') ? 'rail' : 'compact'}-tab-${nextTab.id}`)
        ?.focus();
    });
  };

  // Menu tổng: chuyển khu vực trong khóa hoặc đi ra ngoài (gồm trở về trang chủ).
  const handleSelectSection = (section: CourseWorkspaceSection) => {
    setActiveTab(section);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const clampedProgress = Math.max(0, Math.min(100, course.progress));
  const activeTabPanelLabelId = `course-workspace-compact-tab-${activeTab}`;

  return (
    <div
      data-course-workspace-background
      className="course-learning-workspace relative min-h-[calc(100dvh-1.5rem)] space-y-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))]"
    >
      {/* Ultra-Modern Floating Workspace Header */}
      <header className="course-workspace-header sticky top-0 z-40 -mx-3 border-b border-[#eedecf]/80 bg-[#fffaf5]/96 px-3.5 py-2 backdrop-blur-xl shadow-[0_2px_12px_rgba(217,74,19,0.04)]">
        <div className="mx-auto flex w-full max-w-[980px] items-center justify-between gap-3">
          {/* Left: 3D Mascot Menu Drawer Trigger */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleOpenCourseMenu}
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              className={cn(
                'group flex items-center gap-2 rounded-full border border-orange-200/80 bg-white p-1 pr-3 shadow-2xs transition-all duration-200 hover:border-[#d83a00] hover:bg-orange-50/60 active:scale-97',
                focusRing
              )}
              aria-label="Mở menu khóa học"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#d83a00] to-[#f27427] text-white shadow-2xs transition-transform group-hover:scale-105">
                <Bird size={18} strokeWidth={2.2} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500" />
              </div>
              <span className="text-xs font-extrabold text-[#172033] group-hover:text-[#d83a00]">
                Menu
              </span>
              <ChevronRight size={13} className="text-[#d83a00] opacity-70 transition-transform group-hover:translate-x-0.5" />
            </button>

            <AnimatePresence>
              {isMenuGuideVisible && !isMenuOpen && (
                <motion.div
                  role="status"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  className="absolute left-0 top-full z-[70] mt-3 w-[18rem] rounded-2xl border border-orange-200 bg-[#fffaf3] p-4 text-left shadow-[0_18px_40px_-18px_rgba(111,54,33,0.48)]"
                >
                  <span className="absolute -top-2 left-5 h-4 w-4 rotate-45 border-l border-t border-orange-200 bg-[#fffaf3]" aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-700 text-[10px] text-white">1</span>
                      Meow hướng dẫn
                    </div>
                    <p className="mt-2 text-sm font-bold leading-snug text-[#172033]">Bấm vào đây để chọn chế độ học</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#5f6b7c]">Mở menu để chuyển phần học, xem cài đặt hoặc trở về trang chủ.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenCourseMenu}
                        className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-orange-700 px-3 text-xs font-bold text-white hover:bg-orange-800', focusRing)}
                      >
                        Mở menu <ChevronRight size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={dismissMenuGuide}
                        className={cn('min-h-9 rounded-xl px-3 text-xs font-semibold text-[#5f6b7c] hover:bg-orange-50 hover:text-[#172033]', focusRing)}
                      >
                        Đã hiểu
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Nhiệm vụ hôm nay, Podcast shortcut, streak & level badges */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <CourseDailyQuest stats={learnerStats} onNavigate={handleSelectSection} variant="header" />

            <button
              type="button"
              onClick={() => setIsPodcastOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isPodcastOpen}
              aria-label={isPodcastPlaying ? 'Mở podcast đang phát' : 'Mở podcast bài học'}
              title="Mở podcast bài học"
              className={cn(
                'group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-2xs transition-all hover:-translate-y-0.5 active:scale-95 lg:h-10 lg:w-10',
                isPodcastPlaying
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200/70'
                  : 'border-orange-200/90 bg-gradient-to-br from-[#fff7f0] to-[#ffe5cf] text-[#d83a00] hover:border-[#d83a00] hover:bg-orange-50',
                focusRing
              )}
            >
              <Headphones size={17} strokeWidth={2.2} aria-hidden="true" />
              {isPodcastPlaying && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
              )}
              <span className="sr-only">{isPodcastPlaying ? 'Đang phát podcast' : 'Podcast bài học'}</span>
            </button>

            <span
              className="flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50/90 px-2.5 py-1 text-xs font-black text-[#c2410c] shadow-2xs sm:px-3"
              title={statsError ?? 'Chuỗi ngày học liên tiếp'}
            >
              <Flame size={14} className="text-orange-500 fill-orange-400" />
              <span>{streak === null ? '—' : `${streak}d`}</span>
            </span>

            <span
              className="flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/90 px-2.5 py-1 text-xs font-black text-[#b45309] shadow-2xs sm:px-3"
              title="Cấp độ hiện tại"
            >
              <Zap size={14} className="text-amber-500 fill-amber-400" />
              <span>Lv.{learnerLevel}</span>
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
              <span className="course-workspace-desktop-tab-icon">
                <img src={tab.imageIcon} alt="" />
              </span>
              <span className="course-workspace-desktop-tab-copy">
                <span>{tab.label}</span>
                <small>{tab.hint}</small>
              </span>
              <ChevronRight className="course-workspace-desktop-tab-arrow" size={16} aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      <main className={cn('course-workspace-main mx-auto w-full', activeTab === 'practice' || activeTab === 'exams' ? 'max-w-none' : 'max-w-[980px]')}>
        <AnimatePresence mode="wait">
          <motion.div
            className="course-workspace-panel"
            key={activeTab}
            id={`course-workspace-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={activeTabPanelLabelId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
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
            {activeTab === 'documents' && <DocumentsPanel courseId={course.id} documents={documents} selectedDocument={selectedDocument} onSelectDocument={setSelectedDocumentId} />}
            {activeTab === 'practice' && <CoursePracticePanel courseTitle={course.title} vocabulary={vocabulary} reviewQuestions={reviewQuestions} />}
            {activeTab === 'games' && (
              <GamesPanel
                courseId={course.id}
                courseTitle={course.title}
                vocabulary={vocabulary}
              />
            )}
            {activeTab === 'exams' && <ExamsPanel exams={exams} onStartExam={handleStartExam} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="course-workspace-mobile-nav fixed inset-x-0 bottom-0 z-50 border-t border-[#e8dccb] bg-[#fffaf3]/97 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-5 gap-1" role="tablist" aria-label="Chọn khu vực học trong khóa" aria-orientation="horizontal">
          {courseWorkspaceTabs.map((tab) => (
            <div key={tab.id} className="min-w-0" role="presentation">
              <TabButton tab={tab} activeTab={activeTab} onKeyDown={handleWorkspaceTabKeyDown} onSelect={handleWorkspaceTabSelect} compact />
            </div>
          ))}
        </div>
      </nav>

      <CourseLearningMenuSheet
        activeSection={activeTab}
        courseTitle={course.title}
        isOpen={isMenuOpen}
        level={learnerLevel}
        progress={clampedProgress}
        streak={streak}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigate}
        onSelectSection={handleSelectSection}
      />

      <CourseLearningPodcastPlayer
        activePodcast={activePodcast}
        isOpen={isPodcastOpen}
        podcasts={podcasts}
        onClose={() => setIsPodcastOpen(false)}
        onPlayingChange={setIsPodcastPlaying}
        onSelectPodcast={setActivePodcastId}
      />

    </div>
  );
}

export default function CourseLearningWorkspace() {
  const { id } = useParams();
  const workspace = useCourseLearningWorkspace(id);

  if (workspace.isLoading) {
    return <div className="mx-auto flex min-h-[60vh] items-center justify-center rounded-2xl border border-[#e8dccb] bg-[#fffaf3] px-5 text-sm font-bold text-[#5f6b7c]">Đang tải nội dung khóa học…</div>;
  }
  if (workspace.loadError || !workspace.data) {
    return <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700">{workspace.loadError ?? 'Không tải được workspace khóa học.'}</div>;
  }

  return <CourseLearningWorkspaceContent workspace={workspace.data} />;
}

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { CourseExamRunner, type CourseExamQuestion } from '@/src/features/courses/components/CourseExamRunner';
import { CourseLearningMenuSheet } from '@/src/features/courses/components/CourseLearningMenuSheet';
import { CourseReviewPanel, type ReviewMode } from '@/src/features/courses/components/CourseReviewPanel';
import { VocabularyPanel, getVocabularyDisplayName } from '@/src/features/courses/components/CourseVocabularyPanel';
import {
  DocumentsPanel,
  ExamsPanel,
  GamesPanel,
  TabButton,
  focusRing,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { Bird, ChevronRight, FileText, Flame, Gamepad2, GraduationCap, Layers, Menu, Target, Zap } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseExamItem,
  type CoursePodcastItem,
  type CourseReviewQuestion,
  type NonEmptyArray,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { saveReviewAttempt, saveVocabularyReview } from '@/src/features/courses/repositories/learningProgressRepository';
import type { CourseGameType } from '@/src/features/games/types';
import { cn } from '@/src/lib/utils';
import PracticePage from '@/src/features/review/pages/PracticePage';

type WorkspaceTab = 'vocabulary' | 'documents' | 'practice' | 'review' | 'games' | 'exams';

// Thứ tự tab đi theo mạch học: học từ -> đọc tài liệu -> ôn -> chơi -> thi.
const workspaceTabs = [
  { id: 'vocabulary', label: 'Từ vựng', icon: Layers },
  { id: 'documents', label: 'Tài liệu', icon: FileText },
  { id: 'practice', label: 'Luyện tập', icon: Target },
  { id: 'review', label: 'Ôn tập', icon: Zap },
  { id: 'games', label: 'Game', icon: Gamepad2 },
  { id: 'exams', label: 'Thi thử', icon: GraduationCap },
] satisfies Array<{ id: WorkspaceTab; label: string; icon: typeof Layers }>;

function getInitialDocument(documents: NonEmptyArray<CourseDocumentItem>): CourseDocumentItem {
  return documents[0];
}

function getInitialPodcast(podcasts: NonEmptyArray<CoursePodcastItem>): CoursePodcastItem {
  return podcasts[0];
}

function reviewSkillLabel(type: CourseReviewQuestion['type']) {
  switch (type) {
    case 'meaning':
      return 'Từ vựng';
    case 'article':
      return 'Tình huống';
    case 'sentence':
      return 'Phỏng vấn';
    case 'listening':
      return 'Nghe hiểu';
    default:
      return 'Tổng ôn';
  }
}

function buildQuizOptions(answer: string, pool: string[], limit = 4) {
  const uniqueDistractors = pool.filter((option, index, options) => option !== answer && options.indexOf(option) === index);
  return [answer, ...uniqueDistractors].slice(0, limit).sort((a, b) => a.localeCompare(b, 'vi'));
}

export default function CourseLearningWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const workspace = useCourseLearningWorkspace(id);
  const { course, vocabulary, reviewQuestions, documents, exams, podcasts } = workspace;

  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);
  const learnerLevel = Math.floor(weeklyXp / 500) + 1;

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('vocabulary');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuGuideVisible, setIsMenuGuideVisible] = useState(false);
  const [activeExam, setActiveExam] = useState<CourseExamItem | null>(null);
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [vocabularyCategory, setVocabularyCategory] = useState('all');
  const [expandedVocabularyId, setExpandedVocabularyId] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [reviewMode, setReviewMode] = useState<ReviewMode | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [vocabularyQuestionIndex, setVocabularyQuestionIndex] = useState(0);
  const [selectedVocabularyAnswer, setSelectedVocabularyAnswer] = useState<string | null>(null);
  const [reviewStats, setReviewStats] = useState({ answered: 0, correct: 0 });
  const [isSessionSummaryOpen, setIsSessionSummaryOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(getInitialDocument(documents).id);
  const [activeGameType, setActiveGameType] = useState<CourseGameType>('flappy-vocab');
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState(getInitialPodcast(podcasts).id);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [heardVocabularyId, setHeardVocabularyId] = useState<string | null>(null);
  const vocabularyAudioTimerRef = useRef<number | null>(null);

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

  const vocabularyQuizQuestions = useMemo(() => {
    const meaningPool = vocabulary.map((item) => item.meaning);

    return vocabulary.map((item) => ({
      id: `vq-${item.id}`,
      type: 'meaning' as const,
      prompt: `\"${getVocabularyDisplayName(item)}\" nghĩa là gì?`,
      options: buildQuizOptions(item.meaning, meaningPool),
      answer: item.meaning,
      explanation: `${getVocabularyDisplayName(item)} nghĩa là \"${item.meaning}\". Ví dụ: ${item.example.jp}`,
      source: `Từ vựng: ${item.module}`,
    })) satisfies CourseReviewQuestion[];
  }, [vocabulary]);

  const courseExamQuestions = useMemo<CourseExamQuestion[]>(() => {
    const meaningPool = vocabulary.map((item) => item.meaning);
    const fromReview: CourseExamQuestion[] = reviewQuestions.map((question) => ({
      id: `exam-${question.id}`,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      skill: reviewSkillLabel(question.type),
    }));
    const fromVocabulary: CourseExamQuestion[] = vocabulary.slice(0, 6).map((item) => ({
      id: `exam-vocab-${item.id}`,
      prompt: `\"${getVocabularyDisplayName(item)}\" nghĩa là gì?`,
      options: buildQuizOptions(item.meaning, meaningPool),
      answer: item.meaning,
      explanation: `${getVocabularyDisplayName(item)} nghĩa là \"${item.meaning}\". Ví dụ: ${item.example.jp}`,
      skill: 'Từ vựng',
    }));
    return [...fromReview, ...fromVocabulary];
  }, [reviewQuestions, vocabulary]);

  const activeQuestion = reviewQuestions[questionIndex] ?? reviewQuestions[0];
  const activeVocabularyQuestion = vocabularyQuizQuestions[vocabularyQuestionIndex] ?? vocabularyQuizQuestions[0];
  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? getInitialDocument(documents);
  const activePodcast = podcasts.find((podcast) => podcast.id === activePodcastId) ?? getInitialPodcast(podcasts);

  // Đang trong phiên ôn thì ẩn thanh menu dưới để học viên tập trung làm bài.
  const isReviewSessionActive = activeTab === 'review' && reviewMode !== null;
  const reviewQuestion = reviewMode === 'questions' ? activeQuestion : activeVocabularyQuestion;
  const reviewSelectedAnswer = reviewMode === 'questions' ? selectedAnswer : selectedVocabularyAnswer;
  const reviewQuestionIndex = reviewMode === 'questions' ? questionIndex : vocabularyQuestionIndex;
  const reviewQuestionsCount = reviewMode === 'questions' ? reviewQuestions.length : vocabularyQuizQuestions.length;

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
    setActiveExam(null);
    setVocabularySearchQuery('');
    setVocabularyCategory('all');
    setExpandedVocabularyId(null);
    setReviewMode(null);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setVocabularyQuestionIndex(0);
    setSelectedVocabularyAnswer(null);
    setReviewStats({ answered: 0, correct: 0 });
    setIsSessionSummaryOpen(false);
    setSelectedDocumentId(getInitialDocument(documents).id);
    setActiveGameType('flappy-vocab');
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

  const handleStartExam = (examId: string) => {
    const exam = exams.find((item) => item.id === examId);
    if (exam) {
      setActiveExam(exam);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (reviewMode === 'questions') {
      if (selectedAnswer) return;
      setSelectedAnswer(option);
      setReviewStats((stats) => ({
        answered: stats.answered + 1,
        correct: stats.correct + (option === activeQuestion.answer ? 1 : 0),
      }));
      return;
    }

    if (selectedVocabularyAnswer) return;
    setSelectedVocabularyAnswer(option);
    setReviewStats((stats) => ({
      answered: stats.answered + 1,
      correct: stats.correct + (option === activeVocabularyQuestion.answer ? 1 : 0),
    }));
  };

  const handleQuestionNext = () => {
    if (selectedAnswer) {
      void saveReviewAttempt(activeQuestion.id, selectedAnswer === activeQuestion.answer).catch((error: unknown) => {
        if (import.meta.env.DEV) console.error('[course-review] Failed to save attempt', error);
      });
    }
    setSelectedAnswer(null);
    setQuestionIndex((currentIndex) => (currentIndex + 1) % reviewQuestions.length);
  };

  const handleVocabularyQuestionNext = () => {
    if (selectedVocabularyAnswer) {
      const vocabularyItem = vocabulary[vocabularyQuestionIndex] ?? vocabulary[0];
      void saveVocabularyReview(vocabularyItem.id, selectedVocabularyAnswer === activeVocabularyQuestion.answer).catch((error: unknown) => {
        if (import.meta.env.DEV) console.error('[vocabulary-review] Failed to save progress', error);
      });
    }
    setSelectedVocabularyAnswer(null);
    setVocabularyQuestionIndex((currentIndex) => (currentIndex + 1) % vocabularyQuizQuestions.length);
  };

  const handleReviewNext = () => {
    if (reviewMode === 'questions') {
      handleQuestionNext();
      return;
    }

    handleVocabularyQuestionNext();
  };

  // Bước chọn chế độ: mỗi lần vào chế độ là một phiên ôn mới.
  const handleSelectReviewMode = (mode: ReviewMode) => {
    setReviewMode(mode);
    setSelectedAnswer(null);
    setSelectedVocabularyAnswer(null);
    setQuestionIndex(0);
    setVocabularyQuestionIndex(0);
    setReviewStats({ answered: 0, correct: 0 });
    setIsSessionSummaryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitReviewSession = () => {
    setReviewMode(null);
    setSelectedAnswer(null);
    setSelectedVocabularyAnswer(null);
    setIsSessionSummaryOpen(false);
  };

  const handleRestartReviewSession = () => {
    setSelectedAnswer(null);
    setSelectedVocabularyAnswer(null);
    setQuestionIndex(0);
    setVocabularyQuestionIndex(0);
    setReviewStats({ answered: 0, correct: 0 });
    setIsSessionSummaryOpen(false);
  };

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

  const handleWorkspaceTabSelect = (tab: WorkspaceTab) => {
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

  const handleWorkspaceTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: WorkspaceTab) => {
    const currentIndex = workspaceTabs.findIndex((tab) => tab.id === currentTab);
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
      document.getElementById(`course-workspace-compact-tab-${nextTab.id}`)?.focus();
    });
  };

  // Menu tổng: chuyển khu vực trong khóa hoặc đi ra ngoài (gồm trở về trang chủ).
  const handleSelectSection = (section: WorkspaceTab) => {
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
      className={cn(
        'relative min-h-[calc(100dvh-1.5rem)] space-y-4',
        isReviewSessionActive ? 'pb-8' : 'pb-[calc(6.25rem+env(safe-area-inset-bottom))]'
      )}
    >
      <header className="sticky top-0 z-40 -mx-3 border-b border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[980px] items-center gap-3">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleOpenCourseMenu}
              aria-haspopup="dialog"
              aria-expanded={isMenuOpen}
              className={cn('group -ml-1 flex items-center rounded-2xl p-1 transition-colors hover:bg-orange-50', focusRing)}
              aria-label="Mở menu khóa học"
            >
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fb923c_0%,#c2410c_100%)] text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                <Bird size={22} strokeWidth={2.2} aria-hidden="true" focusable="false" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#fbf6ef] bg-white text-orange-700">
                  <Menu size={9} strokeWidth={3} aria-hidden="true" focusable="false" />
                </span>
              </span>
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
                        Mở menu <ChevronRight size={14} aria-hidden="true" focusable="false" />
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
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[var(--font-heading)] text-sm font-bold tracking-[-0.02em] text-[#172033]">{course.title}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e8dccb]">
                <div className="h-full rounded-full bg-orange-700" style={{ width: `${clampedProgress}%` }} />
              </div>
              <span className="shrink-0 text-xs text-[#5f6b7c]">{clampedProgress}%</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              className="flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700"
              title="Chuỗi ngày học liên tiếp"
            >
              <Flame size={14} aria-hidden="true" focusable="false" />
              {streak}
              <span className="sr-only">ngày streak</span>
            </span>
            <span
              className="flex items-center gap-1 rounded-full border border-[#e8dccb] bg-[#fffdf8] px-2.5 py-1 text-xs font-bold text-[#5f6b7c]"
              title="Cấp độ hiện tại"
            >
              <Zap size={14} className="text-orange-600" aria-hidden="true" focusable="false" />
              Lv.{learnerLevel}
            </span>
          </div>
        </div>
      </header>

      <main className={cn('mx-auto w-full', activeTab === 'practice' || activeTab === 'exams' ? 'max-w-none' : 'max-w-[980px]')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`course-workspace-panel-${activeTab}`}
            role={isReviewSessionActive ? undefined : 'tabpanel'}
            aria-labelledby={isReviewSessionActive ? undefined : activeTabPanelLabelId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'vocabulary' && (
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
            )}
            {activeTab === 'documents' && <DocumentsPanel documents={documents} selectedDocument={selectedDocument} onSelectDocument={setSelectedDocumentId} />}
            {activeTab === 'practice' && <PracticePage embedded courseSections={vocabularyCategories} />}
            {activeTab === 'review' && (
              <CourseReviewPanel
                activeQuestion={reviewQuestion}
                isSummaryOpen={isSessionSummaryOpen}
                questionIndex={reviewQuestionIndex}
                questionsCount={reviewQuestionsCount}
                questionsTotal={reviewQuestions.length}
                reviewMode={reviewMode}
                selectedAnswer={reviewSelectedAnswer}
                stats={reviewStats}
                vocabularyCount={vocabularyQuizQuestions.length}
                onAnswer={handleAnswerSelect}
                onExitSession={handleExitReviewSession}
                onFinishSession={() => setIsSessionSummaryOpen(true)}
                onNext={handleReviewNext}
                onRestartSession={handleRestartReviewSession}
                onSelectMode={handleSelectReviewMode}
              />
            )}
            {activeTab === 'games' && (
              <GamesPanel
                activeGameType={activeGameType}
                courseId={course.id}
                courseTitle={course.title}
                vocabulary={vocabulary}
                reviewQuestions={reviewQuestions}
                onSelectGame={setActiveGameType}
              />
            )}
            {activeTab === 'exams' && <ExamsPanel exams={exams} onStartExam={handleStartExam} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isReviewSessionActive && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e8dccb] bg-[#fffaf3]/97 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl">
          <div className="mx-auto grid w-full max-w-3xl grid-cols-6 gap-1" role="tablist" aria-label="Chọn khu vực học trong khóa" aria-orientation="horizontal">
            {workspaceTabs.map((tab) => (
              <div key={tab.id} className="min-w-0" role="presentation">
                <TabButton tab={tab} activeTab={activeTab} onKeyDown={handleWorkspaceTabKeyDown} onSelect={handleWorkspaceTabSelect} compact />
              </div>
            ))}
          </div>
        </nav>
      )}

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
        isPlaying={isPodcastPlaying}
        podcasts={podcasts}
        onClose={() => setIsPodcastOpen(false)}
        onOpen={() => setIsPodcastOpen(true)}
        onSelectPodcast={setActivePodcastId}
        onTogglePlay={() => setIsPodcastPlaying((currentValue) => !currentValue)}
      />

      <AnimatePresence>
        {activeExam && (
          <CourseExamRunner
            exam={activeExam}
            questions={courseExamQuestions}
            onExit={() => setActiveExam(null)}
            onGoToReview={() => {
              setActiveExam(null);
              setActiveTab('review');
              handleSelectReviewMode('questions');
            }}
            onCompleted={() => undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { CourseExamRunner, type CourseExamQuestion } from '@/src/features/courses/components/CourseExamRunner';
import {
  DocumentsPanel,
  ExamsPanel,
  GamesPanel,
  TabButton,
  dividerListClass,
  emptyStateClass,
  focusRing,
  panelClass,
  panelSubtitleClass,
  panelTitleClass,
  primaryButtonClass,
  searchFieldClass,
  searchInputClass,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { ArrowRight, Bird, Check, ChevronLeft, ChevronRight, FileText, Flame, Gamepad2, GraduationCap, Home, Layers, Lightbulb, RotateCcw, Search, Volume2, X, Zap } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CourseExamItem,
  type CoursePodcastItem,
  type CourseReviewQuestion,
  type CourseVocabularyItem,
  type NonEmptyArray,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { saveReviewAttempt, saveVocabularyReview } from '@/src/features/courses/repositories/learningProgressRepository';
import type { CourseGameType } from '@/src/features/games/types';
import { cn } from '@/src/lib/utils';

type WorkspaceTab = 'vocabulary' | 'documents' | 'review' | 'games' | 'exams';
type ReviewMode = 'vocabulary' | 'questions';
type VocabularyView = 'list' | 'flashcard';

// Thứ tự tab đi theo mạch học: học từ -> đọc tài liệu -> ôn -> chơi -> thi.
const workspaceTabs = [
  { id: 'vocabulary', label: 'Từ vựng', icon: Layers },
  { id: 'documents', label: 'Tài liệu', icon: FileText },
  { id: 'review', label: 'Ôn tập', icon: Zap },
  { id: 'games', label: 'Game', icon: Gamepad2 },
  { id: 'exams', label: 'Thi thử', icon: GraduationCap },
] satisfies Array<{ id: WorkspaceTab; label: string; icon: typeof Layers }>;

const stepLabels: Record<WorkspaceTab, string> = {
  vocabulary: 'Từ vựng',
  documents: 'Tài liệu',
  review: 'Ôn tập',
  games: 'Game',
  exams: 'Thi thử',
};

function getInitialDocument(documents: NonEmptyArray<CourseDocumentItem>): CourseDocumentItem {
  return documents[0];
}

function getInitialPodcast(podcasts: NonEmptyArray<CoursePodcastItem>): CoursePodcastItem {
  return podcasts[0];
}

function getVocabularyDisplayName(item: CourseVocabularyItem) {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
}

function getVocabularyJapanese(item: CourseVocabularyItem) {
  return item.kanji ?? item.kana ?? getVocabularyDisplayName(item);
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

// Quan trọng: KHÔNG đặt display:block (class "block") lên chính thẻ <ruby>, vì nó phá
// display:ruby khiến furigana không nổi lên trên kanji. Block để ở span bọc ngoài.
function VocabularyHeadword({
  item,
  showFurigana,
  rtClassName,
  className,
}: {
  item: CourseVocabularyItem;
  showFurigana: boolean;
  rtClassName?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {showFurigana && item.kanji && item.kana ? (
        <ruby lang="ja">
          {item.kanji}
          <rp>(</rp>
          <rt className={cn('font-medium text-[#7b8796]', rtClassName)}>{item.kana}</rt>
          <rp>)</rp>
        </ruby>
      ) : (
        <span lang="ja">{getVocabularyJapanese(item)}</span>
      )}
    </span>
  );
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
  const [completedSteps, setCompletedSteps] = useState<WorkspaceTab[]>([]);
  const [activeExam, setActiveExam] = useState<CourseExamItem | null>(null);
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [expandedVocabularyId, setExpandedVocabularyId] = useState<string | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('vocabulary');
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

  const filteredVocabulary = useMemo(() => {
    const normalizedQuery = vocabularySearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return vocabulary;
    }

    return vocabulary.filter((item) => {
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
  }, [vocabulary, vocabularySearchQuery]);

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
  const reviewQuestion = reviewMode === 'vocabulary' ? activeVocabularyQuestion : activeQuestion;
  const reviewSelectedAnswer = reviewMode === 'vocabulary' ? selectedVocabularyAnswer : selectedAnswer;
  const reviewQuestionIndex = reviewMode === 'vocabulary' ? vocabularyQuestionIndex : questionIndex;
  const reviewQuestionsCount = reviewMode === 'vocabulary' ? vocabularyQuizQuestions.length : reviewQuestions.length;

  const pathOrder = workspaceTabs.map((tab) => tab.id);
  const currentStepPosition = pathOrder.indexOf(activeTab);
  const nextStep =
    pathOrder.slice(currentStepPosition + 1).find((stepId) => !completedSteps.includes(stepId)) ??
    pathOrder.find((stepId) => stepId !== activeTab && !completedSteps.includes(stepId)) ??
    null;

  useEffect(() => {
    setActiveTab('vocabulary');
    setCompletedSteps([]);
    setActiveExam(null);
    setVocabularySearchQuery('');
    setExpandedVocabularyId(null);
    setReviewMode('vocabulary');
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

  const markStepCompleted = (stepId: WorkspaceTab) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
  };

  const handleContinuePath = () => {
    markStepCompleted(activeTab);
    if (nextStep) {
      setActiveTab(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartExam = (examId: string) => {
    const exam = exams.find((item) => item.id === examId);
    if (exam) {
      setActiveExam(exam);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (reviewMode === 'vocabulary') {
      if (selectedVocabularyAnswer) return;
      setSelectedVocabularyAnswer(option);
      setReviewStats((stats) => ({
        answered: stats.answered + 1,
        correct: stats.correct + (option === activeVocabularyQuestion.answer ? 1 : 0),
      }));
      return;
    }

    if (selectedAnswer) return;
    setSelectedAnswer(option);
    setReviewStats((stats) => ({
      answered: stats.answered + 1,
      correct: stats.correct + (option === activeQuestion.answer ? 1 : 0),
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
    if (reviewMode === 'vocabulary') {
      handleVocabularyQuestionNext();
      return;
    }

    handleQuestionNext();
  };

  const handleReviewModeChange = (mode: ReviewMode) => {
    setReviewMode(mode);
    setSelectedAnswer(null);
    setSelectedVocabularyAnswer(null);
    setReviewStats({ answered: 0, correct: 0 });
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

  const handleGoHome = () => {
    navigate('/app/dashboard');
  };

  const clampedProgress = Math.max(0, Math.min(100, course.progress));
  const activeTabPanelLabelId = `course-workspace-compact-tab-${activeTab}`;

  const stepChipClass = (current: boolean, done: boolean) =>
    cn(
      'flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
      current ? 'border-orange-700 bg-orange-700 text-white' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-[#172033]',
      focusRing
    );

  return (
    <div data-course-workspace-background className="relative min-h-[calc(100dvh-1.5rem)] space-y-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 -mx-3 border-b border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[980px] items-center gap-3">
          <button
            type="button"
            onClick={handleGoHome}
            className={cn('group -ml-1 flex shrink-0 items-center rounded-2xl p-1 transition-colors hover:bg-orange-50', focusRing)}
            aria-label="Về trang chủ"
          >
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fb923c_0%,#c2410c_100%)] text-white shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <Bird size={22} strokeWidth={2.2} aria-hidden="true" focusable="false" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#fbf6ef] bg-white text-orange-700">
                <Home size={9} strokeWidth={3} aria-hidden="true" focusable="false" />
              </span>
            </span>
          </button>
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

      <main className="mx-auto w-full max-w-[980px]">
        <div className="mb-4 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-3 md:p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Lộ trình học</p>
            <span className="text-xs text-[#95a0af]">{completedSteps.length}/{pathOrder.length} bước</span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {workspaceTabs.map((tab, index) => {
              const done = completedSteps.includes(tab.id);
              const current = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={current ? 'step' : undefined}
                  className={stepChipClass(current, done)}
                >
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[11px]', current ? 'bg-white/20 text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-[#efe5d7] text-[#7b8796]')}>
                    {done ? <Check size={12} aria-hidden="true" focusable="false" /> : index + 1}
                  </span>
                  {stepLabels[tab.id]}
                </button>
              );
            })}
          </div>
          {nextStep ? (
            <button type="button" onClick={handleContinuePath} className={cn(primaryButtonClass, 'mt-3 w-full', focusRing)}>
              Tiếp tục: {stepLabels[nextStep]} <ArrowRight size={15} aria-hidden="true" focusable="false" />
            </button>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-[#e8dccb] px-4 py-3 text-center text-xs text-[#95a0af]">
              Anh đã đi hết lộ trình học. Ôn lại phần nào cũng được!
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
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
              <VocabularyPanel
                expandedVocabularyId={expandedVocabularyId}
                filteredVocabulary={filteredVocabulary}
                heardVocabularyId={heardVocabularyId}
                searchQuery={vocabularySearchQuery}
                showFurigana={showFurigana}
                showRomaji={showRomaji}
                totalCount={vocabulary.length}
                onAudio={handleVocabularyAudio}
                onSearchChange={setVocabularySearchQuery}
                onToggleFurigana={() => setShowFurigana((value) => !value)}
                onToggleRomaji={() => setShowRomaji((value) => !value)}
                onToggleVocabulary={(vocabularyId) => setExpandedVocabularyId((currentId) => (currentId === vocabularyId ? null : vocabularyId))}
              />
            )}
            {activeTab === 'documents' && <DocumentsPanel documents={documents} selectedDocument={selectedDocument} onSelectDocument={setSelectedDocumentId} />}
            {activeTab === 'review' && (
              <ReviewPanel
                activeQuestion={reviewQuestion}
                isSummaryOpen={isSessionSummaryOpen}
                questionIndex={reviewQuestionIndex}
                questionsCount={reviewQuestionsCount}
                reviewMode={reviewMode}
                selectedAnswer={reviewSelectedAnswer}
                stats={reviewStats}
                onAnswer={handleAnswerSelect}
                onFinishSession={() => setIsSessionSummaryOpen(true)}
                onModeChange={handleReviewModeChange}
                onNext={handleReviewNext}
                onRestartSession={handleRestartReviewSession}
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

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e8dccb] bg-[#fffaf3]/97 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-5 gap-1" role="tablist" aria-label="Chọn khu vực học trong khóa" aria-orientation="horizontal">
          {workspaceTabs.map((tab) => (
            <div key={tab.id} className="min-w-0" role="presentation">
              <TabButton tab={tab} activeTab={activeTab} onKeyDown={handleWorkspaceTabKeyDown} onSelect={handleWorkspaceTabSelect} compact />
            </div>
          ))}
        </div>
      </nav>

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
            }}
            onCompleted={() => markStepCompleted('exams')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface VocabularyPanelProps {
  expandedVocabularyId: string | null;
  filteredVocabulary: CourseVocabularyItem[];
  heardVocabularyId: string | null;
  searchQuery: string;
  showFurigana: boolean;
  showRomaji: boolean;
  totalCount: number;
  onAudio: (vocabularyId: string) => void;
  onSearchChange: (query: string) => void;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onToggleVocabulary: (vocabularyId: string) => void;
}

function VocabularyPanel({
  expandedVocabularyId,
  filteredVocabulary,
  heardVocabularyId,
  searchQuery,
  showFurigana,
  showRomaji,
  totalCount,
  onAudio,
  onSearchChange,
  onToggleFurigana,
  onToggleRomaji,
  onToggleVocabulary,
}: VocabularyPanelProps) {
  const [view, setView] = useState<VocabularyView>('list');
  const isSearching = searchQuery.trim().length > 0;
  const selectedVocabulary = expandedVocabularyId
    ? filteredVocabulary.find((item) => item.id === expandedVocabularyId) ?? null
    : null;

  const toggleChipClass = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
      active ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-[#172033]',
      focusRing
    );

  const segmentClass = (active: boolean) =>
    cn(
      'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
      active ? 'bg-orange-700 text-white' : 'text-[#5f6b7c] hover:text-[#172033]',
      focusRing
    );

  const viewOptions = [
    { id: 'list' as VocabularyView, label: 'Danh sách' },
    { id: 'flashcard' as VocabularyView, label: 'Flashcard' },
  ];

  return (
    <section className={panelClass}>
      <h2 className={panelTitleClass}>Từ vựng</h2>
      <p className={cn('mt-1', panelSubtitleClass)}>
        {totalCount} từ
        {view === 'list' && isSearching ? ` · đang xem ${filteredVocabulary.length}` : ''}
      </p>

      <div className="mt-4 flex gap-1 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-1" role="group" aria-label="Chọn cách học từ vựng">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setView(option.id)}
            aria-pressed={view === option.id}
            className={segmentClass(view === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#95a0af]">Hiển thị</span>
        <button type="button" onClick={onToggleFurigana} aria-pressed={showFurigana} className={toggleChipClass(showFurigana)}>
          Furigana
        </button>
        <button type="button" onClick={onToggleRomaji} aria-pressed={showRomaji} className={toggleChipClass(showRomaji)}>
          Romaji
        </button>
      </div>

      {view === 'flashcard' ? (
        <VocabularyFlashcards
          items={filteredVocabulary}
          showFurigana={showFurigana}
          showRomaji={showRomaji}
          heardVocabularyId={heardVocabularyId}
          onAudio={onAudio}
        />
      ) : (
        <>
          <label className={cn(searchFieldClass, 'mt-4')}>
            <Search size={18} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
            <span className="sr-only">Tìm từ vựng</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm từ hoặc nghĩa..."
              className={searchInputClass}
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')} className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#95a0af] hover:text-[#172033]', focusRing)} aria-label="Xóa tìm kiếm">
                <X size={15} aria-hidden="true" focusable="false" />
              </button>
            )}
          </label>

          {filteredVocabulary.length > 0 ? (
            <ul className={cn('mt-2', dividerListClass)}>
              {filteredVocabulary.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleVocabulary(item.id)}
                      aria-haspopup="dialog"
                      className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-xl py-3.5 text-left', focusRing)}
                    >
                      <span className="min-w-0 flex-1">
                        <VocabularyHeadword
                          item={item}
                          showFurigana={showFurigana}
                          className="block text-base font-semibold text-[#172033]"
                          rtClassName="text-[0.55em]"
                        />
                        <span className="mt-1 block truncate text-sm text-[#5f6b7c]">
                          {showRomaji ? `${item.pronunciation} · ${item.meaning}` : item.meaning}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAudio(item.id)}
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                        heardVocabularyId === item.id ? 'bg-orange-700 text-white' : 'text-[#95a0af] hover:text-orange-700',
                        focusRing
                      )}
                      aria-label={`Nghe phát âm ${item.word}`}
                    >
                      <Volume2 size={18} aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={cn(emptyStateClass, 'mt-4')}>
              <p className="text-sm font-semibold text-[#172033]">Không tìm thấy từ phù hợp</p>
              <p className="mt-1 text-xs text-[#95a0af]">Thử nhập từ khóa ngắn hơn.</p>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedVocabulary && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-end justify-center bg-gray-950/30 p-3 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onToggleVocabulary(selectedVocabulary.id)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vocab-detail-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Chi tiết từ vựng</span>
                  <h3 id="vocab-detail-title" className="mt-2 font-[var(--font-heading)] text-2xl font-bold leading-tight tracking-[-0.02em] text-[#172033]">
                    <VocabularyHeadword item={selectedVocabulary} showFurigana={showFurigana} rtClassName="text-[0.4em]" />
                  </h3>
                  {showRomaji && (
                    <p className="mt-1 text-sm text-orange-700">/{selectedVocabulary.pronunciation}/</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleVocabulary(selectedVocabulary.id)}
                  className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-[#172033]', focusRing)}
                  aria-label="Đóng chi tiết từ vựng"
                >
                  <X size={18} aria-hidden="true" focusable="false" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={onToggleFurigana} aria-pressed={showFurigana} className={toggleChipClass(showFurigana)}>
                  Furigana
                </button>
                <button type="button" onClick={onToggleRomaji} aria-pressed={showRomaji} className={toggleChipClass(showRomaji)}>
                  Romaji
                </button>
              </div>

              <p className="mt-4 text-lg font-semibold text-[#172033]">{selectedVocabulary.meaning}</p>

              <button
                type="button"
                onClick={() => onAudio(selectedVocabulary.id)}
                className={cn(
                  'mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] px-4 py-2.5 text-sm font-bold transition-colors',
                  heardVocabularyId === selectedVocabulary.id ? 'bg-orange-700 text-white' : 'bg-[#fffdf8] text-orange-700 hover:bg-orange-50',
                  focusRing
                )}
              >
                <Volume2 size={16} aria-hidden="true" focusable="false" /> Nghe phát âm
              </button>

              <div className="mt-4 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">Ví dụ</span>
                <p lang="ja" className="mt-2 text-base font-semibold leading-relaxed text-[#172033]">{selectedVocabulary.example.jp}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{selectedVocabulary.example.vi}</p>
              </div>

              {selectedVocabulary.mnemonic && (
                <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                    <Lightbulb size={13} aria-hidden="true" focusable="false" /> Mẹo nhớ
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-[#4d5a6b]">{selectedVocabulary.mnemonic}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{selectedVocabulary.module}</span>
                {selectedVocabulary.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-[#e8dccb] bg-[#fffdf8] px-3 py-1 text-xs font-medium text-[#5f6b7c]">{tag}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

interface VocabularyFlashcardsProps {
  items: CourseVocabularyItem[];
  showFurigana: boolean;
  showRomaji: boolean;
  heardVocabularyId: string | null;
  onAudio: (vocabularyId: string) => void;
}

function VocabularyFlashcards({ items, showFurigana, showRomaji, heardVocabularyId, onAudio }: VocabularyFlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = items.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const card = items[safeIndex];

  const goTo = (nextIndex: number) => {
    if (total === 0) return;
    setIsFlipped(false);
    setIndex(((nextIndex % total) + total) % total);
  };

  if (!card) {
    return (
      <div className={cn(emptyStateClass, 'mt-4')}>
        <p className="text-sm font-semibold text-[#172033]">Chưa có từ để học</p>
        <p className="mt-1 text-xs text-[#95a0af]">Danh sách từ vựng đang trống.</p>
      </div>
    );
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped((value) => !value);
    }
  };

  return (
    <div className="mt-4">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label="Chạm để lật thẻ từ vựng"
        onClick={() => setIsFlipped((value) => !value)}
        onKeyDown={handleCardKeyDown}
        className={cn('flex min-h-[17rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-6 text-center', focusRing)}
      >
        <AnimatePresence mode="wait">
          {isFlipped ? (
            <motion.div key="back" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }} className="w-full">
              <VocabularyHeadword item={card} showFurigana={showFurigana} className="text-lg font-semibold text-[#7b8796]" rtClassName="text-[0.5em]" />
              <p className="mt-2 text-2xl font-bold text-[#172033]">{card.meaning}</p>
              <div className="mx-auto mt-4 max-w-sm rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-3 text-left">
                <p lang="ja" className="text-sm font-semibold leading-relaxed text-[#172033]">{card.example.jp}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{card.example.vi}</p>
              </div>
              {card.mnemonic && (
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#4d5a6b]">💡 {card.mnemonic}</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="front" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }} className="w-full">
              <VocabularyHeadword item={card} showFurigana={showFurigana} className="text-4xl font-bold text-[#172033]" rtClassName="text-[0.38em]" />
              {showRomaji && <p className="mt-3 text-sm text-orange-700">/{card.pronunciation}/</p>}
              <p className="mt-6 text-xs text-[#95a0af]">Chạm để xem nghĩa</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(safeIndex - 1)}
          className={cn('flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
          aria-label="Từ trước"
        >
          <ChevronLeft size={20} aria-hidden="true" focusable="false" />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAudio(card.id)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] transition-colors',
              heardVocabularyId === card.id ? 'bg-orange-700 text-white' : 'bg-[#fffdf8] text-orange-700 hover:bg-orange-50',
              focusRing
            )}
            aria-label={`Nghe phát âm ${card.word}`}
          >
            <Volume2 size={18} aria-hidden="true" focusable="false" />
          </button>
          <span className="text-sm font-semibold text-[#5f6b7c]">{safeIndex + 1} / {total}</span>
        </div>

        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          className={cn('flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
          aria-label="Từ sau"
        >
          <ChevronRight size={20} aria-hidden="true" focusable="false" />
        </button>
      </div>
    </div>
  );
}

interface ReviewPanelProps {
  activeQuestion: CourseReviewQuestion;
  isSummaryOpen: boolean;
  questionIndex: number;
  questionsCount: number;
  reviewMode: ReviewMode;
  selectedAnswer: string | null;
  stats: { answered: number; correct: number };
  onAnswer: (answer: string) => void;
  onFinishSession: () => void;
  onModeChange: (mode: ReviewMode) => void;
  onNext: () => void;
  onRestartSession: () => void;
}

function ReviewPanel({
  activeQuestion,
  isSummaryOpen,
  questionIndex,
  questionsCount,
  reviewMode,
  selectedAnswer,
  stats,
  onAnswer,
  onFinishSession,
  onModeChange,
  onNext,
  onRestartSession,
}: ReviewPanelProps) {
  const isAnswered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === activeQuestion.answer;
  const answerFeedback = selectedAnswer
    ? `Đã chọn ${selectedAnswer}. ${isCorrect ? 'Đúng' : `Đáp án đúng là ${activeQuestion.answer}`}.`
    : '';

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (isAnswered) {
      return;
    }

    let nextIndex = optionIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (optionIndex + 1) % activeQuestion.options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (optionIndex - 1 + activeQuestion.options.length) % activeQuestion.options.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = activeQuestion.options.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    window.requestAnimationFrame(() => {
      document.getElementById(`course-review-option-${questionIndex}-${nextIndex}`)?.focus();
    });
  };

  const modeOptions = [
    { id: 'vocabulary' as ReviewMode, label: 'Từ vựng' },
    { id: 'questions' as ReviewMode, label: 'Câu hỏi' },
  ];

  if (isSummaryOpen) {
    return (
      <section className={cn(panelClass, 'text-center')}>
        <h2 className={panelTitleClass}>Kết quả phiên ôn</h2>
        <p className="mt-4 font-[var(--font-heading)] text-4xl font-bold text-orange-700">
          {stats.correct}/{stats.answered}
        </p>
        <p className={cn('mt-2', panelSubtitleClass)}>
          {stats.answered === 0 ? 'Anh chưa trả lời câu nào trong phiên này.' : `Đúng ${stats.correct} trên ${stats.answered} câu đã làm.`}
        </p>
        <button type="button" onClick={onRestartSession} className={cn(primaryButtonClass, 'mx-auto mt-5', focusRing)}>
          <RotateCcw size={15} aria-hidden="true" focusable="false" />
          Bắt đầu phiên mới
        </button>
      </section>
    );
  }

  return (
    <section className={panelClass}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-4" role="group" aria-label="Chọn nội dung ôn tập">
          {modeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onModeChange(option.id)}
              aria-pressed={reviewMode === option.id}
              className={cn(
                'rounded-lg py-1 text-sm transition-colors',
                reviewMode === option.id ? 'font-bold text-orange-700 underline decoration-2 underline-offset-8' : 'text-[#7b8796] hover:text-[#172033]',
                focusRing
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="shrink-0 text-xs text-[#95a0af]">
          Câu {Math.min(questionIndex + 1, questionsCount)}/{questionsCount} · Đúng {stats.correct}/{stats.answered}
        </p>
      </div>

      <p className="sr-only" role="status" aria-live="polite">{answerFeedback}</p>

      <p className="mt-6 font-[var(--font-heading)] text-xl font-bold leading-snug tracking-[-0.02em] text-[#172033]">{activeQuestion.prompt}</p>

      <div className="mt-4 grid gap-2 md:grid-cols-2" role="radiogroup" aria-label={activeQuestion.prompt}>
        {activeQuestion.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === activeQuestion.answer;
          const isFocusable = isSelected || (!isAnswered && optionIndex === 0);

          return (
            <button
              id={`course-review-option-${questionIndex}-${optionIndex}`}
              key={option}
              onClick={() => onAnswer(option)}
              onKeyDown={(event) => handleAnswerKeyDown(event, optionIndex)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isFocusable ? 0 : -1}
              disabled={isAnswered}
              className={cn(
                'min-h-13 rounded-xl border bg-white px-4 py-3 text-left text-base transition-colors disabled:cursor-default',
                isSelected && isCorrectOption && 'border-emerald-500 text-emerald-700',
                isSelected && !isCorrectOption && 'border-red-400 text-red-600',
                !isSelected && isAnswered && isCorrectOption && 'border-emerald-500 text-emerald-700',
                !isSelected && !(isAnswered && isCorrectOption) && 'border-[#e8dccb] text-[#172033] hover:border-orange-300',
                focusRing
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} className="mt-4">
          <p className={cn('text-base font-bold', isCorrect ? 'text-emerald-700' : 'text-red-600')}>
            {isCorrect ? 'Chính xác' : `Đáp án đúng: ${activeQuestion.answer}`}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{activeQuestion.explanation}</p>
          <button type="button" onClick={onNext} autoFocus className={cn(primaryButtonClass, 'mt-4 w-full', focusRing)}>
            Tiếp tục
          </button>
        </motion.div>
      )}

      <button
        type="button"
        onClick={onFinishSession}
        className={cn('mx-auto mt-6 block rounded-lg px-3 py-2 text-sm text-[#7b8796] underline-offset-4 hover:text-[#172033] hover:underline', focusRing)}
      >
        Kết thúc phiên
      </button>
    </section>
  );
}

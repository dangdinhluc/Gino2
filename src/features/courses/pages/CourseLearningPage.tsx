import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { DocumentsPanel, ExamsPanel, GamesPanel, TabButton } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { ArrowLeft, ChevronDown, FileText, Gamepad2, GraduationCap, Layers, RotateCcw, Search, Volume2, X, Zap } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CoursePodcastItem,
  type CourseReviewQuestion,
  type CourseVocabularyItem,
  type NonEmptyArray,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { saveReviewAttempt, saveVocabularyReview } from '@/src/features/courses/repositories/learningProgressRepository';
import type { CourseGameType } from '@/src/features/games/types';
import { cn } from '@/src/lib/utils';

type WorkspaceTab = 'vocabulary' | 'review' | 'documents' | 'games' | 'exams';
type ReviewMode = 'vocabulary' | 'questions';

const workspaceTabs = [
  { id: 'vocabulary', label: 'Từ vựng', icon: Layers },
  { id: 'review', label: 'Ôn tập', icon: Zap },
  { id: 'documents', label: 'Tài liệu', icon: FileText },
  { id: 'games', label: 'Game', icon: Gamepad2 },
  { id: 'exams', label: 'Thi thử', icon: GraduationCap },
] satisfies Array<{ id: WorkspaceTab; label: string; icon: typeof Layers }>;

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

function getInitialDocument(documents: NonEmptyArray<CourseDocumentItem>): CourseDocumentItem {
  return documents[0];
}

function getInitialPodcast(podcasts: NonEmptyArray<CoursePodcastItem>): CoursePodcastItem {
  return podcasts[0];
}

function getVocabularyDisplayName(item: CourseVocabularyItem) {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
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

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('vocabulary');
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [expandedVocabularyId, setExpandedVocabularyId] = useState<string | null>(null);
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
      type: 'meaning',
      prompt: `"${getVocabularyDisplayName(item)}" nghĩa là gì?`,
      options: buildQuizOptions(item.meaning, meaningPool),
      answer: item.meaning,
      explanation: `${getVocabularyDisplayName(item)} nghĩa là "${item.meaning}". Ví dụ: ${item.example.jp}`,
      source: `Từ vựng: ${item.module}`,
    })) satisfies CourseReviewQuestion[];
  }, [vocabulary]);

  const activeQuestion = reviewQuestions[questionIndex] ?? reviewQuestions[0];
  const activeVocabularyQuestion = vocabularyQuizQuestions[vocabularyQuestionIndex] ?? vocabularyQuizQuestions[0];
  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? getInitialDocument(documents);
  const activePodcast = podcasts.find((podcast) => podcast.id === activePodcastId) ?? getInitialPodcast(podcasts);
  const reviewQuestion = reviewMode === 'vocabulary' ? activeVocabularyQuestion : activeQuestion;
  const reviewSelectedAnswer = reviewMode === 'vocabulary' ? selectedVocabularyAnswer : selectedAnswer;
  const reviewQuestionIndex = reviewMode === 'vocabulary' ? vocabularyQuestionIndex : questionIndex;
  const reviewQuestionsCount = reviewMode === 'vocabulary' ? vocabularyQuizQuestions.length : reviewQuestions.length;

  useEffect(() => {
    setActiveTab('vocabulary');
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

  const handleExitWorkspace = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(`/app/courses/${id ?? course.id}`);
  };

  const activeTabPanelLabelId = `course-workspace-compact-tab-${activeTab}`;

  return (
    <div data-course-workspace-background className="relative min-h-[calc(100dvh-1.5rem)] space-y-4 pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:space-y-6">
      <section className="sticky top-0 z-40 -mx-3 border-b border-[#eadfd2]/80 bg-[#fbf6ef]/95 px-4 py-2.5 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3">
          <button
            onClick={handleExitWorkspace}
            className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#eadfd2] bg-white/70 text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
            aria-label="Quay lại trang khóa học"
          >
            <ArrowLeft size={18} aria-hidden="true" focusable="false" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[var(--font-heading)] text-sm font-black tracking-[-0.03em] text-[#172033] md:text-base">{course.title}</h1>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full rounded-full bg-orange-700" style={{ width: `${Math.max(0, Math.min(100, course.progress))}%` }} />
              </div>
              <span className="shrink-0 text-xs font-bold text-[#5f6b7c]">{course.progress}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[980px] xl:max-w-[1040px] 2xl:max-w-[1120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`course-workspace-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={activeTabPanelLabelId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'vocabulary' && (
              <VocabularyPanel
                expandedVocabularyId={expandedVocabularyId}
                filteredVocabulary={filteredVocabulary}
                heardVocabularyId={heardVocabularyId}
                searchQuery={vocabularySearchQuery}
                totalCount={vocabulary.length}
                onAudio={handleVocabularyAudio}
                onSearchChange={setVocabularySearchQuery}
                onToggleVocabulary={(vocabularyId) => setExpandedVocabularyId((currentId) => (currentId === vocabularyId ? null : vocabularyId))}
              />
            )}
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
            {activeTab === 'documents' && <DocumentsPanel documents={documents} selectedDocument={selectedDocument} onSelectDocument={setSelectedDocumentId} />}
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
            {activeTab === 'exams' && <ExamsPanel courseId={course.id} exams={exams} />}
          </motion.div>
        </AnimatePresence>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#eadfd2] bg-[#fffaf3]/97 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl">
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
    </div>
  );
}

interface VocabularyPanelProps {
  expandedVocabularyId: string | null;
  filteredVocabulary: CourseVocabularyItem[];
  heardVocabularyId: string | null;
  searchQuery: string;
  totalCount: number;
  onAudio: (vocabularyId: string) => void;
  onSearchChange: (query: string) => void;
  onToggleVocabulary: (vocabularyId: string) => void;
}

function VocabularyPanel({
  expandedVocabularyId,
  filteredVocabulary,
  heardVocabularyId,
  searchQuery,
  totalCount,
  onAudio,
  onSearchChange,
  onToggleVocabulary,
}: VocabularyPanelProps) {
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="workspace-panel space-y-4 rounded-[2.25rem] p-4 md:p-5">
      <div>
        <h3 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.04em] text-[#172033]">Từ vựng khóa học</h3>
        <p className="mt-1 text-sm font-semibold text-[#5f6b7c]">
          {totalCount} từ
          {isSearching ? ` · đang xem ${filteredVocabulary.length} kết quả` : ''}
        </p>
      </div>

      <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-sm font-semibold text-[#5f6b7c] focus-within:border-orange-200 focus-within:ring-2 focus-within:ring-orange-100">
        <Search size={18} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
        <span className="sr-only">Tìm kiếm từ vựng</span>
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm từ hoặc nghĩa..."
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#172033] outline-none placeholder:text-[#95a0af]"
        />
        {searchQuery && (
          <button type="button" onClick={() => onSearchChange('')} className={cn('flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-[#95a0af]', focusRing)} aria-label="Xóa tìm kiếm">
            <X size={15} aria-hidden="true" focusable="false" />
          </button>
        )}
      </label>

      <div className="space-y-2">
        {filteredVocabulary.length > 0 ? filteredVocabulary.map((item) => {
          const isExpanded = expandedVocabularyId === item.id;

          return (
            <div
              key={item.id}
              className={cn('workspace-item rounded-[1.5rem] transition-colors', isExpanded ? 'border-orange-200 bg-orange-50/45' : 'hover:border-orange-200 hover:bg-orange-50/25')}
            >
              <div className="flex items-center gap-2 p-3.5">
                <button
                  onClick={() => onToggleVocabulary(item.id)}
                  aria-expanded={isExpanded}
                  className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left', focusRing)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-black text-[#172033]">{getVocabularyDisplayName(item)}</span>
                    <span className="block truncate text-sm font-semibold text-[#5f6b7c]">{item.meaning}</span>
                  </span>
                  <ChevronDown size={18} className={cn('shrink-0 text-[#95a0af] transition-transform', isExpanded ? 'rotate-180' : '')} aria-hidden="true" focusable="false" />
                </button>
                <button
                  onClick={() => onAudio(item.id)}
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors',
                    heardVocabularyId === item.id ? 'border-orange-200 bg-orange-700 text-white' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:text-orange-700',
                    focusRing
                  )}
                  aria-label={`Nghe phát âm ${item.word}`}
                >
                  <Volume2 size={18} aria-hidden="true" focusable="false" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 px-3.5 pb-4">
                      <p className="text-sm font-bold text-orange-700">/{item.pronunciation}/</p>
                      <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                        <p className="text-sm font-black text-[#172033]">{item.example.jp}</p>
                        <p className="mt-1 text-sm font-semibold text-[#5f6b7c]">{item.example.vi}</p>
                      </div>
                      <p className="text-xs font-semibold text-[#95a0af]">{item.module}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }) : (
          <div className="rounded-[1.5rem] border border-dashed border-[#e6ddd1] bg-[#fffdf8] p-6 text-center">
            <p className="text-sm font-black text-[#172033]">Không tìm thấy từ phù hợp</p>
            <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">Thử nhập từ khóa ngắn hơn.</p>
          </div>
        )}
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
    { id: 'vocabulary' as ReviewMode, label: 'Ôn từ vựng' },
    { id: 'questions' as ReviewMode, label: 'Ôn câu hỏi' },
  ];

  return (
    <div className="workspace-panel space-y-4 rounded-[2.25rem] p-4 md:p-6">
      <div className="flex gap-1 rounded-2xl border border-[#e6ddd1] bg-white p-1" role="group" aria-label="Chọn chế độ ôn tập">
        {modeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onModeChange(option.id)}
            aria-pressed={reviewMode === option.id}
            className={cn(
              'min-h-11 flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors',
              reviewMode === option.id ? 'bg-orange-700 text-white' : 'text-[#5f6b7c] hover:bg-orange-50',
              focusRing
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isSummaryOpen ? (
        <div className="rounded-[2rem] border border-[#e6ddd1] bg-white p-6 text-center">
          <h3 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.04em] text-[#172033]">Kết quả phiên ôn tập</h3>
          <p className="mt-3 text-4xl font-black text-orange-700">
            {stats.correct}/{stats.answered}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#5f6b7c]">
            {stats.answered === 0 ? 'Anh chưa trả lời câu nào trong phiên này.' : `Đúng ${stats.correct} câu trên ${stats.answered} câu đã làm.`}
          </p>
          <button
            type="button"
            onClick={onRestartSession}
            className={cn('mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 px-5 py-3 text-sm font-black text-white', focusRing)}
          >
            <RotateCcw size={16} aria-hidden="true" focusable="false" />
            Bắt đầu phiên mới
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#5f6b7c]">Câu {Math.min(questionIndex + 1, questionsCount)}/{questionsCount}</p>
            <p className="text-sm font-bold text-[#5f6b7c]">Đúng {stats.correct}/{stats.answered}</p>
          </div>

          <p className="sr-only" role="status" aria-live="polite">{answerFeedback}</p>

          <div className="rounded-[2rem] border border-orange-100 bg-orange-50/55 p-5 md:p-6">
            <p className="text-xl font-black leading-snug text-[#172033] md:text-[1.6rem]">{activeQuestion.prompt}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label={activeQuestion.prompt}>
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
                    'min-h-14 rounded-[1.5rem] border p-4 text-left text-base font-bold transition-colors disabled:cursor-default',
                    isSelected && isCorrectOption && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                    isSelected && !isCorrectOption && 'border-red-300 bg-red-50 text-red-700',
                    !isSelected && isAnswered && isCorrectOption && 'border-emerald-300 bg-emerald-50/70 text-emerald-700',
                    !isSelected && !(isAnswered && isCorrectOption) && 'border-[#e6ddd1] bg-[#fffdf8] text-[#172033] hover:border-orange-200 hover:bg-orange-50/40',
                    focusRing
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn('rounded-[1.75rem] border p-4 md:p-5', isCorrect ? 'border-emerald-200 bg-emerald-50/70' : 'border-red-200 bg-red-50/70')}
            >
              <p className={cn('text-base font-black', isCorrect ? 'text-emerald-700' : 'text-red-700')}>
                {isCorrect ? 'Chính xác!' : `Chưa đúng. Đáp án đúng: ${activeQuestion.answer}`}
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{activeQuestion.explanation}</p>

              <button
                type="button"
                onClick={onNext}
                autoFocus
                className={cn('mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-orange-700 px-5 py-3 text-sm font-black text-white', focusRing)}
              >
                Tiếp tục
              </button>
            </motion.div>
          )}

          <button
            type="button"
            onClick={onFinishSession}
            className={cn('mx-auto block rounded-xl px-4 py-2 text-sm font-bold text-[#5f6b7c] underline-offset-4 hover:underline', focusRing)}
          >
            Kết thúc phiên
          </button>
        </>
      )}
    </div>
  );
}

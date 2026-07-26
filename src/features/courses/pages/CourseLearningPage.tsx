import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CourseLearningPodcastPlayer } from '@/src/features/courses/components/CourseLearningPodcastPlayer';
import { DocumentsPanel, ExamsPanel, GamesPanel, TabButton } from '@/src/features/courses/components/CourseLearningResourcePanels';
import { ArrowLeft, Brain, ChevronLeft, ChevronRight, FileText, Gamepad2, GraduationCap, Home, Layers, Lightbulb, MessageSquareQuote, RotateCcw, Search, Sparkles, Volume2, X, Zap } from 'lucide-react';
import {
  type CourseDocumentItem,
  type CoursePodcastItem,
  type CourseReviewQuestion,
  type CourseVocabularyItem,
  type NonEmptyArray,
  type VocabularyStatus,
} from '@/src/features/courses/mock/courseLearningMock';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { saveReviewAttempt, saveVocabularyReview } from '@/src/features/courses/repositories/learningProgressRepository';
import type { CourseGameType } from '@/src/features/games/types';
import { cn } from '@/src/lib/utils';

type WorkspaceTab = 'vocabulary' | 'review' | 'documents' | 'games' | 'exams';
type VocabularyFilter = 'all' | VocabularyStatus;
type VocabularyViewMode = 'list' | 'flashcard';
type ReviewMode = 'vocabulary' | 'questions';

const workspaceTabs = [
  { id: 'vocabulary', label: 'Từ vựng', icon: Layers },
  { id: 'review', label: 'Ôn tập', icon: Zap },
  { id: 'documents', label: 'Tài liệu', icon: FileText },
  { id: 'games', label: 'Game', icon: Gamepad2 },
  { id: 'exams', label: 'Thi thử', icon: GraduationCap },
] satisfies Array<{ id: WorkspaceTab; label: string; icon: typeof Layers }>;

const vocabularyFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'due', label: 'Cần ôn' },
  { id: 'learning', label: 'Đang học' },
  { id: 'new', label: 'Từ mới' },
  { id: 'remembered', label: 'Đã nhớ' },
] satisfies Array<{ id: VocabularyFilter; label: string }>;

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
  { id: 'list', label: 'Danh sách', icon: Layers },
  { id: 'flashcard', label: 'Flashcard', icon: Sparkles },
] satisfies Array<{ id: VocabularyViewMode; label: string; icon: typeof Layers }>;

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
  const [vocabularyFilter, setVocabularyFilter] = useState<VocabularyFilter>('all');
  const [vocabularySearchQuery, setVocabularySearchQuery] = useState('');
  const [selectedVocabularyId, setSelectedVocabularyId] = useState(vocabulary[0]?.id ?? '');
  const [detailVocabularyId, setDetailVocabularyId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('vocabulary');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [vocabularyQuestionIndex, setVocabularyQuestionIndex] = useState(0);
  const [selectedVocabularyAnswer, setSelectedVocabularyAnswer] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(getInitialDocument(documents).id);
  const [activeGameType, setActiveGameType] = useState<CourseGameType>('flappy-vocab');
  const [isPodcastOpen, setIsPodcastOpen] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState(getInitialPodcast(podcasts).id);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);
  const [isReviewModeDialogOpen, setIsReviewModeDialogOpen] = useState(false);
  const [heardVocabularyId, setHeardVocabularyId] = useState<string | null>(null);
  const vocabularyAudioTimerRef = useRef<number | null>(null);

  const filteredVocabulary = useMemo(() => {
    const normalizedQuery = vocabularySearchQuery.trim().toLowerCase();
    const filteredByStatus = vocabularyFilter === 'all' ? vocabulary : vocabulary.filter((item) => item.status === vocabularyFilter);

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

  const selectedVocabulary = filteredVocabulary.find((item) => item.id === selectedVocabularyId) ?? filteredVocabulary[0] ?? vocabulary[0];
  const detailVocabulary = detailVocabularyId ? vocabulary.find((item) => item.id === detailVocabularyId) ?? null : null;
  const activeQuestion = reviewQuestions[questionIndex] ?? reviewQuestions[0];
  const activeVocabularyQuestion = vocabularyQuizQuestions[vocabularyQuestionIndex] ?? vocabularyQuizQuestions[0];
  const selectedDocument = documents.find((item) => item.id === selectedDocumentId) ?? getInitialDocument(documents);
  const activePodcast = podcasts.find((podcast) => podcast.id === activePodcastId) ?? getInitialPodcast(podcasts);
  const isAnswerCorrect = selectedAnswer === activeQuestion.answer;
  const dueVocabularyCount = vocabulary.filter((item) => item.status === 'due').length;
  const reviewQuestion = reviewMode === 'vocabulary' ? activeVocabularyQuestion : activeQuestion;
  const reviewSelectedAnswer = reviewMode === 'vocabulary' ? selectedVocabularyAnswer : selectedAnswer;
  const isReviewAnswerCorrect = reviewSelectedAnswer === reviewQuestion.answer;
  const reviewQuestionIndex = reviewMode === 'vocabulary' ? vocabularyQuestionIndex : questionIndex;
  const reviewQuestionsCount = reviewMode === 'vocabulary' ? vocabularyQuizQuestions.length : reviewQuestions.length;

  useEffect(() => {
    setActiveTab('vocabulary');
    setVocabularyFilter('all');
    setVocabularySearchQuery('');
    setSelectedVocabularyId(vocabulary[0]?.id ?? '');
    setDetailVocabularyId(null);
    setReviewMode('vocabulary');
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setVocabularyQuestionIndex(0);
    setSelectedVocabularyAnswer(null);
    setSelectedDocumentId(getInitialDocument(documents).id);
    setActiveGameType('flappy-vocab');
    setIsPodcastOpen(false);
    setActivePodcastId(getInitialPodcast(podcasts).id);
    setIsPodcastPlaying(false);
    setIsReviewModeDialogOpen(false);
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

  const handleOpenReviewModeDialog = () => {
    setIsReviewModeDialogOpen(true);
  };

  const handleReviewModeSelect = (mode: ReviewMode) => {
    setReviewMode(mode);
    setActiveTab('review');
    setIsReviewModeDialogOpen(false);

    if (mode === 'vocabulary') {
      setSelectedVocabularyAnswer(null);
      return;
    }

    setSelectedAnswer(null);
  };

  const handleWorkspaceTabSelect = (tab: WorkspaceTab) => {
    if (tab === 'review') {
      handleOpenReviewModeDialog();
      return;
    }

    setActiveTab(tab);
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
        <section className="sticky top-0 z-40 -mx-3 border-b border-[#eadfd2]/80 bg-[#fbf6ef]/95 px-4 py-2.5 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3">
            <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-[#eadfd2] bg-white/60 p-1">
              <button onClick={handleGoHome} className={cn('flex h-9 items-center justify-center gap-2 rounded-xl px-2 text-sm font-black text-[#172033] transition-colors hover:bg-[#f1ebe2] sm:px-3', focusRing)} aria-label="Về trang chủ">
                <Home size={18} className="text-[#172033]" aria-hidden="true" focusable="false" />
                <span>Home</span>
              </button>
              <button onClick={handleExitWorkspace} className={cn('flex h-9 items-center justify-center gap-2 rounded-xl px-2 text-sm font-black text-[#5f6b7c] transition-colors hover:bg-[#f1ebe2] hover:text-[#172033] sm:px-3', focusRing)} aria-label="Quay lại danh sách khóa học">
                <ArrowLeft size={18} aria-hidden="true" focusable="false" />
                <span className="hidden sm:inline">Khóa học</span>
              </button>
            </div>
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex min-w-0 items-baseline gap-2">
                <h1 className="truncate font-[var(--font-heading)] text-sm font-black tracking-[-0.03em] text-[#172033] md:text-base">{course.title}</h1>
                <span className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-orange-700 sm:inline">{course.progress}%</span>
              </div>
              <p className="mt-0.5 truncate text-[10px] font-bold text-[#5f6b7c]">{course.currentModule}</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-orange-100">
                <div className="h-full rounded-full bg-orange-700" style={{ width: `${Math.max(0, Math.min(100, course.progress))}%` }} />
              </div>
            </div>
          </div>
        </section>

      <section className="mx-auto w-full max-w-[980px] space-y-5 xl:max-w-[1040px] 2xl:max-w-[1120px]">
        <div className="space-y-5">
          <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-[1.7rem] border border-[rgba(198,182,163,0.5)] bg-[rgba(255,250,243,0.94)] p-2 shadow-[0_24px_60px_-34px_rgba(88,63,38,0.34)] backdrop-blur-xl md:inset-x-8 md:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] md:mx-auto md:max-w-3xl md:rounded-[2rem] lg:max-w-4xl xl:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="tablist" aria-label="Chọn khu vực học trong khóa" aria-orientation="horizontal">
              {workspaceTabs.map((tab) => (
                <div key={tab.id} className="min-w-0" role="presentation">
                  <TabButton tab={tab} activeTab={activeTab} onKeyDown={handleWorkspaceTabKeyDown} onSelect={handleWorkspaceTabSelect} compact />
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} id={`course-workspace-panel-${activeTab}`} role="tabpanel" aria-labelledby={activeTabPanelLabelId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {activeTab === 'vocabulary' && (
                <VocabularyPanel
                  dueCount={dueVocabularyCount}
                  filteredVocabulary={filteredVocabulary}
                  heardVocabularyId={heardVocabularyId}
                  searchQuery={vocabularySearchQuery}
                  selectedVocabulary={selectedVocabulary}
                  vocabularyFilter={vocabularyFilter}
                  onAudio={handleVocabularyAudio}
                  onFilterChange={setVocabularyFilter}
                  onOpenVocabularyDetail={(vocabularyId) => {
                    setSelectedVocabularyId(vocabularyId);
                    setDetailVocabularyId(vocabularyId);
                  }}
                  onSearchChange={setVocabularySearchQuery}
                />
              )}
              {activeTab === 'review' && (
                <ReviewPanel
                  activeQuestion={reviewQuestion}
                  questionIndex={reviewQuestionIndex}
                  selectedAnswer={reviewSelectedAnswer}
                  onAnswer={reviewMode === 'vocabulary' ? setSelectedVocabularyAnswer : setSelectedAnswer}
                  onNext={reviewMode === 'vocabulary' ? handleVocabularyQuestionNext : handleQuestionNext}
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
        </div>
      </section>

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
      <ReviewModeDialog
        isOpen={isReviewModeDialogOpen}
        currentMode={reviewMode}
        onClose={() => setIsReviewModeDialogOpen(false)}
        onSelectMode={handleReviewModeSelect}
      />
      <VocabularyDetailDialog
        heardVocabularyId={heardVocabularyId}
        vocabulary={detailVocabulary}
        onAudio={handleVocabularyAudio}
        onClose={() => setDetailVocabularyId(null)}
      />
    </>
  );
}

interface ReviewModeDialogProps {
  currentMode: ReviewMode;
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: ReviewMode) => void;
}

function ReviewModeDialog({ currentMode, isOpen, onClose, onSelectMode }: ReviewModeDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
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
        dialogRef.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
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
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end bg-gray-950/32 px-3 pb-[calc(5.8rem+env(safe-area-inset-bottom))] pt-12 backdrop-blur-sm md:items-center md:justify-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-mode-dialog-title"
            aria-describedby="review-mode-dialog-description"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_30px_80px_-36px_rgba(17,24,39,0.42)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Chọn chế độ ôn tập</p>
                <h3 id="review-mode-dialog-title" className="mt-2 text-2xl font-black tracking-[-0.04em] text-gray-900">Anh muốn ôn theo dạng nào?</h3>
                <p id="review-mode-dialog-description" className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">
                  Chọn 1 chế độ để vào đúng bộ câu hỏi của phần ôn tập.
                </p>
              </div>
              <button ref={closeButtonRef} onClick={onClose} className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm', focusRing)} aria-label="Đóng chọn chế độ ôn tập">
                <X size={18} aria-hidden="true" focusable="false" />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                {
                  id: 'vocabulary' as ReviewMode,
                  title: 'Ôn từ vựng',
                  description: 'Làm câu hỏi nghĩa của từ đang học trong khóa.',
                  icon: Layers,
                },
                {
                  id: 'questions' as ReviewMode,
                  title: 'Ôn câu hỏi',
                  description: 'Làm bộ câu hỏi kiến thức tổng hợp của khóa.',
                  icon: Brain,
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectMode(option.id)}
                  className={cn(
                    'w-full rounded-[1.6rem] border px-4 py-4 text-left transition-all',
                    currentMode === option.id ? 'border-orange-200 bg-orange-50 shadow-[0_18px_36px_-30px_rgba(201,106,27,0.24)]' : 'border-[#e6ddd1] bg-white hover:border-orange-200 hover:bg-orange-50/50',
                    focusRing
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', currentMode === option.id ? 'bg-orange-700 text-white' : 'bg-orange-50 text-orange-700')}>
                      <option.icon size={22} aria-hidden="true" focusable="false" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-black text-[#172033]">{option.title}</span>
                        {currentMode === option.id && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-700">Đang chọn</span>}
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-relaxed text-[#5f6b7c]">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface VocabularyPanelProps {
  dueCount: number;
  filteredVocabulary: CourseVocabularyItem[];
  heardVocabularyId: string | null;
  searchQuery: string;
  selectedVocabulary: CourseVocabularyItem;
  vocabularyFilter: VocabularyFilter;
  onAudio: (vocabularyId: string) => void;
  onFilterChange: (filter: VocabularyFilter) => void;
  onOpenVocabularyDetail: (vocabularyId: string) => void;
  onSearchChange: (query: string) => void;
}

function VocabularyPanel({ dueCount, filteredVocabulary, heardVocabularyId, searchQuery, selectedVocabulary, vocabularyFilter, onAudio, onFilterChange, onOpenVocabularyDetail, onSearchChange }: VocabularyPanelProps) {
  const [viewMode, setViewMode] = useState<VocabularyViewMode>('list');

  return (
    <div className="workspace-panel space-y-3 rounded-[2.25rem] p-3.5 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Từ vựng khóa học</p>
          <h3 className="mt-0.5 font-[var(--font-heading)] text-lg font-black leading-tight tracking-[-0.03em] text-[#172033] md:text-xl">
            Ưu tiên {dueCount} từ cần ôn hôm nay
          </h3>
        </div>

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
                  'flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-black transition-colors',
                  isActive ? 'bg-orange-700 text-white shadow-[0_12px_24px_-18px_rgba(201,106,27,0.5)]' : 'text-[#5f6b7c] hover:bg-orange-50',
                  focusRing
                )}
              >
                <mode.icon size={15} aria-hidden="true" focusable="false" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {vocabularyFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            aria-current={vocabularyFilter === filter.id ? 'true' : undefined}
            className={cn(
              'min-h-11 whitespace-nowrap rounded-full border px-3 text-xs font-black transition-colors',
              vocabularyFilter === filter.id ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e6ddd1] bg-white text-[#5f6b7c] hover:bg-orange-50',
              focusRing
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <>
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
                      <span className="block truncate text-[15px] font-black italic leading-tight text-[#172033]">
                        {getVocabularyDisplayName(item)}
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
  onAudio: (vocabularyId: string) => void;
  onOpenVocabularyDetail: (vocabularyId: string) => void;
}

function VocabularyFlashcards({ heardVocabularyId, items, onAudio, onOpenVocabularyDetail }: VocabularyFlashcardsProps) {
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
        aria-expanded={isRevealed}
        className={cn(
          'flex min-h-[15rem] w-full flex-col justify-center gap-3 rounded-[1.75rem] border border-[#e6ddd1] bg-white px-5 py-6 text-center transition-colors hover:border-orange-200',
          focusRing
        )}
      >
        {isRevealed ? (
          <>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Nghĩa</p>
            <p className="text-2xl font-black leading-tight text-[#172033]">{card.meaning}</p>
            <div className="mt-1 rounded-2xl bg-[#fdf6ee] px-4 py-3 text-left">
              <p className="text-sm font-black leading-snug text-[#172033]">{card.example.jp}</p>
              <p className="mt-1 text-xs font-semibold leading-snug text-[#5f6b7c]">{card.example.vi}</p>
            </div>
            {card.mnemonic && (
              <p className="text-xs font-semibold leading-snug text-[#5f6b7c]">
                <Lightbulb size={13} className="mr-1 inline text-orange-600" aria-hidden="true" focusable="false" />
                {card.mnemonic}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-3xl font-black italic leading-tight text-[#172033]">{getVocabularyDisplayName(card)}</p>
            <p className="text-sm font-black text-orange-700">/{card.pronunciation}/</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#95a0af]">Chạm để xem nghĩa</p>
          </>
        )}
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
  onAudio: (vocabularyId: string) => void;
  onClose: () => void;
}

function VocabularyDetailDialog({ heardVocabularyId, vocabulary, onAudio, onClose }: VocabularyDetailDialogProps) {
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
                <h3 id="course-vocabulary-detail-title" className="mt-2 text-3xl font-black italic leading-tight text-[#172033]">{getVocabularyDisplayName(vocabulary)}</h3>
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
                <p className="mt-1.5 text-sm font-black leading-snug text-[#172033]">{vocabulary.example.jp}</p>
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

interface ReviewPanelProps {
  activeQuestion: CourseReviewQuestion;
  questionIndex: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

function ReviewPanel({ activeQuestion, questionIndex, selectedAnswer, onAnswer, onNext }: ReviewPanelProps) {
  const answerFeedback = selectedAnswer
    ? `Đã chọn ${selectedAnswer}. ${selectedAnswer === activeQuestion.answer ? 'Đúng' : `Đáp án đúng là ${activeQuestion.answer}`}.`
    : '';

  useEffect(() => {
    if (!selectedAnswer) {
      return;
    }

    const nextQuestionTimer = window.setTimeout(() => {
      onNext();
    }, 520);

    return () => {
      window.clearTimeout(nextQuestionTimer);
    };
  }, [activeQuestion.answer, onNext, selectedAnswer]);

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) => {
    if (selectedAnswer) {
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
    onAnswer(activeQuestion.options[nextIndex]);
    window.requestAnimationFrame(() => {
      document.getElementById(`course-review-option-${questionIndex}-${nextIndex}`)?.focus();
    });
  };

  return (
    <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_24px_52px_-40px_rgba(148,163,184,0.2)] md:p-7">
      <p className="sr-only" role="status" aria-live="polite">{answerFeedback}</p>
      <div className="rounded-[2rem] border border-orange-100 bg-orange-50/55 p-5 md:p-6">
        <p className="text-xl font-black leading-snug text-gray-900 md:text-[1.65rem]">{activeQuestion.prompt}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label={activeQuestion.prompt}>
        {activeQuestion.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === activeQuestion.answer;
          const isFocusable = isSelected || (!selectedAnswer && optionIndex === 0);

          return (
            <button
              id={`course-review-option-${questionIndex}-${optionIndex}`}
              key={option}
              onClick={() => {
                if (!selectedAnswer) {
                  onAnswer(option);
                }
              }}
              onKeyDown={(event) => handleAnswerKeyDown(event, optionIndex)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={isFocusable ? 0 : -1}
              disabled={Boolean(selectedAnswer)}
              className={cn(
                'rounded-[1.5rem] border p-4 text-left text-sm font-black transition-all disabled:cursor-default md:p-5 md:text-base',
                isSelected && isCorrectOption && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                isSelected && !isCorrectOption && 'border-red-200 bg-red-50 text-red-700',
                !isSelected && selectedAnswer && isCorrectOption && 'border-emerald-200 bg-emerald-50/70 text-emerald-700',
                !isSelected && !(selectedAnswer && isCorrectOption) && 'border-[#e6ddd1] bg-[#fffdf8] text-gray-700 hover:border-orange-200 hover:bg-orange-50/40',
                focusRing
              )}
            >
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

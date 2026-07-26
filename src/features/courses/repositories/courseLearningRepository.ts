import { supabase } from '@/src/features/supabase/lib/supabaseClient';
import type {
  CourseDocumentItem,
  CourseExamItem,
  CourseLearningWorkspaceData,
  CoursePodcastItem,
  CourseReviewQuestion,
  CourseVocabularyItem,
  NonEmptyArray,
  VocabularyStatus,
} from '@/src/features/courses/mock/courseLearningMock';

interface CourseWorkspaceRow {
  id: string;
  title: string;
  level: string;
  description: string;
  course_modules?: Array<{
    id: string;
    title: string;
    order_index: number;
    lessons?: Array<{
      id: string;
      title: string;
      order_index: number;
      lesson_vocabulary?: Array<{
        position: number;
        vocabulary_items: {
          id: string;
          term: string;
          translation: string;
          example_sentence: string | null;
          pronunciation: string | null;
          tags: string[];
        } | null;
      }>;
    }>;
  }>;
  documents?: Array<{
    id: string;
    title: string;
    document_type: string;
    external_url: string | null;
    summary: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>;
  podcast_episodes?: Array<{
    id: string;
    title: string;
    summary: string;
    duration_minutes: number;
    created_at: string;
  }>;
  assessments?: Array<{
    id: string;
    title: string;
    assessment_type: string;
    passing_score: number;
    order_index: number;
  }>;
}

interface LearnerWorkspaceProgress {
  enrollmentPercent: number;
  vocabulary: Map<string, VocabularyStatus>;
  assessmentScores: Map<string, number>;
}

interface ReviewQuestionRow {
  id: string;
  prompt: string;
  explanation: string | null;
  source: string;
  options: string[];
  answer: string;
}

const EMPTY_PROGRESS: LearnerWorkspaceProgress = {
  enrollmentPercent: 0,
  vocabulary: new Map(),
  assessmentScores: new Map(),
};

export function mapVocabularyProgress(status: string | undefined): VocabularyStatus {
  if (status === 'mastered') return 'remembered';
  if (status === 'learning') return 'learning';
  return 'new';
}

function asNonEmpty<T>(items: T[], fallback: NonEmptyArray<T>): NonEmptyArray<T> {
  return items.length > 0 ? (items as NonEmptyArray<T>) : fallback;
}

function minutesLabel(minutes: number): string {
  return `${minutes} phút`;
}

function mapWorkspace(
  row: CourseWorkspaceRow,
  progress: LearnerWorkspaceProgress,
  fallback: CourseLearningWorkspaceData,
  reviewRows: ReviewQuestionRow[],
): CourseLearningWorkspaceData {
  const modules = [...(row.course_modules ?? [])].sort((a, b) => a.order_index - b.order_index);
  const lessons = modules.flatMap((module) =>
    [...(module.lessons ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((lesson) => ({ ...lesson, moduleTitle: module.title })),
  );

  const vocabulary = lessons.flatMap((lesson) =>
    [...(lesson.lesson_vocabulary ?? [])]
      .sort((a, b) => a.position - b.position)
      .flatMap(({ vocabulary_items: item }) => {
        if (!item) return [];
        const status = progress.vocabulary.get(item.id) ?? 'new';
        return [{
          id: item.id,
          word: item.term,
          article: '—',
          meaning: item.translation,
          pronunciation: item.pronunciation ?? item.term,
          example: { jp: item.example_sentence ?? item.term, vi: item.translation },
          status,
          module: lesson.moduleTitle,
          strength: status === 'remembered' ? 100 : status === 'learning' ? 55 : 0,
          tags: item.tags ?? [],
        } satisfies CourseVocabularyItem];
      }),
  );

  const reviewQuestions = reviewRows.map((question) => ({
    id: question.id,
    type: 'meaning',
    prompt: question.prompt,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation ?? `Đáp án đúng: ${question.answer}`,
    source: question.source,
  } satisfies CourseReviewQuestion));

  const documents = (row.documents ?? []).map((document) => ({
    id: document.id,
    title: document.title,
    kind: document.document_type.toLowerCase() === 'pdf' ? 'PDF' : 'Post',
    size: typeof document.metadata?.pages === 'number' ? `${document.metadata.pages} trang` : 'Tài liệu',
    publishedAt: document.created_at.slice(0, 10),
    readTime: '5 phút',
    module: modules[0]?.title ?? row.title,
    summary: document.summary,
    preview: document.external_url ?? document.summary,
    tags: [document.document_type.toUpperCase()],
  } satisfies CourseDocumentItem));

  const podcasts = (row.podcast_episodes ?? []).map((podcast, index) => ({
    id: podcast.id,
    title: podcast.title,
    episode: `Episode ${String(index + 1).padStart(2, '0')}`,
    duration: minutesLabel(podcast.duration_minutes),
    summary: podcast.summary,
    isNew: Date.now() - Date.parse(podcast.created_at) < 7 * 86_400_000,
  } satisfies CoursePodcastItem));

  const exams = [...(row.assessments ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((assessment) => {
      const latestScore = progress.assessmentScores.get(assessment.id);
      return {
        id: assessment.id,
        title: assessment.title,
        skills: [assessment.assessment_type, `Đạt từ ${assessment.passing_score}%`],
        duration: '20 phút',
        status: latestScore === undefined ? 'ready' : 'completed',
        ...(latestScore === undefined ? {} : { latestScore }),
      } satisfies CourseExamItem;
    });

  return {
    course: {
      id: row.id,
      title: row.title,
      level: row.level,
      description: row.description,
      currentModule: modules[0]?.title ?? 'Nội dung khóa học',
      progress: progress.enrollmentPercent,
      streakDays: fallback.course.streakDays,
      dailyGoal: fallback.course.dailyGoal,
      vocabularyTarget: vocabulary.length,
    },
    vocabulary: asNonEmpty(vocabulary, fallback.vocabulary),
    reviewQuestions: asNonEmpty(reviewQuestions, fallback.reviewQuestions),
    documents: asNonEmpty(documents, fallback.documents),
    games: fallback.games,
    exams: asNonEmpty(exams, fallback.exams),
    podcasts: asNonEmpty(podcasts, fallback.podcasts),
  };
}

async function fetchLearnerProgress(courseId: string): Promise<LearnerWorkspaceProgress> {
  if (!supabase) return EMPTY_PROGRESS;

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return EMPTY_PROGRESS;

  const [enrollment, vocabulary, attempts] = await Promise.all([
    supabase.from('enrollments').select('progress_percent').eq('course_id', courseId).eq('user_id', userId).maybeSingle(),
    supabase.from('vocabulary_progress').select('vocabulary_item_id, status').eq('user_id', userId),
    supabase.from('assessment_attempts').select('assessment_id, score, attempted_at').eq('user_id', userId).order('attempted_at', { ascending: false }),
  ]);

  const firstError = [enrollment.error, vocabulary.error, attempts.error].find(Boolean);
  if (firstError) throw new Error(firstError.message);

  const assessmentScores = new Map<string, number>();
  for (const attempt of attempts.data ?? []) {
    if (!assessmentScores.has(attempt.assessment_id)) assessmentScores.set(attempt.assessment_id, attempt.score);
  }

  return {
    enrollmentPercent: Math.round(Number(enrollment.data?.progress_percent ?? 0)),
    vocabulary: new Map((vocabulary.data ?? []).map((item) => [item.vocabulary_item_id, mapVocabularyProgress(item.status)])),
    assessmentScores,
  };
}

export async function fetchCourseLearningWorkspace(
  courseId: string,
  fallback: CourseLearningWorkspaceData,
): Promise<CourseLearningWorkspaceData | null> {
  if (!supabase) return null;

  const [courseResult, progress, reviewResult] = await Promise.all([
    supabase
      .from('courses')
      .select(`
        id, title, level, description,
        course_modules(id, title, order_index, lessons(
          id, title, order_index,
          lesson_vocabulary(position, vocabulary_items(id, term, translation, example_sentence, pronunciation, tags))
        )),
        documents(id, title, document_type, external_url, summary, metadata, created_at),
        podcast_episodes(id, title, summary, duration_minutes, created_at),
        assessments(id, title, assessment_type, passing_score, order_index)
      `)
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    fetchLearnerProgress(courseId),
    supabase.rpc('get_course_review_questions', { target_course_id: courseId }),
  ]);

  if (courseResult.error) throw new Error(courseResult.error.message);
  if (reviewResult.error) throw new Error(reviewResult.error.message);
  if (!courseResult.data) return null;

  return mapWorkspace(
    courseResult.data as unknown as CourseWorkspaceRow,
    progress,
    fallback,
    (reviewResult.data ?? []) as ReviewQuestionRow[],
  );
}

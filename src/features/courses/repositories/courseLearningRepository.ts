import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import { TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import { resolveCourseFeatureConfig } from '@/src/features/courses/lib/courseCapabilities';
import type {
  CourseDocumentItem,
  CourseExamItem,
  CourseLearningWorkspaceData,
  CoursePodcastItem,
  CourseReviewQuestion,
  CourseVocabularyItem,
  VocabularyStatus,
} from '@/src/features/courses/courseLearning.types';

/** Tra từ trong deck Tokutei chuẩn (kanji + kana) theo romaji — DB chỉ lưu romaji. */
const deckByRomaji = new Map(
  TOKUTEI_VOCAB.map((card) => [card.romaji.toLowerCase().replace(/[\s-]/g, ''), card]),
);

const JAPANESE_RE = /[\u3040-\u30ff\u4e00-\u9fff]/;
const KANA_RE = /[\u3040-\u30ff]/;

/**
 * Suy ra mặt chữ (kanji) và cách đọc (kana) cho một từ vựng, ưu tiên theo thứ tự:
 * 1. Tra deck Tokutei chuẩn theo romaji (có đủ kanji + kana).
 * 2. Nếu `term` đã là tiếng Nhật thì dùng `term` làm mặt chữ và `reading` làm cách đọc.
 */
function enrichJapaneseFromDeck(
  term: string,
  pronunciation?: string | null,
  reading?: string | null,
): { kanji?: string; kana?: string } {
  const candidates = [term, pronunciation, reading]
    .filter((value): value is string => Boolean(value && value.trim()));

  for (const candidate of candidates) {
    const card = deckByRomaji.get(candidate.toLowerCase().replace(/[\s-]/g, ''));
    if (card) return { kanji: card.word, kana: card.reading };
  }

  if (JAPANESE_RE.test(term)) {
    const cleanReading = reading?.trim();
    const kana = cleanReading && KANA_RE.test(cleanReading) && !/[a-z]/i.test(cleanReading) && cleanReading !== term
      ? cleanReading
      : undefined;
    return { kanji: term, kana };
  }

  return {};
}

interface CourseWorkspaceRow {
  id: string;
  title: string;
  level: string;
  description: string;
  feature_config?: Record<string, unknown> | null;
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
          reading: string | null;
          audio_url: string | null;
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
    content_markdown: string;
    read_time_minutes: number;
    summary: string;
    metadata: Record<string, unknown> | null;
    storage_path: string | null;
    created_at: string;
  }>;
  podcast_episodes?: Array<{
    id: string;
    title: string;
    summary: string;
    duration_minutes: number;
    external_url: string | null;
    storage_path: string | null;
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
  assessmentPassed: Set<string>;
}

interface ReviewQuestionRow {
  question_id: string;
  prompt: string;
  explanation: string;
  source: string;
  options: unknown;
}

export function mapVocabularyProgress(status: string | undefined): VocabularyStatus {
  if (status === 'mastered') return 'remembered';
  if (status === 'learning') return 'learning';
  return 'new';
}

function minutesLabel(minutes: number): string {
  return `${minutes} phút`;
}

function mapWorkspace(
  row: CourseWorkspaceRow,
  progress: LearnerWorkspaceProgress,
  reviewRows: ReviewQuestionRow[],
): Omit<CourseLearningWorkspaceData, 'featureConfig'> {
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
          audioUrl: item.audio_url,
          ...enrichJapaneseFromDeck(item.term, item.pronunciation, item.reading),
        } satisfies CourseVocabularyItem];
      }),
  );

  const reviewQuestions = reviewRows.flatMap((question) => {
    if (!Array.isArray(question.options)) return [];
    const optionIds: Record<string, string> = {};
    const options = question.options.flatMap((option) => {
      if (!option || typeof option !== 'object' || Array.isArray(option)) return [];
      const { id, label } = option as { id?: unknown; label?: unknown };
      if (typeof id !== 'string' || typeof label !== 'string') return [];
      optionIds[label] = id;
      return [label];
    });
    if (options.length < 2) return [];
    return [{
      id: question.question_id,
      type: 'meaning' as const,
      prompt: question.prompt,
      options,
      optionIds,
      explanation: question.explanation,
      source: question.source,
    } satisfies CourseReviewQuestion];
  });

  const documents = (row.documents ?? []).map((document) => ({
    id: document.id,
    title: document.title,
    kind: document.document_type.toLowerCase() === 'pdf' ? 'PDF' : 'Post',
    size: typeof document.metadata?.pages === 'number' ? `${document.metadata.pages} trang` : 'Tài liệu',
    publishedAt: document.created_at.slice(0, 10),
    readTime: minutesLabel(document.read_time_minutes),
    module: modules[0]?.title ?? row.title,
    summary: document.summary,
    preview: document.content_markdown || document.summary,
    tags: [document.document_type.toUpperCase()],
    contentMarkdown: document.content_markdown,
    externalUrl: document.external_url,
    readTimeMinutes: document.read_time_minutes,
    storagePath: document.storage_path,
  } satisfies CourseDocumentItem));

  const podcasts = (row.podcast_episodes ?? []).map((podcast, index) => ({
    id: podcast.id,
    title: podcast.title,
    episode: `Episode ${String(index + 1).padStart(2, '0')}`,
    duration: minutesLabel(podcast.duration_minutes),
    summary: podcast.summary,
    isNew: Date.now() - Date.parse(podcast.created_at) < 7 * 86_400_000,
    externalUrl: podcast.external_url,
    storagePath: podcast.storage_path,
  } satisfies CoursePodcastItem));

  const exams = [...(row.assessments ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map((assessment, index, all) => {
      const latestScore = progress.assessmentScores.get(assessment.id);
      const hasPassed = progress.assessmentPassed.has(assessment.id);
      const previous = index > 0 ? all[index - 1] : null;
      const isLocked = index > 0 && previous !== null && !progress.assessmentPassed.has(previous.id);
      if (isLocked) {
        return {
          id: assessment.id,
          title: assessment.title,
          skills: [assessment.assessment_type, `Đạt từ ${assessment.passing_score}%`],
          duration: '—',
          status: 'locked',
          unlockLabel: previous ? `Vượt "${previous.title}" để mở` : 'Chưa mở khóa',
        } satisfies CourseExamItem;
      }
      return {
        id: assessment.id,
        title: assessment.title,
        skills: [assessment.assessment_type, `Đạt từ ${assessment.passing_score}%`],
        duration: '—',
        status: latestScore === undefined ? 'ready' : (hasPassed ? 'completed' : 'ready'),
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
    },
    vocabulary,
    reviewQuestions,
    documents,
    games: [],
    exams,
    podcasts,
  };
}

async function fetchLearnerProgress(courseId: string): Promise<LearnerWorkspaceProgress> {
  const client = requireSupabase();
  const userId = await requireUserId(client);

  const [enrollment, vocabulary, attempts] = await Promise.all([
    client.from('enrollments').select('progress_percent').eq('course_id', courseId).eq('user_id', userId).maybeSingle(),
    client.from('vocabulary_progress').select('vocabulary_item_id, status').eq('user_id', userId),
    client.from('assessment_attempts').select('assessment_id, score, passed, attempted_at').eq('user_id', userId).order('attempted_at', { ascending: false }),
  ]);

  const firstError = [enrollment.error, vocabulary.error, attempts.error].find(Boolean);
  if (firstError) throw new Error(firstError.message);

  const assessmentScores = new Map<string, number>();
  const assessmentPassed = new Set<string>();
  for (const attempt of attempts.data ?? []) {
    if (!assessmentScores.has(attempt.assessment_id)) assessmentScores.set(attempt.assessment_id, attempt.score);
    if (attempt.passed) assessmentPassed.add(attempt.assessment_id);
  }

  return {
    enrollmentPercent: Math.round(Number(enrollment.data?.progress_percent ?? 0)),
    vocabulary: new Map((vocabulary.data ?? []).map((item) => [item.vocabulary_item_id, mapVocabularyProgress(item.status)])),
    assessmentScores,
    assessmentPassed,
  };
}

export async function fetchCourseLearningWorkspace(
  courseId: string,
): Promise<CourseLearningWorkspaceData | null> {
  const client = requireSupabase();

  const [courseResult, progress, reviewResult] = await Promise.all([
    client
      .from('courses')
      .select(`
        id, title, level, description, feature_config,
        course_modules(id, title, order_index, lessons(
          id, title, order_index,
          lesson_vocabulary(position, vocabulary_items(id, term, translation, example_sentence, pronunciation, reading, audio_url, tags))
        )),
        documents(id, title, document_type, content_markdown, external_url, read_time_minutes, storage_path, summary, metadata, created_at),
        podcast_episodes(id, title, summary, duration_minutes, external_url, storage_path, created_at),
        assessments(id, title, assessment_type, passing_score, order_index)
      `)
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    fetchLearnerProgress(courseId),
    client.rpc('get_course_review_questions', { target_course_id: courseId }),
  ]);

  if (courseResult.error) throw new Error(courseResult.error.message);
  if (reviewResult.error) throw new Error(reviewResult.error.message);
  if (!courseResult.data) return null;
  const row = courseResult.data as unknown as CourseWorkspaceRow;
  const featureConfig = resolveCourseFeatureConfig(row.feature_config);
  const hasLessons = row.course_modules?.some((module) => (module.lessons?.length ?? 0) > 0);
  if (!hasLessons) {
    throw new Error('Nội dung khóa học chưa hoàn thiện để có thể học an toàn.');
  }
  if (featureConfig.documents && !row.documents?.length) {
    throw new Error('Nội dung tài liệu khóa học chưa hoàn thiện.');
  }
  if (featureConfig.exams && !row.assessments?.length) {
    throw new Error('Nội dung thi thử khóa học chưa hoàn thiện.');
  }

  const workspace = mapWorkspace(
    row,
    progress,
    (reviewResult.data ?? []) as unknown as ReviewQuestionRow[],
  );
  if (featureConfig.vocabulary && !workspace.vocabulary.length) {
    throw new Error('Nội dung từ vựng khóa học chưa hoàn thiện.');
  }
  if (featureConfig.practice && !workspace.reviewQuestions.length) {
    throw new Error('Nội dung ôn tập khóa học chưa hoàn thiện.');
  }
  return { ...workspace, featureConfig };
}

export async function createSignedCourseAssetUrl(path: string, expiresInSeconds = 300): Promise<string> {
  const client = requireSupabase();
  await requireUserId(client);
  const { data, error } = await client.storage.from('course-assets').createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

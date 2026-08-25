import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import { TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import { resolveCourseFeatureConfig } from '@/src/features/courses/lib/courseCapabilities';
import type {
  CourseDocumentsData,
  CourseDocumentItem,
  CourseExamItem,
  CourseExamsData,
  CourseGamesData,
  CourseLearningMeta,
  CoursePodcastItem,
  CoursePodcastsData,
  CoursePracticeData,
  CourseReviewQuestion,
  CourseVocabularyData,
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

interface VocabularyRow {
  id: string;
  term: string;
  translation: string;
  example_sentence?: string | null;
  pronunciation?: string | null;
  reading?: string | null;
  audio_url?: string | null;
  tags?: string[] | null;
}

interface LessonVocabularyRow {
  position: number;
  vocabulary_items: VocabularyRow | null;
}

interface CourseLessonRow {
  id?: string;
  title?: string;
  order_index: number;
  lesson_vocabulary?: LessonVocabularyRow[];
}

interface CourseModuleRow {
  id?: string;
  title: string;
  order_index: number;
  lessons?: CourseLessonRow[];
}

interface CourseDocumentRow {
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
}

interface CoursePodcastRow {
  id: string;
  title: string;
  summary: string;
  duration_minutes: number;
  external_url: string | null;
  storage_path: string | null;
  created_at: string;
}

interface AssessmentRow {
  id: string;
  title: string;
  assessment_type: string;
  passing_score: number;
  order_index: number;
}

interface CourseWorkspaceRow {
  id: string;
  title: string;
  level: string;
  description: string;
  feature_config?: Record<string, unknown> | null;
  course_modules?: CourseModuleRow[];
  documents?: CourseDocumentRow[];
  podcast_episodes?: CoursePodcastRow[];
  assessments?: AssessmentRow[];
  podcast_count?: number;
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

function sortedModules(row: CourseWorkspaceRow): CourseModuleRow[] {
  return [...(row.course_modules ?? [])].sort((a, b) => a.order_index - b.order_index);
}

function mapCourseMeta(row: CourseWorkspaceRow, enrollmentPercent: number): CourseLearningMeta {
  const modules = sortedModules(row);
  return {
    course: {
      id: row.id,
      title: row.title,
      level: row.level,
      description: row.description,
      currentModule: modules[0]?.title ?? 'Nội dung khóa học',
      progress: enrollmentPercent,
    },
    featureConfig: resolveCourseFeatureConfig(row.feature_config),
    podcastCount: row.podcast_count ?? row.podcast_episodes?.length ?? 0,
  };
}

function mapVocabularyItems(row: CourseWorkspaceRow, progress = new Map<string, VocabularyStatus>()): CourseVocabularyItem[] {
  const modules = sortedModules(row);
  const lessons = modules.flatMap((module) =>
    [...(module.lessons ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((lesson) => ({ ...lesson, moduleTitle: module.title })),
  );

  return lessons.flatMap((lesson) =>
    [...(lesson.lesson_vocabulary ?? [])]
      .sort((a, b) => a.position - b.position)
      .flatMap(({ vocabulary_items: item }) => {
        if (!item) return [];
        const status = progress.get(item.id) ?? 'new';
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
}

function mapReviewQuestions(reviewRows: ReviewQuestionRow[]): CourseReviewQuestion[] {
  return reviewRows.flatMap((question) => {
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
}

function mapDocuments(row: CourseWorkspaceRow): CourseDocumentItem[] {
  const moduleTitle = sortedModules(row)[0]?.title ?? row.title;
  return (row.documents ?? []).map((document) => ({
    id: document.id,
    title: document.title,
    kind: document.document_type.toLowerCase() === 'pdf' ? 'PDF' : 'Post',
    size: typeof document.metadata?.pages === 'number' ? `${document.metadata.pages} trang` : 'Tài liệu',
    publishedAt: document.created_at.slice(0, 10),
    readTime: minutesLabel(document.read_time_minutes),
    module: moduleTitle,
    summary: document.summary,
    preview: document.content_markdown || document.summary,
    tags: [document.document_type.toUpperCase()],
    contentMarkdown: document.content_markdown,
    externalUrl: document.external_url,
    readTimeMinutes: document.read_time_minutes,
    storagePath: document.storage_path,
  } satisfies CourseDocumentItem));
}

function mapPodcasts(rows: CoursePodcastRow[]): CoursePodcastItem[] {
  return rows.map((podcast, index) => ({
    id: podcast.id,
    title: podcast.title,
    episode: `Episode ${String(index + 1).padStart(2, '0')}`,
    duration: minutesLabel(podcast.duration_minutes),
    summary: podcast.summary,
    isNew: Date.now() - Date.parse(podcast.created_at) < 7 * 86_400_000,
    externalUrl: podcast.external_url,
    storagePath: podcast.storage_path,
  } satisfies CoursePodcastItem));
}

function mapExams(rows: AssessmentRow[], progress: Pick<LearnerWorkspaceProgress, 'assessmentScores' | 'assessmentPassed'>): CourseExamItem[] {
  return [...rows]
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
}

const VOCABULARY_COURSE_SELECT = `
  id,
  course_modules(title, order_index, lessons(
    order_index,
    lesson_vocabulary(position, vocabulary_items(
      id, term, translation, example_sentence, pronunciation, reading, audio_url, tags
    ))
  ))
`;

const PRACTICE_COURSE_SELECT = `
  id,
  course_modules(title, order_index, lessons(
    order_index,
    lesson_vocabulary(position, vocabulary_items(
      id, term, translation, example_sentence, pronunciation, reading
    ))
  ))
`;

const GAMES_COURSE_SELECT = `
  id,
  course_modules(title, order_index, lessons(
    order_index,
    lesson_vocabulary(position, vocabulary_items(id, term, translation))
  ))
`;

function vocabularyIds(row: CourseWorkspaceRow): string[] {
  return Array.from(new Set(sortedModules(row).flatMap((module) =>
    (module.lessons ?? []).flatMap((lesson) =>
      (lesson.lesson_vocabulary ?? []).flatMap(({ vocabulary_items: item }) => item ? [item.id] : []),
    ),
  )));
}

export async function fetchCourseLearningMeta(courseId: string): Promise<CourseLearningMeta | null> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const [courseResult, enrollmentResult] = await Promise.all([
    client
      .from('courses')
      .select('id, title, level, description, feature_config, course_modules(title, order_index), podcast_episodes(count)')
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    client
      .from('enrollments')
      .select('progress_percent')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (courseResult.error) throw new Error(courseResult.error.message);
  if (enrollmentResult.error) throw new Error(enrollmentResult.error.message);
  if (!courseResult.data) return null;

  const selected = courseResult.data as unknown as CourseWorkspaceRow & { podcast_episodes?: Array<{ count?: number }> };
  const row: CourseWorkspaceRow = {
    ...selected,
    podcast_count: selected.podcast_episodes?.[0]?.count ?? 0,
  };
  return mapCourseMeta(row, Math.max(0, Math.min(100, Math.round(Number(enrollmentResult.data?.progress_percent ?? 0)))));
}

export async function fetchCourseVocabulary(courseId: string): Promise<CourseVocabularyData | null> {
  const client = requireSupabase();
  const [courseResult, userId] = await Promise.all([
    client
      .from('courses')
      .select(VOCABULARY_COURSE_SELECT)
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    requireUserId(client),
  ]);

  if (courseResult.error) throw new Error(courseResult.error.message);
  if (!courseResult.data) return null;

  const row = courseResult.data as unknown as CourseWorkspaceRow;
  const ids = vocabularyIds(row);
  const progressResult = ids.length > 0
    ? await client
      .from('vocabulary_progress')
      .select('vocabulary_item_id, status')
      .eq('user_id', userId)
      .in('vocabulary_item_id', ids)
    : { data: [], error: null };
  if (progressResult.error) throw new Error(progressResult.error.message);

  const progress = new Map((progressResult.data ?? []).map((item) => [item.vocabulary_item_id, mapVocabularyProgress(item.status)]));
  return { vocabulary: mapVocabularyItems(row, progress) };
}

export async function fetchCourseDocuments(courseId: string): Promise<CourseDocumentsData | null> {
  const client = requireSupabase();
  const [courseResult, documentsResult] = await Promise.all([
    client
      .from('courses')
      .select('id, title, course_modules(title, order_index)')
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    client
      .from('documents')
      .select('id, title, document_type, content_markdown, external_url, read_time_minutes, storage_path, summary, metadata, created_at')
      .eq('course_id', courseId)
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
  ]);

  if (courseResult.error) throw new Error(courseResult.error.message);
  if (documentsResult.error) throw new Error(documentsResult.error.message);
  if (!courseResult.data) return null;

  const row = {
    ...(courseResult.data as unknown as CourseWorkspaceRow),
    documents: (documentsResult.data ?? []) as unknown as CourseDocumentRow[],
  } satisfies CourseWorkspaceRow;
  return { documents: mapDocuments(row) };
}

export async function fetchCoursePractice(courseId: string): Promise<CoursePracticeData | null> {
  const client = requireSupabase();
  const [courseResult, reviewResult] = await Promise.all([
    client
      .from('courses')
      .select(PRACTICE_COURSE_SELECT)
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle(),
    client.rpc('get_course_review_questions', { target_course_id: courseId }),
  ]);

  if (courseResult.error) throw new Error(courseResult.error.message);
  if (reviewResult.error) throw new Error(reviewResult.error.message);
  if (!courseResult.data) return null;

  const row = courseResult.data as unknown as CourseWorkspaceRow;
  return {
    vocabulary: mapVocabularyItems(row),
    reviewQuestions: mapReviewQuestions((reviewResult.data ?? []) as unknown as ReviewQuestionRow[]),
  };
}

export async function fetchCourseGames(courseId: string): Promise<CourseGamesData | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('courses')
    .select(GAMES_COURSE_SELECT)
    .eq('id', courseId)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  return { vocabulary: mapVocabularyItems(data as unknown as CourseWorkspaceRow), games: [] };
}

export async function fetchCourseExams(courseId: string): Promise<CourseExamsData | null> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client
    .from('assessments')
    .select('id, title, assessment_type, passing_score, order_index')
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('order_index', { ascending: true });
  if (error) throw new Error(error.message);

  const assessments = (data ?? []) as unknown as AssessmentRow[];
  const ids = assessments.map((assessment) => assessment.id);
  const attemptsResult = ids.length > 0
    ? await client
      .from('assessment_attempts')
      .select('assessment_id, score, passed, attempted_at')
      .eq('user_id', userId)
      .in('assessment_id', ids)
      .order('attempted_at', { ascending: false })
    : { data: [], error: null };
  if (attemptsResult.error) throw new Error(attemptsResult.error.message);

  const assessmentScores = new Map<string, number>();
  const assessmentPassed = new Set<string>();
  for (const attempt of attemptsResult.data ?? []) {
    if (!assessmentScores.has(attempt.assessment_id)) assessmentScores.set(attempt.assessment_id, attempt.score);
    if (attempt.passed) assessmentPassed.add(attempt.assessment_id);
  }
  return { exams: mapExams(assessments, { assessmentScores, assessmentPassed }) };
}

export async function fetchCoursePodcasts(courseId: string): Promise<CoursePodcastsData | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('podcast_episodes')
    .select('id, title, summary, duration_minutes, external_url, storage_path, created_at')
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return { podcasts: mapPodcasts((data ?? []) as unknown as CoursePodcastRow[]) };
}

export async function createSignedCourseAssetUrl(path: string, expiresInSeconds = 300): Promise<string> {
  const client = requireSupabase();
  await requireUserId(client);
  const { data, error } = await client.storage.from('course-assets').createSignedUrl(path, expiresInSeconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

import type { Tables } from '@/src/features/supabase/lib/database.types';
import { requireAdmin } from './adminRepositoryCore';

type Course = Tables<'courses'>;
type Module = Tables<'course_modules'>;
type Lesson = Tables<'lessons'>;
type LessonVocabulary = Tables<'lesson_vocabulary'>;
type Assessment = Tables<'assessments'>;
type Document = Tables<'documents'>;
type Audio = Tables<'podcast_episodes'>;
type SpeakingPrompt = Tables<'speaking_prompts'>;

type RelatedStatusRow = { course_id: string; status: string };
type LessonStatusRow = RelatedStatusRow & { id: string };

export interface AdminCourseSummary {
  course: Course;
  moduleCount: number;
  lessonCount: number;
  vocabularyLinkCount: number;
  assessmentCount: number;
  documentCount: number;
  audioCount: number;
  readinessPercent: number;
  pendingContentCount: number;
}

export interface AdminCourseWorkspace {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  lessonVocabulary: LessonVocabulary[];
  assessments: Assessment[];
  documents: Document[];
  audio: Audio[];
  speakingPrompts: SpeakingPrompt[];
}

interface CourseSummaryRows {
  courses: Course[];
  modules: RelatedStatusRow[];
  lessons: LessonStatusRow[];
  lessonVocabulary: Array<Pick<LessonVocabulary, 'lesson_id'>>;
  assessments: RelatedStatusRow[];
  documents: RelatedStatusRow[];
  audio: RelatedStatusRow[];
}

function countByCourse(rows: readonly RelatedStatusRow[]): Map<string, { total: number; published: number }> {
  const counts = new Map<string, { total: number; published: number }>();
  for (const row of rows) {
    const current = counts.get(row.course_id) ?? { total: 0, published: 0 };
    current.total += 1;
    if (row.status === 'published') current.published += 1;
    counts.set(row.course_id, current);
  }
  return counts;
}

function countAt(counts: Map<string, { total: number; published: number }>, courseId: string): { total: number; published: number } {
  return counts.get(courseId) ?? { total: 0, published: 0 };
}

export function summarizeAdminCourses(rows: CourseSummaryRows): AdminCourseSummary[] {
  const moduleCounts = countByCourse(rows.modules);
  const lessonCounts = countByCourse(rows.lessons);
  const assessmentCounts = countByCourse(rows.assessments);
  const documentCounts = countByCourse(rows.documents);
  const audioCounts = countByCourse(rows.audio);
  const lessonCourseIds = new Map(rows.lessons.map((lesson) => [lesson.id, lesson.course_id]));
  const vocabularyCounts = new Map<string, number>();
  for (const link of rows.lessonVocabulary) {
    const courseId = lessonCourseIds.get(link.lesson_id);
    if (courseId) vocabularyCounts.set(courseId, (vocabularyCounts.get(courseId) ?? 0) + 1);
  }

  return rows.courses.map((course) => {
    const modules = countAt(moduleCounts, course.id);
    const lessons = countAt(lessonCounts, course.id);
    const assessments = countAt(assessmentCounts, course.id);
    const documents = countAt(documentCounts, course.id);
    const audio = countAt(audioCounts, course.id);
    const total = modules.total + lessons.total + assessments.total + documents.total + audio.total;
    const published = modules.published + lessons.published + assessments.published + documents.published + audio.published;
    return {
      course,
      moduleCount: modules.total,
      lessonCount: lessons.total,
      vocabularyLinkCount: vocabularyCounts.get(course.id) ?? 0,
      assessmentCount: assessments.total,
      documentCount: documents.total,
      audioCount: audio.total,
      readinessPercent: total ? Math.round((published / total) * 100) : 0,
      pendingContentCount: Math.max(0, total - published),
    };
  });
}

export async function listAdminCourseSummaries(): Promise<AdminCourseSummary[]> {
  const client = await requireAdmin();
  const [coursesResult, modulesResult, lessonsResult, vocabularyResult, assessmentsResult, documentsResult, audioResult] = await Promise.all([
    client.from('courses').select('*').order('order_index'),
    client.from('course_modules').select('course_id, status'),
    client.from('lessons').select('id, course_id, status'),
    client.from('lesson_vocabulary').select('lesson_id'),
    client.from('assessments').select('course_id, status'),
    client.from('documents').select('course_id, status'),
    client.from('podcast_episodes').select('course_id, status'),
  ]);

  for (const result of [coursesResult, modulesResult, lessonsResult, vocabularyResult, assessmentsResult, documentsResult, audioResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  return summarizeAdminCourses({
    courses: coursesResult.data ?? [],
    modules: modulesResult.data ?? [],
    lessons: lessonsResult.data ?? [],
    lessonVocabulary: vocabularyResult.data ?? [],
    assessments: assessmentsResult.data ?? [],
    documents: documentsResult.data ?? [],
    audio: audioResult.data ?? [],
  });
}

export async function fetchAdminCourseWorkspace(courseId: string): Promise<AdminCourseWorkspace> {
  const client = await requireAdmin();
  const [courseResult, modulesResult, lessonsResult, assessmentsResult, documentsResult, audioResult, speakingResult] = await Promise.all([
    client.from('courses').select('*').eq('id', courseId).maybeSingle(),
    client.from('course_modules').select('*').eq('course_id', courseId).order('order_index'),
    client.from('lessons').select('*').eq('course_id', courseId).order('order_index'),
    client.from('assessments').select('*').eq('course_id', courseId).order('order_index'),
    client.from('documents').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
    client.from('podcast_episodes').select('*').eq('course_id', courseId).order('created_at', { ascending: false }),
    client.from('speaking_prompts').select('*').eq('course_id', courseId).order('order_index'),
  ]);
  for (const result of [courseResult, modulesResult, lessonsResult, assessmentsResult, documentsResult, audioResult, speakingResult]) {
    if (result.error) throw new Error(result.error.message);
  }
  if (!courseResult.data) throw new Error('Không tìm thấy khóa học.');

  const lessonIds = (lessonsResult.data ?? []).map((lesson) => lesson.id);
  const vocabularyResult = lessonIds.length
    ? await client.from('lesson_vocabulary').select('*').in('lesson_id', lessonIds).order('lesson_id').order('position')
    : { data: [], error: null };
  if (vocabularyResult.error) throw new Error(vocabularyResult.error.message);

  return {
    course: courseResult.data,
    modules: modulesResult.data ?? [],
    lessons: lessonsResult.data ?? [],
    lessonVocabulary: vocabularyResult.data ?? [],
    assessments: assessmentsResult.data ?? [],
    documents: documentsResult.data ?? [],
    audio: audioResult.data ?? [],
    speakingPrompts: speakingResult.data ?? [],
  };
}

import type { Json, Tables, TablesInsert, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, sanitizeAdminSearch, type AdminDraft, type AdminLessonExercise } from './adminRepositoryCore';

type Course = Tables<'courses'>;
type CourseFeatureConfigInput = { feature_config?: Json };
type Module = Tables<'course_modules'>;
type Lesson = Tables<'lessons'>;
type VocabularyItem = Tables<'vocabulary_items'>;
type Document = Tables<'documents'>;
type Podcast = Tables<'podcast_episodes'>;
type LessonAsset = Tables<'lesson_assets'>;
type LessonVocabulary = Tables<'lesson_vocabulary'>;

export interface AdminVocabularyPage {
  rows: VocabularyItem[];
  total: number;
}

export interface AdminVocabularyPageOptions {
  page: number;
  pageSize: number;
  search?: string;
  level?: string;
  tag?: string;
  courseId?: string;
}

export async function listAdminCourses(): Promise<Course[]> {
  const { data, error } = await (await requireAdmin()).from('courses').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAdminCourse(input: TablesInsert<'courses'> & CourseFeatureConfigInput): Promise<Course> {
  const { data, error } = await (await requireAdmin()).from('courses').insert(input as TablesInsert<'courses'>).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminCourse(id: string, input: TablesUpdate<'courses'> & CourseFeatureConfigInput): Promise<Course> {
  const { data, error } = await (await requireAdmin()).from('courses').update(input as TablesUpdate<'courses'>).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAdminCourse(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('courses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminModules(courseId?: string): Promise<Module[]> {
  let query = (await requireAdmin()).from('course_modules').select('*').order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminModule(input: AdminDraft<'course_modules'>): Promise<Module> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('course_modules').update(payload as TablesUpdate<'course_modules'>).eq('id', id).select('*').single()
    : await client.from('course_modules').insert(insertDraft<'course_modules'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminModule(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('course_modules').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessons(courseId?: string): Promise<Lesson[]> {
  let query = (await requireAdmin()).from('lessons').select('*').order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminLesson(input: AdminDraft<'lessons'>): Promise<Lesson> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lessons').update(payload as TablesUpdate<'lessons'>).eq('id', id).select('*').single()
    : await client.from('lessons').insert(insertDraft<'lessons'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminLesson(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lessons').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminVocabulary(): Promise<VocabularyItem[]> {
  const { data, error } = await (await requireAdmin()).from('vocabulary_items').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAdminVocabularyPicker(options: { search?: string; limit?: number } = {}): Promise<VocabularyItem[]> {
  const client = await requireAdmin();
  const limit = Math.min(100, Math.max(1, options.limit ?? 40));
  let query = client.from('vocabulary_items').select('*').order('created_at', { ascending: false }).limit(limit);
  const sanitized = sanitizeAdminSearch(options.search);
  if (sanitized) query = query.or(`japanese.ilike.%${sanitized}%,reading.ilike.%${sanitized}%,meaning.ilike.%${sanitized}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAdminVocabularyFilterOptions(): Promise<{ levels: string[]; tags: string[] }> {
  const { data, error } = await (await requireAdmin()).from('vocabulary_items').select('level,tags');
  if (error) throw new Error(error.message);
  const levels = Array.from(new Set((data ?? []).map((row) => row.level).filter(Boolean))).sort();
  const tags = Array.from(new Set((data ?? []).flatMap((row) => row.tags ?? []).filter(Boolean))).sort();
  return { levels, tags };
}

export async function listAdminVocabularyPage(options: AdminVocabularyPageOptions): Promise<AdminVocabularyPage> {
  const client = await requireAdmin();
  const page = Math.max(1, options.page);
  const pageSize = Math.min(100, Math.max(1, options.pageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = client.from('vocabulary_items').select('*', { count: 'exact' });
  const sanitized = sanitizeAdminSearch(options.search);
  if (sanitized) query = query.or(`japanese.ilike.%${sanitized}%,reading.ilike.%${sanitized}%,meaning.ilike.%${sanitized}%`);
  if (options.level) query = query.eq('level', options.level);
  if (options.tag) query = query.contains('tags', [options.tag]);
  if (options.courseId) {
    const { data: lessonVocabulary, error: relationError } = await client
      .from('lesson_vocabulary')
      .select('vocabulary_item_id,lessons!inner(course_id)')
      .eq('lessons.course_id', options.courseId);
    if (relationError) throw new Error(relationError.message);
    const ids = Array.from(new Set((lessonVocabulary ?? []).map((row) => row.vocabulary_item_id)));
    if (ids.length === 0) return { rows: [], total: 0 };
    query = query.in('id', ids);
  }
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: count ?? 0 };
}

export async function saveAdminVocabulary(input: AdminDraft<'vocabulary_items'>): Promise<VocabularyItem> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('vocabulary_items').update(payload as TablesUpdate<'vocabulary_items'>).eq('id', id).select('*').single()
    : await client.from('vocabulary_items').insert(insertDraft<'vocabulary_items'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminVocabulary(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('vocabulary_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminDocuments(courseId?: string): Promise<Document[]> {
  let query = (await requireAdmin()).from('documents').select('*').order('created_at', { ascending: false });
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminDocument(input: AdminDraft<'documents'>): Promise<Document> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('documents').update(payload as TablesUpdate<'documents'>).eq('id', id).select('*').single()
    : await client.from('documents').insert(insertDraft<'documents'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminDocument(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminAudio(): Promise<Podcast[]> {
  const { data, error } = await (await requireAdmin()).from('podcast_episodes').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAudio(input: AdminDraft<'podcast_episodes'>): Promise<Podcast> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('podcast_episodes').update(payload as TablesUpdate<'podcast_episodes'>).eq('id', id).select('*').single()
    : await client.from('podcast_episodes').insert(insertDraft<'podcast_episodes'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminAudio(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('podcast_episodes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessonAssets(lessonId?: string): Promise<LessonAsset[]> {
  let query = (await requireAdmin()).from('lesson_assets').select('*').order('sort_order');
  if (lessonId) query = query.eq('lesson_id', lessonId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminLessonAsset(input: AdminDraft<'lesson_assets'>): Promise<LessonAsset> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lesson_assets').update(payload as TablesUpdate<'lesson_assets'>).eq('id', id).select('*').single()
    : await client.from('lesson_assets').insert(insertDraft<'lesson_assets'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminLessonAsset(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lesson_assets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessonVocabulary(lessonId: string): Promise<LessonVocabulary[]> {
  const { data, error } = await (await requireAdmin()).from('lesson_vocabulary').select('*').eq('lesson_id', lessonId).order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceAdminLessonVocabulary(lessonId: string, vocabularyIds: string[]): Promise<void> {
  const client = await requireAdmin();
  const { error: deleteError } = await client.from('lesson_vocabulary').delete().eq('lesson_id', lessonId);
  if (deleteError) throw new Error(deleteError.message);
  if (vocabularyIds.length === 0) return;
  const { error } = await client.from('lesson_vocabulary').insert(vocabularyIds.map((vocabularyItemId, orderIndex) => ({
    lesson_id: lessonId,
    vocabulary_item_id: vocabularyItemId,
    order_index: orderIndex,
  })));
  if (error) throw new Error(error.message);
}

export async function listAdminLessonExercises(lessonId: string): Promise<AdminLessonExercise[]> {
  const { data, error } = await (await requireAdmin()).from('lesson_exercises').select('*').eq('lesson_id', lessonId).order('order_index');
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminLessonExercise[];
}

export async function saveAdminLessonExercise(input: AdminDraft<'lesson_exercises'>): Promise<AdminLessonExercise> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lesson_exercises').update(payload as TablesUpdate<'lesson_exercises'>).eq('id', id).select('*').single()
    : await client.from('lesson_exercises').insert(insertDraft<'lesson_exercises'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data as AdminLessonExercise;
}

export async function deleteAdminLessonExercise(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lesson_exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

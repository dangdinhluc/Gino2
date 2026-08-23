import type { Tables, TablesInsert, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, type AdminDraft, type AdminLessonExercise } from './adminRepositoryCore';

type Course = Tables<'courses'>;
type Module = Tables<'course_modules'>;
type Lesson = Tables<'lessons'>;
type VocabularyItem = Tables<'vocabulary_items'>;
type Document = Tables<'documents'>;
type Podcast = Tables<'podcast_episodes'>;
type LessonAsset = Tables<'lesson_assets'>;
type LessonVocabulary = Tables<'lesson_vocabulary'>;

export async function listAdminCourses(): Promise<Course[]> {
  const { data, error } = await (await requireAdmin()).from('courses').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAdminCourse(input: TablesInsert<'courses'>): Promise<Course> {
  const { data, error } = await (await requireAdmin()).from('courses').insert(input).select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAdminCourse(id: string, input: TablesUpdate<'courses'>): Promise<Course> {
  const { data, error } = await (await requireAdmin()).from('courses').update(input).eq('id', id).select('*').single();
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
  const { data, error } = await (await requireAdmin()).from('vocabulary_items').select('*').order('term');
  if (error) throw new Error(error.message);
  return data ?? [];
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

export async function listAdminAudio(courseId?: string): Promise<Podcast[]> {
  let query = (await requireAdmin()).from('podcast_episodes').select('*').order('created_at', { ascending: false });
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
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

export async function listAdminLessonAssets(): Promise<LessonAsset[]> {
  const { data, error } = await (await requireAdmin()).from('lesson_assets').select('*').order('created_at', { ascending: false });
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

export async function listAdminLessonExercises(): Promise<AdminLessonExercise[]> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_lesson_exercises');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminLessonExercise(input: AdminDraft<'lesson_exercises'>): Promise<void> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('lesson_exercises').update(payload as TablesUpdate<'lesson_exercises'>).eq('id', id)
    : await client.from('lesson_exercises').insert(insertDraft<'lesson_exercises'>(id, payload));
  if (result.error) throw new Error(result.error.message);
}

export async function deleteAdminLessonExercise(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('lesson_exercises').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminLessonVocabulary(): Promise<LessonVocabulary[]> {
  const { data, error } = await (await requireAdmin()).from('lesson_vocabulary').select('*').order('lesson_id').order('position');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceAdminLessonVocabulary(lessonId: string, vocabularyIds: string[]): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_replace_lesson_vocabulary', {
    target_lesson_id: lessonId,
    target_vocabulary_ids: [...new Set(vocabularyIds.filter(Boolean))],
  });
  if (error) throw new Error(error.message);
}

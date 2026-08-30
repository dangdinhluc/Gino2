import type { Tables, TablesInsert, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, sanitizeAdminSearch, type AdminDraft, type AdminLessonExercise } from './adminRepositoryCore';

type Course = Tables<'courses'>;
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

export async function listAdminVocabularyPicker(search = '', selectedIds: readonly string[] = []): Promise<VocabularyItem[]> {
  const client = await requireAdmin();
  const selected = [...new Set(selectedIds.filter(Boolean))];
  const needle = sanitizeAdminSearch(search);
  let query = client.from('vocabulary_items').select('*').order('term').limit(50);
  if (needle) query = query.or(`term.ilike.*${needle}*,reading.ilike.*${needle}*,translation.ilike.*${needle}*`);
  const [searchResult, selectedResult] = await Promise.all([
    query,
    selected.length ? client.from('vocabulary_items').select('*').in('id', selected) : Promise.resolve({ data: [], error: null }),
  ]);
  if (searchResult.error) throw new Error(searchResult.error.message);
  if (selectedResult.error) throw new Error(selectedResult.error.message);
  const byId = new Map<string, VocabularyItem>();
  for (const item of [...(selectedResult.data ?? []), ...(searchResult.data ?? [])]) byId.set(item.id, item);
  return [...byId.values()];
}

export async function listAdminVocabularyFilterOptions(): Promise<{ levels: string[]; tags: string[] }> {
  const { data, error } = await (await requireAdmin()).from('vocabulary_items').select('level, tags');
  if (error) throw new Error(error.message);
  const levels = new Set<string>();
  const tags = new Set<string>();
  for (const item of data ?? []) {
    if (item.level?.trim()) levels.add(item.level.trim());
    for (const tag of item.tags ?? []) if (tag.trim()) tags.add(tag.trim());
  }
  return { levels: [...levels].sort(), tags: [...tags].sort((left, right) => left.localeCompare(right, 'vi')) };
}

export async function listAdminVocabularyPage({ page, pageSize, search = '', level = '', tag = '', courseId = '' }: AdminVocabularyPageOptions): Promise<AdminVocabularyPage> {
  const client = await requireAdmin();
  let vocabularyIds: string[] | null = null;
  if (courseId) {
    const { data: lessons, error: lessonError } = await client.from('lessons').select('id').eq('course_id', courseId);
    if (lessonError) throw new Error(lessonError.message);
    const lessonIds = (lessons ?? []).map((lesson) => lesson.id);
    if (!lessonIds.length) return { rows: [], total: 0 };
    const { data: links, error: linkError } = await client.from('lesson_vocabulary').select('vocabulary_item_id').in('lesson_id', lessonIds);
    if (linkError) throw new Error(linkError.message);
    vocabularyIds = [...new Set((links ?? []).map((link) => link.vocabulary_item_id))];
    if (!vocabularyIds.length) return { rows: [], total: 0 };
  }

  const size = Math.max(1, Math.min(Math.round(pageSize), 100));
  const currentPage = Math.max(0, Math.round(page));
  const needle = sanitizeAdminSearch(search);
  let query = client.from('vocabulary_items').select('*', { count: 'exact' }).order('term');
  if (vocabularyIds) query = query.in('id', vocabularyIds);
  if (level) query = query.eq('level', level);
  if (tag) query = query.contains('tags', [tag]);
  if (needle) query = query.or(`term.ilike.*${needle}*,reading.ilike.*${needle}*,translation.ilike.*${needle}*`);
  const { data, error, count } = await query.range(currentPage * size, (currentPage + 1) * size - 1);
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
  let query = (await requireAdmin()).from('documents').select('*').order('created_at', { ascending: false }).limit(200);
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
  let query = (await requireAdmin()).from('podcast_episodes').select('*').order('created_at', { ascending: false }).limit(200);
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

export async function listAdminLessonAssets(lessonId?: string): Promise<LessonAsset[]> {
  let query = (await requireAdmin()).from('lesson_assets').select('*').order('created_at', { ascending: false });
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

export async function listAdminLessonExercises(lessonId?: string): Promise<AdminLessonExercise[]> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_lesson_exercises');
  if (error) throw new Error(error.message);
  return lessonId ? (data ?? []).filter((item) => item.lesson_id === lessonId) : (data ?? []);
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

export async function listAdminLessonVocabulary(lessonId?: string): Promise<LessonVocabulary[]> {
  let query = (await requireAdmin()).from('lesson_vocabulary').select('*').order('lesson_id').order('position');
  if (lessonId) query = query.eq('lesson_id', lessonId);
  const { data, error } = await query;
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

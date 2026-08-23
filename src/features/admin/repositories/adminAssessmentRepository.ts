import type { Tables, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, type AdminDraft, type AdminReviewOption } from './adminRepositoryCore';

type Assessment = Tables<'assessments'>;
type ReviewQuestion = Tables<'review_questions'>;

export async function listAdminAssessments(courseId?: string): Promise<Assessment[]> {
  let query = (await requireAdmin()).from('assessments').select('*').order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAssessment(input: AdminDraft<'assessments'>): Promise<Assessment> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('assessments').update(payload as TablesUpdate<'assessments'>).eq('id', id).select('*').single()
    : await client.from('assessments').insert(insertDraft<'assessments'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function listAdminAssessmentQuestions() {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_assessment_questions');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminAssessmentQuestion(input: AdminDraft<'assessment_questions'>) {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('assessment_questions').update(payload as TablesUpdate<'assessment_questions'>).eq('id', id).select('id, assessment_id, prompt, options, correct_answer, explanation, order_index, created_at, updated_at').single()
    : await client.from('assessment_questions').insert(insertDraft<'assessment_questions'>(id, payload)).select('id, assessment_id, prompt, options, correct_answer, explanation, order_index, created_at, updated_at').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminAssessment(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('assessments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAdminAssessmentQuestion(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('assessment_questions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminReviewQuestions(): Promise<ReviewQuestion[]> {
  const { data, error } = await (await requireAdmin()).from('review_questions').select('*').order('lesson_id').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAdminReviewOptions(): Promise<AdminReviewOption[]> {
  const { data, error } = await (await requireAdmin()).rpc('get_admin_review_options');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminReviewQuestion(input: {
  id?: string;
  lessonId: string;
  prompt: string;
  explanation?: string | null;
  orderIndex?: number;
  options: string[];
  correctIndex: number;
}): Promise<string> {
  const { data, error } = await (await requireAdmin()).rpc('admin_save_review_question', {
    target_question_id: input.id ?? '',
    target_lesson_id: input.lessonId,
    target_prompt: input.prompt,
    target_explanation: input.explanation ?? '',
    target_order_index: input.orderIndex ?? 0,
    target_options: input.options,
    target_correct_index: input.correctIndex,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAdminReviewQuestion(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_delete_review_question', { target_question_id: id });
  if (error) throw new Error(error.message);
}

export async function publishAdminContent(entityType: string, entityId: string, status: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('publish_content_revision', {
    target_entity_type: entityType,
    target_entity_id: entityId,
    target_status: status,
  });
  if (error) throw new Error(error.message);
}

export async function rollbackAdminContentRevision(revisionId: string): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('rollback_content_revision', { target_revision_id: revisionId });
  if (error) throw new Error(error.message);
}

export async function listAdminContentRevisions(limit = 100): Promise<Tables<'content_revisions'>[]> {
  const { data, error } = await (await requireAdmin())
    .from('content_revisions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 250)));
  if (error) throw new Error(error.message);
  return data ?? [];
}

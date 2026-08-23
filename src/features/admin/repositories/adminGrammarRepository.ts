import type { Tables, TablesUpdate } from '@/src/features/supabase/lib/database.types';
import { insertDraft, requireAdmin, type AdminDraft } from './adminRepositoryCore';

type GrammarTopic = Tables<'grammar_topics'>;
type GrammarRule = Tables<'grammar_rules'>;
type GrammarExample = Tables<'grammar_examples'>;
type SpeakingPrompt = Tables<'speaking_prompts'>;

export async function listAdminGrammarTopics(): Promise<GrammarTopic[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_topics').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminGrammarTopic(input: AdminDraft<'grammar_topics'>): Promise<GrammarTopic> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('grammar_topics').update(payload as TablesUpdate<'grammar_topics'>).eq('id', id).select('*').single()
    : await client.from('grammar_topics').insert(insertDraft<'grammar_topics'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminGrammarTopic(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('grammar_topics').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarRules(): Promise<GrammarRule[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_rules').select('*').order('topic_id').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminGrammarRule(input: AdminDraft<'grammar_rules'>): Promise<GrammarRule> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('grammar_rules').update(payload as TablesUpdate<'grammar_rules'>).eq('id', id).select('*').single()
    : await client.from('grammar_rules').insert(insertDraft<'grammar_rules'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminGrammarRule(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('grammar_rules').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarExamples(): Promise<GrammarExample[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_examples').select('*').order('topic_id').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminGrammarExample(input: AdminDraft<'grammar_examples'>): Promise<GrammarExample> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('grammar_examples').update(payload as TablesUpdate<'grammar_examples'>).eq('id', id).select('*').single()
    : await client.from('grammar_examples').insert(insertDraft<'grammar_examples'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminGrammarExample(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('grammar_examples').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listAdminGrammarTopicCourses(): Promise<Tables<'grammar_topic_courses'>[]> {
  const { data, error } = await (await requireAdmin()).from('grammar_topic_courses').select('*').order('topic_id');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function replaceAdminGrammarTopicCourses(topicId: string, courseIds: string[]): Promise<void> {
  const { error } = await (await requireAdmin()).rpc('admin_replace_grammar_topic_courses', {
    target_topic_id: topicId,
    target_course_ids: [...new Set(courseIds.filter(Boolean))],
  });
  if (error) throw new Error(error.message);
}

export async function listAdminSpeakingPrompts(): Promise<SpeakingPrompt[]> {
  const { data, error } = await (await requireAdmin()).from('speaking_prompts').select('*').order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveAdminSpeakingPrompt(input: AdminDraft<'speaking_prompts'>): Promise<SpeakingPrompt> {
  const client = await requireAdmin();
  const { id, isNew, ...payload } = input;
  const result = id && !isNew
    ? await client.from('speaking_prompts').update(payload as TablesUpdate<'speaking_prompts'>).eq('id', id).select('*').single()
    : await client.from('speaking_prompts').insert(insertDraft<'speaking_prompts'>(id, payload)).select('*').single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function deleteAdminSpeakingPrompt(id: string): Promise<void> {
  const { error } = await (await requireAdmin()).from('speaking_prompts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

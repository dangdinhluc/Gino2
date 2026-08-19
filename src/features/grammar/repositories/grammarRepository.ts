import { supabase } from '@/src/features/supabase/lib/supabaseClient';

export interface GrammarTopic {
  id: string;
  title: string;
  summary: string;
  category: string;
  level: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  bodyMarkdown: string;
}

export interface GrammarExample {
  id: string;
  japaneseText: string;
  vietnameseText: string;
  explanation: string | null;
}

export interface GrammarTopicDetail extends GrammarTopic {
  rules: GrammarRule[];
  examples: GrammarExample[];
}

export interface VocabularyDetailRecord {
  id: string;
  term: string;
  translation: string;
  reading: string;
  pronunciation: string;
  exampleSentence: string;
  tags: string[];
  status: string;
  dueAt: string | null;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  grammarTopics: GrammarTopic[];
}

function requireClient() {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  return supabase;
}

export async function getGrammarTopics(): Promise<GrammarTopic[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('grammar_topics')
    .select('id, title, summary, category, level')
    .eq('status', 'published')
    .order('order_index');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getGrammarTopic(id: string): Promise<GrammarTopicDetail | null> {
  const client = requireClient();
  const [topicResult, ruleResult, exampleResult] = await Promise.all([
    client.from('grammar_topics').select('id, title, summary, category, level').eq('id', id).eq('status', 'published').maybeSingle(),
    client.from('grammar_rules').select('id, title, body_markdown').eq('topic_id', id).order('order_index'),
    client.from('grammar_examples').select('id, japanese_text, vietnamese_text, explanation').eq('topic_id', id).order('order_index'),
  ]);
  const failure = [topicResult.error, ruleResult.error, exampleResult.error].find(Boolean);
  if (failure) throw new Error(failure.message);
  if (!topicResult.data) return null;
  return {
    ...topicResult.data,
    rules: (ruleResult.data ?? []).map((rule) => ({ id: rule.id, title: rule.title, bodyMarkdown: rule.body_markdown })),
    examples: (exampleResult.data ?? []).map((example) => ({
      id: example.id,
      japaneseText: example.japanese_text,
      vietnameseText: example.vietnamese_text,
      explanation: example.explanation,
    })),
  };
}

export async function getVocabularyDetail(id: string): Promise<VocabularyDetailRecord | null> {
  const client = requireClient();
  const { data: item, error: itemError } = await client
    .from('vocabulary_items')
    .select('id, term, translation, reading, pronunciation, example_sentence, tags')
    .eq('id', id)
    .maybeSingle();
  if (itemError) throw new Error(itemError.message);
  if (!item) return null;

  const [progressResult, topicsResult] = await Promise.all([
    client.from('vocabulary_progress').select('status, due_at, interval_days, repetitions, lapses').eq('vocabulary_item_id', id).maybeSingle(),
    client.from('grammar_topic_vocabulary').select('grammar_topics(id, title, summary, category, level)').eq('vocabulary_item_id', id),
  ]);
  const failure = [progressResult.error, topicsResult.error].find(Boolean);
  if (failure) throw new Error(failure.message);
  const topics = (topicsResult.data ?? []).flatMap((row) => {
    const topic = row.grammar_topics as unknown as GrammarTopic | null;
    return topic ? [topic] : [];
  });
  return {
    id: item.id,
    term: item.term,
    translation: item.translation,
    reading: item.reading,
    pronunciation: item.pronunciation,
    exampleSentence: item.example_sentence,
    tags: item.tags ?? [],
    status: progressResult.data?.status ?? 'new',
    dueAt: progressResult.data?.due_at ?? null,
    intervalDays: progressResult.data?.interval_days ?? 0,
    repetitions: progressResult.data?.repetitions ?? 0,
    lapses: progressResult.data?.lapses ?? 0,
    grammarTopics: topics,
  };
}

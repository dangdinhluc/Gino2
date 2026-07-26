import { supabase } from '@/src/features/supabase/lib/supabaseClient';

async function getUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user?.id ?? null;
}

export async function saveVocabularyReview(vocabularyItemId: string, isCorrect: boolean): Promise<void> {
  if (!supabase) return;
  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase.from('vocabulary_progress').upsert({
    user_id: userId,
    vocabulary_item_id: vocabularyItemId,
    status: isCorrect ? 'mastered' : 'learning',
    last_reviewed_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function saveReviewAttempt(questionId: string, isCorrect: boolean): Promise<void> {
  if (!supabase) return;
  const userId = await getUserId();
  if (!userId) return;

  const { error } = await supabase.from('review_attempts').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    question_id: questionId,
    is_correct: isCorrect,
  });
  if (error) throw new Error(error.message);
}

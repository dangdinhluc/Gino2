import { supabase } from '@/src/features/supabase/lib/supabaseClient';

async function requireUserId(): Promise<string> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user?.id) throw new Error('Vui lòng đăng nhập để lưu tiến độ.');
  return data.user.id;
}

export type VocabularyRating = 'again' | 'hard' | 'good' | 'easy';

export interface DueVocabularyCard {
  id: string;
  term: string;
  translation: string;
  reading: string;
  pronunciation: string;
  exampleSentence: string;
  tags: string[];
  status: string;
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export interface VocabularyRatingResult {
  status: string;
  dueAt: string;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

export interface ReviewAnswerResult {
  attemptId: string;
  isCorrect: boolean;
  explanation: string;
  answeredAt: string;
}

export interface ReviewSettings {
  newCardsPerDay: number;
}

export async function getReviewSettings(): Promise<ReviewSettings> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('learner_settings')
    .select('new_cards_per_day')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { newCardsPerDay: data?.new_cards_per_day ?? 10 };
}

export async function updateReviewSettings(newCardsPerDay: number): Promise<ReviewSettings> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const userId = await requireUserId();
  const value = Math.min(Math.max(Math.round(newCardsPerDay), 1), 50);
  const { data, error } = await supabase
    .from('learner_settings')
    .upsert({ user_id: userId, new_cards_per_day: value }, { onConflict: 'user_id' })
    .select('new_cards_per_day')
    .single();
  if (error) throw new Error(error.message);
  return { newCardsPerDay: data.new_cards_per_day };
}

export async function getDueVocabularyCards(limit = 50): Promise<DueVocabularyCard[]> {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  const { data, error } = await supabase.rpc('get_due_vocabulary_cards', { target_limit: Math.min(Math.max(limit, 1), 100) });
  if (error) throw new Error(error.message);
  return (data ?? []).map((card) => ({
    id: card.vocabulary_item_id,
    term: card.term,
    translation: card.translation,
    reading: card.reading,
    pronunciation: card.pronunciation,
    exampleSentence: card.example_sentence,
    tags: card.tags ?? [],
    status: card.status,
    dueAt: card.due_at,
    intervalDays: card.interval_days,
    repetitions: card.repetitions,
    lapses: card.lapses,
  }));
}

export async function submitVocabularyRating(vocabularyItemId: string, rating: VocabularyRating): Promise<VocabularyRatingResult> {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  const { data, error } = await supabase.rpc('submit_vocabulary_rating', {
    target_vocabulary_item_id: vocabularyItemId,
    target_rating: rating,
  });
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) throw new Error('Không nhận được kết quả cập nhật SRS.');
  return {
    status: result.status,
    dueAt: result.due_at,
    intervalDays: result.interval_days,
    repetitions: result.repetitions,
    lapses: result.lapses,
  };
}

export async function submitReviewAnswer(questionId: string, optionId: string): Promise<ReviewAnswerResult> {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  const { data, error } = await supabase.rpc('submit_review_answer', {
    target_question_id: questionId,
    target_option_id: optionId,
  });
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) throw new Error('Không nhận được kết quả chấm bài.');
  return {
    attemptId: result.attempt_id,
    isCorrect: result.is_correct,
    explanation: result.explanation,
    answeredAt: result.answered_at,
  };
}

export async function saveLessonProgress(
  lessonId: string,
  status: 'not-started' | 'in-progress' | 'completed',
  score?: number,
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase chưa được cấu hình.');
  }

  const { error } = await supabase.rpc('record_lesson_progress', {
    target_lesson_id: lessonId,
    target_status: status,
    target_score: score ?? null,
  });
  if (error) throw new Error(error.message);
}

import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';
import type { Json } from '@/src/features/supabase/lib/database.types';
import { readableFunctionError, configuredServiceError } from './aiFunctionError';

export interface SpeakingPrompt {
  id: string;
  courseId: string | null;
  title: string;
  instructions: string;
  rubric: Json;
  orderIndex: number;
}

export interface SpeakingFeedback {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  rewritten: string;
  transcriptConfidence: number | null;
}

export interface SpeakingSubmission {
  id: string;
  promptId: string | null;
  courseId: string | null;
  status: string;
  transcript: string | null;
  feedback: SpeakingFeedback | null;
  durationSeconds: number | null;
  createdAt: string;
}

function asFeedback(value: Json): SpeakingFeedback | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = value as Record<string, Json>;
  if (typeof result.summary !== 'string') return null;
  return {
    score: Math.max(0, Math.min(100, Number(result.score ?? 0))),
    summary: result.summary,
    strengths: Array.isArray(result.strengths) ? result.strengths.filter((item): item is string => typeof item === 'string') : [],
    improvements: Array.isArray(result.improvements) ? result.improvements.filter((item): item is string => typeof item === 'string') : [],
    rewritten: typeof result.rewritten === 'string' ? result.rewritten : '',
    transcriptConfidence: typeof result.transcriptConfidence === 'number' ? result.transcriptConfidence : null,
  };
}

function mapSubmission(row: {
  id: string;
  prompt_id: string | null;
  course_id: string | null;
  status: string;
  transcript: string | null;
  result: Json;
  duration_seconds: number | null;
  created_at: string;
}): SpeakingSubmission {
  return {
    id: row.id,
    promptId: row.prompt_id,
    courseId: row.course_id,
    status: row.status,
    transcript: row.transcript,
    feedback: asFeedback(row.result),
    durationSeconds: row.duration_seconds,
    createdAt: row.created_at,
  };
}

export async function fetchSpeakingPrompts(courseId?: string): Promise<SpeakingPrompt[]> {
  let query = requireSupabase()
    .from('speaking_prompts')
    .select('id, course_id, title, instructions, rubric, order_index')
    .eq('status', 'published')
    .order('order_index');
  if (courseId) query = query.eq('course_id', courseId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((prompt) => ({ id: prompt.id, courseId: prompt.course_id, title: prompt.title, instructions: prompt.instructions, rubric: prompt.rubric, orderIndex: prompt.order_index }));
}

export async function fetchSpeakingHistory(): Promise<SpeakingSubmission[]> {
  const { data, error } = await requireSupabase()
    .from('speaking_submissions')
    .select('id, prompt_id, course_id, status, transcript, result, duration_seconds, created_at')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSubmission);
}

export async function startSpeakingSubmission(promptId: string, mimeType: string, durationSeconds: number): Promise<{ submissionId: string; storagePath: string }> {
  const { data, error } = await requireSupabase().rpc('start_speaking_submission', {
    target_prompt_id: promptId,
    target_mime_type: mimeType,
    target_duration_seconds: durationSeconds,
  });
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) throw new Error('Không tạo được bài nộp Speaking.');
  return { submissionId: result.submission_id, storagePath: result.storage_path };
}

export async function uploadSpeakingAudio(storagePath: string, blob: Blob, mimeType: string): Promise<void> {
  if (blob.size <= 0 || blob.size > 10 * 1024 * 1024) throw new Error('Bản ghi phải có dung lượng từ 1 byte đến 10 MB.');
  const { error } = await requireSupabase().storage.from('learner-submissions').upload(storagePath, blob, { contentType: mimeType, upsert: false });
  if (error) throw new Error(error.message);
}

async function invokeSpeaking(action: 'process' | 'delete', submissionId: string): Promise<SpeakingSubmission> {
  const { data, error } = await requireSupabase().functions.invoke('ai-speaking', { body: { action, submissionId } });
  if (error) throw await readableFunctionError(error, configuredServiceError('Speech'));
  const payload = data as { submissionId?: string; status?: string; transcript?: string | null; result?: Json };
  if (!payload.submissionId || !payload.status) throw new Error('Không nhận được kết quả Speaking từ máy chủ.');
  return {
    id: payload.submissionId,
    promptId: null,
    courseId: null,
    status: payload.status,
    transcript: payload.transcript ?? null,
    feedback: asFeedback(payload.result ?? null),
    durationSeconds: null,
    createdAt: new Date().toISOString(),
  };
}

export async function processSpeakingSubmission(submissionId: string): Promise<SpeakingSubmission> {
  return invokeSpeaking('process', submissionId);
}

export async function deleteSpeakingSubmission(submissionId: string): Promise<void> {
  await invokeSpeaking('delete', submissionId);
}

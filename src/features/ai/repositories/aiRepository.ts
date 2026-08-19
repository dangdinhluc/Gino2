import { supabase, supabaseConfig } from '@/src/features/supabase/lib/supabaseClient';
import type { Json } from '@/src/features/supabase/lib/database.types';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface AiWritingResult {
  submissionId: string;
  score: number;
  summary: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
  strengths: string[];
  rewritten: string;
}

export interface AiWritingHistoryItem {
  id: string;
  inputText: string;
  score: number;
  status: string;
  summary: string;
  createdAt: string;
}

async function getAccessToken(): Promise<string> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Cần đăng nhập để dùng AI.');
  return data.session.access_token;
}

export async function streamAiChat(input: {
  message: string;
  courseId?: string;
  courseContext?: string;
  conversationId?: string;
  onToken: (token: string) => void;
}): Promise<{ conversationId: string }> {
  const trimmedMessage = input.message.trim();
  if (trimmedMessage.length < 1 || trimmedMessage.length > 4000) throw new Error('Tin nhắn phải dài từ 1 đến 4000 ký tự.');
  const token = await getAccessToken();
  const response = await fetch(`${supabaseConfig.url}/functions/v1/ai-chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseConfig.anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: trimmedMessage,
      courseId: input.courseId,
      courseContext: input.courseContext,
      conversationId: input.conversationId,
    }),
  });
  if (!response.ok || !response.body) throw new Error((await response.text()) || 'AI chat không khả dụng.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let conversationId = input.conversationId ?? '';

  const consume = (line: string) => {
    if (!line.startsWith('data:')) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') return;
    const event = JSON.parse(payload) as { delta?: string; conversationId?: string; error?: string };
    if (event.error) throw new Error(event.error);
    if (event.conversationId) conversationId = event.conversationId;
    if (event.delta) input.onToken(event.delta);
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    lines.forEach(consume);
    if (done) break;
  }
  if (buffer) consume(buffer);
  return { conversationId };
}

export async function fetchAiConversationHistory(conversationId?: string): Promise<AiChatMessage[]> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  let query = supabase.from('ai_messages').select('id, role, content, created_at').order('created_at', { ascending: true });
  if (conversationId) query = query.eq('conversation_id', conversationId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((message) => ({
    id: message.id,
    role: message.role === 'assistant' ? 'assistant' : 'user',
    text: message.content,
  }));
}

export async function submitAiWriting(input: {
  text: string;
  courseId?: string;
  promptId?: string;
}): Promise<AiWritingResult> {
  const text = input.text.trim();
  if (text.length < 1 || text.length > 10000) throw new Error('Bài viết phải dài từ 1 đến 10000 ký tự.');
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase.functions.invoke('ai-writing', {
    body: { text, courseId: input.courseId, promptId: input.promptId },
  });
  if (error) throw new Error(error.message);
  return data as AiWritingResult;
}

export async function fetchAiWritingHistory(): Promise<AiWritingHistoryItem[]> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase
    .from('ai_writing_submissions')
    .select('id, input_text, result, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((submission) => {
    const result = submission.result && typeof submission.result === 'object' && !Array.isArray(submission.result)
      ? submission.result as Record<string, Json>
      : {};
    return {
      id: submission.id,
      inputText: submission.input_text,
      score: Number(result.score ?? 0),
      status: submission.status,
      summary: String(result.summary ?? 'Chưa có nhận xét.'),
      createdAt: submission.created_at,
    };
  });
}

export function asAiJson(value: unknown): Json {
  return value as Json;
}

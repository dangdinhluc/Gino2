import { supabase } from '@/src/features/supabase/lib/supabaseClient';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  prompt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

async function requireUserId(): Promise<string> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Vui lòng đăng nhập để dùng nhật ký.');
  return data.user.id;
}

function mapEntry(row: {
  id: string; title: string; content: string; prompt: string | null; tags: string[]; created_at: string; updated_at: string;
}): JournalEntry {
  return { id: row.id, title: row.title, content: row.content, prompt: row.prompt, tags: row.tags ?? [], createdAt: row.created_at, updatedAt: row.updated_at };
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  await requireUserId();
  const { data, error } = await supabase.from('journal_entries').select('id, title, content, prompt, tags, created_at, updated_at').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEntry);
}

export async function createJournalEntry(input: Pick<JournalEntry, 'title' | 'content' | 'prompt' | 'tags'>): Promise<JournalEntry> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  const userId = await requireUserId();
  const { data, error } = await supabase.from('journal_entries').insert({ user_id: userId, ...input }).select('id, title, content, prompt, tags, created_at, updated_at').single();
  if (error) throw new Error(error.message);
  return mapEntry(data);
}

export async function updateJournalEntry(id: string, input: Pick<JournalEntry, 'title' | 'content' | 'prompt' | 'tags'>): Promise<JournalEntry> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  await requireUserId();
  const { data, error } = await supabase.from('journal_entries').update(input).eq('id', id).select('id, title, content, prompt, tags, created_at, updated_at').single();
  if (error) throw new Error(error.message);
  return mapEntry(data);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  await requireUserId();
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

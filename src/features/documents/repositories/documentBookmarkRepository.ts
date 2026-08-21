import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';

export async function fetchDocumentBookmarkIds(): Promise<Set<string>> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client.from('document_bookmarks').select('document_id').eq('user_id', userId);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.document_id));
}

export async function setDocumentBookmark(documentId: string, bookmarked: boolean): Promise<void> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  if (bookmarked) {
    const { error } = await client.from('document_bookmarks').insert({ user_id: userId, document_id: documentId });
    if (error && error.code !== '23505') throw new Error(error.message);
    return;
  }
  const { error } = await client.from('document_bookmarks').delete().eq('user_id', userId).eq('document_id', documentId);
  if (error) throw new Error(error.message);
}

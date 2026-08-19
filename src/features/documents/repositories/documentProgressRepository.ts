import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';

/**
 * Tiến độ đọc tài liệu được ghi vào bảng `learning_activity_events` sẵn có,
 * dùng event_type `document_opened` (text tự do, không check constraint).
 * Cách này tránh migration mới và tái dùng RLS insert/select own đã có sẵn.
 */
const DOCUMENT_OPENED_EVENT = 'document_opened';

export async function recordDocumentOpened(input: {
  courseId: string;
  documentId: string;
  documentTitle: string;
}): Promise<void> {
  const client = requireSupabase();
  const userId = await requireUserId(client);

  const { error } = await client.from('learning_activity_events').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    course_id: input.courseId,
    event_type: DOCUMENT_OPENED_EVENT,
    event_label: `Opened ${input.documentTitle}`,
    metadata: { documentId: input.documentId },
  });
  if (error) throw new Error(error.message);
}

export async function fetchReadDocumentIds(courseId: string): Promise<Set<string>> {
  const client = requireSupabase();
  const userId = await requireUserId(client);

  const { data, error } = await client
    .from('learning_activity_events')
    .select('metadata')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('event_type', DOCUMENT_OPENED_EVENT);
  if (error) throw new Error(error.message);

  const ids = new Set<string>();
  for (const row of data ?? []) {
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    if (typeof meta.documentId === 'string') ids.add(meta.documentId);
  }
  return ids;
}

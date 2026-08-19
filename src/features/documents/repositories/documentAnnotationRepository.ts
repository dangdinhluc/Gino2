import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import { createSignedCourseAssetUrl } from '@/src/features/courses/repositories/courseLearningRepository';
import type { Json } from '@/src/features/supabase/lib/database.types';

export interface DocumentAnnotation {
  id: string;
  userId: string;
  documentId: string;
  selectedText: string;
  note: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  anchor: Json;
  createdAt: string;
  updatedAt: string;
}

type AnnotationRow = {
  id: string;
  user_id: string;
  document_id: string;
  selected_text: string;
  note: string;
  color: DocumentAnnotation['color'];
  anchor: Json;
  created_at: string;
  updated_at: string;
};

function mapAnnotation(row: AnnotationRow): DocumentAnnotation {
  return {
    id: row.id,
    userId: row.user_id,
    documentId: row.document_id,
    selectedText: row.selected_text,
    note: row.note,
    color: row.color,
    anchor: row.anchor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listDocumentAnnotations(documentId: string): Promise<DocumentAnnotation[]> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client
    .from('document_annotations')
    .select('id, user_id, document_id, selected_text, note, color, anchor, created_at, updated_at')
    .eq('document_id', documentId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapAnnotation(row as AnnotationRow));
}

export async function createDocumentAnnotation(input: {
  documentId: string;
  selectedText: string;
  note: string;
  color: DocumentAnnotation['color'];
  anchor?: Json;
}): Promise<DocumentAnnotation> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client
    .from('document_annotations')
    .insert({
      user_id: userId,
      document_id: input.documentId,
      selected_text: input.selectedText,
      note: input.note,
      color: input.color,
      anchor: input.anchor ?? {},
    })
    .select('id, user_id, document_id, selected_text, note, color, anchor, created_at, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return mapAnnotation(data as AnnotationRow);
}

export async function updateDocumentAnnotation(
  annotationId: string,
  input: Partial<Pick<DocumentAnnotation, 'selectedText' | 'note' | 'color' | 'anchor'>>,
): Promise<DocumentAnnotation> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { data, error } = await client
    .from('document_annotations')
    .update({
      ...(input.selectedText === undefined ? {} : { selected_text: input.selectedText }),
      ...(input.note === undefined ? {} : { note: input.note }),
      ...(input.color === undefined ? {} : { color: input.color }),
      ...(input.anchor === undefined ? {} : { anchor: input.anchor }),
    })
    .eq('id', annotationId)
    .eq('user_id', userId)
    .select('id, user_id, document_id, selected_text, note, color, anchor, created_at, updated_at')
    .single();
  if (error) throw new Error(error.message);
  return mapAnnotation(data as AnnotationRow);
}

export async function deleteDocumentAnnotation(annotationId: string): Promise<void> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const { error } = await client.from('document_annotations').delete().eq('id', annotationId).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function createSignedDocumentUrl(storagePath: string, expiresInSeconds = 300): Promise<string> {
  return createSignedCourseAssetUrl(storagePath, expiresInSeconds);
}

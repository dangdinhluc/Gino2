import type { Database } from '@/src/features/supabase/lib/database.types';
import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';

export type GlobalSearchResult = Database['public']['Functions']['get_global_search_results']['Returns'][number];

export async function searchLearningContent(query: string): Promise<GlobalSearchResult[]> {
  const term = query.trim();
  if (!term) return [];

  const client = requireSupabase();
  await requireUserId(client);
  const { data, error } = await client.rpc('get_global_search_results', { target_query: term.slice(0, 120), target_limit: 30 });
  if (error) throw new Error(error.message);
  return data ?? [];
}

import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

export interface PublishedSitePage {
  slug: string;
  title: string;
  bodyMarkdown: string;
  updatedAt: string;
}

export async function getPublishedSitePage(slug: string): Promise<PublishedSitePage | null> {
  const { data, error } = await requireSupabase()
    .from('site_pages')
    .select('slug, title, body_markdown, updated_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { slug: data.slug, title: data.title, bodyMarkdown: data.body_markdown, updatedAt: data.updated_at };
}

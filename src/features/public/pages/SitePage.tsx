import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { getPublishedSitePage, type PublishedSitePage } from '@/src/features/public/repositories/sitePageRepository';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';

interface SitePageProps {
  slug: string;
  fallbackTitle: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value));
}

export default function SitePage({ slug, fallbackTitle }: SitePageProps) {
  const [page, setPage] = useState<PublishedSitePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void getPublishedSitePage(slug)
      .then((value) => { if (!cancelled) setPage(value); })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'Không tải được nội dung.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl space-y-5 bg-[#F7F1E8] px-4 py-8 text-[#172033] md:px-8 md:py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#315C73] hover:text-[#C96A1B]"><ArrowLeft size={16} /> Trang chủ</Link>
      <section className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#C96A1B]"><FileText size={21} /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#C96A1B]">TOKUTEI GINO</p><h1 className="mt-1 text-3xl font-black tracking-tight">{page?.title ?? fallbackTitle}</h1>{page && <p className="mt-2 text-sm text-[#5F6B7C]">Cập nhật: {formatDate(page.updatedAt)}</p>}</div></div>
        {loading && <PageLoading />}
        {!loading && error && <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        {!loading && !error && !page && <p className="mt-8 rounded-2xl border border-[#E4D8C9] bg-[#F8F2EA] p-4 text-sm leading-6 text-[#5F6B7C]">Nội dung này chưa được công bố.</p>}
        {!loading && page && <article className="mt-8 whitespace-pre-wrap text-sm leading-7 text-[#465466]">{page.bodyMarkdown}</article>}
      </section>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Package, Sparkles } from 'lucide-react';
import { enrollInFreePackage, fetchPackageCatalog, type PackageCatalogItem } from '@/src/features/enrollments/repositories/enrollmentRepository';
import { formatMinorUnitAmount, isPaidCheckoutEnabled } from '@/src/shared/lib/money';

export default function PackageCatalogPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackageCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPackageCatalog()
      .then((items) => { if (!cancelled) setPackages(items); })
      .catch((nextError: unknown) => { if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Không tải được danh sách gói học.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleEnroll(item: PackageCatalogItem): Promise<void> {
    if (item.priceCents !== 0) return;
    setBusyId(item.id);
    setError(null);
    try {
      const enrollments = await enrollInFreePackage(item.id);
      const firstCourseId = enrollments[0]?.courseId ?? item.courses[0]?.id;
      if (firstCourseId) navigate(`/app/courses/${firstCourseId}/learn`);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không thể đăng ký gói học.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 pb-24 md:px-8">
      <Link to="/app/courses" className="inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2 text-sm font-bold text-[#5f6b7c]"><ArrowLeft size={16} /> Quay lại khóa học</Link>
      <section className="rounded-3xl border border-orange-200 bg-gradient-to-r from-[#fff9f3] to-[#ffeedd] p-6 md:p-8">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-orange-700"><Sparkles size={14} /> Enrollment</p>
        <h1 className="mt-2 text-3xl font-black text-[#172033]">Chọn gói học</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f6b7c]">Gói miễn phí đăng ký ngay. Thanh toán trả phí chưa mở cho đến khi currency và webhook được xác minh.</p>
      </section>
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <div className="flex items-center justify-center rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-10 text-sm font-bold text-[#5f6b7c]"><Loader2 className="mr-2 animate-spin" size={18} /> Đang tải gói học…</div> : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((item) => {
            const paidLocked = item.priceCents !== 0 && !isPaidCheckoutEnabled();
            return (
              <article key={item.id} className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><Package size={22} /></span><span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-700">{formatMinorUnitAmount(item.priceCents, item.currency)}</span></div>
                <h2 className="mt-5 text-xl font-black text-[#172033]">{item.name}</h2>
                <p className="mt-2 text-sm leading-6 text-[#5f6b7c]">{item.description}</p>
                <div className="mt-4 space-y-2 text-sm text-[#5f6b7c]">{item.courses.map((course) => <div key={course.id} className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600" /> {course.title} · {course.level}</div>)}</div>
                <button type="button" onClick={() => void handleEnroll(item)} disabled={paidLocked || busyId === item.id} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-700 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">{busyId === item.id && <Loader2 size={16} className="animate-spin" />}{item.priceCents === 0 ? 'Đăng ký miễn phí' : 'Thanh toán sẽ mở sau'}</button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { CheckCircle2, CircleAlert, Clock3, PauseCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/shared/lib/utils';

interface StatusStyle {
  label: string;
  icon: LucideIcon;
  className: string;
}

const styles: Record<string, StatusStyle> = {
  draft: { label: 'Nháp', icon: Clock3, className: 'border-[#D9CBB9] bg-[#F8F2EA] text-[#765B42]' },
  in_review: { label: 'Chờ duyệt', icon: Clock3, className: 'border-[#E9C98C] bg-[#FFF7E5] text-[#8A5C13]' },
  published: { label: 'Đã xuất bản', icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  active: { label: 'Đang hoạt động', icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  archived: { label: 'Đã lưu trữ', icon: PauseCircle, className: 'border-slate-200 bg-slate-50 text-slate-700' },
  resolved: { label: 'Đã xử lý', icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  open: { label: 'Đang mở', icon: CircleAlert, className: 'border-amber-200 bg-amber-50 text-amber-900' },
  paused: { label: 'Tạm dừng', icon: PauseCircle, className: 'border-slate-200 bg-slate-50 text-slate-700' },
  error: { label: 'Lỗi', icon: CircleAlert, className: 'border-red-200 bg-red-50 text-red-800' },
  content_editor: { label: 'Content editor', icon: CheckCircle2, className: 'border-[#D9CBB9] bg-[#F8F2EA] text-[#765B42]' },
  instructor_support: { label: 'Instructor support', icon: CheckCircle2, className: 'border-[#D9CBB9] bg-[#F8F2EA] text-[#765B42]' },
  analyst: { label: 'Analyst', icon: CheckCircle2, className: 'border-[#D9CBB9] bg-[#F8F2EA] text-[#765B42]' },
};

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const style = styles[status ?? ''] ?? { label: status || 'Chưa rõ', icon: CircleAlert, className: 'border-[#E4D8C9] bg-white text-[#5F6B7C]' };
  const Icon = style.icon;
  return <span className={cn('inline-flex min-h-6 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold', style.className, className)}><Icon aria-hidden="true" size={12} />{style.label}</span>;
}

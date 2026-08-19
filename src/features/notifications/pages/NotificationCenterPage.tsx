import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { listLearnerNotifications, markLearnerNotificationRead, type LearnerNotification } from '@/src/features/notifications/repositories/notificationRepository';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export default function NotificationCenterPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<LearnerNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => { setIsLoading(true); setError(null); try { setNotifications(await listLearnerNotifications()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được thông báo.'); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  const openNotification = async (notification: LearnerNotification) => {
    if (!notification.readAt) {
      try { await markLearnerNotificationRead(notification.id); setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật được thông báo.'); }
    }
    if (notification.actionUrl?.startsWith('/')) navigate(notification.actionUrl);
  };

  return <div className="mx-auto max-w-3xl space-y-5 pb-16"><header className="rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><Bell size={21} /></span><div><h1 className="font-[var(--font-heading)] text-2xl font-black text-[#172033]">Trung tâm thông báo</h1><p className="mt-1 text-sm text-[#5f6b7c]">Thông báo học tập và vận hành gửi riêng tới tài khoản của anh.</p></div></div></header>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}{isLoading ? <div className="h-48 animate-pulse rounded-3xl border border-[#e8dccb] bg-[#fffaf3]" /> : notifications.length === 0 ? <section className="rounded-3xl border border-dashed border-[#d8ccbb] bg-[#fffdf8] p-12 text-center"><CheckCheck className="mx-auto text-[#c9bca8]" size={30} /><h2 className="mt-3 font-black text-[#172033]">Chưa có thông báo</h2><p className="mt-1 text-sm text-[#5f6b7c]">Khi có cập nhật khóa học hoặc nhắc học, hệ thống sẽ hiện ở đây.</p><Link to="/app/dashboard" className="mt-5 inline-flex rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white">Về trang chủ</Link></section> : <div className="space-y-3">{notifications.map((notification) => <button type="button" key={notification.id} onClick={() => void openNotification(notification)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${notification.readAt ? 'border-[#e8dccb] bg-white' : 'border-orange-200 bg-orange-50/60'}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.readAt ? 'bg-slate-200' : 'bg-orange-500'}`} /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-[#172033]">{notification.title}</strong><small className="text-[10px] font-bold uppercase tracking-wide text-[#95a0af]">{notification.type}</small></span><span className="mt-1 block text-sm leading-6 text-[#5f6b7c]">{notification.body}</span><span className="mt-2 block text-xs font-semibold text-[#95a0af]">{formatDate(notification.createdAt)}</span></span>{notification.actionUrl && <ChevronRight className="mt-1 shrink-0 text-[#95a0af]" size={18} />}</button>)}</div>}</div>;
}

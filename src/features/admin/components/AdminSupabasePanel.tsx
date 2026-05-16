import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Database, Layers3, ShieldAlert, Users } from 'lucide-react';
import {
  fetchAdminOverview,
  isAdminOverviewSupabaseEnabled,
  type AdminOverviewAlert,
  type AdminOverviewSnapshot,
} from '@/src/features/admin/repositories/adminOverviewRepository';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

type PanelStatus = 'disabled' | 'unauthenticated' | 'loading' | 'ready' | 'error';

interface PanelState {
  status: PanelStatus;
  snapshot: AdminOverviewSnapshot | null;
  error: string | null;
}

const SEVERITY_TONE: Record<AdminOverviewAlert['severity'], string> = {
  critical: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

function formatAlertDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('vi-VN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(parsed);
}

export function AdminSupabasePanel() {
  const auth = useAuth();
  const supabaseEnabled = isAdminOverviewSupabaseEnabled();
  const [state, setState] = useState<PanelState>(() => {
    if (!supabaseEnabled) {
      return { status: 'disabled', snapshot: null, error: null };
    }
    return { status: 'loading', snapshot: null, error: null };
  });

  useEffect(() => {
    if (!supabaseEnabled) {
      setState({ status: 'disabled', snapshot: null, error: null });
      return;
    }

    if (!auth.isAuthenticated) {
      setState({ status: 'unauthenticated', snapshot: null, error: null });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading', snapshot: null, error: null });

    fetchAdminOverview()
      .then((snapshot) => {
        if (cancelled) {
          return;
        }
        if (!snapshot) {
          setState({ status: 'disabled', snapshot: null, error: null });
          return;
        }
        setState({ status: 'ready', snapshot, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Không tải được dữ liệu Supabase.';
        setState({ status: 'error', snapshot: null, error: message });
      });

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, supabaseEnabled]);

  const totals = state.snapshot?.totals;
  const alerts = state.snapshot?.alerts ?? [];

  const headerSubtitle = useMemo(() => {
    if (state.status === 'disabled') {
      return 'Supabase chưa cấu hình. Mock cards bên dưới vẫn hoạt động.';
    }
    if (state.status === 'unauthenticated') {
      return 'Đăng nhập admin để mở dữ liệu thật theo RLS.';
    }
    if (state.status === 'loading') {
      return 'Đang đọc dữ liệu từ Supabase local…';
    }
    if (state.status === 'error') {
      return 'Không truy cập được Supabase. Kiểm tra `supabase start` và migration.';
    }
    return 'Số liệu lấy trực tiếp từ migrations + seed Supabase local.';
  }, [state.status]);

  return (
    <article className="rounded-3xl border border-[#E4D8C9] bg-gradient-to-br from-[#172033] via-[#1f2c44] to-[#243a5b] p-5 text-white shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">Supabase real data</p>
          <h2 className="mt-2 text-xl font-black">Trạng thái nền dữ liệu thật</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/70">{headerSubtitle}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
            state.status === 'ready'
              ? 'bg-emerald-400/20 text-emerald-200'
              : state.status === 'loading'
                ? 'bg-cyan-400/20 text-cyan-100'
                : state.status === 'error'
                  ? 'bg-red-500/30 text-red-100'
                  : 'bg-white/10 text-white/70'
          }`}
        >
          <Database size={12} />
          {state.status === 'ready'
            ? 'Đang đọc Supabase'
            : state.status === 'loading'
              ? 'Đang tải'
              : state.status === 'error'
                ? 'Lỗi kết nối'
                : state.status === 'unauthenticated'
                  ? 'Chưa đăng nhập'
                  : 'Chưa cấu hình'}
        </span>
      </header>

      {state.status === 'error' && state.error && (
        <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">
          {state.error}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SupabaseStat label="Khóa published" value={totals?.publishedCourses} icon={Layers3} loading={state.status === 'loading'} />
        <SupabaseStat label="Bài học published" value={totals?.publishedLessons} icon={Layers3} loading={state.status === 'loading'} />
        <SupabaseStat label="Enrollment active" value={totals?.activeEnrollments} icon={Users} loading={state.status === 'loading'} />
        <SupabaseStat label="Cảnh báo mở" value={totals?.openAlerts} icon={ShieldAlert} loading={state.status === 'loading'} />
      </div>

      <section className="mt-5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">Cảnh báo từ Supabase</h3>
        {state.status === 'loading' ? (
          <div className="mt-3 grid gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/80"
              >
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                  <span className={`rounded-full border px-2 py-0.5 ${SEVERITY_TONE[alert.severity]}`}>{alert.severity}</span>
                  <span>{formatAlertDate(alert.createdAt)}</span>
                </div>
                <p className="mt-2 font-bold text-white">{alert.title}</p>
                <p className="mt-1 text-sm text-white/70">{alert.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-sm text-white/60">
            <AlertTriangle size={14} />
            {state.status === 'ready'
              ? 'Không có cảnh báo mở trong Supabase.'
              : state.status === 'unauthenticated'
                ? 'Đăng nhập để đọc cảnh báo theo RLS.'
                : 'Cảnh báo chưa sẵn sàng — tạm dùng dữ liệu mock bên dưới.'}
          </p>
        )}
      </section>
    </article>
  );
}

interface SupabaseStatProps {
  label: string;
  value: number | undefined;
  icon: typeof Database;
  loading: boolean;
}

function SupabaseStat({ label, value, icon: Icon, loading }: SupabaseStatProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black">
        {loading ? <span className="inline-block h-6 w-12 animate-pulse rounded-md bg-white/15" /> : (value ?? '—')}
      </div>
    </div>
  );
}

import { supabase, supabaseConfig } from '@/src/features/supabase/lib/supabaseClient';

export type AdminOverviewSeverity = 'info' | 'warning' | 'critical';
export type AdminOverviewStatus = 'open' | 'resolved';

export interface SupabaseAdminAlertRow {
  id: string;
  severity: string;
  status: string;
  title: string;
  body: string;
  created_at: string;
}

export interface AdminOverviewAlert {
  id: string;
  severity: AdminOverviewSeverity;
  status: AdminOverviewStatus;
  title: string;
  body: string;
  createdAt: string;
}

export interface AdminOverviewSnapshot {
  totals: {
    publishedCourses: number;
    publishedLessons: number;
    activeEnrollments: number;
    openAlerts: number;
  };
  alerts: AdminOverviewAlert[];
}

const ALLOWED_SEVERITIES: ReadonlySet<AdminOverviewSeverity> = new Set(['info', 'warning', 'critical']);
const ALLOWED_STATUSES: ReadonlySet<AdminOverviewStatus> = new Set(['open', 'resolved']);

function normalizeSeverity(value: string): AdminOverviewSeverity {
  return ALLOWED_SEVERITIES.has(value as AdminOverviewSeverity) ? (value as AdminOverviewSeverity) : 'info';
}

function normalizeStatus(value: string): AdminOverviewStatus {
  return ALLOWED_STATUSES.has(value as AdminOverviewStatus) ? (value as AdminOverviewStatus) : 'open';
}

export function mapAdminAlertRow(row: SupabaseAdminAlertRow): AdminOverviewAlert {
  return {
    id: row.id,
    severity: normalizeSeverity(row.severity),
    status: normalizeStatus(row.status),
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function isAdminOverviewSupabaseEnabled(): boolean {
  return supabaseConfig.isConfigured;
}

/**
 * Fetch a small admin overview snapshot for the Supabase status panel.
 * Returns `null` when Supabase isn't configured so callers can keep the
 * existing mock-driven UI without flashing empty state.
 */
export async function fetchAdminOverview(): Promise<AdminOverviewSnapshot | null> {
  if (!supabase) {
    return null;
  }

  const [coursesResult, lessonsResult, enrollmentsResult, alertsCountResult, alertsResult] = await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('admin_alerts').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase
      .from('admin_alerts')
      .select('id, severity, status, title, body, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const firstError = [coursesResult.error, lessonsResult.error, enrollmentsResult.error, alertsCountResult.error, alertsResult.error].find(Boolean);

  if (firstError) {
    throw new Error(firstError.message);
  }

  const alerts = (alertsResult.data ?? []).map((row) => mapAdminAlertRow(row as unknown as SupabaseAdminAlertRow));

  return {
    totals: {
      publishedCourses: coursesResult.count ?? 0,
      publishedLessons: lessonsResult.count ?? 0,
      activeEnrollments: enrollmentsResult.count ?? 0,
      openAlerts: alertsCountResult.count ?? 0,
    },
    alerts,
  };
}

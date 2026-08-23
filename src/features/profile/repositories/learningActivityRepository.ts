import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

export interface StudyHeatmapDay {
  /** Ngày theo định dạng YYYY-MM-DD (múi giờ địa phương của học viên). */
  date: string;
  /** Số sự kiện học tập trong ngày. */
  count: number;
}

export function toLearnerDateKey(value: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
    const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  } catch {
    if (timeZone !== 'Asia/Tokyo') return toLearnerDateKey(value, 'Asia/Tokyo');
    return value.toISOString().slice(0, 10);
  }
}

function subtractLocalDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

/**
 * Đếm sự kiện học tập 30 ngày gần nhất để vẽ heatmap.
 * Chỉ đọc bảng `learning_activity_events` (RLS đã giới hạn theo học viên) — không ghi, an toàn.
 */
export async function fetchLearningActivityHeatmap(days = 30): Promise<StudyHeatmapDay[]> {
  const client = requireSupabase();
  const { data: timezoneData, error: timezoneError } = await client.rpc('learner_timezone');
  if (timezoneError) throw new Error(timezoneError.message);
  const timezone = typeof timezoneData === 'string' ? timezoneData : 'Asia/Tokyo';
  const today = toLearnerDateKey(new Date(), timezone);
  const start = new Date();
  start.setTime(start.getTime() - (days + 2) * 86_400_000);

  const { data, error } = await client
    .from('learning_activity_events')
    .select('occurred_at')
    .gte('occurred_at', start.toISOString());
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = toLearnerDateKey(new Date(row.occurred_at), timezone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: StudyHeatmapDay[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const key = subtractLocalDays(today, offset);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

export interface StudyHeatmapDay {
  /** Ngày theo định dạng YYYY-MM-DD (múi giờ địa phương của học viên). */
  date: string;
  /** Số sự kiện học tập trong ngày. */
  count: number;
}

function toLocalDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Đếm sự kiện học tập 30 ngày gần nhất để vẽ heatmap.
 * Chỉ đọc bảng `learning_activity_events` (RLS đã giới hạn theo học viên) — không ghi, an toàn.
 */
export async function fetchLearningActivityHeatmap(days = 30): Promise<StudyHeatmapDay[]> {
  const client = requireSupabase();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const { data, error } = await client
    .from('learning_activity_events')
    .select('occurred_at')
    .gte('occurred_at', start.toISOString());
  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = toLocalDateKey(new Date(row.occurred_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const result: StudyHeatmapDay[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + offset);
    const key = toLocalDateKey(day);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import type { StudyHeatmapDay } from '@/src/features/profile/repositories/learningActivityRepository';
import { cn } from '@/src/lib/utils';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function levelFor(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

interface StudyHeatmapProps {
  days: StudyHeatmapDay[];
}

/**
 * Heatmap 30 ngày (kiểu GitHub contribution graph).
 * Thuần hiển thị — dữ liệu do repository `fetchLearningActivityHeatmap` cung cấp.
 */
export function StudyHeatmap({ days }: StudyHeatmapProps) {
  const weeks = useMemo(() => {
    const result: StudyHeatmapDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const activeDays = days.filter((day) => day.count > 0).length;
  const totalEvents = days.reduce((sum, day) => sum + day.count, 0);
  const firstActiveDay = days.find((day) => day.count > 0);
  const weekdayOffset = firstActiveDay ? new Date(`${firstActiveDay.date}T00:00:00Z`).getUTCDay() : 0;

  return (
    <section className="rounded-[24px] border border-[#f5ece1] bg-white p-5 shadow-2xs" aria-label="Lịch học 30 ngày">
      <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#d83a00]"><CalendarDays size={18} /></span>
          <div>
            <h2 className="font-[var(--font-heading)] text-lg font-black tracking-[-0.02em] text-[#172033]">Nhịp học 30 ngày</h2>
            <p className="text-xs font-semibold text-[#7b8796]">{activeDays}/30 ngày có học · {totalEvents} hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#95a0af]">
          <span>Ít</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={cn('h-3 w-3 rounded-[4px]', level === 0 ? 'bg-[#efe5d7]' : level === 1 ? 'bg-[#fcd9b8]' : level === 2 ? 'bg-[#f7ab6f]' : level === 3 ? 'bg-[#ef7a34]' : 'bg-[#d83a00]')} />
          ))}
          <span>Nhiều</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex gap-1.5" role="img" aria-label="Heatmap 30 ngày học gần nhất">
          {/* Cột ngày trong tuần */}
          <div className="flex flex-col gap-1.5 pr-1">
            {WEEKDAYS.map((label, index) => (
              <span key={label} className={cn('flex h-4 items-center text-[9px] font-bold text-[#95a0af]', index % 2 === 1 && 'opacity-0')}>{label}</span>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1.5">
              {week.map((day, dayIndex) => {
                // Căn ô đầu tiên đúng thứ trong tuần (thứ Hai làm cột gốc).
                const isOffsetCell = weekIndex === 0 && dayIndex < weekdayOffset;
                const level = isOffsetCell ? 0 : levelFor(day.count);
                const hasActivity = day.count > 0;
                return (
                  <span
                    key={day.date}
                    title={hasActivity ? `${day.date} · ${day.count} hoạt động` : `${day.date} · chưa học`}
                    className={cn(
                      'h-4 w-4 rounded-[4px]',
                      level === 0 ? 'bg-[#efe5d7]' : level === 1 ? 'bg-[#fcd9b8]' : level === 2 ? 'bg-[#f7ab6f]' : level === 3 ? 'bg-[#ef7a34]' : 'bg-[#d83a00]',
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-[#95a0af]">Mỗi ô là một ngày — càng đậm là càng học nhiều. Giữ màu cam đều đặn nhé!</p>
    </section>
  );
}

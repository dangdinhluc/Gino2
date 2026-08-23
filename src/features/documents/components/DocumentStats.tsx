export interface DocumentStatsData {
  totalDocs: number;
  totalMinutes: number;
  readCount?: number;
}

interface DocumentStatsProps {
  stats: DocumentStatsData;
}

/**
 * Statistics remain available in profile/progress surfaces; the course
 * document view stays task-focused and mirrors the compact reference mock.
 */
export function DocumentStats({ stats }: DocumentStatsProps) {
  void stats;
  return null;
}

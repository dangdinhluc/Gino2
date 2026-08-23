export interface VocabularyOverviewStats {
  learnedCount: number;
  categoryCount: number;
  progressPercent: number;
}

interface VocabularyOverviewCardProps {
  stats?: VocabularyOverviewStats;
}

/** Course workspace header already names the section; keep list view compact. */
export function VocabularyOverviewCard({ stats }: VocabularyOverviewCardProps) {
  void stats;
  return null;
}

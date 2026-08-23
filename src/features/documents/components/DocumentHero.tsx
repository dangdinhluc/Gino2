interface DocumentHeroProps {
  totalCount: number;
}

/**
 * Course workspace already provides the page title in its sticky header.
 * Keep this component intentionally empty so the document screen matches
 * the compact mobile mock instead of rendering a second hero banner.
 */
export function DocumentHero({ totalCount }: DocumentHeroProps) {
  void totalCount;
  return null;
}

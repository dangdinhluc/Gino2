import { useEffect, useState } from 'react';
import { assets } from '@/src/shared/lib/assets';

export type PageLoadingVariant = 'default' | 'documents' | 'practice' | 'games' | 'exams';

export const PAGE_LOADING_DELAY_MS = 300;

const variantImages: Record<PageLoadingVariant, string> = {
  default: assets.shared.mascots.brand,
  documents: assets.loading.documents,
  practice: assets.loading.practice,
  games: assets.loading.games,
  exams: assets.loading.exams,
};

interface PageLoadingProps {
  variant?: PageLoadingVariant;
}

export function PageLoading({ variant = 'default' }: PageLoadingProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), PAGE_LOADING_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`page-loading page-loading--${variant}`}
      data-visible={visible}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Đang tải</span>
      <div className="page-loading__content" aria-hidden="true">
        <span className="page-loading__glow" />
        <img
          src={variantImages[variant]}
          alt=""
          aria-hidden="true"
          width={512}
          height={512}
          loading="eager"
          decoding="async"
          className="page-loading__image"
        />
        <span className="page-loading__dots">
          <span className="page-loading__dot" />
          <span className="page-loading__dot" />
          <span className="page-loading__dot" />
        </span>
      </div>
    </div>
  );
}

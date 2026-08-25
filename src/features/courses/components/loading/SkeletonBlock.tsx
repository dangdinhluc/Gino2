import type { CSSProperties, Key } from 'react';
import { cn } from '@/src/lib/utils';

export function SkeletonBlock({
  className,
  rounded = 'rounded-xl',
  style,
}: {
  key?: Key;
  className?: string;
  rounded?: string;
  style?: CSSProperties;
}) {
  return <span aria-hidden="true" className={cn('gino2-skeleton-shimmer block shrink-0', rounded, className)} style={style} />;
}

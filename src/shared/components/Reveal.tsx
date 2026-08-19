import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Hiện dần khi cuộn tới (scroll reveal) — phần micro-interaction hiện đại.
 * Dùng `motion.div` với `whileInView`, chỉ chạy một lần, tôn trọng
 * prefers-reduced-motion (motion tự xử lý qua `useReducedMotion` không bắt buộc;
 * animation nhẹ nên an toàn).
 */
interface RevealProps {
  children: ReactNode;
  /** Độ trễ (giây) để tạo hiệu ứng xếp tầng giữa các khối. */
  delay?: number;
  /** Hướng trượt vào. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

const offsets: Record<NonNullable<RevealProps['direction']>, { x: number; y: number }> = {
  up: { x: 0, y: 18 },
  down: { x: 0, y: -18 },
  left: { x: 18, y: 0 },
  right: { x: -18, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({ children, delay = 0, direction = 'up', className }: RevealProps) {
  const offset = offsets[direction];
  const motionProps: HTMLMotionProps<'div'> = {
    initial: { opacity: 0, ...offset },
    whileInView: { opacity: 1, x: 0, y: 0 },
    viewport: { once: true, margin: '-40px 0px -40px 0px' },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
    className,
  };

  return <motion.div {...motionProps}>{children}</motion.div>;
}

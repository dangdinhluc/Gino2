import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGE_LOADING_DELAY_MS, PageLoading } from '@/src/shared/components/loading/PageLoading';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PageLoading', () => {
  it('waits briefly before revealing the loader and renders exactly three dots', () => {
    const { container } = render(<PageLoading />);
    const loader = screen.getByRole('status');

    expect(loader).toHaveAttribute('data-visible', 'false');
    expect(container.querySelectorAll('.page-loading__dot')).toHaveLength(3);
    expect(screen.queryByText('Đang mở màn hình…')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(PAGE_LOADING_DELAY_MS - 1));
    expect(loader).toHaveAttribute('data-visible', 'false');

    act(() => vi.advanceTimersByTime(1));
    expect(loader).toHaveAttribute('data-visible', 'true');
  });

  it('uses an existing contextual asset without adding visible loading copy', () => {
    const { container } = render(<PageLoading variant="documents" />);
    const loader = screen.getByRole('status');
    const image = container.querySelector('img');

    expect(loader).toHaveClass('page-loading--documents');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('aria-hidden', 'true');
    expect(image?.getAttribute('src')).toContain('documents.webp');
    expect(screen.queryByText('Đang mở màn hình…')).not.toBeInTheDocument();
  });
});

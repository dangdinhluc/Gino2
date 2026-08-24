import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VocabularyDisplaySettingsSheet } from '@/src/features/vocabulary/components/VocabularyDisplaySettingsSheet';

afterEach(() => {
  cleanup();
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
});

describe('VocabularyDisplaySettingsSheet', () => {
  it('keeps display settings accessible and restores scroll on close', () => {
    const onToggleFurigana = vi.fn();
    const onToggleRomaji = vi.fn();
    const onClose = vi.fn();

    render(
      <VocabularyDisplaySettingsSheet
        isOpen
        showFurigana
        showRomaji={false}
        onToggleFurigana={onToggleFurigana}
        onToggleRomaji={onToggleRomaji}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Hiển thị từ vựng' })).toBeDefined();
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('switch', { name: /furigana/i }));
    fireEvent.click(screen.getByRole('switch', { name: /romaji/i }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onToggleFurigana).toHaveBeenCalledOnce();
    expect(onToggleRomaji).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

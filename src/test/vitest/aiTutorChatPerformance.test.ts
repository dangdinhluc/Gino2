import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchAiConversationHistory: vi.fn(),
  streamAiChat: vi.fn(),
}));

vi.mock('@/src/features/ai/repositories/aiRepository', () => ({
  fetchAiConversationHistory: mocks.fetchAiConversationHistory,
  streamAiChat: mocks.streamAiChat,
}));

import { useAiTutorChat } from '@/src/features/ai/hooks/useAiTutorChat';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetchAiConversationHistory.mockResolvedValue({
    conversationId: 'conversation-1',
    messages: [{ id: 'message-1', role: 'assistant', text: 'Xin chào' }],
  });
});

describe('AI tutor loading boundary', () => {
  it('does not load history until the chat is opened, then keeps it for reopen', async () => {
    const { result, rerender } = renderHook(({ enabled }: { enabled: boolean }) => useAiTutorChat({ enabled }), {
      initialProps: { enabled: false },
    });

    expect(mocks.fetchAiConversationHistory).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await waitFor(() => expect(mocks.fetchAiConversationHistory).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    act(() => rerender({ enabled: false }));
    act(() => rerender({ enabled: true }));
    expect(mocks.fetchAiConversationHistory).toHaveBeenCalledTimes(1);
  });
});

import { type FormEvent, useEffect, useRef, useState } from 'react';
import { fetchAiConversationHistory, streamAiChat, type AiChatMessage } from '@/src/features/ai/repositories/aiRepository';

interface UseAiTutorChatOptions {
  enabled?: boolean;
}

export function useAiTutorChat({ enabled = false }: UseAiTutorChatOptions = {}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const historyRequestedRef = useRef(false);

  useEffect(() => {
    if (!enabled || historyRequestedRef.current) return undefined;
    historyRequestedRef.current = true;
    fetchAiConversationHistory()
      .then((history) => setMessages(history))
      .catch((nextError: unknown) => {
        historyRequestedRef.current = false;
        setError(nextError instanceof Error ? nextError.message : 'Không tải được lịch sử AI.');
      });
    return undefined;
  }, [enabled]);

  const sendMessage = async (text: string): Promise<void> => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;
    const timestamp = Date.now();
    const userMessage: AiChatMessage = { id: `pending-user-${timestamp}`, role: 'user', text: trimmedText };
    const assistantId = `pending-assistant-${timestamp}`;
    setError(null);
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', text: '' }]);
    setDraft('');
    setIsSending(true);
    try {
      const result = await streamAiChat({
        message: trimmedText,
        conversationId,
        onToken: (token) => setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, text: `${message.text}${token}` } : message)),
      });
      setConversationId(result.conversationId);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'AI không phản hồi.');
      setMessages((current) => current.filter((message) => message.id !== assistantId));
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  return { draft, error, handleSubmit, isSending, messages, sendMessage, setDraft };
}

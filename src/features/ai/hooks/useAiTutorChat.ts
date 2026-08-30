import { type FormEvent, useEffect, useRef, useState } from 'react';
import { fetchAiConversationHistory, streamAiChat, type AiChatMessage } from '@/src/features/ai/repositories/aiRepository';

interface UseAiTutorChatOptions {
  enabled?: boolean;
  courseId?: string;
}

export function useAiTutorChat({ enabled = false, courseId }: UseAiTutorChatOptions = {}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const historyRequestedRef = useRef(false);
  const courseRef = useRef(courseId);
  const generationRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const courseChanged = courseRef.current !== courseId;
    courseRef.current = courseId;
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    if (courseChanged) {
      historyRequestedRef.current = false;
      setMessages([]);
      setConversationId(undefined);
      setError(null);
    }
    if (!enabled || historyRequestedRef.current) return undefined;
    const generation = generationRef.current;
    setMessages([]);
    setConversationId(undefined);
    setError(null);
    historyRequestedRef.current = true;
    fetchAiConversationHistory(courseId)
      .then((history) => {
        if (generation !== generationRef.current) return;
        setMessages(history.messages);
        setConversationId(history.conversationId);
      })
      .catch((nextError: unknown) => {
        if (generation !== generationRef.current) return;
        historyRequestedRef.current = false;
        setError(nextError instanceof Error ? nextError.message : 'Không tải được lịch sử AI.');
      });
    return () => { generationRef.current += 1; };
  }, [courseId, enabled]);

  const sendMessage = async (text: string): Promise<void> => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;
    const timestamp = Date.now();
    const userMessage: AiChatMessage = { id: `pending-user-${timestamp}`, role: 'user', text: trimmedText };
    const assistantId = `pending-assistant-${timestamp}`;
    const generation = generationRef.current;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const selectedConversationId = conversationId;
    const selectedCourseId = courseId;
    setError(null);
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', text: '' }]);
    setDraft('');
    setIsSending(true);
    try {
      const result = await streamAiChat({
        message: trimmedText,
        courseId: selectedCourseId,
        conversationId: selectedConversationId,
        signal: controller.signal,
        onToken: (token) => {
          if (generation === generationRef.current) setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, text: `${message.text}${token}` } : message));
        },
      });
      if (generation === generationRef.current) setConversationId(result.conversationId);
    } catch (nextError: unknown) {
      if (generation !== generationRef.current || controller.signal.aborted) return;
      setError(nextError instanceof Error ? nextError.message : 'AI không phản hồi.');
      setMessages((current) => current.filter((message) => message.id !== assistantId));
    } finally {
      if (generation === generationRef.current) setIsSending(false);
    }
  };

  const resetChat = (): void => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    historyRequestedRef.current = true;
    setMessages([]);
    setConversationId(undefined);
    setError(null);
    setIsSending(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  return { draft, error, handleSubmit, isSending, messages, resetChat, sendMessage, setDraft };
}

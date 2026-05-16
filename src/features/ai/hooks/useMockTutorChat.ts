import { type FormEvent, useState } from 'react';
import { initialChatMessages, type ChatMessage } from '@/src/data/phaseOneMock';

function buildMockReply(text: string): string {
  const normalizedText = text.toLowerCase();

  if (normalizedText.includes('phỏng vấn') || normalizedText.includes('hr') || normalizedText.includes('interview')) {
    return 'Với phỏng vấn Tokutei, anh nên trả lời theo 3 nhịp: giới thiệu rất ngắn, nói mục tiêu sang Nhật, rồi chốt bằng thái độ học việc và kỷ luật.';
  }

  if (normalizedText.includes('hồ sơ') || normalizedText.includes('giấy tờ') || normalizedText.includes('zairyu')) {
    return 'Với hồ sơ Tokutei, em khuyên anh nhớ theo thứ tự: giấy tờ gốc, bản scan, ảnh, rồi checklist đối chiếu. Em có thể tách tiếp thành bộ phải mang và bộ phải nộp.';
  }

  if (normalizedText.includes('thi') || normalizedText.includes('jft') || normalizedText.includes('mock')) {
    return 'Với mock Tokutei, anh nên chia phiên ôn thành 3 cụm: tiếng Nhật sống còn, tình huống nơi làm việc, rồi phỏng vấn. Làm ngắn nhưng đều sẽ hiệu quả hơn dồn một buổi dài.';
  }

  if (normalizedText.includes('sửa') || normalizedText.includes('câu')) {
    return 'Anh gửi câu rất đúng kiểu để luyện. Em sẽ rút nó về bản gọn hơn, chỉ ra 1 lỗi chính và đưa thêm 1 phiên bản an toàn để dùng khi phỏng vấn hoặc vào ca.';
  }

  return 'Em hiểu ý anh. Với mock tutor Tokutei, em sẽ phản hồi theo 3 bước: chốt ý chính, rút câu cho gọn, rồi đưa một phiên bản an toàn để anh dùng ngay.';
}

export function useMockTutorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [draft, setDraft] = useState('');

  const sendMessage = (text: string) => {
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return;
    }

    const timestamp = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      text: trimmedText,
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${timestamp}`,
      role: 'assistant',
      text: buildMockReply(trimmedText),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return {
    draft,
    handleSubmit,
    messages,
    sendMessage,
    setDraft,
  };
}

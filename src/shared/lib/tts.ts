/**
 * Text-to-speech tiếng Nhật qua Web Speech API (chạy offline trên trình duyệt,
 * không cần backend). Tự chọn giọng ja-JP tốt nhất đang có trên máy.
 */

let voicesLoaded = false;
let cachedVoice: SpeechSynthesisVoice | null = null;

function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const japanese = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('ja'));
  if (japanese.length === 0) return null;
  // Ưu tiên giọng "premium/natural" nếu có (Kyoko trên macOS, Google 日本語 trên Chrome)
  const preferred = japanese.find((voice) => /kyoko|google|natural|premium/i.test(voice.name));
  return preferred ?? japanese[0];
}

function ensureVoices(): void {
  if (voicesLoaded || typeof window === 'undefined' || !window.speechSynthesis) return;
  cachedVoice = pickJapaneseVoice();
  if (!cachedVoice) {
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        cachedVoice = pickJapaneseVoice();
      },
      { once: true },
    );
  }
  voicesLoaded = true;
}

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Đọc một đoạn tiếng Nhật. Hủy câu đang đọc dở trước khi đọc câu mới.
 * @param rate 0.75 mặc định — chậm hơn một chút cho người mới học.
 */
export function speakJapanese(text: string, rate = 0.85): void {
  if (!isTtsSupported() || !text.trim()) return;
  ensureVoices();
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  if (!cachedVoice) cachedVoice = pickJapaneseVoice();
  if (cachedVoice) utterance.voice = cachedVoice;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}

import type { VocabularyScript } from '@/src/features/courses/mock/courseLearningMock';

/** Hai chế độ của tab Ôn tập. Trước đây phải chọn qua modal, giờ đổi thẳng trong panel. */
export type ReviewMode = 'vocabulary' | 'questions';

export const VOCABULARY_SCRIPT_STORAGE_KEY = 'tokutei:vocabulary-script';
export const REVIEW_MODE_STORAGE_KEY = 'tokutei:review-mode';

const DEFAULT_VOCABULARY_SCRIPT: VocabularyScript = 'romaji';
const DEFAULT_REVIEW_MODE: ReviewMode = 'vocabulary';

/** Thuần: ép giá trị đọc từ storage về đúng kiểu chữ hợp lệ. */
export function parseVocabularyScript(value: string | null | undefined): VocabularyScript {
  return value === 'kana' || value === 'kanji' || value === 'romaji' ? value : DEFAULT_VOCABULARY_SCRIPT;
}

/** Thuần: ép giá trị đọc từ storage về đúng chế độ ôn tập hợp lệ. */
export function parseReviewMode(value: string | null | undefined): ReviewMode {
  return value === 'vocabulary' || value === 'questions' ? value : DEFAULT_REVIEW_MODE;
}

/** Đọc storage an toàn: thiếu window hoặc bị chặn (private mode, test node) thì trả null. */
function readStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Ghi storage an toàn: bị chặn thì bỏ qua, lựa chọn vẫn đổi được trong phiên. */
function writeStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Trình duyệt chặn storage — chỉ mất phần nhớ cho lần sau.
  }
}

export function readStoredVocabularyScript(): VocabularyScript {
  return parseVocabularyScript(readStorageItem(VOCABULARY_SCRIPT_STORAGE_KEY));
}

export function writeStoredVocabularyScript(script: VocabularyScript): void {
  writeStorageItem(VOCABULARY_SCRIPT_STORAGE_KEY, script);
}

export function readStoredReviewMode(): ReviewMode {
  return parseReviewMode(readStorageItem(REVIEW_MODE_STORAGE_KEY));
}

export function writeStoredReviewMode(mode: ReviewMode): void {
  writeStorageItem(REVIEW_MODE_STORAGE_KEY, mode);
}

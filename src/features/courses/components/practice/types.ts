export type PracticeMode = 'vocabulary' | 'questions' | 'mixed';
export type PracticeStage = 'setup' | 'session' | 'result';

export interface PracticeQuestion {
  id: string;
  kind: 'vocabulary' | 'question';
  prompt: string;
  options: string[];
  explanation: string;
  source: string;
  correctAnswer?: string;
  optionIds?: Record<string, string>;
  vocabularyId?: string;
  pronunciation?: string;
}

export interface PracticeAnswer {
  selected: string;
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
}

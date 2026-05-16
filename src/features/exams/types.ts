export interface Exam {
  id: string;
  title: string;
  type: 'Tokutei Mock' | 'JFT-Basic' | 'Interview';
  skills: string[];
}

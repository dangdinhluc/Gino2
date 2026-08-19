import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';
import type { Json } from '@/src/features/supabase/lib/database.types';
import type { Exam } from '@/src/features/exams/types';

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  prompt: string;
  options: string[];
  orderIndex: number;
}

export interface AssessmentPaper {
  id: string;
  courseId: string;
  title: string;
  type: string;
  passingScore: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  attemptId: string;
  assessmentId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  attemptedAt: string;
}

export interface AssessmentResultDetail {
  questionId: string;
  prompt: string;
  selectedAnswer: string;
  isCorrect: boolean;
  explanation: string;
  orderIndex: number;
}

export async function fetchPublishedAssessments(): Promise<Exam[]> {
  const { data, error } = await requireSupabase()
    .from('assessments')
    .select('id, title, assessment_type, passing_score')
    .eq('status', 'published')
    .order('order_index');
  if (error) throw new Error(error.message);
  return (data ?? []).map((assessment) => ({
    id: assessment.id,
    title: assessment.title,
    type: assessment.assessment_type,
    skills: [`Đạt từ ${assessment.passing_score}%`],
  }));
}

function asOptions(value: Json): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export async function fetchAssessmentPaper(assessmentId: string): Promise<AssessmentPaper | null> {
  const client = requireSupabase();
  const [{ data: assessment, error: assessmentError }, { data: questions, error: questionError }] = await Promise.all([
    client.from('assessments').select('id, course_id, title, assessment_type, passing_score').eq('id', assessmentId).maybeSingle(),
    client.from('assessment_questions').select('id, assessment_id, prompt, options, order_index').eq('assessment_id', assessmentId).order('order_index'),
  ]);
  if (assessmentError) throw new Error(assessmentError.message);
  if (questionError) throw new Error(questionError.message);
  if (!assessment) return null;

  return {
    id: assessment.id,
    courseId: assessment.course_id,
    title: assessment.title,
    type: assessment.assessment_type,
    passingScore: assessment.passing_score,
    questions: (questions ?? []).map((question) => ({
      id: question.id,
      assessmentId: question.assessment_id,
      prompt: question.prompt,
      options: asOptions(question.options),
      orderIndex: question.order_index,
    })),
  };
}

export async function submitAssessment(assessmentId: string, answers: Record<string, string>): Promise<AssessmentResult> {
  const client = requireSupabase();
  const { data, error } = await client.rpc('submit_assessment', {
    target_assessment_id: assessmentId,
    target_answers: answers,
  });
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) throw new Error('Không nhận được kết quả chấm điểm từ máy chủ.');
  return {
    attemptId: result.attempt_id,
    assessmentId: result.assessment_id,
    score: result.score,
    passed: result.passed,
    totalQuestions: result.total_questions,
    correctAnswers: result.correct_answers,
    attemptedAt: result.attempted_at,
  };
}

export async function fetchLatestAssessmentResult(assessmentId: string): Promise<AssessmentResult | null> {
  const { data, error } = await requireSupabase().rpc('get_latest_assessment_result', { target_assessment_id: assessmentId });
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) return null;
  return {
    attemptId: result.attempt_id,
    assessmentId: result.assessment_id,
    score: result.score,
    passed: result.passed,
    totalQuestions: result.total_questions,
    correctAnswers: result.correct_answers,
    attemptedAt: result.attempted_at,
  };
}

export async function fetchAssessmentResultDetail(attemptId: string): Promise<AssessmentResultDetail[]> {
  const { data, error } = await requireSupabase().rpc('get_assessment_result_detail', { target_attempt_id: attemptId });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    questionId: item.question_id,
    prompt: item.prompt,
    selectedAnswer: item.selected_answer,
    isCorrect: item.is_correct,
    explanation: item.explanation,
    orderIndex: item.order_index,
  }));
}

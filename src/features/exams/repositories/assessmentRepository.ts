import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
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
  const client = requireSupabase();
  const userId = await requireUserId(client);

  const [{ data, error }, { data: attempts, error: attemptsError }] = await Promise.all([
    client
      .from('assessments')
      .select('id, title, assessment_type, passing_score, course_id, order_index')
      .eq('status', 'published')
      .order('order_index'),
    client.from('assessment_attempts').select('assessment_id, passed').eq('user_id', userId),
  ]);
  if (error) throw new Error(error.message);
  if (attemptsError) throw new Error(attemptsError.message);

  const rows = [...(data ?? [])].sort((a, b) => (a.course_id === b.course_id ? a.order_index - b.order_index : a.course_id.localeCompare(b.course_id)));
  const passedIds = new Set((attempts ?? []).filter((attempt) => attempt.passed).map((attempt) => attempt.assessment_id));

  // Với mỗi khóa, áp prerequisite: đề i+1 chỉ mở khi đề i đã pass.
  const byCourse = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byCourse.get(row.course_id) ?? [];
    list.push(row);
    byCourse.set(row.course_id, list);
  }

  const exams: Exam[] = [];
  for (const list of byCourse.values()) {
    list.forEach((assessment, index) => {
      const previous = index > 0 ? list[index - 1] : null;
      const isLocked = index > 0 && previous !== null && !passedIds.has(previous.id);
      exams.push({
        id: assessment.id,
        title: assessment.title,
        type: assessment.assessment_type,
        skills: [`Đạt từ ${assessment.passing_score}%`],
        courseId: assessment.course_id,
        orderIndex: assessment.order_index,
        ...(isLocked
          ? { locked: true, unlockLabel: previous ? `Vượt "${previous.title}" để mở` : 'Chưa mở khóa' }
          : { locked: false }),
      });
    });
  }

  return exams;
}

export interface AssessmentUnlockState {
  locked: boolean;
  unlockLabel?: string;
}

/**
 * Xác định đề thi có bị khóa bởi prerequisite (điểm pass đề trước) hay không.
 * Đề đầu tiên trong khóa luôn mở; đề i+1 chỉ mở khi đề i đã từng đạt điểm pass.
 */
export async function fetchAssessmentUnlockState(assessmentId: string): Promise<AssessmentUnlockState> {
  const client = requireSupabase();
  const userId = await requireUserId(client);

  const [{ data: assessment, error: assessmentError }, { data: attempts, error: attemptsError }] = await Promise.all([
    client
      .from('assessments')
      .select('id, course_id, title, order_index')
      .eq('id', assessmentId)
      .eq('status', 'published')
      .maybeSingle(),
    client.from('assessment_attempts').select('assessment_id, passed').eq('user_id', userId),
  ]);

  if (assessmentError) throw new Error(assessmentError.message);
  if (attemptsError) throw new Error(attemptsError.message);
  if (!assessment) return { locked: false };

  // Đề đầu tiên trong khóa luôn mở.
  const { data: siblings, error: siblingsError } = await client
    .from('assessments')
    .select('id, title, order_index')
    .eq('course_id', assessment.course_id)
    .eq('status', 'published')
    .order('order_index');
  if (siblingsError) throw new Error(siblingsError.message);

  const ordered = (siblings ?? []).sort((a, b) => a.order_index - b.order_index);
  const index = ordered.findIndex((item) => item.id === assessmentId);
  if (index <= 0) return { locked: false };

  const previous = ordered[index - 1];
  const passedIds = new Set((attempts ?? []).filter((attempt) => attempt.passed).map((attempt) => attempt.assessment_id));
  if (passedIds.has(previous.id)) return { locked: false };

  return { locked: true, unlockLabel: `Vượt "${previous.title}" để mở khóa đề này` };
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

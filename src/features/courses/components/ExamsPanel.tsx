import { ClipboardCheck, Lock, Play } from 'lucide-react';
import type { CourseExamItem } from '@/src/features/courses/courseLearning.types';

interface ExamsPanelProps {
  exams: CourseExamItem[];
  onStartExam: (examId: string) => void;
}

export function ExamsPanel({ exams, onStartExam }: ExamsPanelProps) {
  return (
    <div className="mx-auto w-full max-w-[620px] space-y-2.5 pb-24">
      {exams.length === 0 ? (
        <div className="rounded-[13px] border border-dashed border-[#dedbe6] bg-white px-4 py-8 text-center">
          <ClipboardCheck size={24} className="mx-auto text-[#8062c9]" />
          <strong className="mt-2 block text-[11px] font-extrabold text-[#34353b]">Chưa có đề thi</strong>
          <span className="mt-1 block text-[9px] text-[#9597a0]">Đề sẽ xuất hiện khi được xuất bản cho khóa học.</span>
        </div>
      ) : (
        exams.map((exam, index) => {
          const isLocked = exam.status === 'locked';
          const label = isLocked ? 'Đang khóa' : exam.status === 'in_progress' ? 'Tiếp tục' : exam.status === 'completed' ? 'Làm lại' : 'Làm bài';
          return (
            <article key={exam.id} className="flex min-h-[76px] items-center gap-3 rounded-[13px] border border-[#e8e8ef] bg-white p-3 shadow-[0_2px_8px_rgba(25,25,40,.025)]">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${isLocked ? 'bg-[#f3f3f5] text-[#a1a2a8]' : 'bg-[#f3efff] text-[#6f45d8]'}`}>
                {isLocked ? <Lock size={17} /> : <ClipboardCheck size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-[11px] font-extrabold text-[#303138]">{exam.title || `Đề thi số ${index + 1}`}</strong>
                <span className="mt-1 block truncate text-[9px] font-medium text-[#9698a1]">
                  {exam.duration}{exam.skills.length ? ` · ${exam.skills.slice(0, 2).join(' · ')}` : ''}
                </span>
                {exam.latestScore !== undefined && <span className="mt-1 block text-[8px] font-bold text-[#6f45d8]">Điểm gần nhất {exam.latestScore}%</span>}
              </div>
              <button
                type="button"
                onClick={() => onStartExam(exam.id)}
                disabled={isLocked}
                className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[9px] font-extrabold ${isLocked ? 'cursor-not-allowed bg-[#f3f3f5] text-[#aaaab0]' : 'border border-[#d4c9ee] bg-[#fbf9ff] text-[#6f45d8] hover:bg-[#f4f0ff]'}`}
              >
                {isLocked ? <Lock size={11} /> : <Play size={11} fill="currentColor" />}{label}
              </button>
            </article>
          );
        })
      )}
    </div>
  );
}

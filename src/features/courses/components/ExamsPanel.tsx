import { ClipboardCheck, Lock, Play } from 'lucide-react';
import type { CourseExamItem } from '@/src/features/courses/courseLearning.types';

interface ExamsPanelProps {
  exams: CourseExamItem[];
  onStartExam: (examId: string) => void;
}

export function ExamsPanel({ exams, onStartExam }: ExamsPanelProps) {
  return (
    <div className="mx-auto w-full max-w-[620px] space-y-2.5 px-3 lg:px-0">
      {exams.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[10px] font-semibold text-[#827a90]">Chọn bất kỳ đề nào để bắt đầu. Có thể làm lại sau khi hoàn thành.</p>
          <span className="shrink-0 rounded-full bg-[#f1ecfb] px-2 py-1 text-[9px] font-black text-[#6f45d8]">{exams.length} đề</span>
        </div>
      )}
      {exams.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#dedbe6] bg-white px-4 py-8 text-center">
          <ClipboardCheck size={24} className="mx-auto text-[#8062c9]" />
          <strong className="mt-2 block text-[11px] font-extrabold text-[#34353b]">Chưa có đề thi</strong>
          <span className="mt-1 block text-[9px] text-[#9597a0]">Đề sẽ xuất hiện khi được xuất bản cho khóa học.</span>
        </div>
      ) : (
        exams.map((exam, index) => {
          const isLocked = exam.status === 'locked';
          const label = isLocked ? 'Đang khóa' : exam.status === 'in_progress' ? 'Tiếp tục' : exam.status === 'completed' ? 'Làm lại' : 'Làm bài';
          return (
            <article key={exam.id} className={`flex min-h-[80px] items-center gap-3 rounded-[18px] border p-3 transition-colors ${isLocked ? 'border-[#ebe7f1] bg-white' : 'border-[#dcd1f4] bg-[#fdfcff] shadow-[0_5px_16px_rgba(55,39,90,.06)]'}`}>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] ${isLocked ? 'bg-[#f5f2f9] text-[#a69db6]' : 'bg-[#eee7ff] text-[#6f45d8]'}`}>
                {isLocked ? <Lock size={17} /> : <ClipboardCheck size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <strong className={`block truncate text-[12px] font-extrabold ${isLocked ? 'text-[#56515f]' : 'text-[#302842]'}`}>{exam.title || `Đề thi số ${index + 1}`}</strong>
                <span className="mt-1 block truncate text-[9px] font-medium text-[#918a9d]">
                  {exam.duration}{exam.skills.length ? ` · ${exam.skills.slice(0, 2).join(' · ')}` : ''}
                </span>
                {exam.latestScore !== undefined && <span className="mt-1 block text-[8px] font-bold text-[#6f45d8]">Điểm gần nhất {exam.latestScore}%</span>}
              </div>
              <button
                type="button"
                onClick={() => onStartExam(exam.id)}
                disabled={isLocked}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[9px] font-extrabold ${isLocked ? 'cursor-not-allowed bg-[#f5f2f9] text-[#aaa1b8]' : 'bg-[#6f45d8] text-white shadow-[0_4px_10px_rgba(111,69,216,.18)] hover:bg-[#6039c2]'}`}
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

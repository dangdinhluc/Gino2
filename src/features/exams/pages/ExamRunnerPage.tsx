import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronLeft, Clock3, Send } from 'lucide-react';
import { examShell } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

type TheoryQuestion = {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  answer: string;
};

const theoryQuestions: TheoryQuestion[] = [
  {
    id: 'q1',
    topic: 'Hồ sơ',
    prompt: 'Trước buổi phỏng vấn, mục nào nên kiểm tra đầu tiên?',
    options: ['Hộ chiếu / thẻ cư trú', 'Tai nghe', 'Hộp cơm', 'Đồng hồ thông minh'],
    answer: 'Hộ chiếu / thẻ cư trú',
  },
  {
    id: 'q2',
    topic: 'Vào ca',
    prompt: 'Khi bắt đầu ca, hành động nào đúng nhất?',
    options: ['Chào đội và xác nhận vị trí', 'Tự vào làm ngay', 'Đổi vị trí với bạn cho nhanh', 'Để checklist cuối ca làm luôn'],
    answer: 'Chào đội và xác nhận vị trí',
  },
  {
    id: 'q3',
    topic: 'Giao tiếp',
    prompt: '“houkoku” gần nghĩa nhất với điều gì?',
    options: ['báo cáo', 'nghỉ ngơi', 'phỏng vấn', 'chuyển ca'],
    answer: 'báo cáo',
  },
  {
    id: 'q4',
    topic: 'Phỏng vấn',
    prompt: 'Khi HR hỏi mục tiêu sang Nhật, câu nào an toàn nhất?',
    options: ['Em muốn học và làm việc ổn định lâu dài.', 'Em sang trước rồi tính tiếp.', 'Bạn em bảo đi nên em đi.', 'Em chưa rõ công việc là gì.'],
    answer: 'Em muốn học và làm việc ổn định lâu dài.',
  },
  {
    id: 'q5',
    topic: 'An toàn',
    prompt: 'Khi thấy khu vực nguy hiểm, phản ứng nào đúng?',
    options: ['Báo quản lý và chặn khu vực', 'Làm nhanh rồi tính', 'Đợi người khác nhắc', 'Im lặng cho xong ca'],
    answer: 'Báo quản lý và chặn khu vực',
  },
  {
    id: 'q6',
    topic: 'Tác phong',
    prompt: 'Khi chưa hiểu hướng dẫn, câu nào phù hợp nhất?',
    options: ['Xin nhắc lại cho em một lần nữa.', 'Em đoán chắc đúng rồi.', 'Để em làm đại trước.', 'Em hỏi lại sau ca.'],
    answer: 'Xin nhắc lại cho em một lần nữa.',
  },
  {
    id: 'q7',
    topic: 'Lịch làm',
    prompt: '“kyukei” nghĩa là gì?',
    options: ['giờ nghỉ', 'quản lý', 'đồng phục', 'hồ sơ'],
    answer: 'giờ nghỉ',
  },
  {
    id: 'q8',
    topic: 'Hồ sơ',
    prompt: 'Mục nào không nên thiếu trong checklist trước phỏng vấn?',
    options: ['Ảnh hồ sơ và bản scan giấy tờ', 'Bảng điểm game', 'Ảnh món ăn yêu thích', 'Bộ sticker điện thoại'],
    answer: 'Ảnh hồ sơ và bản scan giấy tờ',
  },
  {
    id: 'q9',
    topic: 'Nhà hàng',
    prompt: 'Trong ca đầu, ưu tiên nào đúng hơn?',
    options: ['Đúng quy trình trước, nhanh sau', 'Nhanh trước, sai sửa sau', 'Làm theo bạn bên cạnh', 'Chỉ tập trung phần dễ'],
    answer: 'Đúng quy trình trước, nhanh sau',
  },
  {
    id: 'q10',
    topic: 'Nghe hiểu',
    prompt: 'Khi quản lý nói lại hướng dẫn, anh nên làm gì để chắc ý?',
    options: ['Nhắc lại ý chính để xác nhận', 'Gật đầu cho qua', 'Đợi đồng nghiệp làm mẫu', 'Bỏ qua vì ngại hỏi'],
    answer: 'Nhắc lại ý chính để xác nhận',
  },
  {
    id: 'q11',
    topic: 'Phỏng vấn',
    prompt: 'Câu nào nên tránh khi được hỏi điểm mạnh?',
    options: ['Em học nhanh và chịu khó.', 'Em cái gì cũng giỏi hết.', 'Em quen làm theo quy trình.', 'Em chủ động hỏi khi chưa hiểu.'],
    answer: 'Em cái gì cũng giỏi hết.',
  },
  {
    id: 'q12',
    topic: 'Tổng ôn',
    prompt: 'Phiên ôn cuối ngày nào hiệu quả nhất?',
    options: ['10 phút ôn flashcards + 1 câu tự giới thiệu', 'Chơi game bất kỳ 1 giờ', 'Mở nhiều tab rồi để đó', 'Chỉ xem video, không ôn lại'],
    answer: '10 phút ôn flashcards + 1 câu tự giới thiệu',
  },
];

export default function ExamRunner() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isQuestionListOpen, setIsQuestionListOpen] = useState(false);

  const activeQuestion = theoryQuestions[activeIndex];
  const selectedAnswer = selectedAnswers[activeQuestion.id];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress = Math.round((answeredCount / theoryQuestions.length) * 100);

  const handleAnswer = (option: string) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [activeQuestion.id]: option,
    }));
  };

  const handleSubmit = () => {
    navigate(`/app/exams/${id ?? examShell.id}/result`);
  };

  const goToPreviousQuestion = () => {
    setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1));
  };

  const goToNextQuestion = () => {
    setActiveIndex((currentIndex) => Math.min(theoryQuestions.length - 1, currentIndex + 1));
  };

  return (
    <div className="min-h-[100dvh] bg-[#fbf6ef]">
      <header className="sticky top-0 z-20 border-b border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[820px] items-center gap-2">
          <Link to="/app/exams" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#5f6b7c] transition-colors hover:bg-[#fffaf3] hover:text-[#172033]" aria-label="Thoát bài thi">
            <ArrowLeft size={20} strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            onClick={() => setIsQuestionListOpen((open) => !open)}
            aria-expanded={isQuestionListOpen}
            aria-controls="exam-question-list"
            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-2 text-sm font-bold text-[#172033] transition-colors hover:bg-[#fffaf3]"
          >
            Câu {activeIndex + 1}/{theoryQuestions.length}
            <ChevronDown className={cn('transition-transform', isQuestionListOpen && 'rotate-180')} size={16} />
          </button>
          <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#fffaf3] px-2.5 text-sm font-bold tabular-nums text-[#5f6b7c]">
            <Clock3 size={15} /> {examShell.duration}
          </span>
          <button type="button" onClick={handleSubmit} className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-2.5 text-xs font-bold text-orange-800 transition-colors hover:border-orange-700 hover:bg-orange-700 hover:text-white">
            Nộp <Send size={14} />
          </button>
        </div>

        {isQuestionListOpen && (
          <div id="exam-question-list" className="mx-auto grid w-full max-w-[820px] grid-cols-5 gap-2 border-t border-[#e8dccb] pt-3 sm:grid-cols-8">
            {theoryQuestions.map((question, index) => {
              const isActive = activeIndex === index;
              const isAnswered = Boolean(selectedAnswers[question.id]);
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => { setActiveIndex(index); setIsQuestionListOpen(false); }}
                  aria-label={`Câu ${index + 1}${isAnswered ? ' (đã làm)' : ''}`}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors',
                    isActive ? 'border-orange-700 bg-orange-700 text-white' : isAnswered ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#95a0af] hover:border-orange-300'
                  )}
                >
                  {isAnswered && !isActive ? <CheckCircle2 size={15} /> : index + 1}
                </button>
              );
            })}
          </div>
        )}

        <div className="mx-auto mt-2 h-1.5 w-full max-w-[820px] overflow-hidden rounded-full bg-[#efe5d7]">
          <div className="h-full rounded-full bg-orange-700 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[680px] px-5 pb-28 pt-7 sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">{activeQuestion.topic}</p>
          <span className="text-xs font-bold text-[#95a0af]">{answeredCount}/{theoryQuestions.length} đã làm</span>
        </div>
        <h1 className="mt-3 font-[var(--font-heading)] text-[clamp(1.5rem,5vw,2rem)] font-bold leading-[1.25] tracking-[-0.03em] text-[#172033]">{activeQuestion.prompt}</h1>

        <div className="mt-8 grid gap-3">
          {activeQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswer(option)}
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-15 items-center gap-4 rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors',
                  isSelected ? 'border-orange-700 bg-orange-50 text-orange-800 shadow-[0_0_0_1px_#c2410c]' : 'border-[#e8dccb] text-[#172033] hover:border-orange-300 hover:bg-[#fffaf3]'
                )}
              >
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold', isSelected ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffaf3] text-[#5f6b7c]')}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-base font-semibold">{option}</span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e8dccb] bg-[#fbf6ef]/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-3">
          <button type="button" onClick={goToPreviousQuestion} disabled={activeIndex === 0} className="flex h-12 min-w-29 items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-semibold text-[#5f6b7c] transition-colors hover:text-[#172033] disabled:opacity-45">
            <ChevronLeft size={17} /> Câu trước
          </button>
          {activeIndex === theoryQuestions.length - 1 ? (
            <button type="button" onClick={handleSubmit} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800">
              Xem lại & nộp <Send size={16} />
            </button>
          ) : (
            <button type="button" onClick={goToNextQuestion} className="flex h-12 min-w-29 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white transition-colors hover:bg-orange-800">
              Câu tiếp <ArrowRight size={17} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

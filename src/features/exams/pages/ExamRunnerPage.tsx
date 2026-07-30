import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, ChevronLeft, Clock3, Flag, ListChecks, Send } from 'lucide-react';
import { examShell } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

type TheoryQuestion = {
  id: string;
  topic: string;
  prompt: string;
  context: string;
  options: string[];
  answer: string;
};

const theoryQuestions: TheoryQuestion[] = [
  {
    id: 'q1',
    topic: 'Hồ sơ',
    prompt: 'Trước buổi phỏng vấn, mục nào nên kiểm tra đầu tiên?',
    context: 'Ưu tiên giấy tờ nhận diện và bộ hồ sơ gốc để tránh lỗi nền.',
    options: ['Hộ chiếu / thẻ cư trú', 'Tai nghe', 'Hộp cơm', 'Đồng hồ thông minh'],
    answer: 'Hộ chiếu / thẻ cư trú',
  },
  {
    id: 'q2',
    topic: 'Vào ca',
    prompt: 'Khi bắt đầu ca, hành động nào đúng nhất?',
    context: 'Cần chào đội, xác nhận vị trí và theo checklist đầu ca.',
    options: ['Chào đội và xác nhận vị trí', 'Tự vào làm ngay', 'Đổi vị trí với bạn cho nhanh', 'Để checklist cuối ca làm luôn'],
    answer: 'Chào đội và xác nhận vị trí',
  },
  {
    id: 'q3',
    topic: 'Giao tiếp',
    prompt: '“houkoku” gần nghĩa nhất với điều gì?',
    context: 'Đây là phản xạ cần có khi gặp sự cố hoặc phát hiện sai lệch.',
    options: ['báo cáo', 'nghỉ ngơi', 'phỏng vấn', 'chuyển ca'],
    answer: 'báo cáo',
  },
  {
    id: 'q4',
    topic: 'Phỏng vấn',
    prompt: 'Khi HR hỏi mục tiêu sang Nhật, câu nào an toàn nhất?',
    context: 'Câu trả lời nên ngắn, rõ ý và thể hiện định hướng nghiêm túc.',
    options: ['Em muốn học và làm việc ổn định lâu dài.', 'Em sang trước rồi tính tiếp.', 'Bạn em bảo đi nên em đi.', 'Em chưa rõ công việc là gì.'],
    answer: 'Em muốn học và làm việc ổn định lâu dài.',
  },
  {
    id: 'q5',
    topic: 'An toàn',
    prompt: 'Khi thấy khu vực nguy hiểm, phản ứng nào đúng?',
    context: 'Ưu tiên cảnh báo và báo cáo thay vì tự bỏ qua.',
    options: ['Báo quản lý và chặn khu vực', 'Làm nhanh rồi tính', 'Đợi người khác nhắc', 'Im lặng cho xong ca'],
    answer: 'Báo quản lý và chặn khu vực',
  },
  {
    id: 'q6',
    topic: 'Tác phong',
    prompt: 'Khi chưa hiểu hướng dẫn, câu nào phù hợp nhất?',
    context: 'Người học việc nên xin nhắc lại thay vì đoán.',
    options: ['Xin nhắc lại cho em một lần nữa.', 'Em đoán chắc đúng rồi.', 'Để em làm đại trước.', 'Em hỏi lại sau ca.'],
    answer: 'Xin nhắc lại cho em một lần nữa.',
  },
  {
    id: 'q7',
    topic: 'Lịch làm',
    prompt: '“kyukei” nghĩa là gì?',
    context: 'Đây là một trong những từ nền cần nhớ khi vào ca.',
    options: ['giờ nghỉ', 'quản lý', 'đồng phục', 'hồ sơ'],
    answer: 'giờ nghỉ',
  },
  {
    id: 'q8',
    topic: 'Hồ sơ',
    prompt: 'Mục nào không nên thiếu trong checklist trước phỏng vấn?',
    context: 'Một checklist tốt phải khóa cả giấy tờ lẫn phần trình bày.',
    options: ['Ảnh hồ sơ và bản scan giấy tờ', 'Bảng điểm game', 'Ảnh món ăn yêu thích', 'Bộ sticker điện thoại'],
    answer: 'Ảnh hồ sơ và bản scan giấy tờ',
  },
  {
    id: 'q9',
    topic: 'Nhà hàng',
    prompt: 'Trong ca đầu, ưu tiên nào đúng hơn?',
    context: 'Mục tiêu đầu là đúng quy trình, không phải làm nhanh bằng mọi giá.',
    options: ['Đúng quy trình trước, nhanh sau', 'Nhanh trước, sai sửa sau', 'Làm theo bạn bên cạnh', 'Chỉ tập trung phần dễ'],
    answer: 'Đúng quy trình trước, nhanh sau',
  },
  {
    id: 'q10',
    topic: 'Nghe hiểu',
    prompt: 'Khi quản lý nói lại hướng dẫn, anh nên làm gì để chắc ý?',
    context: 'Một nhịp xác nhận lại sẽ giảm rủi ro hiểu sai khi làm việc thật.',
    options: ['Nhắc lại ý chính để xác nhận', 'Gật đầu cho qua', 'Đợi đồng nghiệp làm mẫu', 'Bỏ qua vì ngại hỏi'],
    answer: 'Nhắc lại ý chính để xác nhận',
  },
  {
    id: 'q11',
    topic: 'Phỏng vấn',
    prompt: 'Câu nào nên tránh khi được hỏi điểm mạnh?',
    context: 'Câu trả lời nên thực tế và có thể chứng minh bằng thái độ làm việc.',
    options: ['Em học nhanh và chịu khó.', 'Em cái gì cũng giỏi hết.', 'Em quen làm theo quy trình.', 'Em chủ động hỏi khi chưa hiểu.'],
    answer: 'Em cái gì cũng giỏi hết.',
  },
  {
    id: 'q12',
    topic: 'Tổng ôn',
    prompt: 'Phiên ôn cuối ngày nào hiệu quả nhất?',
    context: 'Kết ngày bằng một phiên ngắn sẽ giữ streak và chốt lại thứ quan trọng.',
    options: ['10 phút ôn flashcards + 1 câu tự giới thiệu', 'Chơi game bất kỳ 1 giờ', 'Mở nhiều tab rồi để đó', 'Chỉ xem video, không ôn lại'],
    answer: '10 phút ôn flashcards + 1 câu tự giới thiệu',
  },
];

export default function ExamRunner() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

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
    <div className="mx-auto max-w-7xl space-y-5 pb-24">
      <section className="sticky top-0 z-40 -mx-4 border-b border-[#e8dccb] bg-[#f8f4ee]/92 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:rounded-2xl md:border md:bg-[#fffaf3] md:p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/app/exams" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-orange-700">
              <ArrowLeft size={20} strokeWidth={1.8} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-700">{examShell.provider} · readiness mock</p>
              <h1 className="truncate font-[var(--font-heading)] text-base font-bold tracking-[-0.02em] text-[#172033] md:text-xl">{examShell.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-[#5f6b7c]">
              <Clock3 size={16} strokeWidth={1.8} className="text-[#95a0af]" />
              {examShell.duration}
            </div>
            <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800">
              Nộp bài
              <Send size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
          <div className="h-full rounded-full bg-orange-700 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.32fr]">
        <div className="overflow-hidden rounded-2xl border border-[#e8dccb] bg-[#fffaf3]">
          <div className="border-b border-[#efe5d7] bg-[#fffdf8] p-5 md:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e8dccb] bg-orange-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700">
                  <BookOpenCheck size={14} strokeWidth={1.8} />
                  Trắc nghiệm lý thuyết
                </div>
                <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Câu {activeIndex + 1}: {activeQuestion.topic}</h2>
                <p className="max-w-3xl text-sm leading-relaxed text-[#5f6b7c]">
                  Bài thi mock hiện dùng dạng chọn phản xạ đúng. Anh có thể nhảy câu ở bảng bên phải hoặc dùng nút chuyển câu bên dưới.
                </p>
              </div>
              <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#5f6b7c]">
                {answeredCount}/{theoryQuestions.length} đã làm
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-7">
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <ListChecks size={24} strokeWidth={1.8} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-orange-700">Đề bài</p>
                  <h3 className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">{activeQuestion.prompt}</h3>
                  <p className="text-sm leading-relaxed text-[#5f6b7c]">{activeQuestion.context}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {activeQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      'flex min-h-20 items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors',
                      isSelected ? 'border-orange-300 bg-orange-50 text-orange-800' : 'border-[#e8dccb] bg-[#fffdf8] text-[#172033] hover:border-orange-300 hover:bg-orange-50/60'
                    )}
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold', isSelected ? 'border-orange-300 bg-white text-orange-700' : 'border-[#e8dccb] bg-white text-[#95a0af]')}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-semibold md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#efe5d7] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={activeIndex === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#5f6b7c] transition-colors hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} strokeWidth={1.8} />
                Câu trước
              </button>
              <div className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#95a0af]">
                Câu {activeIndex + 1} / {theoryQuestions.length}
              </div>
              <button
                onClick={goToNextQuestion}
                disabled={activeIndex === theoryQuestions.length - 1}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Câu sau
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4">
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">
              <Flag size={14} strokeWidth={1.8} /> Danh sách câu
            </div>
            <div className="grid grid-cols-4 gap-2 xl:grid-cols-3 2xl:grid-cols-4">
              {theoryQuestions.map((question, index) => {
                const isActive = activeIndex === index;
                const isAnswered = Boolean(selectedAnswers[question.id]);
                return (
                  <button
                    key={question.id}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'flex h-11 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                      isActive
                        ? 'border-orange-700 bg-orange-700 text-white'
                        : isAnswered
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-[#e8dccb] bg-[#fffdf8] text-[#95a0af] hover:border-orange-300 hover:text-orange-700'
                    )}
                  >
                    {isAnswered && !isActive ? <CheckCircle2 size={15} strokeWidth={1.8} /> : index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8dccb] bg-orange-50/60 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700">Ghi chú</div>
            <p className="mt-3 text-sm leading-relaxed text-[#5f6b7c]">
              Màn này đang ưu tiên phần trắc nghiệm readiness để chốt flow nhanh. Sau này nếu cần mô phỏng sâu hơn, mình tách riêng mode JFT, workplace và HR interview.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

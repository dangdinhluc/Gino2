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
    <div className="mx-auto max-w-7xl space-y-6 pb-24">
      <section className="sticky top-0 z-40 -mx-4 border-b border-[#e6ddd1] bg-[#f8f4ee]/92 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:rounded-[2rem] md:border md:bg-[#fffaf3]/92 md:p-4 md:shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/app/exams" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-[#fffaf3] text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{examShell.provider} · readiness mock</p>
              <h1 className="truncate text-base font-black text-gray-900 md:text-xl">{examShell.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-blue-600">
              <Clock3 size={16} />
              {examShell.duration}
            </div>
            <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Nộp bài
              <Send size={16} />
            </button>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.32fr]">
        <div className="overflow-hidden rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)]">
          <div className="border-b border-[#efe6da] bg-[linear-gradient(135deg,#fffaf3_0%,#fff7ed_100%)] p-5 md:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 shadow-sm">
                  <BookOpenCheck size={14} />
                  Trắc nghiệm lý thuyết
                </div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Câu {activeIndex + 1}: {activeQuestion.topic}</h2>
                <p className="max-w-3xl text-sm font-medium leading-relaxed text-gray-500">
                  Bài thi mock hiện dùng dạng chọn phản xạ đúng. Anh có thể nhảy câu ở bảng bên phải hoặc dùng nút chuyển câu bên dưới.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
                {answeredCount}/{theoryQuestions.length} đã làm
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-7">
            <div className="rounded-[2rem] border border-[#eadfce] bg-white p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 shadow-sm">
                  <ListChecks size={24} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-orange-600">Đề bài</p>
                  <h3 className="text-xl font-black tracking-tight text-gray-900">{activeQuestion.prompt}</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-500">{activeQuestion.context}</p>
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
                      'flex min-h-20 items-center gap-4 rounded-[1.5rem] border px-5 py-4 text-left transition-all',
                      isSelected ? 'border-orange-200 bg-orange-50 text-orange-700 shadow-sm' : 'border-[#e6ddd1] bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50/70'
                    )}
                  >
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black', isSelected ? 'border-orange-200 bg-white text-orange-500' : 'border-gray-200 bg-gray-50 text-gray-400')}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-black md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#efe6da] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={activeIndex === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-5 py-3 text-sm font-black text-gray-700 transition-all hover:border-orange-200 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronLeft size={16} />
                Câu trước
              </button>
              <div className="text-center text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                Câu {activeIndex + 1} / {theoryQuestions.length}
              </div>
              <button
                onClick={goToNextQuestion}
                disabled={activeIndex === theoryQuestions.length - 1}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Câu sau
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_20px_48px_-38px_rgba(148,163,184,0.2)]">
            <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <Flag size={14} /> Danh sách câu
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
                      'flex h-11 items-center justify-center rounded-xl border text-xs font-black transition-all',
                      isActive
                        ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-100'
                        : isAnswered
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                          : 'border-[#e6ddd1] bg-white text-gray-400 hover:border-orange-200 hover:text-orange-500'
                    )}
                  >
                    {isAnswered && !isActive ? <CheckCircle2 size={15} /> : index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-orange-50/70 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Ghi chú</div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600">
              Màn này đang ưu tiên phần trắc nghiệm readiness để chốt flow nhanh. Sau này nếu cần mô phỏng sâu hơn, mình tách riêng mode JFT, workplace và HR interview.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

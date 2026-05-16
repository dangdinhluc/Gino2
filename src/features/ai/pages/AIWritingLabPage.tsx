import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock3, FileText, Gauge, PenTool, Send, Sparkles } from 'lucide-react';

const quickPrompts = [
  'Viết 5-6 câu tự giới thiệu để phỏng vấn Tokutei.',
  'Mô tả một ca làm đầu tiên thật gọn.',
  'Viết tin nhắn xin đổi ca lịch sự.',
];

const scoringItems = [
  'Độ ngắn gọn và đúng ý',
  'Tính lịch sự, rõ ràng và đúng tác phong',
  'Mức độ phù hợp với bối cảnh Tokutei hiện tại',
];

export default function AIWritingLab() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const analysisTimerRef = useRef<number | null>(null);

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const clearAnalysisTimer = () => {
    if (analysisTimerRef.current !== null) {
      window.clearTimeout(analysisTimerRef.current);
      analysisTimerRef.current = null;
    }
  };

  const updateDraftText = (nextText: string) => {
    clearAnalysisTimer();
    setText(nextText);
    setIsAnalyzing(false);
    setHasAnalyzed(false);
  };

  useEffect(() => clearAnalysisTimer, []);

  const handleAnalyze = () => {
    clearAnalysisTimer();
    setIsAnalyzing(true);
    setHasAnalyzed(false);
    analysisTimerRef.current = window.setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      analysisTimerRef.current = null;
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px] md:tracking-[0.2em]">
              <Sparkles size={14} />
              Writing Lab
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">AI chấm viết theo nhịp học hiện tại</h2>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link to="/app/ai-lab/history" className="inline-flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-xs font-black text-gray-600 transition-all hover:border-orange-200 hover:text-orange-500">
                <Clock3 size={15} />
                Lịch sử chấm
              </Link>
              <Link to="/app/journal" className="inline-flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-xs font-black text-gray-600 transition-all hover:border-orange-200 hover:text-orange-500">
                <FileText size={15} />
                Nhật ký viết
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-[#e6ddd1] bg-[#fffaf3]/92 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.24)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">Bài viết</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{wordCount}</div>
              <div className="mt-1 text-[10px] font-medium leading-tight text-orange-500 md:text-[11px]">từ hiện tại</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100/70 bg-blue-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-400 md:text-[10px] md:tracking-[0.18em]">Mục tiêu</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">80-120</div>
              <div className="mt-1 text-[10px] font-medium leading-tight text-blue-500 md:text-[11px]">từ / lượt</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100/70 bg-emerald-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 md:text-[10px] md:tracking-[0.18em]">Phản hồi</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">AI</div>
              <div className="mt-1 text-[10px] font-medium leading-tight text-emerald-500 md:text-[11px]">gợi ý tức thì</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.78fr]">
        <div className="space-y-5 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Bài viết hiện tại</p>
              <h3 className="mt-1 text-xl font-black tracking-tight text-gray-900">Bản nháp để AI chấm</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    updateDraftText(prompt);
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition-all hover:border-orange-200 hover:text-orange-500"
                >
                  Mẫu nhanh
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(248,244,236,0.98)_100%)] p-3 shadow-[0_20px_48px_-38px_rgba(180,138,91,0.16)]">
            <textarea
              value={text}
              onChange={(e) => {
                updateDraftText(e.target.value);
              }}
              placeholder="Nhập hoặc dán câu trả lời/phần ghi chú Tokutei của anh ở đây. Ví dụ: Em là Minh. Em muốn làm việc ổn định lâu dài ở Nhật..."
              className="h-72 w-full resize-none rounded-[1.5rem] border-0 bg-white/80 p-5 text-[15px] leading-7 text-gray-700 outline-none"
            />
            <div className="flex flex-col gap-3 border-t border-orange-100 px-3 pb-1 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">{wordCount} từ</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Tokutei</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Gợi ý 80-120 từ</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? 'Đang phân tích...' : 'Chấm điểm ngay'}
                {!isAnalyzing && <Send size={16} />}
              </button>
            </div>
          </div>

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2rem] border border-orange-100 bg-orange-50/60 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">AI đang đọc bài viết</h4>
                  <p className="text-xs font-medium text-gray-500">Kiểm tra độ ngắn gọn, tác phong và độ phù hợp với bối cảnh Tokutei hiện tại.</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                />
              </div>
            </motion.div>
          )}

          {!isAnalyzing && hasAnalyzed && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-[2rem] border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 text-blue-500" size={20} />
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-blue-900">AI nhận xét nhanh</h4>
                    <p className="text-sm leading-relaxed text-blue-700">
                      Bài viết ổn về ý nhưng đoạn mục tiêu sang Nhật còn hơi dài và thiếu một câu chốt thái độ làm việc. Nếu rút còn 3 ý chính và thêm một câu kết lịch sự, bài sẽ chắc hơn rõ rệt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Điểm dự kiến</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">8.5/10</div>
                </div>
                <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/80 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Lỗi cần sửa</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">3</div>
                </div>
                <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/80 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Độ mạch lạc</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">Tốt</div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                    <PenTool size={14} />
                    Gợi ý sửa nổi bật
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-black">Mục tiêu:</span> nói rõ anh muốn làm việc ổn định, học nhanh và tuân thủ quy trình.
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-black">Câu chốt:</span> thêm một câu lịch sự như <span className="font-semibold">Em sẽ cố gắng bắt nhịp sớm và làm việc nghiêm túc.</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                    <CheckCircle2 size={14} />
                    Điều anh đang làm tốt
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3">Ý chính rõ và bám đúng chủ đề đề bài.</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">Độ dài phù hợp, chưa lan man.</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <FileText size={14} />
              Brief gợi ý
            </div>
            <div className="mt-4 space-y-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    updateDraftText(prompt);
                  }}
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-left text-sm font-semibold text-gray-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(248,244,236,0.98)_100%)] p-5 shadow-[0_20px_48px_-36px_rgba(180,138,91,0.18)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
              <Gauge size={14} />
              Tiêu chí AI đang chấm
            </div>
            <div className="mt-4 space-y-3">
              {scoringItems.map((item) => (
                <div key={item} className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
              <Clock3 size={14} />
              Nhịp dùng tốt nhất
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Viết một đoạn ngắn sau khi ôn thẻ nhớ hoặc ngay trước khi vào speaking sẽ giúp AI bắt đúng lỗi đang lặp lại trong ngày.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

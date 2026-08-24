import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Clock3, FileText, Gauge, PenTool, Send, Sparkles } from 'lucide-react';
import { submitAiWriting, type AiWritingResult } from '@/src/features/ai/repositories/aiRepository';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

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
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiWritingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const updateDraftText = (nextText: string) => {
    setText(nextText);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      setResult(await submitAiWriting({ text, courseId: activeCourseId ?? undefined }));
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'AI không chấm được bài viết.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const heroStats = [
    { label: 'Bài viết', value: wordCount, sub: 'từ hiện tại' },
    { label: 'Mục tiêu', value: '80-120', sub: 'từ / lượt' },
    { label: 'Phản hồi', value: 'AI', sub: 'gợi ý tức thì' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      <section className={panelClass}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <Sparkles size={14} /> Writing Lab
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">AI chấm viết theo nhịp học hiện tại</h1>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/app/ai-lab/history" className={`inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2.5 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
                <Clock3 size={15} /> Lịch sử chấm
              </Link>
              <Link to="/app/journal" className={`inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2.5 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
                <FileText size={15} /> Nhật ký viết
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {heroStats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 md:min-w-[6rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">{stat.label}</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-xl font-bold leading-none text-[#172033] md:text-2xl">{stat.value}</div>
                <div className="mt-1 text-[11px] text-[#95a0af]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.78fr]">
        <div className="space-y-5">
          <div className={panelClass}>
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#95a0af]">Bài viết hiện tại</p>
              <h2 className="mt-1 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Bản nháp để AI chấm</h2>
            </div>

            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-3">
              <textarea
                value={text}
                onChange={(e) => updateDraftText(e.target.value)}
                placeholder="Nhập hoặc dán câu trả lời/phần ghi chú Tokutei của anh ở đây. Ví dụ: Em là Minh. Em muốn làm việc ổn định lâu dài ở Nhật..."
                className="h-72 w-full resize-none rounded-lg border border-[#e8dccb] bg-white p-4 text-[15px] leading-7 text-[#172033] outline-none transition-shadow placeholder:text-[#95a0af] focus:ring-2 focus:ring-orange-500"
              />
              <div className="mt-3 flex flex-col gap-3 border-t border-[#efe5d7] px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-700">{wordCount} từ</span>
                  <span className="rounded-lg bg-[#f0f2f5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f6b7c]">Tokutei</span>
                  <span className="rounded-lg bg-[#f0f2f5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f6b7c]">Gợi ý 80-120 từ</span>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || isAnalyzing}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                >
                  {isAnalyzing ? 'Đang phân tích...' : 'Chấm điểm ngay'}
                  {!isAnalyzing && <Send size={16} />}
                </button>
              </div>
            </div>

            {isAnalyzing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-orange-200 bg-orange-50/50 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-700">
                    <Sparkles size={20} strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#172033]">AI đang đọc bài viết</h3>
                    <p className="text-xs text-[#5f6b7c]">Kiểm tra độ ngắn gọn, tác phong và độ phù hợp với bối cảnh Tokutei hiện tại.</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.8 }} className="h-full rounded-full bg-orange-700" />
                </div>
              </motion.div>
            )}

            {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

            {!isAnalyzing && result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
                <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 shrink-0 text-orange-700" size={20} strokeWidth={1.8} />
                    <div className="space-y-1">
                      <h3 className="font-bold text-[#172033]">AI nhận xét nhanh</h3>
                      <p className="text-sm leading-relaxed text-[#5f6b7c]">{result.summary}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: 'Điểm', value: `${(result.score / 10).toFixed(1)}/10` },
                    { label: 'Lỗi cần sửa', value: String(result.corrections.length) },
                    { label: 'Điểm mạnh', value: String(result.strengths.length) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b8796]">{item.label}</div>
                      <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                      <PenTool size={14} /> Gợi ý sửa nổi bật
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-[#5f6b7c]">
                      {result.corrections.length > 0 ? result.corrections.map((correction) => (
                        <div key={`${correction.original}-${correction.corrected}`} className="rounded-lg bg-orange-50 px-4 py-3">
                          <span className="font-bold text-[#172033]">{correction.original}</span> → <span className="font-bold text-[#172033]">{correction.corrected}</span>
                          <p className="mt-1 text-xs">{correction.explanation}</p>
                        </div>
                      )) : <div className="rounded-lg bg-orange-50 px-4 py-3">Không có lỗi nổi bật cần sửa.</div>}
                      {result.rewritten && <div className="rounded-lg bg-[#f6efe6] px-4 py-3"><span className="font-bold text-[#172033]">Bản gợi ý:</span> {result.rewritten}</div>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                      <CheckCircle2 size={14} /> Điều anh đang làm tốt
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-[#5f6b7c]">
                      {result.strengths.length > 0 ? result.strengths.map((strength) => <div key={strength} className="rounded-lg bg-emerald-50 px-4 py-3">{strength}</div>) : <div className="rounded-lg bg-[#f0f2f5] px-4 py-3">AI chưa ghi nhận điểm mạnh nổi bật.</div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <FileText size={14} /> Brief gợi ý
            </div>
            <div className="mt-4 space-y-2.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => updateDraftText(prompt)}
                  className={`w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-left text-sm font-medium text-[#5f6b7c] transition-colors hover:bg-[#f6efe6] hover:text-orange-700 ${focusRing}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <Gauge size={14} /> Tiêu chí AI đang chấm
            </div>
            <div className="mt-4 space-y-2.5">
              {scoringItems.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-medium text-[#172033]">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" /> {item}
                </div>
              ))}
            </div>
          </div>

          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">
              <Clock3 size={14} /> Nhịp dùng tốt nhất
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5f6b7c]">Viết một đoạn ngắn sau khi ôn thẻ nhớ hoặc ngay trước khi vào speaking sẽ giúp AI bắt đúng lỗi đang lặp lại trong ngày.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

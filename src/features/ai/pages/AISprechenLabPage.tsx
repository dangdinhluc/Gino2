import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Clock3, Gauge, Mic, RotateCcw, Sparkles, Target, Volume2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const coachingItems = [
  'Giữ câu trả lời 2-3 ý ngắn, đừng cố nói dài.',
  'Nói chậm hơn một nhịp để rõ âm cuối.',
  'Lặp lại câu mẫu một lần trước khi trả lời tự do.',
];

export default function AISprechenLab() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasFeedback(true);
    } else {
      setIsRecording(true);
      setHasFeedback(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2 md:space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px] md:tracking-[0.2em]">
              <Sparkles size={14} />
              Speaking Lab
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Luyện nói với AI theo format gọn và rõ</h2>
            <Link to="/app/ai-speak/history" className="inline-flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-4 py-2.5 text-xs font-black text-gray-600 transition-all hover:border-orange-200 hover:text-orange-500">
              <Clock3 size={15} />
              Lịch sử luyện nói
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-[#e6ddd1] bg-[#fffaf3]/92 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.24)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">Chủ đề</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">1</div>
              <div className="mt-1 text-[10px] font-medium leading-tight text-orange-500 md:text-[11px]">đang luyện</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100/70 bg-blue-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-400 md:text-[10px] md:tracking-[0.18em]">Mục tiêu</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">Tokutei</div>
              <div className="mt-1 text-[10px] font-medium leading-tight text-blue-500 md:text-[11px]">phản xạ nói</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100/70 bg-emerald-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 md:text-[10px] md:tracking-[0.18em]">Feedback</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">AI</div>
              <div className="mt-1 text-[10px] font-medium leading-tight text-emerald-500 md:text-[11px]">phát âm + trôi chảy</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
        <div className="space-y-5 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Chủ đề hôm nay</p>
              <h3 className="text-2xl font-black tracking-tight text-gray-900">Tự giới thiệu và mục tiêu sang Nhật</h3>
              <p className="max-w-xl text-sm leading-relaxed text-gray-500">
                Tập trả lời ngắn, rõ âm và đúng nhịp. Khi dừng ghi âm, AI sẽ trả lại nhận xét ngay để anh biết cần sửa phát âm, độ trôi chảy hay độ an toàn của câu trả lời.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/70 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Đề bài mẫu</div>
              <div className="mt-1 text-sm font-black text-gray-900">Hãy tự giới thiệu và nói ngắn về mục tiêu làm việc tại Nhật.</div>
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(248,244,236,0.98)_100%)] p-6 shadow-[0_24px_54px_-40px_rgba(180,138,91,0.18)]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm">
                  <Volume2 size={15} className="text-orange-500" />
                  "Hãy tự giới thiệu và nói ngắn về mục tiêu làm việc tại Nhật."
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">
                  <Target size={14} />
                  Trả lời trong 30-45 giây
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-5 py-6">
                <div className="relative">
                  {isRecording && (
                    <>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0.4 }}
                        animate={{ scale: 1.35, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-orange-300"
                      />
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0.3 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                        className="absolute inset-0 rounded-full bg-amber-300"
                      />
                    </>
                  )}

                  <button
                    onClick={toggleRecording}
                    aria-label={isRecording ? 'Dừng ghi âm mock' : 'Bắt đầu ghi âm mock'}
                    aria-pressed={isRecording}
                    className={cn(
                      'relative z-10 flex h-28 w-28 items-center justify-center rounded-full text-white shadow-xl transition-all',
                      isRecording
                        ? 'scale-110 bg-red-500 shadow-red-200'
                        : 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-200 hover:scale-[1.03]'
                    )}
                  >
                    <Mic size={36} />
                  </button>
                </div>

                <div className="text-center">
                  <p className={cn('text-base font-black tracking-tight', isRecording ? 'text-red-500' : 'text-gray-800')}>
                    {isRecording ? 'AI đang lắng nghe...' : 'Nhấn để bắt đầu nói'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {isRecording ? 'Nói tự nhiên, ưu tiên câu ngắn và rõ âm cuối.' : 'Bấm lần nữa để dừng và nhận feedback.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Flow</div>
                  <div className="mt-1 text-sm font-black text-gray-900">Nghe đề</div>
                </div>
                <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Bước 2</div>
                  <div className="mt-1 text-sm font-black text-gray-900">Trả lời ngắn</div>
                </div>
                <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Bước 3</div>
                  <div className="mt-1 text-sm font-black text-gray-900">Nhận feedback</div>
                </div>
              </div>
            </div>
          </div>

          {hasFeedback && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/80 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Tổng quan</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">85%</div>
                </div>
                <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50/80 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">Trôi chảy</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">70%</div>
                </div>
                <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/80 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Phát âm</div>
                  <div className="mt-2 text-3xl font-black text-gray-900">Tốt</div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
                    <AlertTriangle size={14} />
                    Điểm cần sửa
                  </div>
                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-4 text-sm leading-relaxed text-orange-800">
                    Anh đang nói liền quá nhanh sau câu giới thiệu tên. Tách rõ nhịp giữa phần giới thiệu và mục tiêu sang Nhật sẽ giúp câu chắc, dễ nghe và tự nhiên hơn.
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-600">Phản xạ trả lời</span>
                    <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                    <CheckCircle2 size={14} />
                    Điều anh làm tốt
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3">Vào ý nhanh, không bị vòng vo.</div>
                    <div className="rounded-2xl bg-blue-50 px-4 py-3">Nhịp câu khá đều, phù hợp với format trả lời Tokutei ngắn gọn.</div>
                  </div>

                  <button
                    onClick={() => setHasFeedback(false)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 px-4 py-3 text-sm font-bold text-gray-600 transition-all hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
                  >
                    <RotateCcw size={16} />
                    Thử lại câu này
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <Gauge size={14} />
              Coaching nhanh
            </div>
            <div className="mt-4 space-y-3">
              {coachingItems.map((item) => (
                <div key={item} className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm font-semibold leading-relaxed text-gray-600">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(248,244,236,0.98)_100%)] p-5 shadow-[0_20px_48px_-36px_rgba(180,138,91,0.18)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
              <Clock3 size={14} />
              Nhịp đề xuất
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Warm up</div>
                <div className="mt-1 text-sm font-black text-gray-900">Nghe câu mẫu 1 lần</div>
              </div>
              <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Speaking</div>
                <div className="mt-1 text-sm font-black text-gray-900">Nói 30-45 giây</div>
              </div>
              <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Review</div>
                <div className="mt-1 text-sm font-black text-gray-900">Sửa 1 lỗi chính trước</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

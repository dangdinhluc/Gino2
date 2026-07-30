import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Clock3, Gauge, Mic, RotateCcw, Sparkles, Target, Volume2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

const coachingItems = [
  'Giữ câu trả lời 2-3 ý ngắn, đừng cố nói dài.',
  'Nói chậm hơn một nhịp để rõ âm cuối.',
  'Lặp lại câu mẫu một lần trước khi trả lời tự do.',
];

const flowSteps = [
  { label: 'Flow', value: 'Nghe đề' },
  { label: 'Bước 2', value: 'Trả lời ngắn' },
  { label: 'Bước 3', value: 'Nhận feedback' },
];

const pacing = [
  { label: 'Warm up', value: 'Nghe câu mẫu 1 lần' },
  { label: 'Speaking', value: 'Nói 30-45 giây' },
  { label: 'Review', value: 'Sửa 1 lỗi chính trước' },
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

  const heroStats = [
    { label: 'Chủ đề', value: '1', sub: 'đang luyện' },
    { label: 'Mục tiêu', value: 'Tokutei', sub: 'phản xạ nói' },
    { label: 'Feedback', value: 'AI', sub: 'phát âm + trôi chảy' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      <section className={panelClass}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <Sparkles size={14} /> Speaking Lab
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Luyện nói với AI theo format gọn và rõ</h1>
            <Link to="/app/ai-speak/history" className={`inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-2.5 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
              <Clock3 size={15} /> Lịch sử luyện nói
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {heroStats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 md:min-w-[6rem]">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">{stat.label}</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-lg font-bold leading-none text-[#172033] md:text-xl">{stat.value}</div>
                <div className="mt-1 text-[11px] text-[#95a0af]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.22fr_0.78fr]">
        <div className="space-y-5">
          <div className={panelClass}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#95a0af]">Chủ đề hôm nay</p>
                <h2 className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Tự giới thiệu và mục tiêu sang Nhật</h2>
                <p className="max-w-xl text-sm leading-relaxed text-[#5f6b7c]">Tập trả lời ngắn, rõ âm và đúng nhịp. Khi dừng ghi âm, AI sẽ trả lại nhận xét ngay để anh biết cần sửa phát âm, độ trôi chảy hay độ an toàn của câu trả lời.</p>
              </div>
              <div className="shrink-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">Đề bài mẫu</div>
                <div className="mt-1 text-sm font-bold text-[#172033]">Hãy tự giới thiệu và nói ngắn về mục tiêu làm việc tại Nhật.</div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-[#e8dccb] bg-white px-4 py-2 text-xs font-bold text-[#5f6b7c]">
                    <Volume2 size={15} className="text-orange-700" strokeWidth={1.8} />
                    "Hãy tự giới thiệu và nói ngắn về mục tiêu làm việc tại Nhật."
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">
                    <Target size={14} /> Trả lời trong 30-45 giây
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-5 py-6">
                  <div className="relative">
                    {isRecording && (
                      <>
                        <motion.div initial={{ scale: 0.9, opacity: 0.4 }} animate={{ scale: 1.35, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full bg-orange-300" />
                        <motion.div initial={{ scale: 0.9, opacity: 0.3 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }} className="absolute inset-0 rounded-full bg-orange-200" />
                      </>
                    )}
                    <button
                      onClick={toggleRecording}
                      aria-label={isRecording ? 'Dừng ghi âm mock' : 'Bắt đầu ghi âm mock'}
                      aria-pressed={isRecording}
                      className={cn(
                        'relative z-10 flex h-28 w-28 items-center justify-center rounded-full text-white transition-all',
                        focusRing,
                        isRecording ? 'scale-110 bg-red-500' : 'bg-orange-700 hover:bg-orange-800'
                      )}
                    >
                      <Mic size={36} />
                    </button>
                  </div>

                  <div className="text-center">
                    <p className={cn('font-bold', isRecording ? 'text-red-500' : 'text-[#172033]')}>
                      {isRecording ? 'AI đang lắng nghe...' : 'Nhấn để bắt đầu nói'}
                    </p>
                    <p className="mt-1 text-sm text-[#5f6b7c]">{isRecording ? 'Nói tự nhiên, ưu tiên câu ngắn và rõ âm cuối.' : 'Bấm lần nữa để dừng và nhận feedback.'}</p>
                  </div>
                </div>

                <div className="grid gap-2.5 md:grid-cols-3">
                  {flowSteps.map((step) => (
                    <div key={step.label} className="rounded-xl border border-[#e8dccb] bg-white px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">{step.label}</div>
                      <div className="mt-1 text-sm font-bold text-[#172033]">{step.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {hasFeedback && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: 'Tổng quan', value: '85%' },
                    { label: 'Trôi chảy', value: '70%' },
                    { label: 'Phát âm', value: 'Tốt' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b8796]">{item.label}</div>
                      <div className="mt-2 font-[var(--font-heading)] text-2xl font-bold text-[#172033]">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                      <AlertTriangle size={14} /> Điểm cần sửa
                    </div>
                    <div className="mt-4 rounded-lg bg-orange-50 px-4 py-4 text-sm leading-relaxed text-orange-800">Anh đang nói liền quá nhanh sau câu giới thiệu tên. Tách rõ nhịp giữa phần giới thiệu và mục tiêu sang Nhật sẽ giúp câu chắc, dễ nghe và tự nhiên hơn.</div>
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-[#e8dccb] px-4 py-3">
                      <span className="text-sm font-medium text-[#5f6b7c]">Phản xạ trả lời</span>
                      <div className="h-2 w-36 overflow-hidden rounded-full bg-[#efe5d7]">
                        <div className="h-full w-[70%] rounded-full bg-orange-700" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                      <CheckCircle2 size={14} /> Điều anh làm tốt
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-[#5f6b7c]">
                      <div className="rounded-lg bg-emerald-50 px-4 py-3">Vào ý nhanh, không bị vòng vo.</div>
                      <div className="rounded-lg bg-[#f0f2f5] px-4 py-3">Nhịp câu khá đều, phù hợp với format trả lời Tokutei ngắn gọn.</div>
                    </div>
                    <button
                      onClick={() => setHasFeedback(false)}
                      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8dccb] bg-white px-4 py-3 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}
                    >
                      <RotateCcw size={16} /> Thử lại câu này
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <Gauge size={14} /> Coaching nhanh
            </div>
            <div className="mt-4 space-y-2.5">
              {coachingItems.map((item) => (
                <div key={item} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-medium leading-relaxed text-[#5f6b7c]">{item}</div>
              ))}
            </div>
          </div>

          <div className={panelClass}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <Clock3 size={14} /> Nhịp đề xuất
            </div>
            <div className="mt-4 grid gap-2.5">
              {pacing.map((step) => (
                <div key={step.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">{step.label}</div>
                  <div className="mt-1 text-sm font-bold text-[#172033]">{step.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Clock3, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { FloatingAudioButton } from '@/src/features/games/components/FloatingAudioButton';
import { assets } from '@/src/shared/lib/assets';

type PracticeKind = 'vocabulary' | 'question' | 'all';

interface ScopeOption {
  id: string;
  title: string;
  subtitle: string;
  countText: string;
  icon: string;
}

const scopes: ScopeOption[] = [
  { id: 'all', title: 'Tất cả chủ đề', subtitle: 'Toàn bộ từ vựng & câu hỏi', countText: '120+ câu', icon: assets.practice.icons.goal },
  { id: 'workplace', title: 'Workplace cơ bản', subtitle: 'Từ vựng & hội thoại nơi làm việc', countText: '35 câu', icon: assets.practice.icons.vocabularyBook },
  { id: 'communication', title: 'Giao tiếp hàng ngày', subtitle: 'Phản xạ giao tiếp với đồng nghiệp', countText: '40 câu', icon: assets.practice.icons.flashcards },
  { id: 'advanced', title: 'Từ vựng Nâng cao', subtitle: 'Chuyên môn & an toàn lao động', countText: '30 câu', icon: assets.practice.icons.badgeOrangeAa },
  { id: 'grammar', title: 'Ngữ pháp mẫu câu', subtitle: 'Các mẫu ngữ pháp N4-N3 trọng tâm', countText: '25 câu', icon: assets.practice.icons.worksheetQuiz },
  { id: 'listening', title: 'Nghe hiểuTokutei', subtitle: 'Luyện phản xạ âm thanh & hội thoại', countText: '20 câu', icon: assets.practice.icons.listening },
];

const countOptions = [
  { count: 10, label: '10 câu', duration: '5 phút' },
  { count: 20, label: '20 câu', duration: '10 phút (Khuyên dùng)' },
  { count: 30, label: '30 câu', duration: '15 phút' },
];

export default function PracticePage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const streak = useProgressStore((state) => state.streak);

  // User selections
  const [selectedKind, setSelectedKind] = useState<PracticeKind>('vocabulary');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [selectedCount, setSelectedCount] = useState<number>(20);

  const handleStartPractice = () => {
    const params = new URLSearchParams({
      mode: 'cram',
      kind: selectedKind,
      scope: selectedScope,
      count: String(selectedCount),
    });
    navigate(`/app/review/flashcards?${params.toString()}`);
  };

  const selectedScopeData = scopes.find((s) => s.id === selectedScope) || scopes[0];

  return (
    <div className="mx-auto w-full max-w-[1080px] space-y-4 px-3.5 pb-28 sm:space-y-6 sm:px-6 sm:pb-32 lg:px-8">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-4 sm:p-6 shadow-2xs">
        {/* Background Kanji Watermark */}
        <div
          className="pointer-events-none absolute left-3 top-1 select-none text-3xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          練
        </div>

        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#d83a00] shadow-2xs sm:px-3 sm:py-1 sm:text-xs">
              <Sparkles size={12} className="text-amber-500 fill-amber-400" /> LUYỆN TẬP CHỦ ĐỘNG
            </div>
            <h1 className="font-[var(--font-heading)] text-xl font-black tracking-[-0.03em] text-[#0f172a] sm:text-3xl">
              Chế độ Luyện tập Phản xạ 🎯
            </h1>
            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm line-clamp-2 sm:line-clamp-none">
              Chọn chủ đề từ vựng, phạm vi ôn tập và thời gian phù hợp để kích hoạt phản xạ tự nhiên khi làm việc.
            </p>
          </div>

          <div className="relative shrink-0 block -my-1 -mr-1 sm:-my-2 sm:-mr-2">
            <img
              src={assets.practice.icons.heroWorkbook}
              alt="Hero workbook"
              className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-28 drop-shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-3 gap-1 rounded-[22px] border border-[#f5ece1] bg-white p-2.5 sm:p-4 shadow-[0_6px_20px_rgba(217,74,19,0.05)] divide-x divide-[#f5ece1]">
        {[
          { value: '12', label: 'bài đã luyện', icon: assets.practice.icons.completed },
          { value: '86%', label: 'độ chính xác', icon: assets.practice.icons.goal },
          { value: String(streak || 5), label: 'ngày liên tiếp', icon: assets.practice.icons.streak },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center justify-center text-center px-1 sm:px-2 space-y-0.5">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#717d8f] sm:text-xs">
              <img src={stat.icon} alt="" className="h-3.5 w-3.5 object-contain sm:h-4 sm:w-4" />
              <span className="truncate">{stat.label}</span>
            </div>
            <div className="font-[var(--font-heading)] text-base font-black text-[#0f172a] sm:text-xl">
              {stat.value}
            </div>
          </div>
        ))}
      </section>

      {/* Main Practice Configurator */}
      <div className="rounded-[24px] border border-[#eedecf] bg-white p-4 shadow-[0_8px_30px_rgba(63,45,24,0.05)] space-y-5 sm:p-6 sm:space-y-6">
        {/* Step 1: Select Mode */}
        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#ffead3] text-[11px] sm:text-xs font-extrabold text-[#d24a17]">1</span>
            <h2 className="font-[var(--font-heading)] text-sm sm:text-base font-extrabold tracking-[-0.02em] text-[#172033]">
              Chọn loại luyện tập
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {[
              {
                id: 'vocabulary' as const,
                label: 'Từ vựng',
                subLabel: 'Ôn từ & cụm từ',
                icon: assets.courses.workspace.vocabulary,
              },
              {
                id: 'question' as const,
                label: 'Câu hỏi',
                subLabel: 'Làm bài kiểm tra',
                icon: assets.courses.workspace.exam,
              },
              {
                id: 'all' as const,
                label: 'Hỗn hợp',
                subLabel: 'Kết hợp cả hai',
                icon: assets.courses.workspace.practice,
              },
            ].map((option) => {
              const isActive = selectedKind === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedKind(option.id)}
                  aria-pressed={isActive}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 sm:p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d83a00]/30 sm:min-h-[105px] ${
                    isActive
                      ? 'border-[#fde6d2] bg-gradient-to-br from-[#fff7f0] via-[#ffeedd] to-[#ffe5cf] shadow-2xs ring-2 ring-[#d83a00]'
                      : 'border-[#eee3d5] bg-white hover:border-orange-200 hover:bg-[#fffcf9]'
                  }`}
                >
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center p-0.5">
                    <img src={option.icon} alt="" className="h-full w-full object-contain" />
                  </div>
                  <span className="mt-1 font-[var(--font-heading)] text-xs font-black text-[#172033] sm:text-sm">
                    {option.label}
                  </span>
                  <span className="mt-0.5 hidden text-[10px] font-medium text-[#778292] sm:block">
                    {option.subLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Select Scope (Compact Dropdown Selector) */}
        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#ffead3] text-[11px] sm:text-xs font-extrabold text-[#d24a17]">2</span>
              <h2 className="font-[var(--font-heading)] text-sm sm:text-base font-extrabold tracking-[-0.02em] text-[#172033]">
                Chọn phạm vi ôn tập
              </h2>
            </div>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-[#b8501c] bg-[#fff0df] px-2 py-0.5 rounded-full">
              {scopes.length} danh mục
            </span>
          </div>

          {/* Compact Dropdown Select Bar */}
          <div className="relative">
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#e4d8c8] bg-white px-3 py-2 pr-8 text-xs font-extrabold text-[#172033] shadow-2xs transition hover:border-[#e46b33] focus:border-[#e46b33] focus:outline-none focus:ring-2 focus:ring-[#e46b33]/20 sm:px-3.5 sm:py-2.5 sm:pr-9 sm:text-sm cursor-pointer"
            >
              {scopes.map((scope) => (
                <option key={scope.id} value={scope.id}>
                  {scope.title} ({scope.countText}) - {scope.subtitle}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#778292]" aria-hidden="true" />
          </div>
        </section>

        {/* Step 3: Select Question Count & Time */}
        <section className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-orange-100 text-[11px] sm:text-xs font-black text-[#d83a00]">3</span>
            <h2 className="font-[var(--font-heading)] text-sm sm:text-base font-black tracking-[-0.01em] text-[#0f172a]">
              Số lượng câu & thời gian
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {countOptions.map((opt) => {
              const isActive = selectedCount === opt.count;
              return (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setSelectedCount(opt.count)}
                  aria-pressed={isActive}
                  className={`rounded-2xl border p-2 sm:p-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d83a00]/30 ${
                    isActive
                      ? 'border-[#fde6d2] bg-gradient-to-br from-[#fff7f0] via-[#ffeedd] to-[#ffe5cf] text-[#0f172a] shadow-2xs ring-2 ring-[#d83a00]'
                      : 'border-[#eee3d5] bg-white text-[#0f172a] hover:border-orange-200 hover:bg-[#fffcf9]'
                  }`}
                >
                  <div className={`font-[var(--font-heading)] text-xs font-black sm:text-base ${isActive ? 'text-[#d83a00]' : 'text-[#0f172a]'}`}>
                    {opt.label}
                  </div>
                  <div className={`mt-0.5 text-[10px] sm:text-[11px] font-extrabold truncate ${isActive ? 'text-[#c2410c]' : 'text-[#5f6b7c]'}`}>
                    {opt.duration}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Big Start Action Button */}
        <div className="pt-1 sm:pt-2">
          <button
            type="button"
            onClick={handleStartPractice}
            className="flex min-h-[48px] sm:min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] via-[#e65100] to-[#f26522] px-4 py-3 text-xs sm:text-base font-black text-white shadow-xs transition-all duration-200 hover:shadow-md hover:brightness-108 active:scale-[0.98]"
          >
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
              <Play size={13} fill="currentColor" aria-hidden="true" />
            </span>
            <span className="truncate">Bắt đầu ({selectedCount} câu • {selectedScopeData.title})</span>
            <ArrowRight size={16} aria-hidden="true" className="shrink-0" />
          </button>
        </div>
      </div>

      {/* Recent Practice Results Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-[var(--font-heading)] text-sm font-extrabold tracking-[-0.02em] text-[#172033] sm:text-lg">
            Lịch sử luyện tập gần đây
          </h2>
          <button
            type="button"
            onClick={() => navigate('/app/exams')}
            className="text-xs font-bold text-[#d24a17] hover:text-[#af390d] shrink-0"
          >
            Xem tất cả bài thi &gt;
          </button>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-[#ebe4da] bg-white shadow-[0_3px_12px_rgba(63,45,24,0.04)]">
          {[
            {
              title: 'Phản xạ phỏng vấn Tokutei',
              time: 'Hôm nay · 10:23',
              score: 88,
              detail: '13/15 câu đúng',
              minutes: '8 phút',
              icon: assets.practice.icons.goal,
              tone: 'bg-[#edf9e9]',
              scoreTone: 'text-emerald-600',
            },
            {
              title: 'Nghe hiểu an toàn đầu ca',
              time: 'Hôm qua · 15:40',
              score: 76,
              detail: '19/25 câu đúng',
              minutes: '11 phút',
              icon: assets.practice.icons.listening,
              tone: 'bg-[#f0edff]',
              scoreTone: 'text-amber-600',
            },
          ].map((result, index) => (
            <div key={result.title} className={`flex items-center gap-2.5 p-3 sm:p-4 ${index ? 'border-t border-[#f0e9df]' : ''}`}>
              <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl p-1.5 ${result.tone}`}>
                <img src={result.icon} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-[var(--font-heading)] text-xs sm:text-sm font-extrabold text-[#172033] truncate">
                  {result.title}
                </h3>
                <p className="mt-0.5 text-[10px] text-[#8190a0]">{result.time}</p>
              </div>
              <div className="hidden text-xs font-semibold text-[#677587] sm:block">
                <p>{result.detail}</p>
                <p className="mt-0.5">{result.minutes}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-[var(--font-heading)] text-base sm:text-lg font-extrabold ${result.scoreTone}`}>{result.score}%</p>
                <button
                  type="button"
                  onClick={() => navigate('/app/review/flashcards?mode=cram&replay=recent')}
                  className="mt-1 inline-flex min-h-6 items-center gap-0.5 rounded-lg border border-[#eeab7a] px-1.5 text-[10px] font-bold text-[#cf4c16] hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  Làm lại <RotateCcw size={11} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


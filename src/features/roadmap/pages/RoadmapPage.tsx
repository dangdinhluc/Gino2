import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, BookOpen, Check, ChevronDown, Gamepad2, GraduationCap, Layers, Lock, MapPin, RotateCcw, Sparkles, Star } from 'lucide-react';
import { roadmapLevels, type RoadmapLevelStatus } from '@/src/features/roadmap/mock/roadmapMock';
import { cn } from '@/src/lib/utils';

type RoadmapTab = 'roadmap' | 'vocab' | 'grammar' | 'games';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const detailTabs: { id: RoadmapTab; label: string }[] = [
  { id: 'roadmap', label: 'Lộ trình' },
  { id: 'vocab', label: 'Từ vựng' },
  { id: 'grammar', label: 'Ngữ pháp' },
  { id: 'games', label: 'Trò chơi' },
];

const statusMeta: Record<RoadmapLevelStatus, { label: string; className: string }> = {
  done: { label: 'Hoàn thành', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  current: { label: 'Đang học', className: 'border-orange-200 bg-orange-50 text-orange-700' },
  locked: { label: 'Sắp mở khóa', className: 'border-[#e8dccb] bg-[#fffdf8] text-[#95a0af]' },
};

// Độ lệch ngang tạo đường đi uốn lượn nhẹ như bản đồ hành trình.
const windOffsets = [-40, 0, 40, 0];

export default function RoadmapPage() {
  const initialLevelId = useMemo(
    () => (roadmapLevels.find((level) => level.status === 'current') ?? roadmapLevels[0]).id,
    []
  );
  const [selectedLevelId, setSelectedLevelId] = useState(initialLevelId);
  const [activeTab, setActiveTab] = useState<RoadmapTab>('roadmap');
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedLevel = roadmapLevels.find((level) => level.id === selectedLevelId) ?? roadmapLevels[0];
  const displayLevels = useMemo(() => [...roadmapLevels].reverse(), []);
  const currentIndex = roadmapLevels.findIndex((level) => level.status === 'current');
  const journeyStep = currentIndex >= 0 ? currentIndex + 1 : 1;

  const handleSelectLevel = (levelId: string) => {
    setSelectedLevelId(levelId);
    setActiveTab('roadmap');
    setExpandedWeekId(null);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleReplay = () => {
    handleSelectLevel(roadmapLevels[0].id);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5 md:pb-16">
      <section className="overflow-hidden rounded-3xl border border-[#e8dccb] bg-[linear-gradient(135deg,#fff3e2_0%,#fffaf3_55%,#ffe9d3_100%)] p-6 md:p-8">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
          <MapPin size={14} aria-hidden="true" focusable="false" /> Hành trình học tập
        </div>
        <h1 className="mt-3 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">
          Hành trình tiếng Nhật của bạn
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#5f6b7c]">
          Từ người mới bắt đầu đến thành thạo Tokutei — mỗi cột mốc là một chặng chinh phục.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full border border-[#e8dccb] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#5f6b7c]">
            <Star size={14} className="text-orange-600" aria-hidden="true" focusable="false" /> {roadmapLevels.length} chặng
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
            <Sparkles size={14} aria-hidden="true" focusable="false" /> Đang ở chặng {journeyStep}/{roadmapLevels.length}
          </span>
          <button type="button" onClick={handleReplay} className={cn('flex items-center gap-1.5 rounded-full border border-[#e8dccb] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}>
            <RotateCcw size={14} aria-hidden="true" focusable="false" /> Xem lại từ đầu
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="sr-only">Bản đồ hành trình</h2>
        <ol className="relative mx-auto flex max-w-md flex-col items-center">
          {displayLevels.map((level, index) => {
            const selected = level.id === selectedLevelId;
            const offset = windOffsets[index % windOffsets.length];
            const meta = statusMeta[level.status];
            return (
              <li key={level.id} className="relative flex w-full flex-col items-center">
                {index > 0 && (
                  <span aria-hidden="true" className="h-10 w-1 rounded-full bg-[repeating-linear-gradient(180deg,#e2d4c0_0,#e2d4c0_6px,transparent_6px,transparent_12px)]" />
                )}
                <button
                  type="button"
                  onClick={() => handleSelectLevel(level.id)}
                  style={{ transform: `translateX(${offset}px)` }}
                  aria-pressed={selected}
                  className={cn('group flex flex-col items-center gap-2 rounded-2xl p-1', focusRing)}
                >
                  <span className={cn('relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-3xl shadow-md ring-4 transition-transform group-hover:scale-105', level.accent, selected ? 'ring-orange-300' : 'ring-white')}>
                    <span className={cn(level.status === 'locked' && 'opacity-70 grayscale')}>{level.emoji}</span>
                    {level.status === 'done' && (
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow">
                        <Check size={13} strokeWidth={3} aria-hidden="true" focusable="false" />
                      </span>
                    )}
                    {level.status === 'locked' && (
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#b6a892] text-white shadow">
                        <Lock size={12} strokeWidth={2.5} aria-hidden="true" focusable="false" />
                      </span>
                    )}
                    {level.status === 'current' && (
                      <span aria-hidden="true" className="absolute -inset-1 animate-ping rounded-full border-2 border-orange-300/70" />
                    )}
                  </span>
                  <span className="flex flex-col items-center">
                    <span className={cn('text-sm font-bold', selected ? 'text-orange-700' : 'text-[#172033]')}>{level.code}</span>
                    <span className="text-[11px] text-[#7b8796]">{level.landmark}</span>
                    <span className={cn('mt-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', meta.className)}>{meta.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
          <span aria-hidden="true" className="mt-2 h-10 w-1 rounded-full bg-[repeating-linear-gradient(180deg,#e2d4c0_0,#e2d4c0_6px,transparent_6px,transparent_12px)]" />
          <div className="mt-2 flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            🌱 Bắt đầu tại đây
          </div>
        </ol>
      </section>

      <section ref={detailRef} className="mt-10 scroll-mt-4">
        <div className="overflow-hidden rounded-3xl border border-[#e8dccb] bg-[#fffaf3]">
          <div className={cn('flex items-start gap-4 bg-gradient-to-br p-6 md:p-7', selectedLevel.accent)}>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-4xl backdrop-blur-sm">
              {selectedLevel.emoji}
            </span>
            <div className="min-w-0 flex-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold">{selectedLevel.code}</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{statusMeta[selectedLevel.status].label}</span>
              </div>
              <h2 className="mt-2 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] md:text-2xl">{selectedLevel.title}</h2>
              <p className="mt-1 text-sm text-white/85">{selectedLevel.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-lg bg-white/20 px-2.5 py-1">⏱ {selectedLevel.duration}</span>
                <span className="rounded-lg bg-white/20 px-2.5 py-1">📚 {selectedLevel.wordCount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-[#efe5d7] px-3 pt-3">
            {detailTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={active}
                  className={cn('shrink-0 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors', active ? 'border-b-2 border-orange-700 text-orange-700' : 'text-[#7b8796] hover:text-[#172033]', focusRing)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={`${selectedLevel.id}-${activeTab}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {activeTab === 'roadmap' && (
                  <ol className="space-y-3">
                    {selectedLevel.weeks.map((week, index) => {
                      const open = expandedWeekId === week.id;
                      return (
                        <li key={week.id} className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8]">
                          <button
                            type="button"
                            onClick={() => setExpandedWeekId((prev) => (prev === week.id ? null : week.id))}
                            aria-expanded={open}
                            className={cn('flex w-full items-center gap-3 px-4 py-3.5 text-left', focusRing)}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-700 text-sm font-bold text-white">{index + 1}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-orange-700">{week.period}</span>
                              <span className="block truncate text-sm font-bold text-[#172033]">{week.title}</span>
                            </span>
                            <ChevronDown size={18} className={cn('shrink-0 text-[#95a0af] transition-transform', open && 'rotate-180')} aria-hidden="true" focusable="false" />
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="border-t border-[#efe5d7] px-4 py-4">
                                  <p className="flex items-start gap-2 text-sm text-[#5f6b7c]">
                                    <Sparkles size={15} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" focusable="false" />
                                    {week.tip}
                                  </p>
                                  <ul className="mt-3 space-y-1.5">
                                    {week.details.map((detail) => (
                                      <li key={detail} className="flex items-start gap-2 text-sm text-[#4d5a6b]">
                                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                                        <span lang="ja">{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {week.actions.map((action) => (
                                      <Link key={action.label} to={action.path} className={cn('inline-flex items-center gap-1.5 rounded-xl bg-orange-700 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-800', focusRing)}>
                                        {action.label} <ArrowRight size={13} aria-hidden="true" focusable="false" />
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                  </ol>
                )}

                {activeTab === 'vocab' && <RoadmapTabList icon={Layers} items={selectedLevel.vocab} />}
                {activeTab === 'grammar' && <RoadmapTabList icon={BookOpen} items={selectedLevel.grammar} />}
                {activeTab === 'games' && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedLevel.games.map((game) => (
                      <Link key={game.label} to={game.path} className={cn('group flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4 transition-colors hover:border-orange-300', focusRing)}>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                          <Gamepad2 size={20} aria-hidden="true" focusable="false" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-[#172033]">{game.label}</span>
                          <span className="block text-xs text-[#7b8796]">{game.note}</span>
                        </span>
                        <ArrowRight size={16} className="shrink-0 text-[#95a0af] transition-transform group-hover:translate-x-0.5" aria-hidden="true" focusable="false" />
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <Link to="/app/courses" className={cn('mt-5 flex items-center justify-center gap-2 rounded-2xl bg-orange-700 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-orange-800', focusRing)}>
          <GraduationCap size={17} aria-hidden="true" focusable="false" /> Vào học chặng {selectedLevel.code}
        </Link>
      </section>
    </div>
  );
}

function RoadmapTabList({ icon: Icon, items }: { icon: typeof Layers; items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
            <Icon size={16} aria-hidden="true" focusable="false" />
          </span>
          <span lang="ja" className="text-sm leading-relaxed text-[#4d5a6b]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

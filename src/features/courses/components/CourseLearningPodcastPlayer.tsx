import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Headphones, Pause, Play, Sparkles, Volume2, X } from 'lucide-react';
import { type CoursePodcastItem } from '@/src/features/courses/mock/courseLearningMock';
import { cn } from '@/src/lib/utils';

interface CourseLearningPodcastPlayerProps {
  activePodcast: CoursePodcastItem;
  isOpen: boolean;
  isPlaying: boolean;
  podcasts: CoursePodcastItem[];
  onClose: () => void;
  onOpen?: () => void;
  onSelectPodcast: (podcastId: string) => void;
  onTogglePlay: () => void;
}

export function CourseLearningPodcastPlayer({
  activePodcast,
  isOpen,
  isPlaying,
  podcasts,
  onClose,
  onSelectPodcast,
  onTogglePlay,
}: CourseLearningPodcastPlayerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-podcast-title"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[28px] border border-[#fde6d2] bg-white p-5 sm:p-6 shadow-2xl space-y-4"
          >
            {/* Header: Badge & Close Button */}
            <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00]">
                  <Sparkles size={12} className="text-amber-500 fill-amber-400" /> PODCAST KHÓA HỌC
                </div>
                <h3 id="course-podcast-title" className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
                  Audio Bài học & Phản xạ 🎧
                </h3>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                aria-label="Đóng trình phát âm thanh"
              >
                <X size={16} />
              </button>
            </div>

            {/* Hero Now Playing Card */}
            <div className="rounded-[22px] border border-[#fde6d2] bg-gradient-to-br from-[#fff7f0] via-[#ffeedd] to-[#ffe5cf] p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-3.5">
                {/* 3D Play / Pause Button */}
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-white shadow-md transition-transform duration-200 hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? 'Tạm dừng podcast' : 'Phát podcast'}
                >
                  {isPlaying ? (
                    <Pause size={22} className="fill-white" />
                  ) : (
                    <Play size={22} className="translate-x-0.5 fill-white" />
                  )}
                </button>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#c2410c]">
                    <span>{activePodcast.episode}</span>
                    <span>•</span>
                    <span>{activePodcast.duration}</span>
                  </div>
                  <h4 className="font-[var(--font-heading)] text-sm font-black text-[#0f172a] truncate">
                    {activePodcast.title}
                  </h4>
                  <p className="text-xs font-semibold text-[#5f6b7c] truncate">
                    {activePodcast.summary}
                  </p>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-[#9a3412]">
                  <span>{isPlaying ? 'Đang phát...' : 'Tạm dừng'}</span>
                  <span className="flex items-center gap-1">
                    <Volume2 size={12} /> {isPlaying ? '67%' : '33%'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/80 p-0.5 shadow-2xs">
                  <div
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522] transition-all duration-300',
                      isPlaying ? 'w-2/3' : 'w-1/3'
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Episode List */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-[#717d8f] uppercase tracking-wider">
                Danh sách tập ({podcasts.length})
              </span>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {podcasts.map((podcast) => {
                  const isActive = activePodcast.id === podcast.id;
                  return (
                    <button
                      key={podcast.id}
                      type="button"
                      onClick={() => onSelectPodcast(podcast.id)}
                      className={cn(
                        'flex items-center justify-between gap-3 w-full rounded-2xl border p-3 text-left transition-all duration-200',
                        isActive
                          ? 'border-[#fde6d2] bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] shadow-2xs ring-2 ring-[#d83a00]'
                          : 'border-[#f5ece1] bg-white hover:border-orange-200 hover:bg-[#fffcf9]'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black',
                            isActive
                              ? 'bg-[#d83a00] text-white shadow-2xs'
                              : 'bg-slate-100 text-[#5f6b7c]'
                          )}
                        >
                          {isActive && isPlaying ? (
                            <Pause size={14} fill="currentColor" />
                          ) : (
                            <Play size={14} fill="currentColor" className="translate-x-0.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className={cn('text-xs font-black truncate', isActive ? 'text-[#d83a00]' : 'text-[#0f172a]')}>
                            {podcast.episode}: {podcast.title}
                          </p>
                          <p className="text-[11px] font-semibold text-[#717d8f]">{podcast.duration}</p>
                        </div>
                      </div>

                      {podcast.isNew && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-[#059669] border border-emerald-200/60 shrink-0">
                          Mới
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

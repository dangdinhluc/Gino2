import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Headphones, Pause, Play, X } from 'lucide-react';
import { type CoursePodcastItem } from '@/src/features/courses/mock/courseLearningMock';
import { cn } from '@/src/lib/utils';

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

interface CourseLearningPodcastPlayerProps {
  activePodcast: CoursePodcastItem;
  isOpen: boolean;
  isPlaying: boolean;
  podcasts: CoursePodcastItem[];
  onClose: () => void;
  onOpen: () => void;
  onSelectPodcast: (podcastId: string) => void;
  onTogglePlay: () => void;
}

export function CourseLearningPodcastPlayer({ activePodcast, isOpen, isPlaying, podcasts, onClose, onOpen, onSelectPodcast, onTogglePlay }: CourseLearningPodcastPlayerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
      return;
    }

    if (!previousFocusRef.current) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current;
    }
    closeButtonRef.current?.focus();

    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={onOpen} title="Mở podcast" className={cn('fixed bottom-[calc(8.25rem+env(safe-area-inset-bottom))] right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-orange-200 bg-orange-700 p-0 text-white shadow-[0_22px_44px_-24px_rgba(249,115,22,0.7)] transition-transform hover:scale-105 md:bottom-[calc(6.75rem+env(safe-area-inset-bottom))] md:right-8 xl:bottom-[calc(7rem+env(safe-area-inset-bottom))] xl:right-8', focusRing)} aria-label="Mở podcast" aria-haspopup="dialog" aria-expanded={isOpen} aria-controls="course-podcast-popover">
        <Headphones size={21} aria-hidden="true" focusable="false" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div ref={dialogRef} id="course-podcast-popover" role="dialog" aria-labelledby="course-podcast-title" tabIndex={-1} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }} className="fixed bottom-[calc(12rem+env(safe-area-inset-bottom))] right-4 z-[70] max-h-[calc(100dvh-15rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_70px_-34px_rgba(17,24,39,0.36)] md:bottom-[calc(10rem+env(safe-area-inset-bottom))] md:right-8 xl:bottom-24 xl:right-7">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Podcast khóa học</p>
                <h3 id="course-podcast-title" className="mt-1 text-lg font-black text-gray-900">{activePodcast.title}</h3>
                <p className="text-xs font-semibold text-gray-500">{activePodcast.episode} • {activePodcast.duration}</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={onClose} className={cn('flex h-11 w-11 items-center justify-center rounded-full bg-[#f5efe6] text-gray-500 hover:bg-[#eee6dc]', focusRing)} aria-label="Đóng podcast">
                <X size={18} aria-hidden="true" focusable="false" />
              </button>
            </div>

            <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={onTogglePlay} className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-700 text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.65)]', focusRing)} aria-label={isPlaying ? 'Tạm dừng podcast mock' : 'Phát podcast mock'}>
                  {isPlaying ? <Pause size={22} className="fill-white" aria-hidden="true" focusable="false" /> : <Play size={22} className="translate-x-0.5 fill-white" aria-hidden="true" focusable="false" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-gray-900">{activePodcast.summary}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Tiến độ podcast mock" aria-valuenow={isPlaying ? 67 : 33} aria-valuemin={0} aria-valuemax={100} aria-valuetext={isPlaying ? '67% podcast đã phát' : '33% podcast đã phát'}>
                    <div className={cn('h-full rounded-full bg-orange-700', isPlaying ? 'w-2/3' : 'w-1/3')} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {podcasts.map((podcast) => (
                <button key={podcast.id} type="button" onClick={() => onSelectPodcast(podcast.id)} aria-current={activePodcast.id === podcast.id ? 'true' : undefined} className={cn('flex min-h-11 w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors', activePodcast.id === podcast.id ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e6ddd1] bg-white text-gray-600 hover:bg-orange-50/50', focusRing)}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{podcast.episode}: {podcast.title}</p>
                    <p className="text-xs font-semibold opacity-70">{podcast.duration}</p>
                  </div>
                  {podcast.isNew && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">Mới</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

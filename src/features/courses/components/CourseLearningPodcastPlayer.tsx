import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Headphones, Pause, Play, Sparkles, X } from 'lucide-react';
import { type CoursePodcastItem } from '@/src/features/courses/courseLearning.types';
import { createSignedCourseAssetUrl } from '@/src/features/courses/repositories/courseLearningRepository';
import { cn } from '@/src/lib/utils';

interface CourseLearningPodcastPlayerProps {
  activePodcast: CoursePodcastItem;
  isOpen: boolean;
  podcasts: CoursePodcastItem[];
  onClose: () => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onSelectPodcast: (podcastId: string) => void;
}

function formatElapsed(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export function CourseLearningPodcastPlayer({
  activePodcast,
  isOpen,
  podcasts,
  onClose,
  onPlayingChange,
  onSelectPodcast,
}: CourseLearningPodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      audioRef.current?.pause();
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
      return;
    }

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    let cancelled = false;
    audioRef.current?.pause();
    setAudioUrl(null);
    setAudioError(null);
    setProgress(0);
    setElapsed(0);
    if (!activePodcast.storagePath && !activePodcast.externalUrl) {
      setAudioError('Audio này chưa được xuất bản.');
      return;
    }

    setIsLoadingAudio(true);
    const source = activePodcast.storagePath
      ? createSignedCourseAssetUrl(activePodcast.storagePath)
      : Promise.resolve(activePodcast.externalUrl ?? '');
    source
      .then((url) => { if (!cancelled) setAudioUrl(url); })
      .catch((error: unknown) => { if (!cancelled) setAudioError(error instanceof Error ? error.message : 'Không mở được audio riêng tư.'); })
      .finally(() => { if (!cancelled) setIsLoadingAudio(false); });
    return () => { cancelled = true; };
  }, [activePodcast.id, activePodcast.externalUrl, activePodcast.storagePath]);

  function setPlaybackState(next: boolean): void {
    setIsPlaying(next);
    onPlayingChange?.(next);
  }

  async function togglePlayback(): Promise<void> {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch (error: unknown) {
      setAudioError(error instanceof Error ? error.message : 'Trình duyệt không thể phát audio này.');
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs" onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="course-podcast-title" initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }} transition={{ duration: 0.2 }} onClick={(event) => event.stopPropagation()} className="relative max-h-[calc(100vh-3rem)] w-full max-w-md space-y-4 overflow-y-auto rounded-[28px] border border-[#fde6d2] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#d83a00]"><Sparkles size={12} className="fill-amber-400 text-amber-500" /> Podcast khóa học</div>
                <h3 id="course-podcast-title" className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">Audio bài học</h3>
              </div>
              <button ref={closeButtonRef} type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Đóng trình phát âm thanh"><X size={16} /></button>
            </div>

            <div className="space-y-3 rounded-[22px] border border-[#fde6d2] bg-gradient-to-br from-[#fff7f0] via-[#ffeedd] to-[#ffe5cf] p-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <button type="button" onClick={() => void togglePlayback()} disabled={!audioUrl} className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d83a00] to-[#f26522] text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50" aria-label={isPlaying ? 'Tạm dừng podcast' : 'Phát podcast'}>{isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="translate-x-0.5 fill-white" />}</button>
                <div className="min-w-0 flex-1 space-y-0.5"><div className="text-[11px] font-extrabold text-[#c2410c]">{activePodcast.episode} · {activePodcast.duration}</div><h4 className="truncate font-[var(--font-heading)] text-sm font-black text-[#0f172a]">{activePodcast.title}</h4><p className="truncate text-xs font-semibold text-[#5f6b7c]">{activePodcast.summary}</p></div>
              </div>
              {isLoadingAudio && <p className="text-xs font-semibold text-[#9a3412]">Đang tạo liên kết audio riêng tư…</p>}
              {audioError && <p className="text-xs font-semibold text-red-700">{audioError}</p>}
              {audioUrl && <><div className="flex items-center justify-between text-[10px] font-extrabold text-[#9a3412]"><span>{isPlaying ? 'Đang phát' : 'Sẵn sàng phát'}</span><span>{formatElapsed(elapsed)} · {Math.round(progress)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/80 p-0.5"><div className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f26522] transition-all" style={{ width: `${progress}%` }} /></div><audio ref={audioRef} src={audioUrl} controls className="mt-2 w-full" onPlay={() => setPlaybackState(true)} onPause={() => setPlaybackState(false)} onEnded={() => setPlaybackState(false)} onTimeUpdate={(event) => { const { currentTime, duration } = event.currentTarget; setElapsed(currentTime); setProgress(Number.isFinite(duration) && duration > 0 ? currentTime / duration * 100 : 0); }} onError={() => setAudioError('Không thể phát audio này.')} /></>}
            </div>

            <div className="space-y-2"><span className="text-[11px] font-extrabold uppercase tracking-wider text-[#717d8f]">Danh sách tập ({podcasts.length})</span><div className="max-h-52 space-y-2 overflow-y-auto pr-1">{podcasts.map((podcast) => { const isActive = activePodcast.id === podcast.id; return <button key={podcast.id} type="button" onClick={() => onSelectPodcast(podcast.id)} className={cn('flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all', isActive ? 'border-[#fde6d2] bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] ring-2 ring-[#d83a00]' : 'border-[#f5ece1] bg-white hover:border-orange-200')}><div className="flex min-w-0 items-center gap-3"><span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isActive ? 'bg-[#d83a00] text-white' : 'bg-slate-100 text-[#5f6b7c]')}>{isActive && isPlaying ? <Pause size={14} fill="currentColor" /> : <Headphones size={14} />}</span><div className="min-w-0"><p className={cn('truncate text-xs font-black', isActive ? 'text-[#d83a00]' : 'text-[#0f172a]')}>{podcast.episode}: {podcast.title}</p><p className="text-[11px] font-semibold text-[#717d8f]">{podcast.duration}</p></div></div>{podcast.isNew && <span className="shrink-0 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-[#059669]">Mới</span>}</button>; })}</div></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

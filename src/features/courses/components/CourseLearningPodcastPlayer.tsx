import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
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

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2] as const;

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
  const progressBarRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      audioRef.current?.pause();
      setIsPlaying(false);
      onPlayingChange?.(false);
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
  }, [isOpen, onPlayingChange]);

  useEffect(() => {
    let cancelled = false;
    audioRef.current?.pause();
    setIsPlaying(false);
    onPlayingChange?.(false);
    setAudioUrl(null);
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);

    if (!activePodcast.storagePath && !activePodcast.externalUrl) {
      setAudioError('Audio bài học này chưa được tải lên hệ thống.');
      return;
    }

    setIsLoadingAudio(true);
    const source = activePodcast.storagePath
      ? createSignedCourseAssetUrl(activePodcast.storagePath)
      : Promise.resolve(activePodcast.externalUrl ?? '');

    source
      .then((url) => {
        if (!cancelled) setAudioUrl(url);
      })
      .catch((error: unknown) => {
        if (!cancelled) setAudioError(error instanceof Error ? error.message : 'Không thể tải file audio riêng tư.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAudio(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activePodcast.id, activePodcast.externalUrl, activePodcast.storagePath, onPlayingChange]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        onPlayingChange?.(true);
      } catch (err) {
        setAudioError(err instanceof Error ? err.message : 'Trình duyệt không thể phát audio này.');
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      onPlayingChange?.(false);
    }
  };

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressBarRef.current;
    if (!audio || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration || Infinity));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed as (typeof SPEED_OPTIONS)[number]);
    const nextSpeed = SPEED_OPTIONS[(currentIndex + 1) % SPEED_OPTIONS.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Audio bài học"
        >
          <motion.div
            initial={{ scale: 0.95, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 14, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[85dvh] w-full max-w-[400px] flex-col overflow-hidden rounded-[24px] border border-[#fde6d2] bg-[#fffaf5] shadow-2xl"
          >
            {/* 1. Header (Compact) */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#f5ece1] bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#d83a00] to-[#f27427] text-white shadow-2xs">
                  <Headphones size={14} strokeWidth={2.4} />
                </span>
                <h3 className="font-[var(--font-heading)] text-sm font-black text-[#0f172a]">
                  Podcast bài học
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#717d8f] shadow-2xs transition-colors hover:bg-white hover:text-[#d83a00]"
                aria-label="Đóng trình phát âm thanh"
              >
                <X size={15} />
              </button>
            </div>

            {/* Hidden native audio element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                onPlay={() => {
                  setIsPlaying(true);
                  onPlayingChange?.(true);
                }}
                onPause={() => {
                  setIsPlaying(false);
                  onPlayingChange?.(false);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  onPlayingChange?.(false);
                }}
                onTimeUpdate={(event) => {
                  const { currentTime: curr, duration: dur } = event.currentTarget;
                  setCurrentTime(curr);
                  if (Number.isFinite(dur) && dur > 0) setDuration(dur);
                }}
                onLoadedMetadata={(event) => {
                  const dur = event.currentTarget.duration;
                  if (Number.isFinite(dur) && dur > 0) setDuration(dur);
                }}
                onError={() => {
                  setAudioError('Không thể phát file âm thanh này.');
                  setIsPlaying(false);
                  onPlayingChange?.(false);
                }}
              />
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5 sm:p-5">
              {/* 2. Compact Player Card */}
              <div className="rounded-[20px] border border-orange-200/90 bg-gradient-to-b from-white via-[#fffdf9] to-[#fff7f0] p-4 shadow-2xs">
                {/* Track Info Row */}
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d83a00] to-[#f27427] text-white shadow-xs">
                    <Headphones size={20} strokeWidth={2.2} />
                    {isPlaying && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white opacity-80" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#c2410c]">
                      {activePodcast.episode} · {activePodcast.duration}
                    </span>
                    <h4 className="truncate font-[var(--font-heading)] text-sm font-black text-[#0f172a]">
                      {activePodcast.title}
                    </h4>
                  </div>

                  {/* Equalizer animation */}
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
                      {[35, 90, 60, 100, 70].map((height, i) => (
                        <span
                          key={i}
                          className="w-0.5 rounded-full bg-[#d83a00] animate-pulse"
                          style={{ height: `${height}%`, animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Status messages */}
                {isLoadingAudio && (
                  <p className="mt-2.5 text-center text-[11px] font-bold text-[#c2410c]">
                    Đang kết nối audio bài học…
                  </p>
                )}
                {audioError && (
                  <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800">
                    <AlertCircle size={13} className="shrink-0 text-amber-600" />
                    <span className="truncate">{audioError}</span>
                  </div>
                )}

                {/* 3. Scrub Progress Bar */}
                <div className="mt-3.5 space-y-1">
                  <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="group relative h-2 w-full cursor-pointer rounded-full bg-orange-100 p-0.5"
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={duration || 100}
                    aria-valuenow={currentTime}
                    aria-label="Thanh thời gian nghe"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f27427]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-extrabold text-[#8c97a8]">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-[#c2410c]">{isPlaying ? 'Đang phát' : 'Sẵn sàng'}</span>
                    <span>{duration > 0 ? formatTime(duration) : activePodcast.duration}</span>
                  </div>
                </div>

                {/* 4. Controls Bar */}
                <div className="mt-3 flex items-center justify-between gap-1 border-t border-[#f5ece1] pt-3">
                  {/* Speed button */}
                  <button
                    type="button"
                    onClick={cycleSpeed}
                    className="rounded-lg border border-orange-200/90 bg-white px-2 py-1 text-[11px] font-black text-[#5f6b7c] shadow-2xs hover:text-[#d83a00] active:scale-95"
                    title="Tốc độ phát"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Play Controls Center */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSkip(-10)}
                      disabled={!audioUrl}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#717d8f] hover:bg-orange-50 hover:text-[#d83a00] active:scale-95 disabled:opacity-30"
                      title="Lùi 10s"
                    >
                      <RotateCcw size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handlePlayPause()}
                      disabled={!audioUrl}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d83a00] to-[#ea580c] text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                      aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                    >
                      {isPlaying ? (
                        <Pause size={18} className="fill-white" />
                      ) : (
                        <Play size={18} className="translate-x-0.5 fill-white" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSkip(10)}
                      disabled={!audioUrl}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#717d8f] hover:bg-orange-50 hover:text-[#d83a00] active:scale-95 disabled:opacity-30"
                      title="Tới 10s"
                    >
                      <RotateCw size={15} />
                    </button>
                  </div>

                  {/* Volume toggle */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#717d8f] hover:text-[#d83a00] active:scale-95"
                    title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                </div>
              </div>

              {/* 5. Playlist Episodes (Compact List) */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#8c97a8]">
                  Danh sách bài nghe ({podcasts.length})
                </p>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                  {podcasts.map((podcast) => {
                    const isActive = activePodcast.id === podcast.id;
                    return (
                      <button
                        key={podcast.id}
                        type="button"
                        onClick={() => onSelectPodcast(podcast.id)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-left transition-all active:scale-[0.98]',
                          isActive
                            ? 'border-orange-300 bg-gradient-to-r from-[#fff7f0] to-[#ffeedd] shadow-2xs font-bold'
                            : 'border-[#f0e5d8] bg-white hover:border-orange-200 hover:bg-[#fffaf5]'
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs',
                              isActive ? 'bg-[#d83a00] text-white' : 'bg-orange-50 text-[#d83a00]'
                            )}
                          >
                            {isActive && isPlaying ? (
                              <Pause size={11} fill="currentColor" />
                            ) : (
                              <Headphones size={11} />
                            )}
                          </span>
                          <span className={cn('truncate text-xs', isActive ? 'text-[#d83a00] font-black' : 'text-[#172033] font-bold')}>
                            {podcast.episode}: {podcast.title}
                          </span>
                        </div>

                        <span className="shrink-0 text-[10px] font-semibold text-[#8c97a8]">
                          {podcast.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}


import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, RotateCcw, Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { recordGameCompletion, type GameCompletionAward } from '@/src/features/games/repositories/gamesRepository';
import { type VocabRound } from '@/src/features/games/data/vocabData';

interface Pipe {
  id: number;
  x: number;
  gapY: number;
  word: string;
  meaning: string;
  options: string[];
  sourceId: string;
  passed: boolean;
  scored: boolean;
}

interface FlappyVocabProps {
  courseId?: string;
  rounds?: VocabRound[];
  returnTo?: string;
  courseTitle?: string;
}

const GRAVITY = 0.3;
const JUMP = -6;
const PIPE_SPEED = 1.8;
const PIPE_WIDTH = 56;
const GAP_SIZE = 200;
const BIRD_X = 70;
const BIRD_SIZE = 28;
const GAME_W = 380;
const GAME_H = 640;
const PIPE_SPAWN_DIST = 280;
const GROUND_H = 60;

function shuffled(correct: string, pool: string[]): string[] {
  const others = pool.filter((o) => o !== correct).sort(() => Math.random() - 0.5).slice(0, 3);
  return [correct, ...others].sort(() => Math.random() - 0.5);
}

function getHighScore(): number {
  try { return Number(localStorage.getItem('flappy-vocab-best') || '0'); } catch { return 0; }
}
function setHighScore(s: number) {
  try { localStorage.setItem('flappy-vocab-best', String(s)); } catch { /* */ }
}

export function FlappyVocab({ courseId, rounds, returnTo = '/app/hub', courseTitle }: FlappyVocabProps) {
  const [state, setState] = useState<'ready' | 'flying' | 'question' | 'over'>('ready');
  const [birdY, setBirdY] = useState(GAME_H / 2 - 40);
  const [vel, setVel] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(getHighScore);
  const [currentQ, setCurrentQ] = useState<Pipe | null>(null);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [bgOffset, setBgOffset] = useState(0);
  const [grace, setGrace] = useState(false);
  const frameRef = useRef(0);
  const pipeId = useRef(0);
  const speedRef = useRef(PIPE_SPEED);
  const graceRef = useRef(false);
  const completionRecorded = useRef(false);
  const [completionAward, setCompletionAward] = useState<GameCompletionAward | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const roundPool = useMemo(() => rounds ?? [], [rounds]);
  const showCourseReturn = returnTo !== '/app/hub';

  const spawnPipe = useCallback((): Pipe => {
    const item = roundPool[Math.floor(Math.random() * roundPool.length)]!;
    pipeId.current += 1;
    const gapY = 100 + Math.random() * (GAME_H - GROUND_H - GAP_SIZE - 200);
    return {
      id: pipeId.current, x: GAME_W + 20, gapY,
      word: item.data.word, meaning: item.data.meaning,
      options: shuffled(item.data.meaning, item.data.options),
      sourceId: item.id,
      passed: false, scored: false,
    };
  }, [roundPool]);

  const flap = useCallback(() => {
    if (state === 'ready') {
      setState('flying');
      setVel(JUMP);
      setPipes([spawnPipe()]);
      speedRef.current = PIPE_SPEED;
    } else if (state === 'flying') {
      setVel(JUMP);
    }
  }, [state, spawnPipe]);

  const answer = (opt: string) => {
    if (!currentQ) return;
    const correct = opt === currentQ.meaning;
    if (correct) {
      setScore((s) => s + 10 + combo * 3);
      setCombo((c) => c + 1);
      setFlash('correct');
      // Teleport bird to center of gap + grace period
      setBirdY(currentQ.gapY + GAP_SIZE / 2 - BIRD_SIZE / 2);
      setVel(JUMP * 0.5);
      setGrace(true);
      graceRef.current = true;
      setTimeout(() => { setGrace(false); graceRef.current = false; }, 600);
    } else {
      setCombo(0);
      setFlash('wrong');
      // Wrong answer = die
      setPipes((ps) => ps.map((p) => p.id === currentQ.id ? { ...p, scored: true } : p));
      setCurrentQ(null);
      setTimeout(() => { setFlash(null); die(); }, 300);
      return;
    }
    setPipes((ps) => ps.map((p) => p.id === currentQ.id ? { ...p, scored: true } : p));
    setCurrentQ(null);
    setTimeout(() => setFlash(null), 400);
    setState('flying');
  };

  const die = useCallback(() => {
    setState('over');
    if (score > best) { setBest(score); setHighScore(score); }
    if (!completionRecorded.current && courseId) {
      completionRecorded.current = true;
      recordGameCompletion(courseId, 'flappy-vocab').then(setCompletionAward).catch((error: unknown) => setCompletionError(error instanceof Error ? error.message : 'Không xác nhận được điểm thưởng.'));
    }
  }, [score, best, courseId]);

  // Main loop
  useEffect(() => {
    if (state !== 'flying') return;
    const tick = () => {
      setVel((v) => v + GRAVITY);
      setBirdY((y) => {
        const next = y + vel;
        if (next < 0 || next > GAME_H - GROUND_H - BIRD_SIZE) { die(); return y; }
        return next;
      });
      setBgOffset((o) => (o + 0.5) % 200);

      setPipes((ps) => {
        let arr = ps.map((p) => ({ ...p, x: p.x - speedRef.current }));

        // Collision check
        for (const p of arr) {
          if (p.scored || p.passed) continue;
          if (graceRef.current) continue;
          const pipeLeft = p.x;
          const pipeRight = p.x + PIPE_WIDTH;
          const birdRight = BIRD_X + BIRD_SIZE;
          if (birdRight > pipeLeft && BIRD_X < pipeRight) {
            // Bird is horizontally within pipe
            const birdTop = birdY;
            const birdBot = birdY + BIRD_SIZE;
            const gapTop = p.gapY;
            const gapBot = p.gapY + GAP_SIZE;
            if (birdTop < gapTop || birdBot > gapBot) {
              // Hit pipe — trigger question instead of death
              setCurrentQ(p);
              setState('question');
              arr = arr.map((pp) => pp.id === p.id ? { ...pp, passed: true } : pp);
              break;
            }
          }
          // Score when passing
          if (!p.scored && p.x + PIPE_WIDTH < BIRD_X) {
            arr = arr.map((pp) => pp.id === p.id ? { ...pp, scored: true } : pp);
            setScore((s) => s + 1);
            // Speed up slightly
            speedRef.current = Math.min(speedRef.current + 0.02, 3.2);
          }
        }

        // Cleanup + spawn
        arr = arr.filter((p) => p.x > -PIPE_WIDTH - 20);
        const last = arr[arr.length - 1];
        if (!last || last.x < GAME_W - PIPE_SPAWN_DIST) {
          arr.push(spawnPipe());
        }
        return arr;
      });

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [state, vel, birdY, die, spawnPipe]);

  const restart = () => {
    setBirdY(GAME_H / 2 - 40);
    setVel(0);
    setPipes([]);
    setScore(0);
    setCombo(0);
    setCurrentQ(null);
    setFlash(null);
    completionRecorded.current = false;
    setCompletionAward(null);
    setCompletionError(null);
    speedRef.current = PIPE_SPEED;
    setState('ready');
  };

  const birdRotation = Math.max(-20, Math.min(vel * 4, 60));

  if (!roundPool.length) {
    return <div className="fixed inset-0 grid place-items-center bg-[#0a0e13] p-6 text-center text-sm font-semibold text-white/70">Khóa học chưa có đủ từ vựng để mở game này.</div>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0e13]">
      {/* HUD */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3">
        <Link to={returnTo} className="rounded-xl p-2 text-white/60 hover:bg-white/10"><ArrowLeft size={18} /></Link>
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-white">{score}</span>
          {combo > 1 && (
            <motion.span initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="rounded-full bg-amber-500/25 px-2 py-0.5 text-xs font-black text-amber-300">
              x{combo}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-white/40">
          <Star size={12} className="text-amber-400" /> {best}
        </div>
      </div>

      {/* Game canvas */}
      <div
        className="relative select-none overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        style={{ width: GAME_W, height: GAME_H }}
        onClick={flap}
        onKeyDown={(e) => { if (e.code === 'Space') { e.preventDefault(); flap(); } }}
        tabIndex={0}
        role="button"
        aria-label="Tap to fly"
      >
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b2838] via-[#1e3a5f] to-[#0f2027]" />

        {/* Stars parallax */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, white, transparent), radial-gradient(1px 1px at 80px 120px, white, transparent), radial-gradient(1px 1px at 160px 60px, white, transparent), radial-gradient(1px 1px at 240px 180px, white, transparent), radial-gradient(1px 1px at 320px 90px, white, transparent), radial-gradient(1px 1px at 50px 200px, white, transparent)', backgroundSize: '200px 240px', backgroundPosition: `${-bgOffset}px 0` }} />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 border-t-2 border-amber-700/40" style={{ height: GROUND_H }}>
          <div className="h-full bg-gradient-to-t from-[#2d1f0e] to-[#3d2b14]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 20px)', backgroundPosition: `${-bgOffset * 2}px 0` }} />
        </div>

        {/* Pipes */}
        {pipes.map((p) => (
          <div key={p.id} className="absolute top-0" style={{ left: p.x, width: PIPE_WIDTH, height: GAME_H - GROUND_H }}>
            {/* Top pipe */}
            <div className="absolute left-0 right-0 top-0 rounded-b-lg" style={{ height: p.gapY, background: 'linear-gradient(90deg, #2a7a3a, #3da34d, #2a7a3a)', boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.3)' }}>
              <div className="absolute -left-1 -right-1 bottom-0 h-5 rounded-md bg-[#3da34d] shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </div>
            {/* Bottom pipe */}
            <div className="absolute bottom-0 left-0 right-0 rounded-t-lg" style={{ top: p.gapY + GAP_SIZE, background: 'linear-gradient(90deg, #2a7a3a, #3da34d, #2a7a3a)', boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.3)' }}>
              <div className="absolute -left-1 -right-1 top-0 h-5 rounded-md bg-[#3da34d] shadow-[0_-2px_4px_rgba(0,0,0,0.3)]" />
            </div>
            {/* Word floating in gap */}
            {!p.scored && (
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: p.gapY + GAP_SIZE / 2 - 14 }}>
                <span className="whitespace-nowrap rounded-lg bg-white/90 px-2 py-1 text-[11px] font-black text-gray-800 shadow-md">{p.word}</span>
              </div>
            )}
          </div>
        ))}

        {/* Bird */}
        <div className={cn('absolute transition-opacity', grace && 'animate-pulse')} style={{ left: BIRD_X, top: birdY, width: BIRD_SIZE, height: BIRD_SIZE, transform: `rotate(${birdRotation}deg)` }}>
          <div className="relative h-full w-full">
            {/* Body */}
            <div className={cn('absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_2px_8px_rgba(251,191,36,0.5)]', grace && 'ring-2 ring-amber-300/60')} />
            {/* Eye */}
            <div className="absolute right-[3px] top-[6px] h-[10px] w-[10px] rounded-full bg-white">
              <div className="absolute right-[1px] top-[2px] h-[5px] w-[5px] rounded-full bg-gray-900" />
            </div>
            {/* Beak */}
            <div className="absolute right-[-6px] top-[11px] h-0 w-0 border-b-[4px] border-l-[8px] border-t-[4px] border-b-transparent border-l-orange-600 border-t-transparent" />
            {/* Wing */}
            <div className={cn('absolute left-[4px] top-[12px] h-[8px] w-[12px] rounded-full bg-amber-600/80', state === 'flying' && 'animate-pulse')} />
          </div>
        </div>

        {/* Flash effect */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={cn('absolute inset-0 pointer-events-none', flash === 'correct' ? 'bg-emerald-400/20' : 'bg-red-400/20')}
            />
          )}
        </AnimatePresence>

        {/* Ready screen */}
        {state === 'ready' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/30">
            <div className="text-5xl">🐦</div>
            <h2 className="text-2xl font-black text-white drop-shadow-lg">Flappy Vocab</h2>
            {courseTitle && <p className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">{courseTitle}</p>}
            <p className="max-w-[240px] text-center text-xs font-semibold text-white/70">Bay qua ống — trả lời nghĩa từ khi va chạm để sống sót!</p>
            <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-4 text-sm font-bold text-amber-300">
              Tap để bắt đầu
            </motion.p>
            {best > 0 && <p className="text-xs text-white/40">Best: {best}</p>}
          </div>
        )}

        {/* Question overlay */}
        {state === 'question' && currentQ && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-3">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-[300px] rounded-2xl border border-amber-500/30 bg-[#1a2332] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-amber-400/70">Nghĩa của</p>
              <p className="mt-1 text-center text-2xl font-black text-white">{currentQ.word}</p>
              <div className="mt-4 grid gap-2">
                {currentQ.options.map((opt, i) => (
                  <button
                    key={opt}
                    onClick={(e) => { e.stopPropagation(); answer(opt); }}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-bold text-white transition-all hover:border-amber-400/40 hover:bg-amber-500/10 active:scale-[0.96]"
                  >
                    <span className="mr-2 text-xs text-white/30">{['A', 'B', 'C', 'D'][i]}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Game over */}
        {state === 'over' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 flex items-center justify-center bg-black/75 p-4">
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }} className="w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a2332] p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              {score > best - 1 && score > 0 && <p className="text-xs font-black uppercase text-amber-400">🎉 New Best!</p>}
              <Trophy size={36} className="mx-auto mt-2 text-amber-400" />
              <p className="mt-3 text-2xl font-black text-white">{score}</p>
              <p className="text-xs text-white/40">điểm</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/5 py-2">
                  <p className="text-[10px] font-bold text-white/40">Combo</p>
                  <p className="text-base font-black text-white">x{combo}</p>
                </div>
                <div className="rounded-xl bg-white/5 py-2">
                  <p className="text-[10px] font-bold text-white/40">Best</p>
                  <p className="text-base font-black text-amber-300">{Math.max(best, score)}</p>
                </div>
              </div>
              {courseId && <p role="status" className={completionError ? 'mt-4 text-xs font-semibold text-red-300' : 'mt-4 text-xs font-semibold text-white/60'}>{completionError ?? (completionAward ? (completionAward.awarded ? `Đã cộng ${completionAward.xpAwarded} XP qua máy chủ.` : 'Điểm thưởng hôm nay của game này đã được ghi nhận.') : 'Đang xác nhận điểm thưởng qua máy chủ…')}</p>}
              <div className="mt-5 flex flex-col gap-2">
                <button onClick={(e) => { e.stopPropagation(); restart(); }} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02]">
                  <RotateCcw size={14} /> Chơi lại
                </button>
                <Link to="/app/hub" onClick={(e) => e.stopPropagation()} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/60 transition-colors hover:text-white">
                  Về Hub
                </Link>
                {showCourseReturn && (
                  <Link to={returnTo} onClick={(e) => e.stopPropagation()} className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 py-2.5 text-sm font-bold text-amber-100 transition-colors hover:bg-amber-500/25">
                    Về khóa học
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

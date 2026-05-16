import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Flame, Heart, RotateCcw, Sparkles, Timer, Trophy, XCircle, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { readBestScore, shuffle, writeBestScore } from './gamePersistence';

interface ReflexRound {
  id: string;
  situation: string;
  correct: string;
  distractors: string[];
  hint: string;
}

const ROUND_POOL: ReflexRound[] = [
  {
    id: 'r1',
    situation: 'Vào ca sáng, chào đội với quản lý.',
    correct: 'Ohayou gozaimasu.',
    distractors: ['Konbanwa.', 'Sayounara.', 'Otsukaresama desu.'],
    hint: 'Lời chào buổi sáng lịch sự, dùng tới tận 11h.',
  },
  {
    id: 'r2',
    situation: 'Tan ca chiều, anh chào đồng nghiệp ra về.',
    correct: 'Otsukaresama desu.',
    distractors: ['Itadakimasu.', 'Sumimasen.', 'Konnichiwa.'],
    hint: 'Cảm ơn vì đã vất vả cùng ca.',
  },
  {
    id: 'r3',
    situation: 'Tự giới thiệu trong phỏng vấn HR.',
    correct: 'Watashi wa Minh to moushimasu.',
    distractors: ['Watashi Minh desu ne.', 'Minh-san wa watashi desu.', 'Minh dakara desu.'],
    hint: 'Mẫu “to moushimasu” lịch sự hơn “desu”.',
  },
  {
    id: 'r4',
    situation: 'Cuối phần tự giới thiệu, anh muốn gửi gắm.',
    correct: 'Yoroshiku onegai itashimasu.',
    distractors: ['Doumo arigatou.', 'Sumimasen deshita.', 'Ittekimasu.'],
    hint: 'Câu chốt phỏng vấn / chào team mới.',
  },
  {
    id: 'r5',
    situation: 'Trước khi ăn cơm hộp với đội.',
    correct: 'Itadakimasu.',
    distractors: ['Gochisou sama deshita.', 'Ohayou gozaimasu.', 'Yoroshiku.'],
    hint: 'Câu “xin phép dùng bữa”.',
  },
  {
    id: 'r6',
    situation: 'Ăn xong, dọn khay trả lại.',
    correct: 'Gochisou sama deshita.',
    distractors: ['Itadakimasu.', 'Sumimasen.', 'Otsukaresama.'],
    hint: 'Câu cảm ơn sau bữa ăn.',
  },
  {
    id: 'r7',
    situation: 'Anh va vào người đi ngang trong xưởng.',
    correct: 'Sumimasen.',
    distractors: ['Arigatou.', 'Onegaishimasu.', 'Doumo.'],
    hint: '“Xin lỗi / cho qua” lịch sự.',
  },
  {
    id: 'r8',
    situation: 'Quản lý nhờ giúp việc nhỏ, anh nhận lời.',
    correct: 'Hai, wakarimashita.',
    distractors: ['Iie, dame desu.', 'Sou desu ka.', 'Mou ii desu.'],
    hint: '“Vâng, em hiểu rồi.” khi nhận task.',
  },
  {
    id: 'r9',
    situation: 'Anh cần hỏi lại vì chưa rõ hướng dẫn.',
    correct: 'Sumimasen, mou ichido onegaishimasu.',
    distractors: ['Mou ii desu.', 'Wakaranai kara dame.', 'Iie, tsugi onegaishimasu.'],
    hint: '“Xin nhắc lại giúp em một lần nữa.”',
  },
  {
    id: 'r10',
    situation: 'Sáng đầu tiên gặp HR ngoài hành lang.',
    correct: 'Ohayou gozaimasu, Minh desu.',
    distractors: ['Konbanwa, Minh deshita.', 'Konnichiwa, Minh chan.', 'Otsukare, Minh dayo.'],
    hint: 'Chào buổi sáng + giới thiệu tên gọn.',
  },
];

const ROUND_TIME_MS = 5000;
const FEEDBACK_MS = 1200;
const ROUNDS_PER_GAME = 8;
const GAME_ID = 'aisatsu-reflex';

type Phase = 'playing' | 'feedback' | 'done';

export default function AisatsuReflexGame() {
  const [rounds, setRounds] = useState<ReflexRound[]>(() => shuffle(ROUND_POOL).slice(0, ROUNDS_PER_GAME));
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [hits, setHits] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [remainingMs, setRemainingMs] = useState(ROUND_TIME_MS);
  const [bestScore, setBestScore] = useState<number | null>(() => readBestScore(GAME_ID));

  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  const deadlineRef = useRef<number>(Date.now() + ROUND_TIME_MS);
  const currentRound = rounds[roundIndex];

  const handleAnswer = useCallback(
    (option: string | null) => {
      if (phaseRef.current !== 'playing') return;
      const round = rounds[roundIndex];
      if (!round) return;
      const isCorrect = option === round.correct;
      if (isCorrect) {
        const left = Math.max(0, deadlineRef.current - Date.now());
        const timeFactor = Math.max(0, Math.min(1, left / ROUND_TIME_MS));
        const gained = 80 + Math.round(timeFactor * 60) + combo * 12;
        setScore((current) => current + gained);
        setCombo((current) => {
          const next = current + 1;
          setMaxCombo((prev) => Math.max(prev, next));
          return next;
        });
        setHits((current) => current + 1);
      } else {
        setLives((current) => current - 1);
        setCombo(0);
      }
      setSelected(option);
      setPhase('feedback');
    },
    [combo, roundIndex, rounds],
  );

  useEffect(() => {
    if (phase !== 'playing') return;
    if (!currentRound) return;
    setShuffledOptions(shuffle([currentRound.correct, ...currentRound.distractors]));
    setSelected(null);
    setRemainingMs(ROUND_TIME_MS);
    deadlineRef.current = Date.now() + ROUND_TIME_MS;
  }, [phase, currentRound]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = window.setInterval(() => {
      const left = deadlineRef.current - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        handleAnswer(null);
        return;
      }
      setRemainingMs(left);
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, handleAnswer]);

  useEffect(() => {
    if (phase !== 'feedback') return;
    const id = window.setTimeout(() => {
      const finishedAll = roundIndex + 1 >= rounds.length;
      if (lives <= 0 || finishedAll) {
        setPhase('done');
        return;
      }
      setRoundIndex((current) => current + 1);
      setPhase('playing');
    }, FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase, roundIndex, lives, rounds.length]);

  useEffect(() => {
    if (phase !== 'done') return;
    setBestScore((current) => {
      const next = writeBestScore(GAME_ID, score);
      return current === null || next > current ? next : current;
    });
  }, [phase, score]);

  const accuracy = useMemo(() => {
    const playedRounds = phase === 'done' ? roundIndex + 1 : roundIndex + (phase === 'feedback' ? 1 : 0);
    if (playedRounds === 0) return 0;
    return Math.round((hits / playedRounds) * 100);
  }, [hits, roundIndex, phase]);

  const progress = Math.min(100, Math.round(((roundIndex + (phase === 'done' ? 1 : 0)) / rounds.length) * 100));
  const timerPct = phase === 'playing' ? Math.max(0, Math.min(1, remainingMs / ROUND_TIME_MS)) : 0;
  const isCorrectAnswer = selected === currentRound?.correct;

  const handleRestart = () => {
    setRounds(shuffle(ROUND_POOL).slice(0, ROUNDS_PER_GAME));
    setRoundIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setLives(3);
    setHits(0);
    setSelected(null);
    setShuffledOptions([]);
    setRemainingMs(ROUND_TIME_MS);
    setPhase('playing');
  };

  if (phase === 'done') {
    return (
      <GameDoneCard
        title="Aisatsu Reflex hoàn tất"
        score={score}
        bestScore={bestScore}
        meta={[
          { label: 'Combo cao nhất', value: `x${maxCombo}` },
          { label: 'Câu đúng', value: `${hits}/${rounds.length}` },
          { label: 'Độ chính xác', value: `${accuracy}%` },
        ]}
        outOfLives={lives <= 0 && hits < rounds.length}
        onRestart={handleRestart}
      />
    );
  }

  if (!currentRound) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-24">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-400 p-5 text-white shadow-[0_22px_60px_-38px_rgba(249,115,22,0.55)] md:p-7">
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/app/hub"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <ArrowLeft size={14} /> Hub
          </Link>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart
                key={`life-${idx}`}
                size={18}
                className={cn(
                  'transition-all',
                  idx < lives ? 'fill-rose-100 text-rose-100' : 'text-white/30',
                )}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Zap size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/75">Reflex · 5s mỗi câu</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Aisatsu Reflex</h1>
            <p className="mt-1 text-xs font-medium leading-relaxed text-white/85 md:text-sm">
              Chọn câu chào tiếng Nhật đúng nhất với tình huống. Combo lên thì điểm nhân lên.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Điểm</div>
            <div className="mt-1 text-lg font-black">{score}</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Combo</div>
            <div className="mt-1 flex items-center justify-center gap-1 text-lg font-black">
              <Flame size={14} /> x{combo}
            </div>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Câu</div>
            <div className="mt-1 text-lg font-black">
              {roundIndex + 1}/{rounds.length}
            </div>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-white"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_50px_-42px_rgba(148,123,82,0.32)] md:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
            <Timer size={12} /> Còn {(remainingMs / 1000).toFixed(1)}s
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Tình huống</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-100">
          <motion.div
            className={cn(
              'h-full rounded-full',
              timerPct > 0.5 ? 'bg-emerald-400' : timerPct > 0.25 ? 'bg-amber-400' : 'bg-rose-500',
            )}
            animate={{ width: `${timerPct * 100}%` }}
            transition={{ ease: 'linear', duration: 0.1 }}
          />
        </div>
        <div className="mt-4 rounded-[1.5rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_100%)] p-4 md:p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Anh sẽ chào thế nào?</p>
          <p className="mt-2 text-lg font-black leading-snug text-gray-900 md:text-xl">{currentRound.situation}</p>
        </div>

        <div className="mt-4 grid gap-2.5">
          {shuffledOptions.map((option) => {
            const isSelected = selected === option;
            const showCorrect = phase === 'feedback' && option === currentRound.correct;
            const showWrong = phase === 'feedback' && isSelected && !isCorrectAnswer;
            return (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleAnswer(option)}
                disabled={phase !== 'playing'}
                whileTap={phase === 'playing' ? { scale: 0.98 } : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-black transition-all',
                  phase === 'playing' && 'border-[#e6ddd1] bg-white text-gray-800 active:border-orange-300',
                  showCorrect && 'border-emerald-300 bg-emerald-50 text-emerald-700',
                  showWrong && 'border-rose-300 bg-rose-50 text-rose-700',
                  phase === 'feedback' && !showCorrect && !showWrong && 'border-[#ece4d4] bg-[#f8f1e6] text-gray-400',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                    phase === 'playing' && 'bg-orange-50 text-orange-500',
                    showCorrect && 'bg-emerald-500 text-white',
                    showWrong && 'bg-rose-500 text-white',
                  )}
                >
                  {showCorrect ? <CheckCircle2 size={14} /> : showWrong ? <XCircle size={14} /> : option.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {phase === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                'mt-4 flex items-start gap-3 rounded-2xl border p-3.5',
                isCorrectAnswer ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white',
                  isCorrectAnswer ? 'text-emerald-500' : 'text-rose-500',
                )}
              >
                {isCorrectAnswer ? <Sparkles size={18} /> : <XCircle size={18} />}
              </div>
              <div className="min-w-0 text-xs font-bold leading-relaxed text-gray-700">
                <p className="text-sm font-black text-gray-900">
                  {selected === null
                    ? 'Hết giờ rồi anh'
                    : isCorrectAnswer
                      ? `+${score > 0 ? '' : ''}Combo lên rồi!`
                      : 'Chưa khớp tình huống'}
                </p>
                <p className="mt-1">
                  Đúng: <span className="font-black text-gray-900">{currentRound.correct}</span> — {currentRound.hint}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

interface GameDoneCardProps {
  title: string;
  score: number;
  bestScore: number | null;
  meta: { label: string; value: string }[];
  outOfLives: boolean;
  onRestart: () => void;
}

function GameDoneCard({ title, score, bestScore, meta, outOfLives, onRestart }: GameDoneCardProps) {
  const isNewBest = bestScore !== null && score >= bestScore && score > 0;
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-center justify-center pb-16">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-6 text-center shadow-[0_28px_72px_-44px_rgba(180,138,91,0.34)] md:p-10"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-xl">
          <Trophy size={36} />
        </div>
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">
          {outOfLives ? 'Hết mạng — chơi lại nào' : 'Hoàn tất phiên'}
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 md:text-4xl">{title}</h1>
        <div className="mt-5 inline-flex items-baseline gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Điểm</span>
          <span className="text-3xl font-black text-orange-600">{score}</span>
        </div>
        {bestScore !== null && (
          <p className={cn('mt-2 text-[11px] font-black uppercase tracking-[0.18em]', isNewBest ? 'text-emerald-500' : 'text-gray-400')}>
            {isNewBest ? 'Kỷ lục mới của anh!' : `Kỷ lục hiện tại: ${bestScore}`}
          </p>
        )}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
          {meta.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#ece4d4] bg-white/70 px-3 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">{item.label}</div>
              <div className="mt-1.5 text-lg font-black text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white px-5 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50"
          >
            <RotateCcw size={16} /> Chơi lại
          </button>
          <Link
            to="/app/hub"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-22px_rgba(249,115,22,0.65)]"
          >
            Về Hub
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

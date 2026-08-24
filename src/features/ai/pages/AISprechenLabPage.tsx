import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, Loader2, Mic, Square } from 'lucide-react';
import {
  fetchSpeakingPrompts,
  processSpeakingSubmission,
  startSpeakingSubmission,
  uploadSpeakingAudio,
  type SpeakingPrompt,
  type SpeakingSubmission,
} from '@/src/features/ai/repositories/speakingRepository';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';

const panelClass = 'rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6';

function supportedRecordingMime(): { recorderMime: string; apiMime: string } | null {
  const candidates = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/ogg'];
  const recorderMime = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  if (!recorderMime) return null;
  return { recorderMime, apiMime: recorderMime.startsWith('audio/ogg') ? 'audio/ogg' : 'audio/webm' };
}

function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function AISprechenLab() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([]);
  const [promptId, setPromptId] = useState('');
  const [submission, setSubmission] = useState<SpeakingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const mimeRef = useRef('audio/webm');
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const activeCourseStatus = useActiveCourseStore((state) => state.status);

  useEffect(() => {
    let cancelled = false;
    if (activeCourseStatus !== 'ready') return () => { cancelled = true; };
    if (!activeCourseId) {
      setPrompts([]);
      setLoading(false);
      return () => { cancelled = true; };
    }
    fetchSpeakingPrompts(activeCourseId)
      .then((items) => { if (!cancelled) { setPrompts(items); setPromptId(items[0]?.id ?? ''); } })
      .catch((nextError: unknown) => { if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Không tải được đề Speaking.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; recorderRef.current?.stop(); streamRef.current?.getTracks().forEach((track) => track.stop()); };
  }, [activeCourseId, activeCourseStatus]);

  useEffect(() => {
    if (!recording) return undefined;
    const timer = window.setInterval(() => setElapsedSeconds(Math.min(600, Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)))), 250);
    return () => window.clearInterval(timer);
  }, [recording]);

  const selectedPrompt = prompts.find((prompt) => prompt.id === promptId) ?? null;

  async function submitRecording(blob: Blob, durationSeconds: number, mimeType: string): Promise<void> {
    if (!selectedPrompt || durationSeconds < 1) throw new Error('Bản ghi quá ngắn. Hãy nói ít nhất một giây.');
    setProcessing(true);
    const started = await startSpeakingSubmission(selectedPrompt.id, mimeType, durationSeconds);
    await uploadSpeakingAudio(started.storagePath, blob, mimeType);
    setSubmission(await processSpeakingSubmission(started.submissionId));
  }

  async function startRecording(): Promise<void> {
    if (!selectedPrompt || recording || processing) return;
    setError(null);
    setSubmission(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Trình duyệt này không hỗ trợ ghi âm. Hãy dùng Chrome hoặc Edge bản mới.');
      return;
    }
    const mime = supportedRecordingMime();
    if (!mime) {
      setError('Trình duyệt không hỗ trợ định dạng ghi âm an toàn cho Speech-to-Text. Hãy dùng Chrome hoặc Edge bản mới.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: mime.recorderMime });
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      mimeRef.current = mime.apiMime;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        recorderRef.current = null;
        streamRef.current = null;
        const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        setRecording(false);
        void submitRecording(blob, durationSeconds, mimeRef.current).catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Không xử lý được bài Speaking.')).finally(() => setProcessing(false));
      };
      startedAtRef.current = Date.now();
      setElapsedSeconds(0);
      recorder.start(500);
      setRecording(true);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không mở được micro. Hãy cho phép quyền micro rồi thử lại.');
    }
  }

  function stopRecording(): void {
    recorderRef.current?.stop();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      <section className={panelClass}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Speaking Lab · dữ liệu thật</p><h1 className="mt-1 text-2xl font-black text-[#172033]">Ghi âm, transcript và phản hồi AI</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f6b7c]">Audio được tải vào Storage private. Nếu Speech-to-Text hoặc Gemini chưa cấu hình, màn chỉ báo trạng thái cấu hình — không tạo feedback giả.</p></div><Link to="/app/ai-speak/history" className="inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] bg-white px-4 py-2.5 text-sm font-bold text-[#5f6b7c]"><Clock3 size={16} /> Lịch sử</Link></div>
      </section>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <div className={`${panelClass} inline-flex items-center gap-2 text-sm font-bold text-[#5f6b7c]`}><Loader2 size={17} className="animate-spin" /> Đang tải đề Speaking…</div> : !selectedPrompt ? <div className={`${panelClass} text-sm font-semibold text-[#5f6b7c]`}>Chưa có đề Speaking đã publish cho các khóa học của anh.</div> : <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><article className={panelClass}><label className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8796]">Đề Speaking</label><select value={promptId} onChange={(event) => { setPromptId(event.target.value); setSubmission(null); setError(null); }} disabled={recording || processing} className="mt-2 w-full rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm font-bold text-[#172033]">{prompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.title}</option>)}</select><h2 className="mt-5 text-xl font-black text-[#172033]">{selectedPrompt.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#5f6b7c]">{selectedPrompt.instructions}</p><div className="mt-6 flex flex-col items-center rounded-2xl border border-[#e8dccb] bg-white p-7 text-center"><button type="button" onClick={() => { if (recording) stopRecording(); else void startRecording(); }} disabled={processing} className={`flex h-28 w-28 items-center justify-center rounded-full text-white shadow-lg transition ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-700 hover:bg-orange-800'} disabled:opacity-50`} aria-label={recording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}>{recording ? <Square size={34} /> : <Mic size={38} />}</button><p className="mt-4 font-black text-[#172033]">{recording ? `Đang ghi âm ${formatDuration(elapsedSeconds)}` : processing ? 'Đang tải audio và chấm…' : 'Nhấn để bắt đầu ghi âm'}</p><p className="mt-1 text-sm text-[#5f6b7c]">{recording ? 'Nhấn lại để dừng và gửi bài.' : 'Khuyến nghị câu trả lời ngắn, rõ ràng.'}</p></div></article><aside className={panelClass}>{processing && <div className="flex items-center gap-2 text-sm font-bold text-[#5f6b7c]"><Loader2 size={17} className="animate-spin" /> Đang tạo transcript và gọi AI…</div>}{!processing && !submission && <p className="text-sm leading-6 text-[#5f6b7c]">Kết quả thật sẽ xuất hiện tại đây sau khi server xử lý audio.</p>}{submission?.feedback && <SpeakingFeedbackCard submission={submission} />}{submission && !submission.feedback && <p className="text-sm font-semibold text-[#5f6b7c]">Trạng thái: {submission.status}</p>}</aside></section>}
    </div>
  );
}

function SpeakingFeedbackCard({ submission }: { submission: SpeakingSubmission }) {
  const feedback = submission.feedback!;
  return <div className="space-y-4"><div className="rounded-xl bg-orange-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Điểm server</p><p className="mt-1 text-3xl font-black text-[#172033]">{feedback.score}/100</p><p className="mt-2 text-sm leading-6 text-[#5f6b7c]">{feedback.summary}</p></div>{submission.transcript && <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8796]">Transcript</p><p className="mt-1 rounded-xl border border-[#e8dccb] bg-white p-3 text-sm leading-6 text-[#172033]">{submission.transcript}</p></div>}<div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Điểm tốt</p><div className="mt-2 space-y-2">{feedback.strengths.map((item) => <p key={item} className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{item}</p>)}{feedback.strengths.length === 0 && <p className="text-sm text-[#5f6b7c]">Chưa có nhận xét điểm mạnh.</p>}</div></div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">Cần cải thiện</p><div className="mt-2 space-y-2">{feedback.improvements.map((item) => <p key={item} className="rounded-xl bg-orange-50 p-3 text-sm text-orange-900">{item}</p>)}{feedback.improvements.length === 0 && <p className="text-sm text-[#5f6b7c]">Chưa có lỗi nổi bật.</p>}</div></div>{feedback.rewritten && <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8796]">Bản gợi ý</p><p className="mt-1 rounded-xl border border-[#e8dccb] bg-white p-3 text-sm leading-6 text-[#172033]">{feedback.rewritten}</p></div>}</div>;
}

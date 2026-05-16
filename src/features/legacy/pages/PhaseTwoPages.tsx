import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flag,
  GraduationCap,
  Lock,
  MessageCircle,
  Mic,
  PenTool,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
  Volume2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  friends,
  grammarTopics,
  journalEntries,
  messageThreads,
  onboardingSteps,
  phaseTwoMetrics,
  privacySections,
  settingsSections,
  speakingHistory,
  termsSections,
  vocabularyEntries,
  writingHistory,
} from '@/src/data/phaseTwoMock';
import type { LegalSection, PhaseMetric, PracticeHistoryItem } from '@/src/data/phaseTwoMock';

type Tone = PhaseMetric['tone'];

const toneStyles: Record<Tone, string> = {
  orange: 'border-orange-100 bg-orange-50 text-orange-600',
  blue: 'border-blue-100 bg-blue-50 text-blue-600',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  violet: 'border-violet-100 bg-violet-50 text-violet-600',
  pink: 'border-pink-100 bg-pink-50 text-pink-600',
  amber: 'border-amber-100 bg-amber-50 text-amber-600',
};

interface PageHeroProps {
  eyebrow: string;
  title: string;
  sub: string;
  icon: LucideIcon;
  actions?: ReactNode;
}

function PageHero({ eyebrow, title, sub, icon: Icon, actions }: PageHeroProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
      <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2 md:space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px] md:tracking-[0.2em]">
            <Icon size={14} />
            {eyebrow}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">{title}</h2>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">{sub}</p>
          </div>
        </div>
        {actions}
      </div>
    </section>
  );
}

function MetricGrid({ metrics = phaseTwoMetrics }: { metrics?: PhaseMetric[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className={cn('min-w-0 rounded-[1.15rem] border px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3', toneStyles[metric.tone])}>
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px] md:tracking-[0.18em]">{metric.label}</div>
          <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{metric.value}</div>
          <div className="mt-1 text-[10px] font-medium leading-tight md:text-[11px]">{metric.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#efe7dc]">
      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${value}%` }} />
    </div>
  );
}

function HistoryList({ items, icon: Icon }: { items: PracticeHistoryItem[]; icon: LucideIcon }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <motion.article key={item.id} whileHover={{ y: -3 }} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
              <Icon size={22} />
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-500">{item.date}</span>
          </div>
          <h3 className="mt-5 text-lg font-black tracking-tight text-gray-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.summary}</p>
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>{item.status}</span>
              <span>{item.score}/100</span>
            </div>
            <ScoreBar value={item.score} />
          </div>
        </motion.article>
      ))}
    </section>
  );
}

function LegalPage({ title, sections, icon: Icon }: { title: string; sections: LegalSection[]; icon: LucideIcon }) {
  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Legal shell" title={title} sub="Trang pháp lý mock để app có đủ luồng điều khoản và bảo mật trước khi nối nội dung chính thức." icon={Icon} />
      <section className="space-y-4 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)] md:p-7">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[1.75rem] border border-[#e6ddd1] bg-white/55 p-5">
            <h3 className="text-lg font-black text-gray-900">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function Onboarding() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const completedSteps = Object.keys(answers).length;
  const isComplete = completedSteps === onboardingSteps.length;

  return (
    <div className="space-y-6 pb-16">
      <PageHero
        eyebrow="Onboarding"
        title="Chọn nhịp học Tokutei của anh"
        sub="Màn này là placement mock: chọn mục tiêu, level và lịch học để sau này nối vào hồ sơ Tokutei thật."
        icon={Flag}
        actions={<MetricGrid />}
      />
      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Tiến độ setup</div>
          <div className="mt-3 text-5xl font-black text-gray-900">{completedSteps}/{onboardingSteps.length}</div>
          <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">Chọn xong 3 bước thì anh có thể vào dashboard. Dữ liệu đang giữ trong state local.</p>
          <ScoreBar value={Math.round((completedSteps / onboardingSteps.length) * 100)} />
          {isComplete ? (
            <Link to="/app/dashboard" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Vào dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <button disabled className="mt-6 w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-3 text-sm font-black text-gray-400">Chọn đủ 3 bước để tiếp tục</button>
          )}
        </div>
        <div className="space-y-4">
          {onboardingSteps.map((step, stepIndex) => (
            <article key={step.title} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-38px_rgba(148,163,184,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Bước {stepIndex + 1}</p>
                  <h3 className="mt-1 text-xl font-black text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{step.sub}</p>
                </div>
                {answers[stepIndex] && <CheckCircle2 className="text-emerald-500" size={22} />}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {step.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setAnswers((current) => ({ ...current, [stepIndex]: option }))}
                    className={cn('rounded-full border px-4 py-2 text-xs font-bold transition-all', answers[stepIndex] === option ? 'border-orange-200 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500')}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FriendsPage() {
  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Community" title="Bạn học Tokutei" sub="Leaderboard mock để anh thấy cộng đồng, streak và bạn học cùng nhịp luyện." icon={Users} actions={<MetricGrid metrics={[{ label: 'Bạn học', value: `${friends.length}`, sub: 'đang mock', tone: 'blue' }, { label: 'Top streak', value: '18d', sub: 'Hana', tone: 'orange' }, { label: 'Tin nhắn', value: '4', sub: 'chưa đọc', tone: 'emerald' }]} />} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {friends.map((friend, index) => (
          <motion.article key={friend.id} whileHover={{ y: -3 }} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.18)]">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-400 text-lg font-black text-white">{index + 1}</div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-500">{friend.streak}d streak</span>
            </div>
            <h3 className="mt-5 text-lg font-black text-gray-900">{friend.name}</h3>
            <p className="text-sm font-medium text-gray-500">{friend.status}</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-xs font-bold text-gray-500">
              <span>{friend.level}</span>
              <span>{friend.xp} XP</span>
            </div>
            <Link to="/app/messages" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-black text-orange-600">
              Nhắn tin <ChevronRight size={14} />
            </Link>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

export function MessagesPage() {
  const [draft, setDraft] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [selectedThreadId, setSelectedThreadId] = useState(messageThreads[0]?.id ?? '');
  const selectedThread = messageThreads.find((thread) => thread.id === selectedThreadId) ?? messageThreads[0];

  const handleSend = () => {
    if (!draft.trim()) return;
    setDraft('');
    setSentCount((current) => current + 1);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Messages" title="Tin nhắn cộng đồng" sub="Inbox mock cho Zalo, mentor và nhóm luyện thi. Gửi tin chỉ cập nhật UI local." icon={MessageCircle} />
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3">
          {messageThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setSelectedThreadId(thread.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-[2rem] border p-4 text-left shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)] transition-all',
                selectedThread?.id === thread.id ? 'border-orange-200 bg-orange-50/70' : 'border-[#e6ddd1] bg-[#fffaf3] hover:border-orange-200'
              )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500"><MessageCircle size={22} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="truncate text-sm font-black text-gray-900">{thread.name}</h3>
                  <span className="text-[10px] font-bold text-gray-400">{thread.time}</span>
                </div>
                <p className="truncate text-xs font-medium text-gray-500">{thread.lastMessage}</p>
              </div>
              {thread.unread > 0 && <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black text-white">{thread.unread}</span>}
            </button>
          ))}
        </div>
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          <div className="space-y-4">
            <div className="rounded-[2rem] bg-blue-50 p-4 text-sm font-medium text-blue-700">{selectedThread?.name}: {selectedThread?.lastMessage}</div>
            <div className="ml-auto max-w-sm rounded-[2rem] bg-orange-500 p-4 text-sm font-bold text-white">
              {selectedThread?.label === 'Exam' ? 'Em muốn mở mock interview cuối tuần.' : 'Em muốn ôn 5 câu tự giới thiệu an toàn.'}
            </div>
            {sentCount > 0 && <div className="ml-auto max-w-sm rounded-[2rem] bg-orange-100 p-4 text-sm font-bold text-orange-700">Đã gửi {sentCount} tin mock trong phiên này.</div>}
          </div>
          <div className="mt-5 flex gap-3">
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Nhập tin nhắn mock cho ${selectedThread?.name ?? 'kênh này'}...`} className="min-w-0 flex-1 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-100" />
            <button type="button" onClick={handleSend} disabled={!draft.trim()} className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white disabled:opacity-45">Gửi</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function GrammarTopicDetail() {
  const { id } = useParams();
  const topic = grammarTopics.find((item) => item.id === id);

  if (!topic) {
    return (
      <div className="space-y-6 pb-16">
        <PageHero eyebrow="Not found" title="Chưa có chủ điểm này" sub="Route đã mở nhưng mockdata chưa có nội dung tương ứng." icon={BookOpen} actions={<Link to="/app/grammar" className="inline-flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-5 py-3 text-sm font-black text-gray-700"><ArrowLeft size={16} /> Thư viện</Link>} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow={`${topic.level} · ${topic.category}`} title={topic.title} sub={topic.summary} icon={BookOpen} actions={<Link to="/app/grammar" className="inline-flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-5 py-3 text-sm font-black text-gray-700"><ArrowLeft size={16} /> Thư viện</Link>} />
      <section className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="space-y-4 rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          {topic.rules.map((rule, index) => (
            <div key={rule} className="flex gap-3 rounded-[1.75rem] bg-white/70 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xs font-black text-orange-500">{index + 1}</div>
              <p className="text-sm font-medium leading-relaxed text-gray-600">{rule}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {topic.examples.map((example) => (
            <div key={example.de} className="rounded-[2rem] border border-blue-100 bg-blue-50/65 p-5">
              <p className="text-lg font-black text-blue-900">{example.de}</p>
              <p className="mt-2 text-sm font-medium text-blue-700">{example.vi}</p>
            </div>
          ))}
          <Link to="/app/hub/wortstellung" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Luyện bằng game <ChevronRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}

export function VocabularyDetail() {
  const { wordId } = useParams();
  const entry = vocabularyEntries.find((item) => item.id === wordId);

  if (!entry) {
    return (
      <div className="space-y-6 pb-16">
        <PageHero eyebrow="Not found" title="Chưa có từ vựng này" sub="Route đã mở nhưng mockdata chưa có entry tương ứng." icon={Volume2} actions={<Link to="/app/search" className="inline-flex items-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-5 py-3 text-sm font-black text-gray-700"><ArrowLeft size={16} /> Tìm kiếm</Link>} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow={`${entry.level} · Vocabulary`} title={`${entry.article} ${entry.word}`} sub={entry.meaning} icon={Volume2} actions={<Link to="/app/review/flashcards" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Ôn bằng thẻ <ChevronRight size={16} /></Link>} />
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 text-center shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-orange-50 text-orange-500"><Volume2 size={34} /></div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Phát âm mock</p>
          <h3 className="mt-2 text-3xl font-black text-gray-900">{entry.pronunciation}</h3>
          <div className="mt-5 flex flex-wrap justify-center gap-2">{entry.related.map((word) => <span key={word} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-500">{word}</span>)}</div>
        </div>
        <div className="space-y-4">
          {entry.examples.map((example) => (
            <article key={example.de} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)]">
              <p className="text-lg font-black text-gray-900">{example.de}</p>
              <p className="mt-2 text-sm font-medium text-gray-500">{example.vi}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WritingHistory() {
  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Writing history" title="Lịch sử AI chấm viết" sub="Danh sách bài viết mock để sau này nối dữ liệu thật từ AI Writing Lab." icon={PenTool} actions={<Link to="/app/ai-lab" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Viết bài mới <ChevronRight size={16} /></Link>} />
      <HistoryList items={writingHistory} icon={FileText} />
    </div>
  );
}

export function SpeakingHistory() {
  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Speaking history" title="Lịch sử luyện nói" sub="Các phiên speaking mock giúp anh xem nhịp phát âm và feedback gần đây." icon={Mic} actions={<Link to="/app/ai-speak" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Luyện nói tiếp <ChevronRight size={16} /></Link>} />
      <HistoryList items={speakingHistory} icon={Mic} />
    </div>
  );
}

export function Journal() {
  const [draft, setDraft] = useState('');
  const wordCount = useMemo(() => draft.split(/\s+/).filter(Boolean).length, [draft]);

  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Markdown journal" title="Nhật ký luyện viết" sub="Viết ngắn mỗi ngày, lưu mock trong UI để chốt flow journal trước." icon={FileText} />
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="# Tokutei interview notes..." className="h-80 w-full resize-none rounded-[2rem] border border-[#e1d8cb] bg-white/80 p-5 text-sm leading-7 outline-none focus:ring-2 focus:ring-orange-100" />
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-400"><span>{wordCount} từ</span><Link to="/app/ai-lab" className="text-orange-500">Gửi sang AI Writing →</Link></div>
        </div>
        <div className="space-y-3">
          {journalEntries.map((entry) => (
            <article key={entry.id} className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)]">
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-black text-gray-900">{entry.title}</h3><span className="text-[10px] font-bold text-gray-400">{entry.date}</span></div>
              <p className="mt-2 text-xs font-bold text-orange-500">{entry.prompt}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{entry.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-2">{entry.tags.map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-500">{tag}</span>)}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function SettingsShell() {
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(settingsSections.flatMap((section) => section.items.map((item) => [item.key, item.enabled])))
  );

  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Settings" title="Cài đặt app" sub="Shell cài đặt để gom mục tiêu học, thông báo, AI và pháp lý trước khi có backend thật." icon={Settings} actions={<div className="flex flex-wrap gap-2"><Link to="/terms" className="rounded-2xl border border-[#e6ddd1] bg-white px-4 py-3 text-xs font-black text-gray-600">Điều khoản</Link><Link to="/privacy" className="rounded-2xl border border-[#e6ddd1] bg-white px-4 py-3 text-xs font-black text-gray-600">Bảo mật</Link></div>} />
      <section className="grid gap-5 lg:grid-cols-2">
        {settingsSections.map((section) => (
          <article key={section.title} className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
            <h3 className="text-xl font-black text-gray-900">{section.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{section.sub}</p>
            <div className="mt-5 space-y-3">
              {section.items.map((item) => (
                <button key={item.key} type="button" role="switch" aria-checked={enabledItems[item.key]} onClick={() => setEnabledItems((current) => ({ ...current, [item.key]: !current[item.key] }))} className="flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-[#e6ddd1] bg-white/70 p-4 text-left">
                  <span><span className="block text-sm font-black text-gray-900">{item.label}</span><span className="mt-1 block text-xs font-medium text-gray-500">{item.description}</span></span>
                  <span className={cn('h-7 w-12 rounded-full p-1 transition-colors', enabledItems[item.key] ? 'bg-orange-500' : 'bg-gray-200')}><span className={cn('block h-5 w-5 rounded-full bg-white transition-transform', enabledItems[item.key] && 'translate-x-5')} /></span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export function TermsPage() {
  return <LegalPage title="Điều khoản sử dụng" sections={termsSections} icon={GraduationCap} />;
}

export function PrivacyPage() {
  return <LegalPage title="Chính sách bảo mật" sections={privacySections} icon={Shield} />;
}

export function PhaseTwoSearchLanding() {
  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Search shell" title="Tìm kiếm nội dung" sub="Màn gom tìm kiếm mock cho các entry từ vựng, ngữ pháp và lịch sử học." icon={Search} />
      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/app/grammar/aisatsu" className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 font-black text-gray-900 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)]">Ngữ pháp: aisatsu khi vào ca</Link>
        <Link to="/app/vocabulary/zairyu-card" className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 font-black text-gray-900 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)]">Từ vựng: zairyu card</Link>
      </section>
    </div>
  );
}

export function LockedPhasePage() {
  return (
    <div className="space-y-6 pb-16">
      <PageHero eyebrow="Coming soon" title="Màn này đang khóa" sub="Route mock để tránh màn trắng khi user bấm nhầm vào luồng chưa mở." icon={Lock} />
      <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Về dashboard <ChevronRight size={16} /></Link>
    </div>
  );
}

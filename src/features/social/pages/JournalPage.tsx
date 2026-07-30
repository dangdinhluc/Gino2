import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  FileText,
  Flame,
  PenTool,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { journalStreak, useCommunityStore } from '@/src/features/social/store/communityStore';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';
const inputClass =
  'w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm text-[#172033] outline-none placeholder:text-[#95a0af] focus:ring-2 focus:ring-orange-500';

const PROMPTS = [
  'Hôm nay anh học được từ nào đáng nhớ nhất? Vì sao?',
  'Viết 3 câu tự giới thiệu bằng romaji cho buổi phỏng vấn.',
  'Mô tả cách anh sẽ bắt đầu một ca làm lý tưởng.',
  'Từ nào anh hay quên nhất tuần này? Đặt 1 câu với nó.',
  'Checklist giấy tờ của anh còn thiếu gì? Kế hoạch bổ sung?',
  'Ghi lại một tình huống an toàn lao động anh muốn phản xạ nhanh hơn.',
];

function formatDate(at: number): string {
  const date = new Date(at);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function JournalPage() {
  const journal = useCommunityStore((state) => state.journal);
  const addJournalEntry = useCommunityStore((state) => state.addJournalEntry);
  const updateJournalEntry = useCommunityStore((state) => state.updateJournalEntry);
  const deleteJournalEntry = useCommunityStore((state) => state.deleteJournalEntry);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);
  const streak = useMemo(() => journalStreak(journal), [journal]);
  const totalWords = useMemo(
    () => journal.reduce((sum, entry) => sum + entry.content.split(/\s+/).filter(Boolean).length, 0),
    [journal],
  );

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTagsInput('');
    setActivePrompt(null);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
    if (editingId) {
      updateJournalEntry(editingId, { title: title.trim() || 'Ghi chú không tiêu đề', content, tags });
    } else {
      addJournalEntry({ title, content, prompt: activePrompt, tags });
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const entry = journal.find((item) => item.id === id);
    if (!entry) return;
    setEditingId(id);
    setTitle(entry.title);
    setContent(entry.content);
    setTagsInput(entry.tags.join(', '));
    setActivePrompt(entry.prompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heroStats = [
    { label: 'Chuỗi viết', value: streak, sub: 'ngày liên tục', icon: true },
    { label: 'Bài viết', value: journal.length, sub: 'đã lưu', icon: false },
    { label: 'Tổng số từ', value: totalWords, sub: 'đã viết', icon: false },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              <FileText size={14} /> Journal
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">Nhật ký luyện viết</h1>
            <p className="max-w-2xl text-sm text-[#5f6b7c]">Viết ngắn mỗi ngày — nhật ký lưu ngay trên máy anh và là kho tư liệu quý khi luyện trả lời phỏng vấn.</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {heroStats.map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 md:min-w-[5.5rem]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7b8796]">{stat.icon && <Flame size={11} strokeWidth={1.8} />} {stat.label}</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-xl font-bold leading-none text-[#172033] md:text-2xl">{stat.value}</div>
                <div className="mt-1 text-[11px] text-[#95a0af]">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
              <PenTool size={14} /> {editingId ? 'Sửa bài viết' : 'Viết hôm nay'}
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="flex items-center gap-1 rounded-lg bg-[#f0f2f5] px-3 py-1.5 text-[10px] font-bold text-[#5f6b7c] hover:text-[#172033]">
                <X size={12} /> Hủy sửa
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {PROMPTS.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setActivePrompt((current) => (current === prompt ? null : prompt))}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-colors',
                  activePrompt === prompt ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-orange-700',
                )}
              >
                <Sparkles size={11} className="mr-1 inline" />
                {prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt}
              </button>
            ))}
          </div>
          {activePrompt && (
            <p className="mt-3 rounded-xl border border-orange-200 bg-orange-50/60 px-4 py-3 text-xs font-medium leading-relaxed text-orange-800">{activePrompt}</p>
          )}

          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề (ví dụ: Checklist trước ngày phỏng vấn)" className={`mt-4 font-bold ${inputClass}`} />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Viết vài dòng về buổi học hôm nay... (tiếng Việt hay tiếng Nhật đều được)" className={`mt-3 h-56 resize-none leading-7 ${inputClass}`} />
          <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="Tag, cách nhau bằng dấu phẩy (tokutei, mensetsu, daily...)" className={`mt-3 text-xs font-bold ${inputClass}`} />
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#95a0af]">{wordCount} từ</span>
            <div className="flex items-center gap-2">
              <Link to="/app/ai-lab" className={`rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}>
                Gửi sang AI Writing →
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={!content.trim()}
                className={`inline-flex items-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-800 disabled:opacity-45 ${focusRing}`}
              >
                <Plus size={15} /> {editingId ? 'Lưu thay đổi' : 'Lưu bài viết'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {journal.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d8ccbb] bg-[#fffdf8] px-5 py-12 text-center">
              <CalendarDays size={28} className="mx-auto text-[#c9bca8]" strokeWidth={1.8} />
              <p className="mt-3 font-bold text-[#5f6b7c]">Chưa có bài viết nào</p>
              <p className="mt-1 text-xs text-[#95a0af]">Bắt đầu bằng một gợi ý bên trái — 3 câu cũng được.</p>
            </div>
          )}
          <AnimatePresence>
            {journal.map((entry) => (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={cn(
                  'rounded-2xl border p-5',
                  editingId === entry.id ? 'border-orange-300 bg-orange-50/50' : 'border-[#e8dccb] bg-[#fffaf3]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-[#172033]">{entry.title}</h3>
                    <span className="text-[10px] font-bold text-[#95a0af]">{formatDate(entry.createdAt)}{entry.updatedAt !== entry.createdAt ? ' · đã sửa' : ''}</span>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button type="button" onClick={() => handleEdit(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dccb] bg-[#fffdf8] text-[#95a0af] transition-colors hover:text-orange-700" aria-label="Sửa bài viết">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => deleteJournalEntry(entry.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8dccb] bg-[#fffdf8] text-[#95a0af] transition-colors hover:text-red-600" aria-label="Xóa bài viết">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {entry.prompt && <p className="mt-2 text-xs font-bold text-orange-700">{entry.prompt}</p>}
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-[#5f6b7c]">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">#{tag}</span>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

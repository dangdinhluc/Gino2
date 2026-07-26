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

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm md:px-4 md:py-1.5 md:text-[11px]">
              <FileText size={14} />
              Journal
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900 md:text-4xl">Nhật ký luyện viết</h2>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
              Viết ngắn mỗi ngày — nhật ký lưu ngay trên máy anh và là kho tư liệu quý khi luyện trả lời phỏng vấn.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-orange-100 bg-orange-50 px-3 py-2.5 text-orange-600 md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]"><Flame size={11} /> Chuỗi viết</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{streak}</div>
              <div className="mt-1 text-[10px] font-medium md:text-[11px]">ngày liên tục</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100 bg-blue-50 px-3 py-2.5 text-blue-600 md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Bài viết</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{journal.length}</div>
              <div className="mt-1 text-[10px] font-medium md:text-[11px]">đã lưu</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-emerald-600 md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70 md:text-[10px]">Tổng số từ</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{totalWords}</div>
              <div className="mt-1 text-[10px] font-medium md:text-[11px]">đã viết</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Editor */}
        <div className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <PenTool size={14} /> {editingId ? 'Sửa bài viết' : 'Viết hôm nay'}
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-500 hover:text-gray-700">
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
                  'rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all',
                  activePrompt === prompt ? 'border-orange-200 bg-orange-500 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500',
                )}
              >
                <Sparkles size={11} className="mr-1 inline" />
                {prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt}
              </button>
            ))}
          </div>
          {activePrompt && (
            <p className="mt-3 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-xs font-bold leading-relaxed text-orange-700">{activePrompt}</p>
          )}

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tiêu đề (ví dụ: Checklist trước ngày phỏng vấn)"
            className="mt-4 w-full rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-100"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Viết vài dòng về buổi học hôm nay... (tiếng Việt hay tiếng Nhật đều được)"
            className="mt-3 h-56 w-full resize-none rounded-[1.5rem] border border-[#e1d8cb] bg-white/85 p-5 text-sm leading-7 outline-none focus:ring-2 focus:ring-orange-100"
          />
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="Tag, cách nhau bằng dấu phẩy (tokutei, mensetsu, daily...)"
            className="mt-3 w-full rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-100"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-400">{wordCount} từ</span>
            <div className="flex items-center gap-2">
              <Link to="/app/ai-lab" className="rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-xs font-black text-gray-600 transition-colors hover:bg-orange-50">
                Gửi sang AI Writing →
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={!content.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-transform hover:scale-[1.02] disabled:opacity-45"
              >
                <Plus size={15} /> {editingId ? 'Lưu thay đổi' : 'Lưu bài viết'}
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách bài viết */}
        <div className="space-y-3">
          {journal.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-[#dccfbe] bg-white/60 px-5 py-12 text-center">
              <CalendarDays size={28} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-black text-gray-600">Chưa có bài viết nào</p>
              <p className="mt-1 text-xs font-medium text-gray-400">Bắt đầu bằng một gợi ý bên trái — 3 câu cũng được.</p>
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
                  'rounded-[2rem] border p-5 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.18)]',
                  editingId === entry.id ? 'border-orange-300 bg-orange-50/60' : 'border-[#e6ddd1] bg-[#fffaf3]',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-gray-900">{entry.title}</h3>
                    <span className="text-[10px] font-bold text-gray-400">{formatDate(entry.createdAt)}{entry.updatedAt !== entry.createdAt ? ' · đã sửa' : ''}</span>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e6ddd1] bg-white text-gray-400 transition-colors hover:text-orange-500"
                      aria-label="Sửa bài viết"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e6ddd1] bg-white text-gray-400 transition-colors hover:text-rose-500"
                      aria-label="Xóa bài viết"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {entry.prompt && <p className="mt-2 text-xs font-bold text-orange-500">{entry.prompt}</p>}
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{entry.content}</p>
                {entry.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-500">#{tag}</span>
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

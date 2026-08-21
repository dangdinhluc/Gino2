import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Bell, Check, ChevronRight, Flag, Flame, Globe2, Loader2, MessageCircle, Pencil, Search, Send, Sparkles, UserPlus, Users, X } from 'lucide-react';
import {
  createCommunityPost,
  createProgressPost,
  getCommunityLeaderboard,
  joinCommunityGroup,
  listCommunityGroups,
  formatCommunityDate,
  followCommunityUser,
  getCommunityFeed,
  getCommunityMe,
  getCommunityMessages,
  listCommunityThreads,
  saveCommunityProfile,
  searchCommunityMembers,
  sendCommunityMessage,
  unfollowCommunityUser,
  type CommunityMe,
  type CommunityMember,
  type CommunityLeaderboardEntry,
  blockCommunityUser,
  reportCommunityContent,
  type CommunityGroup,
  type CommunityMessage,
  type CommunityPost,
  type CommunityThread,
} from '@/src/features/social/repositories/communityRepository';
import { cn } from '@/src/lib/utils';
import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';

const panel = 'rounded-[24px] border border-[#e8dccb] bg-[#fffaf3] p-5 shadow-2xs';

export default function CommunityPage() {
  const [me, setMe] = useState<CommunityMe | null>(null);
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [leaderboard, setLeaderboard] = useState<CommunityLeaderboardEntry[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedThread, setSelectedThread] = useState<CommunityThread | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [search, setSearch] = useState('');
  const [postText, setPostText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'profile' | 'post' | 'message'; id: string; label: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [nextMe, nextFeed, nextMembers, nextThreads, nextLeaderboard, nextGroups] = await Promise.all([getCommunityMe(), getCommunityFeed(), searchCommunityMembers(), listCommunityThreads(), getCommunityLeaderboard(), listCommunityGroups()]);
      setMe(nextMe); setFeed(nextFeed); setMembers(nextMembers); setThreads(nextThreads); setLeaderboard(nextLeaderboard); setGroups(nextGroups);
      if (nextMe) { setHandle(nextMe.handle); setBio(nextMe.bio); setIsPublic(nextMe.isPublic); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được cộng đồng.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void searchCommunityMembers(search).then(setMembers).catch(() => undefined); }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!selectedThread) { setMessages([]); return undefined; }
    void getCommunityMessages(selectedThread.otherUserId).then(setMessages).catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được tin nhắn.'));
    try {
      const client = requireSupabase();
      const channel = client.channel(`community-messages-${selectedThread.otherUserId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' }, (payload) => {
          const row = payload.new as { sender_id?: string; recipient_id?: string };
          if (row.sender_id === selectedThread.otherUserId || row.recipient_id === selectedThread.otherUserId) {
            void getCommunityMessages(selectedThread.otherUserId).then(setMessages).catch(() => undefined);
          }
        })
        .subscribe();
      return () => { void client.removeChannel(channel); };
    } catch {
      return undefined;
    }
  }, [selectedThread]);

  useEffect(() => {
    if (!selectedThread) return undefined;
    const timer = window.setInterval(() => { void listCommunityThreads().then(setThreads).catch(() => undefined); }, 30_000);
    return () => window.clearInterval(timer);
  }, [selectedThread]);

  const sortedMessages = useMemo(() => messages, [messages]);

  async function saveProfile(): Promise<void> {
    setSaving(true); setError(null);
    try { setMe(await saveCommunityProfile({ handle, bio, isPublic })); setProfileOpen(false); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không lưu được hồ sơ.'); }
    finally { setSaving(false); }
  }

  async function publishPost(): Promise<void> {
    if (!postText.trim() || saving) return;
    setSaving(true); setError(null);
    try { await createCommunityPost(postText); setPostText(''); setFeed(await getCommunityFeed()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không đăng được bài.'); }
    finally { setSaving(false); }
  }

  async function shareProgress(): Promise<void> {
    setSaving(true); setError(null);
    try { await createProgressPost(); setFeed(await getCommunityFeed()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không chia sẻ được tiến độ.'); }
    finally { setSaving(false); }
  }

  async function toggleFollow(member: CommunityMember): Promise<void> {
    try {
      if (member.following) await unfollowCommunityUser(member.userId); else await followCommunityUser(member.userId);
      setMembers((current) => current.map((item) => item.userId === member.userId ? { ...item, following: !item.following, followerCount: item.followerCount + (item.following ? -1 : 1) } : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không cập nhật follow.'); }
  }

  async function sendMessage(): Promise<void> {
    if (!selectedThread || !messageText.trim() || saving) return;
    setSaving(true); setError(null);
    try { await sendCommunityMessage(selectedThread.otherUserId, messageText); setMessageText(''); setMessages(await getCommunityMessages(selectedThread.otherUserId)); setThreads(await listCommunityThreads()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không gửi được tin nhắn.'); }
    finally { setSaving(false); }
  }

  async function submitReport(): Promise<void> {
    if (!reportTarget || !reportReason.trim() || reporting) return;
    setReporting(true); setError(null);
    try { await reportCommunityContent({ targetType: reportTarget.type, targetId: reportTarget.id, reason: reportReason }); setReportTarget(null); setReportReason(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không gửi được báo cáo.'); }
    finally { setReporting(false); }
  }

  async function blockUser(userId: string): Promise<void> {
    try { await blockCommunityUser(userId); setMembers((current) => current.filter((item) => item.userId !== userId)); setFeed((current) => current.filter((item) => item.userId !== userId)); setThreads((current) => current.filter((item) => item.otherUserId !== userId)); if (selectedThread?.otherUserId === userId) setSelectedThread(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không chặn được người dùng.'); }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      <header className="relative overflow-hidden rounded-[26px] border border-orange-200 bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 sm:p-6">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-orange-700"><Users size={14} /> Cộng đồng Tokutei</p><h1 className="mt-2 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Học cùng nhau, giữ nhịp lâu hơn</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f6b7c]">Chia sẻ tiến độ, theo dõi bạn học và nhắn tin riêng. Email và dữ liệu học riêng không công khai.</p></div>
          <button type="button" onClick={() => setProfileOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#d83a00] px-4 py-2.5 text-sm font-black text-white"><Pencil size={15} /> Hồ sơ cộng đồng</button>
        </div>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <div className="flex items-center gap-2 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-6 text-sm font-bold text-[#5f6b7c]"><Loader2 size={17} className="animate-spin" /> Đang tải cộng đồng…</div> : (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <main className="space-y-5">
            <section className={panel}>
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">Bảng tin</p><h2 className="mt-1 text-xl font-black text-[#172033]">Nhịp học mới nhất</h2></div><button type="button" onClick={() => void shareProgress()} disabled={saving || !me?.isPublic} className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-black text-[#c2410c] disabled:opacity-50"><Sparkles size={14} /> Chia sẻ tiến độ</button></div>
              <div className="mt-4 flex gap-2"><input value={postText} onChange={(event) => setPostText(event.target.value)} maxLength={1000} placeholder="Hôm nay anh đang học gì?" className="min-w-0 flex-1 rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400" /><button type="button" onClick={() => void publishPost()} disabled={!postText.trim() || saving || !me?.isPublic} aria-label="Đăng bài" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d83a00] text-white disabled:opacity-50"><Send size={16} /></button></div>
              {!me?.isPublic && <p className="mt-2 text-xs font-semibold text-amber-700">Bật hồ sơ công khai để đăng bài và chia sẻ tiến độ.</p>}
              <div className="mt-5 space-y-3">{feed.length === 0 ? <p className="rounded-xl border border-dashed border-[#d8ccbb] p-8 text-center text-sm font-semibold text-[#7b8796]">Chưa có bài đăng. Hãy là người đầu tiên chia sẻ.</p> : feed.map((post) => <article key={post.postId} className="rounded-2xl border border-[#f0e5d8] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[#172033]">{post.displayName}</p><p className="text-xs font-semibold text-[#d83a00]">@{post.handle}</p></div><time className="text-[10px] font-bold text-[#95a0af]">{formatCommunityDate(post.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f6b7c]">{post.body}</p>{post.postType === 'progress' && <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700"><Flame size={13} /> Tiến độ học tập</span>}<div className="mt-3 flex gap-2"><button type="button" onClick={() => setReportTarget({ type: 'post', id: post.postId, label: post.displayName })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#7b8796] hover:bg-red-50 hover:text-red-700"><Flag size={12} /> Báo cáo</button><button type="button" onClick={() => void blockUser(post.userId)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#7b8796] hover:bg-slate-100 hover:text-slate-800"><Ban size={12} /> Chặn người này</button></div></article>)}</div>
            </section>
            <section className={panel}><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">Bảng xếp hạng</p><h2 className="mt-1 text-xl font-black text-[#172033]">XP 7 ngày</h2></div><span className="text-xs font-bold text-[#7b8796]">Công khai</span></div><div className="mt-4 space-y-2">{leaderboard.length === 0 ? <p className="text-sm text-[#7b8796]">Chưa có dữ liệu xếp hạng.</p> : leaderboard.slice(0, 5).map((item, index) => <div key={item.userId} className="flex items-center gap-3 rounded-xl border border-[#f0e5d8] bg-white p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-xs font-black text-amber-700">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#172033]">{item.displayName}</p><p className="text-xs text-[#7b8796]">@{item.handle}</p></div><span className="text-xs font-black text-orange-700">{item.weeklyXp} XP</span></div>)}</div></section>
            <section className={panel}><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">Nhóm học</p><h2 className="mt-1 text-xl font-black text-[#172033]">Học theo khóa</h2></div><Users size={18} className="text-[#95a0af]" /></div><div className="mt-4 space-y-2">{groups.length === 0 ? <p className="text-sm text-[#7b8796]">Chưa có nhóm công khai.</p> : groups.slice(0, 5).map((group) => <div key={group.id} className="flex items-center gap-3 rounded-xl border border-[#f0e5d8] bg-white p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#172033]">{group.name}</p><p className="truncate text-xs text-[#7b8796]">{group.memberCount} thành viên · {group.description}</p></div><button type="button" onClick={() => void joinCommunityGroup(group.id).then(() => setGroups((current) => current.map((item) => item.id === group.id ? { ...item, joined: true, memberCount: item.memberCount + (item.joined ? 0 : 1) } : item))).catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tham gia được nhóm.'))} disabled={group.joined} className="rounded-lg bg-[#d83a00] px-2.5 py-1.5 text-xs font-black text-white disabled:bg-emerald-100 disabled:text-emerald-700">{group.joined ? 'Đã tham gia' : 'Tham gia'}</button></div>)}</div></section>
          </main>

          <aside className="space-y-5">
            <section className={panel}><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-orange-700">Bạn học</p><h2 className="mt-1 text-xl font-black text-[#172033]">Tìm người học cùng</h2></div><Search size={18} className="text-[#95a0af]" /></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên hoặc @handle" className="mt-4 w-full rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400" /><div className="mt-4 space-y-2">{members.length === 0 ? <p className="text-sm text-[#7b8796]">Chưa tìm thấy bạn học công khai.</p> : members.map((member) => <div key={member.userId} className="flex items-center gap-3 rounded-xl border border-[#f0e5d8] bg-white p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-black text-orange-700">{member.displayName.charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#172033]">{member.displayName}</p><p className="truncate text-xs text-[#7b8796]">@{member.handle} · {member.followerCount} follow</p></div><button type="button" onClick={() => void toggleFollow(member)} className={cn('rounded-lg px-2.5 py-1.5 text-xs font-black', member.following ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'bg-[#d83a00] text-white')} aria-label={`${member.following ? 'Bỏ theo dõi' : 'Theo dõi'} ${member.displayName}`}>{member.following ? <Check size={14} /> : <UserPlus size={14} />}</button><button type="button" onClick={() => setSelectedThread({ otherUserId: member.userId, displayName: member.displayName, handle: member.handle, lastBody: '', lastAt: new Date().toISOString(), unreadCount: 0 })} className="rounded-lg border border-[#e8dccb] p-1.5 text-[#7b8796]" aria-label={`Nhắn tin ${member.displayName}`}><MessageCircle size={14} /></button><button type="button" onClick={() => setReportTarget({ type: 'profile', id: member.userId, label: member.displayName })} className="rounded-lg border border-[#e8dccb] p-1.5 text-[#7b8796]" aria-label={`Báo cáo ${member.displayName}`}><Flag size={14} /></button><button type="button" onClick={() => void blockUser(member.userId)} className="rounded-lg border border-[#e8dccb] p-1.5 text-[#7b8796]" aria-label={`Chặn ${member.displayName}`}><Ban size={14} /></button></div>)}</div></section>
            <section className={panel}><div className="flex items-center gap-2"><Bell size={16} className="text-orange-700" /><h2 className="text-lg font-black text-[#172033]">Tin nhắn gần đây</h2></div>{threads.length === 0 ? <p className="mt-3 text-sm text-[#7b8796]">Chưa có hội thoại.</p> : <div className="mt-3 space-y-2">{threads.map((thread) => <button type="button" key={thread.otherUserId} onClick={() => setSelectedThread(thread)} className="flex w-full items-center gap-3 rounded-xl border border-[#f0e5d8] bg-white p-3 text-left"><MessageCircle size={17} className="shrink-0 text-orange-700" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#172033]">{thread.displayName}</strong><small className="block truncate text-xs text-[#7b8796]">{thread.lastBody}</small></span>{thread.unreadCount > 0 && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-black text-white">{thread.unreadCount}</span>}<ChevronRight size={15} className="text-[#95a0af]" /></button>)}</div>}</section>
          </aside>
        </div>
      )}

      {profileOpen && <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="community-profile-title" className="w-full max-w-md rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 id="community-profile-title" className="text-xl font-black text-[#172033]">Hồ sơ cộng đồng</h2><button type="button" onClick={() => setProfileOpen(false)} aria-label="Đóng"><X size={18} /></button></div><label className="mt-5 block text-xs font-black text-[#7b8796]">HANDLE<input value={handle} onChange={(event) => setHandle(event.target.value)} maxLength={32} className="mt-1 w-full rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm font-bold" placeholder="ten_cua_anh" /></label><label className="mt-3 block text-xs font-black text-[#7b8796]">GIỚI THIỆU<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={240} className="mt-1 h-24 w-full resize-none rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm" /></label><label className="mt-3 flex items-center gap-2 text-sm font-bold text-[#172033]"><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /> <Globe2 size={15} className="text-emerald-700" /> Hồ sơ công khai</label><button type="button" onClick={() => void saveProfile()} disabled={saving} className="mt-5 w-full rounded-xl bg-[#d83a00] px-4 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu hồ sơ'}</button></section></div>}

      {selectedThread && <div className="fixed inset-0 z-[85] grid place-items-center bg-slate-950/35 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedThread(null); }}><section role="dialog" aria-modal="true" aria-labelledby="community-message-title" className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-[#d83a00]">@{selectedThread.handle}</p><h2 id="community-message-title" className="text-xl font-black text-[#172033]">{selectedThread.displayName}</h2></div><div className="flex items-center gap-1"><button type="button" onClick={() => setReportTarget({ type: 'profile', id: selectedThread.otherUserId, label: selectedThread.displayName })} aria-label="Báo cáo người dùng" className="rounded-lg p-2 text-[#7b8796] hover:bg-red-50 hover:text-red-700"><Flag size={16} /></button><button type="button" onClick={() => void blockUser(selectedThread.otherUserId)} aria-label="Chặn người dùng" className="rounded-lg p-2 text-[#7b8796] hover:bg-slate-100"><Ban size={16} /></button><button type="button" onClick={() => setSelectedThread(null)} aria-label="Đóng"><X size={18} /></button></div></div><div className="my-4 min-h-40 flex-1 space-y-2 overflow-y-auto rounded-2xl border border-[#f0e5d8] bg-white p-3">{sortedMessages.length === 0 ? <p className="py-8 text-center text-sm text-[#7b8796]">Bắt đầu hội thoại.</p> : sortedMessages.map((message) => <div key={message.id} className={cn('flex', message.senderId === me?.userId ? 'justify-end' : 'justify-start')}><div className="flex max-w-[80%] flex-col"><p className={cn('rounded-2xl px-3 py-2 text-sm', message.senderId === me?.userId ? 'bg-[#d83a00] text-white' : 'bg-[#f5eee5] text-[#172033]')}>{message.body}</p>{message.senderId !== me?.userId && <button type="button" onClick={() => setReportTarget({ type: 'message', id: message.id, label: selectedThread.displayName })} className="mt-1 self-start text-[10px] font-bold text-[#7b8796] hover:text-red-700">Báo cáo tin nhắn</button>}</div></div>)}</div><div className="flex gap-2"><input value={messageText} onChange={(event) => setMessageText(event.target.value)} maxLength={2000} onKeyDown={(event) => { if (event.key === 'Enter') void sendMessage(); }} placeholder="Viết tin nhắn…" className="min-w-0 flex-1 rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm" /><button type="button" onClick={() => void sendMessage()} disabled={!messageText.trim() || saving} aria-label="Gửi tin nhắn" className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d83a00] text-white disabled:opacity-50"><Send size={16} /></button></div></section></div>}
      {reportTarget && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportTarget(null); }}><section role="dialog" aria-modal="true" aria-labelledby="community-report-title" className="w-full max-w-md rounded-3xl border border-[#e8dccb] bg-[#fffaf3] p-5 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-red-700">An toàn cộng đồng</p><h2 id="community-report-title" className="mt-1 text-xl font-black text-[#172033]">Báo cáo {reportTarget.label}</h2></div><button type="button" onClick={() => setReportTarget(null)} aria-label="Đóng"><X size={18} /></button></div><p className="mt-3 text-sm text-[#5f6b7c]">Báo cáo được gửi tới đội ngũ quản trị. Không đưa thông tin nhạy cảm vào nội dung.</p><textarea value={reportReason} onChange={(event) => setReportReason(event.target.value)} maxLength={500} placeholder="Lý do báo cáo…" className="mt-4 min-h-28 w-full rounded-xl border border-[#e8dccb] bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400" /><button type="button" onClick={() => void submitReport()} disabled={!reportReason.trim() || reporting} className="mt-4 w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{reporting ? 'Đang gửi…' : 'Gửi báo cáo'}</button></section></div>}
    </div>
  );
}

export function CommunityNavIcon() { return <Users size={18} />; }


import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { AdminNavigationGroup } from '@/src/features/admin/lib/adminNavigation';
import { cn } from '@/src/shared/lib/utils';

interface NavigationProps {
  navigation: readonly AdminNavigationGroup[];
  onNavigate?: () => void;
}

function NavigationList({ navigation, onNavigate }: NavigationProps) {
  return <nav aria-label="Điều hướng quản trị" className="space-y-5">{navigation.map((group) => <section key={group.label ?? 'overview'}>{group.label && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8B7A67]">{group.label}</p>}<div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition', isActive ? 'bg-[#315C73] text-white shadow-sm' : 'text-[#5F6B7C] hover:bg-[#F0E8DC] hover:text-[#315C73]')}><Icon aria-hidden="true" size={17} />{item.label}</NavLink>; })}</div></section>)}</nav>;
}

export function AdminSidebar({ navigation }: NavigationProps) {
  return <aside className="hidden w-64 shrink-0 border-r border-[#E4D8C9] bg-[#FFFCF7] lg:flex lg:min-h-dvh lg:flex-col"><Link to="/admin" className="flex min-h-[76px] items-center gap-3 border-b border-[#E4D8C9] px-6"><span className="grid size-10 place-items-center rounded-2xl bg-[#315C73] text-lg font-bold text-white">G</span><span><strong className="block text-base text-[#172033]">Gino2 Admin</strong><small className="block text-xs text-[#7B8796]">Production workspace</small></span></Link><div className="min-h-0 flex-1 overflow-y-auto px-3 py-5"><NavigationList navigation={navigation} /></div><Link to="/app/dashboard" className="m-3 min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-center text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]">Mở ứng dụng học</Link></aside>;
}

export function AdminMobileNavigation({ navigation, open, onOpen, onClose }: NavigationProps & { open: boolean; onOpen: () => void; onClose: () => void }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  return <><button type="button" onClick={onOpen} aria-label="Mở điều hướng quản trị" aria-expanded={open} className="grid size-11 place-items-center rounded-xl border border-[#D9CBB9] bg-white text-[#315C73] lg:hidden"><Menu aria-hidden="true" size={20} /></button>{open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Đóng điều hướng" onClick={onClose} className="absolute inset-0 bg-[#172033]/35" /><aside aria-label="Menu quản trị" className="relative flex h-full w-[min(19rem,86vw)] flex-col bg-[#FFFCF7] shadow-xl"><header className="flex items-center justify-between border-b border-[#E4D8C9] px-5 py-4"><Link to="/admin" onClick={onClose} className="font-bold text-[#172033]">Gino2 Admin</Link><button type="button" onClick={onClose} aria-label="Đóng điều hướng quản trị" className="grid size-11 place-items-center rounded-xl border border-[#D9CBB9] bg-white text-[#315C73]"><X aria-hidden="true" size={18} /></button></header><div className="min-h-0 flex-1 overflow-y-auto p-4"><NavigationList navigation={navigation} onNavigate={onClose} /></div></aside></div>}</>;
}

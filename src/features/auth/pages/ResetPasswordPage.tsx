import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

export default function ResetPasswordPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return setError('Mật khẩu cần có ít nhất 8 ký tự.');
    if (password !== confirmation) return setError('Xác nhận mật khẩu chưa khớp.');
    setError(null);
    setIsSubmitting(true);
    const result = await auth.updatePassword(password);
    setIsSubmitting(false);
    if (!result.ok) return setError(result.error ?? 'Không cập nhật được mật khẩu.');
    setDone(true);
    window.setTimeout(() => navigate('/app/dashboard', { replace: true }), 800);
  };

  if (!auth.isLoading && !auth.isAuthenticated) return <Navigate to="/forgot-password" replace />;
  return <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4 py-10"><section className="w-full max-w-md rounded-3xl border border-[#e4d8c9] bg-[#fffcf7] p-6 shadow-xl sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#c96a1b]"><LockKeyhole size={22} /></div><h1 className="mt-4 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Đặt mật khẩu mới</h1>{done ? <p className="mt-5 text-sm text-emerald-700">Đã cập nhật mật khẩu, đang vào khu học tập…</p> : <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4"><label className="block text-sm font-bold text-[#172033]">Mật khẩu mới<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label><label className="block text-sm font-bold text-[#172033]">Xác nhận mật khẩu<input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}<button disabled={isSubmitting} className="w-full rounded-xl bg-[#c96a1b] px-4 py-3 text-sm font-black text-white disabled:opacity-60">{isSubmitting ? 'Đang lưu…' : 'Cập nhật mật khẩu'}</button></form>}<p className="mt-5 text-center text-sm"><Link to="/login/learner" className="font-bold text-[#c96a1b]">Về đăng nhập</Link></p></section></main>;
}

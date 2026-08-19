import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

export default function PasswordRecoveryPage() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await auth.requestPasswordReset(email.trim());
    setIsSubmitting(false);
    if (!result.ok) return setError(result.error ?? 'Không gửi được email khôi phục.');
    setSent(true);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4 py-10"><section className="w-full max-w-md rounded-3xl border border-[#e4d8c9] bg-[#fffcf7] p-6 shadow-xl sm:p-8"><Link to="/login/learner" className="text-sm font-bold text-[#c96a1b]">← Quay lại đăng nhập</Link><div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#c96a1b]"><Mail size={22} /></div><h1 className="mt-4 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Khôi phục mật khẩu</h1><p className="mt-2 text-sm leading-6 text-[#5f6b7c]">Nhập email để nhận đường dẫn đặt lại mật khẩu.</p>{sent ? <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Nếu email tồn tại, anh sẽ nhận được đường dẫn khôi phục trong ít phút.</p> : <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4"><label className="block text-sm font-bold text-[#172033]">Email<div className="relative mt-1.5"><Mail size={16} className="absolute left-3 top-3.5 text-[#8a95a3]" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#e4d8c9] bg-white py-3 pl-10 pr-3 outline-none focus:border-orange-500" /></div></label>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}<button disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#c96a1b] px-4 py-3 text-sm font-black text-white disabled:opacity-60"><Send size={16} />{isSubmitting ? 'Đang gửi…' : 'Gửi đường dẫn'}</button></form>}</section></main>
  );
}

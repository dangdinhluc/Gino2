import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, UserPlus } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';

export default function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return setError('Mật khẩu cần có ít nhất 8 ký tự.');
    if (password !== confirmation) return setError('Xác nhận mật khẩu chưa khớp.');
    setError(null);
    setIsSubmitting(true);
    const result = await auth.signUp(email.trim(), password, displayName.trim());
    setIsSubmitting(false);
    if (!result.ok) return setError(result.error ?? 'Không tạo được tài khoản.');
    if (result.requiresEmailConfirmation) return setConfirmationSent(true);
    navigate('/onboarding', { replace: true });
  };

  if (auth.isAuthenticated) return <Navigate to="/onboarding" replace />;

  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e4d8c9] bg-[#fffcf7] p-6 shadow-xl sm:p-8">
        <Link to="/" className="inline-block py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c96a1b]">TOKUTEI GINO</Link>
        <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#c96a1b]"><UserPlus size={22} /></div>
        <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Tạo tài khoản học viên</h1>
        <p className="mt-2 text-sm leading-6 text-[#5f6b7c]">Starter miễn phí sẽ được kích hoạt sau khi anh xác thực email và hoàn tất thông tin học.</p>

        {confirmationSent ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">Email xác thực đã được gửi. Hãy mở đường dẫn trong email để kích hoạt tài khoản, sau đó quay lại hoàn tất onboarding.</div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-[#172033]">Tên hiển thị<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" placeholder="Tên anh" /></label>
            <label className="block text-sm font-bold text-[#172033]">Email<div className="relative mt-1.5"><Mail size={16} className="absolute left-3 top-3.5 text-[#8a95a3]" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#e4d8c9] bg-white py-3 pl-10 pr-3 outline-none focus:border-orange-500" placeholder="anh@example.com" /></div></label>
            <label className="block text-sm font-bold text-[#172033]">Mật khẩu<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label>
            <label className="block text-sm font-bold text-[#172033]">Xác nhận mật khẩu<input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label>
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
            <button disabled={isSubmitting} className="w-full rounded-xl bg-[#c96a1b] px-4 py-3 text-sm font-black text-white disabled:opacity-60">{isSubmitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}</button>
          </form>
        )}
        <p className="mt-5 text-center text-sm text-[#5f6b7c]">Đã có tài khoản? <Link to="/login/learner" className="inline-block px-1 py-2.5 font-black text-[#c96a1b]">Đăng nhập</Link></p>
      </section>
    </main>
  );
}

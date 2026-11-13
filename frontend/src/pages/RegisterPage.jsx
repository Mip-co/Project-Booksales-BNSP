import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/format.js';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-700 text-white">
            <BookOpen size={24} />
          </span>
          <h1 className="text-xl font-extrabold text-emerald-950">Buat akun pelanggan</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <label className="block space-y-1">
            <span className="text-sm font-medium">Nama lengkap</span>
            <input name="name" required maxLength={100} value={form.name} onChange={handleChange} className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Kata sandi (min. 8 karakter)</span>
            <input name="password" type="password" required minLength={8} value={form.password} onChange={handleChange} className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Ulangi kata sandi</span>
            <input name="password_confirmation" type="password" required minLength={8} value={form.password_confirmation} onChange={handleChange} className={field} />
          </label>

          <button
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            Daftar
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}

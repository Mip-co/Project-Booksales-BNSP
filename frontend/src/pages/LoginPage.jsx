import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, BookOpen } from 'lucide-react';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../utils/format.js';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={homePathFor(user)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const loggedIn = await login(form.email, form.password);
      // Admin -> /admin/dashboard. Pelanggan -> halaman asal (mis. checkout) atau katalog.
      const target =
        loggedIn.role === 'admin' ? homePathFor(loggedIn) : (location.state?.from?.pathname ?? '/');
      navigate(target, { replace: true });
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
          <div>
            <h1 className="text-xl font-extrabold text-emerald-950">Masuk ke Booksales</h1>
            <p className="text-sm text-slate-500">Gunakan email dan kata sandi Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input type="email" required autoComplete="email" autoFocus value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Kata sandi</span>
            <input type="password" required autoComplete="current-password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} />
          </label>

          <button
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            Masuk
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-emerald-700 hover:underline">Daftar</Link>
        </p>
        <Link to="/" className="mt-3 block text-center text-sm text-slate-400 hover:text-emerald-700">
          ← Kembali ke katalog
        </Link>
      </div>
    </div>
  );
}

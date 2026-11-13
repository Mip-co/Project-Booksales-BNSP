import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Library, LogIn, LogOut, MessageCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ROLE_LABEL } from '../utils/format.js';
import Avatar from './Avatar.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:text-emerald-800'
  }`;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { totalQty } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-700 text-white">
            <BookOpen size={20} />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-emerald-950 sm:block">
            Booksales
          </span>
        </Link>

        {/* Urutan: [Katalog] [Kontak] [Keranjang + badge (hanya non-admin)] [Foto + Nama + Badge Role -> /user/profile] [Logout].
            Tidak ada tombol "Pesanan": riwayat ada di profil (tab "Riwayat Pesanan"). */}
        <nav className="ml-auto flex shrink-0 items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <span className="flex items-center gap-1.5">
              <Library size={18} />
              <span className="hidden md:inline">Katalog</span>
            </span>
          </NavLink>

          <NavLink to="/contact" className={linkClass}>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={18} />
              <span className="hidden md:inline">Kontak</span>
            </span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin/dashboard" className={linkClass}>
              <span className="flex items-center gap-1.5">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </span>
            </NavLink>
          )}

          {/* Admin tidak berbelanja -> ikon keranjang disembunyikan */}
          {!isAdmin && (
            <Link
              to="/cart"
              aria-label="Keranjang"
              className="relative rounded-lg p-2 text-slate-600 transition hover:text-emerald-800"
            >
              <ShoppingCart size={22} />
              {totalQty > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold leading-5 text-white">
                  {totalQty}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="ml-1 flex items-center gap-2">
              <Link
                to="/user/profile"
                title="Profil saya"
                className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-100"
              >
                <Avatar src={user.photo_url} name={user.name} size="sm" />
                <span className="hidden text-left leading-tight md:block">
                  <span className="block max-w-36 truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    {ROLE_LABEL[user.role]}
                  </span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Keluar"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:text-red-600"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-1 flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <LogIn size={16} /> Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

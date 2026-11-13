import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, ClipboardList, Database, LayoutDashboard, LogOut, PenLine, Tag, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../Avatar.jsx';

// 4 menu utama. Menu ke-4 adalah grup master data (halaman terpisah per entitas).
const MENU = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/admin/transactions', label: 'Transaksi Masuk', Icon: ClipboardList },
  { to: '/admin/books', label: 'Kelola Buku', Icon: BookOpen },
];

const MASTER_GROUP = {
  label: 'Kelola Master User & Genre',
  Icon: Database,
  items: [
    { to: '/admin/users', label: 'Master User', Icon: Users },
    { to: '/admin/genres', label: 'Master Genre', Icon: Tag },
    { to: '/admin/authors', label: 'Master Penulis', Icon: PenLine },
  ],
};

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-emerald-700 text-white' : 'text-emerald-200 hover:bg-emerald-900'
  }`;

/** Kerangka halaman admin: sidebar dark green (#022C22) + <Outlet /> untuk 4 menu.
 * Viewport dikunci (h-screen overflow-hidden): sidebar tetap di tempat, hanya <main> yang scroll. */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inMaster = MASTER_GROUP.items.some((i) => pathname.startsWith(i.to));
  const [masterOpen, setMasterOpen] = useState(true);
  const showMaster = masterOpen || inMaster;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col justify-between bg-[#022C22] p-5 text-emerald-50 md:flex">
        {/* Atas: logo + menu (scroll sendiri bila layar pendek) */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <Link to="/admin/dashboard" className="mb-8 flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600">
            <BookOpen size={22} />
          </span>
          <span className="leading-tight">
            <span className="block font-extrabold">Booksales</span>
            <span className="block text-xs text-emerald-300">Panel Admin</span>
          </span>
        </Link>

        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-emerald-400/70">Menu</p>
        <nav className="space-y-1">
          {MENU.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={itemClass}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}

          {/* Menu 4: grup master data (collapsible) */}
          <button
            type="button"
            onClick={() => setMasterOpen((o) => !o)}
            aria-expanded={showMaster}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
              inMaster ? 'text-white' : 'text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <MASTER_GROUP.Icon size={18} />
            <span className="flex-1 leading-tight">{MASTER_GROUP.label}</span>
            <ChevronDown size={16} className={`transition ${showMaster ? 'rotate-180' : ''}`} />
          </button>
          {showMaster && (
            <div className="ml-4 space-y-1 border-l border-emerald-800 pl-3">
              {MASTER_GROUP.items.map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} className={itemClass}>
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        </div>

        {/* Bawah: profil + Logout, selalu terkunci di dasar sidebar */}
        <div className="mt-4 shrink-0 space-y-3 border-t border-emerald-900 pt-4">
          <Link to="/user/profile" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-emerald-900">
            <Avatar src={user?.photo_url} name={user?.name ?? ''} size="sm" />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">{user?.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
              </span>
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-800 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900"
          >
            <LogOut size={16} /> Keluar Panel
          </button>
        </div>
      </aside>

      {/* Navigasi ringkas (mobile) */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto bg-[#022C22] p-3 md:hidden">
        {[...MENU, ...MASTER_GROUP.items].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                isActive ? 'bg-emerald-600 text-white' : 'text-emerald-200'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
        <button onClick={handleLogout} aria-label="Keluar" className="ml-auto shrink-0 text-emerald-200">
          <LogOut size={18} />
        </button>
      </div>

      <main className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}

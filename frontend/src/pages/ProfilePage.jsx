import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClipboardList, LogOut, User } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import AccountInfoForm from '../components/profile/AccountInfoForm.jsx';
import TransactionHistory from '../components/profile/TransactionHistory.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABEL } from '../utils/format.js';

/**
 * Dashboard User (/user/profile) — satu halaman, konten kanan berganti lewat state tab:
 *   'info'   -> Form Edit Profil
 *   'orders' -> Daftar & tabel Riwayat Pesanan (khusus pelanggan)
 * Parameter ?tab=orders&code=ORD-... dipakai redirect checkout untuk langsung membuka riwayat.
 */
export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [tab, setTab] = useState(!isAdmin && params.get('tab') === 'orders' ? 'orders' : 'info');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menu = [
    { key: 'info', label: 'Info Akun', Icon: User },
    ...(isAdmin ? [] : [{ key: 'orders', label: 'Riwayat Pesanan', Icon: ClipboardList }]),
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      {/* Kolom kiri: sidebar user */}
      <aside className="flex h-fit flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white p-6">
        <Avatar src={user.photo_url} name={user.name} size="lg" />
        <h2 className="text-lg font-bold">{user.name}</h2>
        <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
          {ROLE_LABEL[user.role]}
        </span>

        <nav className="mt-3 w-full space-y-1 border-t pt-4">
          {menu.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              aria-current={tab === key ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                tab === key
                  ? 'bg-emerald-50 font-semibold text-emerald-800'
                  : 'font-medium text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={16} /> Keluar Akun
        </button>
      </aside>

      {/* Kolom kanan: konten dinamis */}
      <div className="min-w-0">
        {tab === 'orders' ? <TransactionHistory initialCode={params.get('code') ?? ''} /> : <AccountInfoForm />}
      </div>
    </div>
  );
}

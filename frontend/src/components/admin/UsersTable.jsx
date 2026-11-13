import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ROLE_LABEL, formatDate } from '../../utils/format.js';
import Avatar from '../Avatar.jsx';

const ROLE_STYLE = {
  admin: 'bg-violet-100 text-violet-800',
  customer: 'bg-emerald-100 text-emerald-800',
};

export default function UsersTable({ users, currentUserId, search, onSearch, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari nama atau email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3">Transaksi</th>
              <th className="px-4 py-3">Akses Terakhir</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada akun yang cocok.</td>
              </tr>
            )}
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.photo_url} name={u.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {u.name} {isSelf && <span className="text-xs font-normal text-slate-400">(Anda)</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ROLE_STYLE[u.role]}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{u.transactions_count}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.last_access)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit(u)} aria-label={`Ubah ${u.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(u)}
                        disabled={isSelf}
                        aria-label={`Hapus ${u.name}`}
                        title={isSelf ? 'Tidak dapat menghapus akun sendiri' : undefined}
                        className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

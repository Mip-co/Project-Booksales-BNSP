import { Pencil, Plus, Trash2 } from 'lucide-react';
import Avatar from '../Avatar.jsx';

export default function AuthorsTable({ authors, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus size={16} /> Tambah Penulis
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Bio</th>
              <th className="px-4 py-3">Jumlah Buku</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {authors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada penulis.</td>
              </tr>
            )}
            {authors.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={a.photo_url} name={a.name} size="sm" />
                    <span className="font-medium">{a.name}</span>
                  </div>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-500">{a.bio || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{a.books_count}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(a)} aria-label={`Ubah ${a.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      disabled={a.books_count > 0}
                      aria-label={`Hapus ${a.name}`}
                      title={a.books_count > 0 ? 'Penulis masih memiliki buku' : undefined}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

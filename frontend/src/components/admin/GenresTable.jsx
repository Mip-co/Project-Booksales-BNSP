import { Pencil, Plus, Trash2 } from 'lucide-react';

export default function GenresTable({ genres, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus size={16} /> Tambah Genre
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama Genre</th>
              <th className="px-4 py-3">Deskripsi</th>
              <th className="px-4 py-3">Jumlah Buku</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {genres.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada genre.</td>
              </tr>
            )}
            {genres.map((g) => (
              <tr key={g.id}>
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-slate-500">{g.description || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{g.books_count}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(g)} aria-label={`Ubah ${g.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(g)}
                      disabled={g.books_count > 0}
                      aria-label={`Hapus ${g.name}`}
                      title={g.books_count > 0 ? 'Genre masih memiliki buku' : undefined}
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

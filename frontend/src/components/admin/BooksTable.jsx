import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { rupiah } from '../../utils/format.js';
import BookCover from '../BookCover.jsx';

const LOW_STOCK = 10;

export default function BooksTable({ books, search, onSearch, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Cari judul atau penulis…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus size={16} /> Tambah Buku
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Buku</th>
              <th className="px-4 py-3">Genre</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {books.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada buku yang cocok.</td>
              </tr>
            )}
            {books.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BookCover src={b.cover_url} alt={`Cover ${b.title}`} className="h-16 w-11 shrink-0 rounded" />
                    <div className="min-w-0">
                      <p className="font-medium">{b.title}</p>
                      <p className="text-xs text-slate-500">{b.author?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.genre?.name}</td>
                <td className="px-4 py-3 font-medium">{rupiah(b.price)}</td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${b.stock <= LOW_STOCK ? 'text-red-600' : ''}`}>{b.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${b.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {b.stock > 0 ? 'Tersedia' : 'Habis'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(b)} aria-label={`Ubah ${b.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(b)} aria-label={`Hapus ${b.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
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

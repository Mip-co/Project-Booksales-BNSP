import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { rupiah } from '../utils/format.js';
import BookCover from './BookCover.jsx';

/** Kartu buku di katalog. Klik kartu -> halaman detail /books/:id. */
export default function BookCard({ book, onAdd }) {
  const { isAdmin } = useAuth();
  const outOfStock = book.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/books/${book.id}`} className="block" aria-label={`Lihat detail ${book.title}`}>
        <div className="relative bg-slate-100">
          <BookCover src={book.cover_url} alt={`Cover ${book.title}`} className="aspect-[2/3] w-full" />
          {outOfStock && (
            <span className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-bold uppercase tracking-wide text-white">
              Stok habis
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          {book.genre?.name}
        </span>
        <Link to={`/books/${book.id}`}>
          <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 hover:text-emerald-800" title={book.title}>
            {book.title}
          </h3>
        </Link>
        <p className="line-clamp-1 text-sm text-slate-500">{book.author?.name}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-lg font-bold text-emerald-800">{rupiah(book.price)}</p>
            <p className="text-xs text-slate-400">{outOfStock ? 'Tidak tersedia' : `Stok ${book.stock}`}</p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => onAdd(book)}
              disabled={outOfStock}
              aria-label={`Tambah ${book.title} ke keranjang`}
              className="flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Plus size={16} /> Tambah
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import BookCover from '../components/BookCover.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { bookService } from '../services/bookService.js';
import { getErrorMessage, rupiah } from '../utils/format.js';

/** Detail buku: kolom kiri cover + badge stok, kolom kanan informasi & kontrol pembelian. */
export default function BookDetailPage() {
  const { id } = useParams();
  const { add } = useCart();
  const { isAdmin } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setQty(1);
    bookService
      .get(id)
      .then((data) => !cancelled && setBook(data))
      .catch((err) =>
        !cancelled && setError(err?.response?.status === 404 ? 'Buku tidak ditemukan.' : getErrorMessage(err))
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-emerald-700">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="grid place-items-center gap-4 rounded-3xl bg-white py-20 text-center">
        <p className="text-lg font-semibold text-slate-700">{error || 'Buku tidak ditemukan.'}</p>
        <Link to="/" className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const outOfStock = book.stock <= 0;

  const handleAdd = () => {
    add(book, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline">
        <ArrowLeft size={16} /> Kembali ke Katalog
      </Link>

      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 md:grid-cols-[320px_1fr]">
        {/* Kiri: cover + badge stok */}
        <div className="relative mx-auto w-full max-w-xs">
          <BookCover
            src={book.cover_url}
            alt={`Cover ${book.title}`}
            className="aspect-[2/3] w-full rounded-2xl shadow-lg"
          />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow ${
              outOfStock ? 'bg-red-600 text-white' : 'bg-white text-emerald-800'
            }`}
          >
            {outOfStock ? 'Stok habis' : `Stok ${book.stock}`}
          </span>
        </div>

        {/* Kanan: informasi */}
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
            {book.genre?.name}
          </span>
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900">{book.title}</h1>
            <p className="mt-1 text-slate-500">
              oleh <span className="font-semibold text-slate-700">{book.author?.name}</span>
            </p>
          </div>

          <p className="text-3xl font-extrabold text-emerald-800">{rupiah(book.price)}</p>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Deskripsi</h2>
            <p className="mt-1 whitespace-pre-line leading-relaxed text-slate-700">
              {book.description || 'Belum ada deskripsi untuk buku ini.'}
            </p>
          </div>

          {/* Admin tidak berbelanja -> kontrol pembelian disembunyikan */}
          {!isAdmin && (
            <div className="mt-auto flex flex-wrap items-center gap-3 border-t pt-5">
              <div className="flex items-center rounded-xl border border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1 || outOfStock}
                  aria-label="Kurangi jumlah"
                  className="p-3 text-slate-600 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold">{outOfStock ? 0 : qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(book.stock, q + 1))}
                  disabled={qty >= book.stock || outOfStock}
                  aria-label="Tambah jumlah"
                  className="p-3 text-slate-600 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added ? 'Ditambahkan' : '+ Tambah ke Keranjang'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Landmark, Laptop, Library, Lightbulb, Loader2, Search, ShieldCheck, Truck, X } from 'lucide-react';
import BookCard from '../components/BookCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { bookService } from '../services/bookService.js';
import { genreService } from '../services/genreService.js';
import { getErrorMessage } from '../utils/format.js';

// Ikon genre dipilih dari kata kunci pada nama (tabel genres tidak punya slug/ikon).
// Genre baru buatan admin yang tidak cocok kata kunci memakai ikon Library.
const GENRE_ICON_RULES = [
  [/novel|fiksi|cerita|sastra/i, BookOpen],
  [/diri|motivasi|kebiasaan/i, Lightbulb],
  [/teknologi|komputer|program/i, Laptop],
  [/sejarah|sosial|budaya/i, Landmark],
];
const iconForGenre = (name) => GENRE_ICON_RULES.find(([re]) => re.test(name))?.[1] ?? Library;

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const [query, setQuery] = useState(search);
  const { add } = useCart();

  const [genres, setGenres] = useState([]);
  const [genreId, setGenreId] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Search bar: ketikan ditunda 350 ms lalu disimpan di URL (?q=) agar bisa di-bookmark / di-refresh.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const q = query.trim();
      setParams(q ? { q } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, setParams]);

  useEffect(() => {
    genreService.list().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    bookService
      .list({ search: search || undefined, genre_id: genreId ?? undefined })
      .then((data) => !cancelled && setBooks(data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, genreId]);

  const handleAdd = useCallback(
    (book) => {
      add(book);
      setToast(`"${book.title}" ditambahkan ke keranjang`);
      setTimeout(() => setToast(''), 1800);
    },
    [add]
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 p-8 text-white sm:p-12">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            <ShieldCheck size={14} /> Toko buku terpercaya
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
            Temukan Buku Favoritmu
          </h1>
          <p className="mt-3 text-emerald-50/90">
            Novel, pengembangan diri, teknologi, hingga sejarah. Pilih dari rumah, kami kirim
            dengan cepat dan aman.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-emerald-50">
            <span className="flex items-center gap-2"><Truck size={16} /> Pengiriman cepat</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} /> Buku original</span>
          </div>
        </div>
        <BookOpen size={260} className="absolute -right-12 -top-8 rotate-12 text-white/10" />
      </section>

      {/* Search bar (di bawah hero, di atas filter genre) */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setParams(query.trim() ? { q: query.trim() } : {}, { replace: true });
        }}
        className="relative"
      >
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari judul atau penulis buku..."
          aria-label="Cari buku"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        )}
      </form>

      {/* Filter genre */}
      <section className="flex flex-wrap gap-3">
        <GenreChip label="Semua" Icon={Library} active={genreId === null} onClick={() => setGenreId(null)} />
        {genres.map((g) => (
          <GenreChip
            key={g.id}
            label={g.name}
            Icon={iconForGenre(g.name)}
            active={genreId === g.id}
            onClick={() => setGenreId(g.id)}
          />
        ))}
      </section>

      {search && (
        <p className="text-sm text-slate-500">
          Hasil pencarian judul/penulis untuk <strong className="text-slate-800">“{search}”</strong>
        </p>
      )}

      {loading ? (
        <div className="grid place-items-center py-20 text-emerald-700">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : (
        <section>
          <h2 className="mb-3 text-xl font-bold text-slate-900">
            Katalog Buku <span className="text-sm font-medium text-slate-400">({books.length})</span>
          </h2>
          {books.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-slate-500">Tidak ada buku yang cocok.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {books.map((b) => (
                <BookCard key={b.id} book={b} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </section>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-emerald-950 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function GenreChip({ label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? 'border-emerald-700 bg-emerald-700 text-white shadow'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );
}

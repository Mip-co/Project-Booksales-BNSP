import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import BookCover from '../components/BookCover.jsx';
import { useCart } from '../context/CartContext.jsx';
import { rupiah } from '../utils/format.js';

export default function CartPage() {
  const { items, setQty, remove, totalPrice, totalQty } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="grid place-items-center gap-4 rounded-3xl bg-white py-20 text-center">
        <ShoppingBag size={48} className="text-emerald-300" />
        <h1 className="text-xl font-bold">Keranjang masih kosong</h1>
        <Link to="/" className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white hover:bg-emerald-800">
          Mulai belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold">Keranjang Belanja</h1>

        {items.map((item) => (
          <article key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <BookCover src={item.cover_url} alt={`Cover ${item.title}`} className="h-28 w-[74px] shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold leading-snug">{item.title}</h2>
                  <p className="text-xs text-slate-500">{item.author}</p>
                  <p className="mt-1 text-sm text-slate-600">{rupiah(item.price)}</p>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  aria-label={`Hapus ${item.title}`}
                  className="text-slate-400 transition hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-xl border border-slate-200">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    disabled={item.qty <= 1}
                    aria-label="Kurangi"
                    className="p-2 text-slate-600 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    disabled={item.qty >= item.stock}
                    aria-label="Tambah"
                    className="p-2 text-slate-600 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-bold text-emerald-800">{rupiah(item.price * item.qty)}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">Ringkasan</h2>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Jumlah buku</span>
          <span>{totalQty}</span>
        </div>
        <div className="flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="text-emerald-800">{rupiah(totalPrice)}</span>
        </div>
        <p className="text-xs text-slate-400">
          Total akhir dihitung ulang oleh server saat checkout.
        </p>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800"
        >
          Lanjut ke Checkout
        </button>
      </aside>
    </div>
  );
}

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import OrderProgress from '../OrderProgress.jsx';
import { orderService } from '../../services/orderService.js';
import { STATUS_LABEL, STATUS_STYLE, formatDate, getErrorMessage, rupiah } from '../../utils/format.js';

const POLL_MS = 15000;

/**
 * Tab "Riwayat Pesanan": tabel pesanan milik pelanggan.
 * Klik baris untuk melihat progress bar status + detail item + data pengiriman.
 * `initialCode` (dari redirect checkout) membuka otomatis pesanan yang baru dibuat.
 */
export default function OrderHistory({ initialCode = '' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(initialCode);
  const [expandedId, setExpandedId] = useState(null);
  const autoOpened = useRef(false);

  const load = useCallback(async () => {
    try {
      setOrders(await orderService.myOrders());
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat + polling ringan agar progres status terlihat "live".
  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Buka otomatis pesanan yang baru dibuat (sekali saja).
  useEffect(() => {
    if (autoOpened.current || orders.length === 0) return;
    autoOpened.current = true;
    const match = initialCode && orders.find((o) => o.order_code === initialCode);
    if (match) setExpandedId(match.id);
  }, [orders, initialCode]);

  const q = query.trim().toUpperCase();
  const visible = q ? orders.filter((o) => o.order_code.includes(q)) : orders;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Riwayat Pesanan</h1>
          <p className="text-sm text-slate-500">Pantau status dan detail seluruh transaksi Anda.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kode pesanan…"
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid place-items-center py-16 text-emerald-700">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : visible.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-8 text-center text-slate-500">
          {orders.length === 0 ? 'Belum ada pesanan.' : 'Kode pesanan tidak ditemukan.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const open = expandedId === o.id;
                return (
                  <Fragment key={o.id}>
                    <tr
                      onClick={() => setExpandedId(open ? null : o.id)}
                      className={`cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/50 ${open ? 'bg-emerald-50/50' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-800">{o.order_code}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3 text-slate-600">{o.items.reduce((s, i) => s + i.qty, 0)} pcs</td>
                      <td className="px-4 py-3 font-semibold">{rupiah(o.total_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[o.status]}`}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-slate-400">
                        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                    </tr>

                    {open && (
                      <tr className="border-t border-slate-100 bg-slate-50/60">
                        <td colSpan={6} className="space-y-5 px-4 py-5 sm:px-6">
                          <OrderProgress status={o.status} />

                          <table className="w-full text-sm">
                            <thead className="text-xs uppercase tracking-wide text-slate-400">
                              <tr>
                                <th className="py-1 text-left">Buku</th>
                                <th className="py-1 text-right">Harga</th>
                                <th className="py-1 text-right">Qty</th>
                                <th className="py-1 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {o.items.map((i) => (
                                <tr key={i.id}>
                                  <td className="py-2">{i.book_title}</td>
                                  <td className="py-2 text-right text-slate-600">{rupiah(i.price)}</td>
                                  <td className="py-2 text-right text-slate-600">{i.qty}</td>
                                  <td className="py-2 text-right font-medium">{rupiah(i.subtotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-slate-300 font-bold">
                                <td colSpan={3} className="py-2 text-right">Total</td>
                                <td className="py-2 text-right text-emerald-800">{rupiah(o.total_price)}</td>
                              </tr>
                            </tfoot>
                          </table>

                          <dl className="grid gap-3 rounded-xl bg-white p-4 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Penerima</dt>
                              <dd>{o.customer_name} · {o.phone}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alamat pengiriman</dt>
                              <dd>{o.shipping_address}</dd>
                            </div>
                            {o.notes && (
                              <div className="sm:col-span-2">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan</dt>
                                <dd>{o.notes}</dd>
                              </div>
                            )}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

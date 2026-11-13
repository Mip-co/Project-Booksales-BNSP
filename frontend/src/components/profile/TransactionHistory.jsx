import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import OrderBooksCell from '../OrderBooksCell.jsx';
import OrderDetail from '../OrderDetail.jsx';
import OrderProgress from '../OrderProgress.jsx';
import { transactionService } from '../../services/transactionService.js';
import { STATUS_LABEL, STATUS_STYLE, formatDate, getErrorMessage, rupiah } from '../../utils/format.js';

const POLL_MS = 15000;

/**
 * Tab "Riwayat Pesanan": satu baris per checkout (bukan per buku).
 * Klik baris untuk melihat progress bar, seluruh buku, ongkir, kurir, dan pembayaran.
 * `initialCode` (dari redirect checkout) = nomor order yang baru dibuat; dibuka otomatis.
 */
export default function TransactionHistory({ initialCode = '' }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(initialCode);
  const [expanded, setExpanded] = useState(null); // order_number
  const autoOpened = useRef(false);

  const load = useCallback(async () => {
    try {
      setOrders(await transactionService.my());
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

  // Buka otomatis order yang baru dibuat (sekali saja).
  useEffect(() => {
    if (autoOpened.current || orders.length === 0) return;
    autoOpened.current = true;
    if (initialCode && orders.some((o) => o.order_number === initialCode)) setExpanded(initialCode);
  }, [orders, initialCode]);

  const q = query.trim().toUpperCase();
  const visible = q ? orders.filter((o) => o.order_number.includes(q)) : orders;

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Riwayat Pesanan</h1>
          <p className="text-sm text-slate-500">Pantau status dan detail setiap checkout Anda.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nomor order…"
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
          {orders.length === 0 ? 'Belum ada pesanan.' : 'Nomor order tidak ditemukan.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">No. Order</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Buku</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const open = expanded === o.order_number;
                return (
                  <Fragment key={o.order_number}>
                    <tr
                      onClick={() => setExpanded(open ? null : o.order_number)}
                      className={`cursor-pointer border-t border-slate-100 transition hover:bg-emerald-50/50 ${open ? 'bg-emerald-50/50' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-800">{o.order_number}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3"><OrderBooksCell order={o} /></td>
                      <td className="px-4 py-3 text-right font-semibold">{rupiah(o.total_amount)}</td>
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
                          <OrderDetail order={o} />
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

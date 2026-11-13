import { Loader2 } from 'lucide-react';
import { STATUS_LABEL, STATUS_STYLE, formatDate, rupiah } from '../../utils/format.js';

const NEXT = { pending: 'diproses', diproses: 'dikirim', dikirim: 'selesai' };

/**
 * Tabel Live Order Monitor.
 * Dropdown hanya menawarkan status saat ini + satu langkah berikutnya,
 * selaras dengan validasi di server (status tidak boleh melompat/mundur).
 */
export default function OrdersTable({ orders, onChangeStatus, updatingId }) {
  if (orders.length === 0) {
    return <p className="rounded-2xl bg-white p-8 text-center text-slate-500">Belum ada pesanan masuk.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Kode</th>
            <th className="px-4 py-3">Pelanggan</th>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Waktu</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((o) => {
            const options = [o.status, NEXT[o.status]].filter(Boolean);
            return (
              <tr key={o.id} className="align-top">
                <td className="px-4 py-3 font-mono font-semibold text-emerald-800">{o.order_code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.customer_name}</p>
                  <p className="text-xs text-slate-500">{o.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {o.items.map((i) => (
                    <p key={i.id}>{i.book_title} ×{i.qty}</p>
                  ))}
                </td>
                <td className="px-4 py-3 font-semibold">{rupiah(o.total_price)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.status}
                      disabled={!NEXT[o.status] || updatingId === o.id}
                      onChange={(e) => onChangeStatus(o.id, e.target.value)}
                      className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-bold outline-none disabled:opacity-80 ${STATUS_STYLE[o.status]}`}
                    >
                      {options.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    {updatingId === o.id && <Loader2 size={14} className="animate-spin text-slate-400" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

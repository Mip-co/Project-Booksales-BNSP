import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { PAYMENT_LABEL, SHIPPING_LABEL, STATUS_LABEL, STATUS_STYLE, formatDate, rupiah } from '../../utils/format.js';
import OrderBooksCell from '../OrderBooksCell.jsx';
import OrderDetail from '../OrderDetail.jsx';

const NEXT = { pending: 'diproses', diproses: 'dikirim', dikirim: 'selesai' };

/**
 * Tabel Live Order Monitor: satu baris per checkout.
 * Dropdown hanya menawarkan status saat ini + satu langkah berikutnya (selaras dengan
 * validasi server). Mengubah status memperbarui SEMUA buku dalam order itu sekaligus.
 * Klik baris untuk melihat rincian semua buku.
 */
export default function TransactionsTable({ rows, onChangeStatus, updatingId }) {
  const [expanded, setExpanded] = useState(null); // order_number

  if (rows.length === 0) {
    return <p className="rounded-2xl bg-white p-8 text-center text-slate-500">Belum ada transaksi masuk.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">No. Order</th>
            <th className="px-4 py-3">Pelanggan</th>
            <th className="px-4 py-3">Buku</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Waktu</th>
            <th className="px-4 py-3">Status</th>
            <th className="w-10 px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const open = expanded === o.order_number;
            const options = [o.status, NEXT[o.status]].filter(Boolean);
            const busy = updatingId === o.order_number;

            return (
              <Fragment key={o.order_number}>
                <tr
                  onClick={() => setExpanded(open ? null : o.order_number)}
                  className={`cursor-pointer border-t border-slate-100 align-top transition hover:bg-emerald-50/40 ${open ? 'bg-emerald-50/40' : ''}`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-800">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.recipient_name ?? o.customer?.name}</p>
                    <p className="text-xs text-slate-500">{o.customer?.email}</p>
                    <p className="text-xs text-slate-500">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3"><OrderBooksCell order={o} /></td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{rupiah(o.total_amount)}</p>
                    <p className="text-xs text-slate-500">
                      {SHIPPING_LABEL[o.shipping_method] ?? '-'} · {PAYMENT_LABEL[o.payment_method] ?? '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <select
                        value={o.status}
                        disabled={!NEXT[o.status] || busy}
                        onChange={(e) => onChangeStatus(o.order_number, e.target.value)}
                        aria-label={`Status order ${o.order_number}`}
                        className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-bold outline-none disabled:opacity-80 ${STATUS_STYLE[o.status]}`}
                      >
                        {options.map((st) => (
                          <option key={st} value={st}>{STATUS_LABEL[st]}</option>
                        ))}
                      </select>
                      {busy && <Loader2 size={14} className="animate-spin text-slate-400" />}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-slate-400">
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                </tr>

                {open && (
                  <tr className="border-t border-slate-100 bg-slate-50/60">
                    <td colSpan={7} className="px-4 py-5 sm:px-6">
                      <OrderDetail order={o} showCustomer />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

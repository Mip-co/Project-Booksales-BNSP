import { PAYMENT_LABEL, SHIPPING_LABEL, rupiah } from '../utils/format.js';
import BookCover from './BookCover.jsx';

const dt = 'text-xs font-semibold uppercase tracking-wide text-slate-400';

/**
 * Rincian satu order (checkout): semua buku + qty + subtotal, subtotal keranjang,
 * ongkir, total bayar, lalu data penerima, kurir, dan metode pembayaran.
 * Dipakai di Riwayat Pesanan (pelanggan) dan Transaksi Masuk (admin).
 */
export default function OrderDetail({ order, showCustomer = false }) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2 text-left">Buku</th>
              <th className="px-4 py-2 text-right">Harga</th>
              <th className="px-4 py-2 text-right">Qty</th>
              <th className="px-4 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <BookCover src={i.cover_url} alt="" className="h-12 w-8 shrink-0 rounded" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{i.title}</p>
                      <p className="text-xs text-slate-500">{i.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-slate-600">{rupiah(i.price)}</td>
                <td className="px-4 py-2 text-right text-slate-600">{i.quantity}</td>
                <td className="px-4 py-2 text-right font-medium">{rupiah(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 text-sm">
            <tr>
              <td colSpan={3} className="px-4 pt-2 text-right text-slate-500">Subtotal buku</td>
              <td className="px-4 pt-2 text-right">{rupiah(order.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-1 text-right text-slate-500">
                Ongkos kirim ({SHIPPING_LABEL[order.shipping_method] ?? '-'})
              </td>
              <td className="px-4 py-1 text-right">{rupiah(order.shipping_cost)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={3} className="px-4 pb-3 pt-1 text-right">Total Bayar</td>
              <td className="px-4 pb-3 text-right text-emerald-800">{rupiah(order.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <dl className="grid gap-3 rounded-xl bg-white p-4 text-sm sm:grid-cols-2">
        {showCustomer && order.customer && (
          <div>
            <dt className={dt}>Akun pelanggan</dt>
            <dd>{order.customer.name} · {order.customer.email}</dd>
          </div>
        )}
        <div>
          <dt className={dt}>Penerima</dt>
          <dd>{order.recipient_name} · {order.phone}</dd>
        </div>
        <div>
          <dt className={dt}>Kurir</dt>
          <dd>{SHIPPING_LABEL[order.shipping_method] ?? '-'}</dd>
        </div>
        <div>
          <dt className={dt}>Metode pembayaran</dt>
          <dd>{PAYMENT_LABEL[order.payment_method] ?? '-'}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={dt}>Alamat pengiriman</dt>
          <dd>{order.shipping_address}</dd>
        </div>
        {order.notes && (
          <div className="sm:col-span-2">
            <dt className={dt}>Catatan</dt>
            <dd>{order.notes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

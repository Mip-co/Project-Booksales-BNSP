import { useCallback, useEffect, useState } from 'react';
import Notice from '../../components/admin/Notice.jsx';
import OrdersTable from '../../components/admin/OrdersTable.jsx';
import { useNotice } from '../../hooks/useNotice.js';
import { orderService } from '../../services/orderService.js';
import { ORDER_STEPS, STATUS_LABEL, getErrorMessage } from '../../utils/format.js';

const POLL_MS = 10000;

/** Menu 2 — Transaksi Masuk: Live Order Monitor + ubah status pesanan. */
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, flash] = useNotice();

  const load = useCallback(
    () => orderService.adminList().then(setOrders).catch((e) => flash('error', getErrorMessage(e))),
    [flash]
  );

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS); // "real-time" via polling
    return () => clearInterval(timer);
  }, [load]);

  const handleChangeStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const updated = await orderService.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      flash('success', `Status pesanan ${updated.order_code} → ${STATUS_LABEL[updated.status]}`);
    } catch (e) {
      flash('error', getErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const count = (s) => orders.filter((o) => o.status === s).length;

  return (
    <>
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          Transaksi Masuk
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" /> Live
          </span>
        </h1>
        <p className="text-sm text-slate-500">Pantau pesanan pelanggan dan perbarui statusnya.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {[['all', 'Semua', orders.length], ...ORDER_STEPS.map((s) => [s, STATUS_LABEL[s], count(s)])].map(
          ([key, label, n]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filter === key ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600 hover:bg-emerald-50'
              }`}
            >
              {label} <span className="opacity-70">({n})</span>
            </button>
          )
        )}
      </div>

      <Notice notice={notice} />
      <OrdersTable orders={visible} onChangeStatus={handleChangeStatus} updatingId={updatingId} />
    </>
  );
}

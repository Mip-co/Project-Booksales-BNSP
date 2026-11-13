import { useEffect, useState } from 'react';
import { BookOpen, Boxes, Loader2, Users, Wallet } from 'lucide-react';
import GenreDoughnut from '../../components/admin/charts/GenreDoughnut.jsx';
import SalesTrendChart from '../../components/admin/charts/SalesTrendChart.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import { dashboardService } from '../../services/dashboardService.js';
import { getErrorMessage, rupiah } from '../../utils/format.js';

const REFRESH_MS = 30000;

/** Menu 1 — Dashboard: 4 stat card + grafik tren penjualan + doughnut genre. */
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = () =>
      dashboardService
        .get()
        .then((d) => active && (setData(d), setError('')))
        .catch((e) => active && setError(getErrorMessage(e)));

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Pantau penjualan dan inventaris toko buku dengan mudah.</p>
      </header>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!data ? (
        !error && (
          <div className="grid place-items-center py-20 text-emerald-700">
            <Loader2 className="animate-spin" size={32} />
          </div>
        )
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Omset Selesai" value={rupiah(data.stats.total_revenue)} hint="Sinkron real-time" Icon={Wallet} />
            <StatCard label="Produk Aktif (SKU)" value={data.stats.active_books} hint="Judul buku dengan stok tersedia" Icon={BookOpen} tone="sky" />
            <StatCard label="Total Pelanggan" value={data.stats.total_customers} hint="Akun terdaftar" Icon={Users} tone="amber" />
            <StatCard
              label="Total Stok Keseluruhan"
              value={data.stats.total_stock.toLocaleString('id-ID')}
              hint="Jumlah seluruh eksemplar buku"
              Icon={Boxes}
              tone="red"
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
              <h2 className="font-bold text-slate-900">Tren Penjualan</h2>
              <p className="mb-3 text-xs text-slate-400">Pemasukan omset 6 bulan terakhir</p>
              <SalesTrendChart data={data.sales_trend} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-slate-900">Kategori Genre</h2>
              <p className="mb-3 text-xs text-slate-400">Distribusi buku terjual per genre (status selesai)</p>
              <GenreDoughnut data={data.genre_distribution} />
            </div>
          </section>
        </>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, MapPin, ShieldCheck, Truck, UserCheck } from 'lucide-react';
import BookCover from '../components/BookCover.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { transactionService } from '../services/transactionService.js';
import { PAYMENT_OPTIONS, SHIPPING_OPTIONS, getErrorMessage, rupiah } from '../utils/format.js';

/** Nilai awal form diambil dari profil user (auto-fill). */
const fromProfile = (user) => ({
  recipient_name: user?.name ?? '',
  phone: user?.phone ?? '',
  shipping_address: user?.address ?? '',
  notes: '',
});

const field =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, totalQty, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => fromProfile(user));
  const [shippingCode, setShippingCode] = useState('reguler');
  const [paymentCode, setPaymentCode] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Profil bisa tiba terlambat (validasi ulang /me saat app dibuka):
  // isi hanya kolom yang masih kosong, jangan menimpa ketikan user.
  useEffect(() => {
    const profile = fromProfile(user);
    setForm((f) => ({
      recipient_name: f.recipient_name || profile.recipient_name,
      phone: f.phone || profile.phone,
      shipping_address: f.shipping_address || profile.shipping_address,
      notes: f.notes,
    }));
  }, [user]);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const shipping = SHIPPING_OPTIONS.find((o) => o.code === shippingCode);
  const grandTotal = totalPrice + shipping.cost;
  const profileIncomplete = !user?.phone || !user?.address;
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      // Hanya ID buku, qty, dan KODE kurir/pembayaran yang dikirim.
      // Harga, ongkir, dan total dihitung ulang oleh server.
      const order = await transactionService.create({
        ...form,
        notes: form.notes || null,
        shipping_method: shippingCode,
        payment_method: paymentCode,
        items: items.map((i) => ({ book_id: i.id, qty: i.qty })),
      });
      clear();
      // API menyajikan satu order per checkout (nomor tanpa akhiran -1, -2, …).
      navigate(`/user/profile?tab=orders&code=${order.order_number}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500">Lengkapi data pengiriman dan pilih kurir serta metode pembayaran.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* ============ KOLOM KIRI ============ */}
        <div className="space-y-5">
          <p className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <UserCheck size={18} className="mt-0.5 shrink-0" />
            <span>
              {profileIncomplete
                ? 'Lengkapi nomor telepon dan alamat di '
                : 'Data terisi otomatis dari profil Anda. Ubah permanen di '}
              <Link to="/user/profile" className="font-semibold underline">Profil Saya</Link>.
            </span>
          </p>

          {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}

          {/* Data penerima */}
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
            <SectionTitle Icon={MapPin} step="1" title="Data Pengiriman" />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium">Nama penerima</span>
                <input name="recipient_name" value={form.recipient_name} onChange={handleChange} required maxLength={100} className={field} />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Nomor telepon / WhatsApp</span>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="081234567890" inputMode="tel" className={field} />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Alamat lengkap pengiriman</span>
              <textarea name="shipping_address" value={form.shipping_address} onChange={handleChange} required minLength={10} rows={3} className={field} />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Catatan untuk kurir (opsional)</span>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} maxLength={500} className={field} />
            </label>
          </section>

          {/* Kurir */}
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
            <SectionTitle Icon={Truck} step="2" title="Metode Pengiriman" />
            <div className="grid gap-3 sm:grid-cols-3">
              {SHIPPING_OPTIONS.map((o) => (
                <OptionCard
                  key={o.code}
                  name="shipping_method"
                  checked={shippingCode === o.code}
                  onChange={() => setShippingCode(o.code)}
                  title={o.label}
                  sub={o.eta}
                  aside={rupiah(o.cost)}
                />
              ))}
            </div>
          </section>

          {/* Pembayaran */}
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
            <SectionTitle Icon={CreditCard} step="3" title="Metode Pembayaran" />
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_OPTIONS.map((o) => (
                <OptionCard
                  key={o.code}
                  name="payment_method"
                  checked={paymentCode === o.code}
                  onChange={() => setPaymentCode(o.code)}
                  title={o.label}
                  sub={o.hint}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">Pembayaran bersifat simulasi; tidak ada dana yang diproses.</p>
          </section>
        </div>

        {/* ============ KOLOM KANAN: RINGKASAN ============ */}
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-900">Ringkasan Pesanan</h2>

          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 py-3">
                <BookCover src={i.cover_url} alt="" className="h-20 w-14 shrink-0 rounded-lg border border-slate-100" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{i.title}</p>
                  <p className="truncate text-xs text-slate-500">{i.author}</p>
                  <p className="mt-1 text-xs text-slate-500">{rupiah(i.price)} × {i.qty}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-slate-900">{rupiah(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
            <Row label={`Subtotal (${totalQty} buku)`} value={rupiah(totalPrice)} />
            <Row label={`Ongkos kirim · ${shipping.label}`} value={rupiah(shipping.cost)} />
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
              <dt className="font-bold text-slate-900">Total Bayar</dt>
              <dd className="text-2xl font-extrabold text-emerald-800">{rupiah(grandTotal)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            Buat Pesanan Sekarang
          </button>

          <p className="flex items-start gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            Total akhir dihitung ulang oleh server saat pesanan dibuat.
          </p>
          <Link to="/cart" className="block text-center text-sm font-medium text-emerald-700 hover:underline">
            Ubah keranjang
          </Link>
        </aside>
      </div>
    </form>
  );
}

function SectionTitle({ Icon, step, title }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-700 text-sm font-bold text-white">{step}</span>
      <Icon size={18} className="text-emerald-700" />
      {title}
    </h2>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-slate-600">
      <dt>{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}

/** Kartu pilihan (radio) bergaya kartu. */
function OptionCard({ name, checked, onChange, title, sub, aside }) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-4 transition ${
        checked ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span
          aria-hidden="true"
          className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${checked ? 'border-emerald-600 bg-emerald-600 ring-2 ring-inset ring-white' : 'border-slate-300'}`}
        />
      </span>
      {aside && <span className="text-sm font-semibold text-emerald-800">{aside}</span>}
      <span className="text-xs text-slate-500">{sub}</span>
    </label>
  );
}

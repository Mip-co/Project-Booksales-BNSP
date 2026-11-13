export const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

/** Format ringkas untuk sumbu grafik: 240000 -> "Rp240rb", 2500000 -> "Rp2,5jt". */
export const rupiahCompact = (value) => {
  const v = Number(value ?? 0);
  if (v >= 1_000_000) return `Rp${String(+(v / 1_000_000).toFixed(1)).replace('.', ',')}jt`;
  if (v >= 1_000) return `Rp${Math.round(v / 1_000)}rb`;
  return `Rp${v}`;
};

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export const ORDER_STEPS = ['pending', 'diproses', 'dikirim', 'selesai'];

export const STATUS_LABEL = {
  pending: 'Pending',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
};

export const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-800',
  diproses: 'bg-sky-100 text-sky-800',
  dikirim: 'bg-indigo-100 text-indigo-800',
  selesai: 'bg-emerald-100 text-emerald-800',
};

export const ROLE_LABEL = { admin: 'Admin', customer: 'Pelanggan' };

/** Ambil pesan error paling relevan dari respons Laravel (422 / 403 / 409 / dst). */
export function getErrorMessage(error, fallback = 'Terjadi kesalahan. Silakan coba lagi.') {
  const data = error?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first.length) return first[0];
  }
  if (data?.message) return data.message;
  if (error?.code === 'ERR_NETWORK') return 'Tidak dapat terhubung ke server.';
  return fallback;
}

/**
 * Opsi checkout. Tarif di sini HANYA untuk tampilan; server memakai tarifnya sendiri
 * (Transaction::SHIPPING_COSTS) dan hanya menerima kode ('hemat' | 'reguler' | 'instan').
 */
export const SHIPPING_OPTIONS = [
  { code: 'hemat', label: 'Hemat', eta: 'Estimasi 4–6 hari', cost: 10000 },
  { code: 'reguler', label: 'Reguler', eta: 'Estimasi 2–3 hari', cost: 15000 },
  { code: 'instan', label: 'Instan / Same Day', eta: 'Tiba hari ini', cost: 25000 },
];

export const PAYMENT_OPTIONS = [
  { code: 'cod', label: 'COD (Bayar di Tempat)', hint: 'Bayar tunai ke kurir saat buku tiba.' },
  { code: 'transfer', label: 'Transfer Bank Manual', hint: 'Transfer ke rekening toko, lalu konfirmasi.' },
  { code: 'ewallet', label: 'E-Wallet', hint: 'GoPay, OVO, DANA, atau ShopeePay (simulasi).' },
];

export const SHIPPING_LABEL = Object.fromEntries(SHIPPING_OPTIONS.map((o) => [o.code, o.label]));
export const PAYMENT_LABEL = Object.fromEntries(PAYMENT_OPTIONS.map((o) => [o.code, o.label]));

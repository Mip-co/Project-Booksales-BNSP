import { useEffect, useState } from 'react';
import { ClipboardList, Library, MessageCircle, Send, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

// Nomor WhatsApp toko (format internasional tanpa "+" / spasi). GANTI sebelum dipakai.
const WA_NUMBER = '628888112602';

const TOPICS = [
  'Pertanyaan tentang pesanan',
  'Informasi buku / stok',
  'Kendala akun',
  'Saran & masukan',
  'Lainnya',
];

const HIGHLIGHTS = [
  { Icon: Library, title: 'Katalog beragam', text: 'Novel, pengembangan diri, teknologi, sejarah, dan banyak lagi.' },
  { Icon: ShoppingBag, title: 'Checkout praktis', text: 'Alamat pengiriman terisi otomatis dari profil Anda.' },
  { Icon: ClipboardList, title: 'Pesanan terpantau', text: 'Pantau status pesanan dari Pending hingga Selesai.' },
];

const field =
  'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

/** Halaman "Tentang Kami" + form kontak yang membuka percakapan WhatsApp. */
export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    topic: TOPICS[0],
    message: '',
  });
  const [sent, setSent] = useState(false);

  // Auto-fill Nama & Email bila user sudah login (tidak menimpa yang sudah diketik).
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '' }));
  }, [user]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = [
      'Halo Booksales, saya ingin menghubungi Anda.',
      '',
      `Nama: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Topik: ${form.topic}`,
      '',
      'Pesan:',
      form.message.trim(),
    ].join('\n');

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setSent(true);
    setForm((f) => ({ ...f, message: '' }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* About Us */}
      <section className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 p-8 text-white">
          <h1 className="text-2xl font-extrabold">Tentang Booksales</h1>
          <p className="mt-3 leading-relaxed text-emerald-50">
            Booksales adalah toko buku online yang memudahkan Anda menemukan, memesan, dan memantau
            pesanan buku favorit dari satu tempat. Kami hadir untuk membuat belanja buku terasa
            sederhana, jelas, dan menyenangkan.
          </p>
        </div>

        <ul className="space-y-3">
          {HIGHLIGHTS.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon size={22} />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Form kontak */}
      <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-700 text-white">
            <MessageCircle size={22} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-emerald-950">Hubungi Kami</h2>
            <p className="text-sm text-slate-500">Pesan Anda akan dikirim lewat WhatsApp.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Nama</span>
              <input required autoComplete="name" value={form.name} onChange={update('name')} className={field} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Email</span>
              <input type="email" required autoComplete="email" value={form.email} onChange={update('email')} className={field} />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Topik</span>
            <select value={form.topic} onChange={update('topic')} className={field}>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Pesan</span>
            <textarea required rows={5} value={form.message} onChange={update('message')}
              placeholder="Tulis pertanyaan atau pesan Anda…" className={`${field} resize-y`} />
          </label>

          {sent && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              WhatsApp dibuka di tab baru. Tekan tombol kirim di sana untuk mengirim pesan Anda.
            </p>
          )}

          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800">
            <Send size={18} /> Kirim via WhatsApp
          </button>
        </form>
      </section>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, X } from 'lucide-react';
import { getErrorMessage } from '../../utils/format.js';
import BookCover from '../BookCover.jsx';

const MAX_COVER_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EMPTY = {
  genre_id: '',
  author_id: '',
  title: '',
  price: '',
  stock: 0,
  description: '',
};

/** Modal tambah / ubah buku + upload cover. `book` null = mode tambah. */
export default function BookFormModal({ book, genres, authors, onSave, onClose }) {
  const fileRef = useRef(null);

  const [form, setForm] = useState(() =>
    book
      ? {
          genre_id: book.genre_id,
          author_id: book.author_id,
          title: book.title,
          price: book.price,
          stock: book.stock,
          description: book.description ?? '',
        }
      : EMPTY
  );
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Lepas object URL pratinjau agar tidak bocor memori.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shownCover = preview ?? (removeCover ? null : book?.cover_url);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // izinkan memilih file yang sama lagi
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Cover harus berformat JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      setError('Ukuran cover maksimal 2 MB.');
      return;
    }

    setError('');
    setCoverFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveCover(false);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setPreview(null);
    setRemoveCover(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // multipart/form-data karena ada file cover
    const data = new FormData();
    data.append('genre_id', form.genre_id);
    data.append('title', form.title);
    data.append('author_id', form.author_id);
    data.append('price', form.price);
    data.append('stock', form.stock);
    data.append('description', form.description);
    if (coverFile) data.append('cover_photo', coverFile);
    if (removeCover) data.append('remove_cover', '1');

    try {
      await onSave(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-3 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{book ? 'Ubah Buku' : 'Tambah Buku'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
          {/* Cover */}
          <div className="space-y-2">
            <BookCover src={shownCover} alt="Pratinjau cover" className="aspect-[2/3] w-full rounded-xl border border-slate-200" />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-400">
              <Camera size={16} /> {shownCover ? 'Ganti Cover' : 'Unggah Cover'}
            </button>
            {shownCover && (
              <button type="button" onClick={handleRemoveCover}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-red-600 hover:border-red-300">
                <Trash2 size={16} /> Hapus
              </button>
            )}
            <p className="text-center text-xs text-slate-400">JPG, PNG, atau WEBP. Maks. 2 MB. Rasio 2:3 disarankan.</p>
          </div>

          {/* Data buku */}
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Judul</span>
              <input name="title" value={form.title} onChange={handleChange} required maxLength={255} className={field} />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Penulis</span>
              <select name="author_id" value={form.author_id} onChange={handleChange} required className={field}>
                <option value="">Pilih…</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Genre</span>
              <select name="genre_id" value={form.genre_id} onChange={handleChange} required className={field}>
                <option value="">Pilih…</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium">Harga (Rp)</span>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className={field} />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium">Stok</span>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required className={field} />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Deskripsi (opsional)</span>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} maxLength={3000} className={field} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button disabled={saving} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
            {saving && <Loader2 size={16} className="animate-spin" />} Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

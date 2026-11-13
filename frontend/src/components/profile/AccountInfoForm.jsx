import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import Avatar from '../Avatar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { profileService } from '../../services/profileService.js';
import { getErrorMessage } from '../../utils/format.js';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const toForm = (user) => ({
  name: user.name ?? '',
  email: user.email ?? '',
  phone: user.phone ?? '',
  address: user.address ?? '',
});

/** Tab "Info Akun": form edit profil (nama, email, HP, alamat, foto). */
export default function AccountInfoForm() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState(() => toForm(user));
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  // Sinkronkan form bila data user di context berubah (mis. hasil validasi /me).
  useEffect(() => {
    setForm(toForm({ name: user.name, email: user.email, phone: user.phone, address: user.address }));
  }, [user.name, user.email, user.phone, user.address]);

  // Lepas object URL pratinjau agar tidak bocor memori.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shownPhoto = preview ?? (removePhoto ? null : user.photo_url);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // izinkan memilih file yang sama lagi
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Foto harus berformat JPG, PNG, atau WEBP.' });
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 2 MB.' });
      return;
    }

    setMessage(null);
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPreview(null);
    setRemovePhoto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('phone', form.phone);
    data.append('address', form.address);
    if (photoFile) data.append('photo', photoFile);
    if (removePhoto) data.append('remove_photo', '1');

    try {
      const fresh = await profileService.update(data);
      updateUser(fresh); // state global: Navbar, sidebar profil, panel admin ikut berubah seketika
      setPhotoFile(null);
      setPreview(null);
      setRemovePhoto(false);
      setMessage({ type: 'success', text: 'Data akun berhasil diperbarui.' });
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <header>
        <h1 className="text-2xl font-extrabold">Informasi Akun</h1>
        <p className="text-sm text-slate-500">Kelola data diri dan foto profil Anda.</p>
      </header>

      {message && (
        <p className={`rounded-xl p-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
          {message.text}
        </p>
      )}

      {/* Foto profil */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-50 p-4">
        <Avatar src={shownPhoto} name={user.name} size="md" />
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-400">
            <Camera size={16} /> Ganti Foto
          </button>
          {shownPhoto && (
            <button type="button" onClick={handleRemovePhoto}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:border-red-300">
              <Trash2 size={16} /> Hapus
            </button>
          )}
          <p className="w-full text-xs text-slate-400">JPG, PNG, atau WEBP. Maksimal 2 MB.</p>
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Nama lengkap</span>
        <input name="name" value={form.name} onChange={handleChange} required maxLength={255} className={field} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required maxLength={255} className={field} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nomor telepon / WhatsApp</span>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="081234567890" inputMode="tel" className={field} />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alamat lengkap pengiriman</span>
        <textarea name="address" value={form.address} onChange={handleChange} rows={3} maxLength={500} className={field} />
      </label>

      <button
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        Ubah Data Akun
      </button>
    </form>
  );
}

import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { getErrorMessage } from '../../utils/format.js';

/** Modal tambah / ubah akun. `user` null = mode tambah. */
export default function UserFormModal({ user, isSelf, onSave, onClose }) {
  const editing = Boolean(user);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'customer',
    password: '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { ...form, phone: form.phone || null, address: form.address || null };
    if (editing && !payload.password) delete payload.password; // kosong = tidak diganti

    try {
      await onSave(payload);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{editing ? 'Ubah Akun' : 'Tambah Akun'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="block space-y-1">
          <span className="text-sm font-medium">Nama lengkap</span>
          <input name="name" value={form.name} onChange={handleChange} required maxLength={100} className={field} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required maxLength={100} className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Role</span>
            <select name="role" value={form.role} onChange={handleChange} disabled={isSelf} className={`${field} disabled:bg-slate-50`}>
              <option value="customer">Pelanggan</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Kata sandi {editing && <span className="font-normal text-slate-400">(kosongkan jika tidak diganti)</span>}
          </span>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            required={!editing} minLength={8} autoComplete="new-password" className={field} />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Telepon / WhatsApp (opsional)</span>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="081234567890" className={field} />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Alamat (opsional)</span>
          <textarea name="address" rows={2} value={form.address} onChange={handleChange} maxLength={500} className={field} />
        </label>

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

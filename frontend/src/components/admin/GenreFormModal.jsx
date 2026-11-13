import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { getErrorMessage } from '../../utils/format.js';

/** Modal tambah / ubah genre. `genre` null = mode tambah. */
export default function GenreFormModal({ genre, onSave, onClose }) {
  const [name, setName] = useState(genre?.name ?? '');
  const [description, setDescription] = useState(genre?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), description: description.trim() || null });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{genre ? 'Ubah Genre' : 'Tambah Genre'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="block space-y-1">
          <span className="text-sm font-medium">Nama genre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            autoFocus
            placeholder="Contoh: Komik & Manga"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Deskripsi (opsional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
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

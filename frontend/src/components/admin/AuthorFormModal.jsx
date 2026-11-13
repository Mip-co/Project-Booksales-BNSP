import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2, X } from 'lucide-react';
import { getErrorMessage } from '../../utils/format.js';
import Avatar from '../Avatar.jsx';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Modal tambah / ubah penulis + foto. `author` null = mode tambah. */
export default function AuthorFormModal({ author, onSave, onClose }) {
  const fileRef = useRef(null);
  const [name, setName] = useState(author?.name ?? '');
  const [bio, setBio] = useState(author?.bio ?? '');
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shownPhoto = preview ?? (removePhoto ? null : author?.photo_url);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return setError('Foto harus berformat JPG, PNG, atau WEBP.');
    if (file.size > MAX_BYTES) return setError('Ukuran foto maksimal 2 MB.');
    setError('');
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const data = new FormData();
    data.append('name', name.trim());
    data.append('bio', bio);
    if (photoFile) data.append('photo', photoFile);
    if (removePhoto) data.append('remove_photo', '1');

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
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{author ? 'Ubah Penulis' : 'Tambah Penulis'}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3">
          <Avatar src={shownPhoto} name={name || 'Penulis'} size="md" />
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-400">
              <Camera size={16} /> {shownPhoto ? 'Ganti' : 'Unggah'} Foto
            </button>
            {shownPhoto && (
              <button type="button" onClick={() => { setPhotoFile(null); setPreview(null); setRemovePhoto(true); }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:border-red-300">
                <Trash2 size={16} /> Hapus
              </button>
            )}
          </div>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Nama penulis</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={255} autoFocus className={field} />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Bio (opsional)</span>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={3000} className={field} />
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

import { useEffect, useState } from 'react';

const SIZE = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-28 w-28 text-4xl',
};

/**
 * Foto profil bundar. Bila belum ada foto, ATAU gambar gagal dimuat,
 * tampilkan inisial nama (tidak pernah menampilkan ikon gambar pecah).
 */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);

  // URL baru (mis. setelah ganti foto) => coba muat lagi.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const base = `${SIZE[size]} shrink-0 rounded-full ${className}`;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${base} object-cover ring-2 ring-emerald-500/40`}
      />
    );
  }

  return (
    <span className={`${base} grid place-items-center bg-emerald-100 font-bold text-emerald-700`}>
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Cover buku. Bila belum ada cover, ATAU gambar gagal dimuat,
 * tampilkan placeholder ikon (tidak pernah menampilkan gambar pecah).
 */
export default function BookCover({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`grid place-items-center bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-500 ${className}`}>
      <BookOpen size={32} />
    </div>
  );
}

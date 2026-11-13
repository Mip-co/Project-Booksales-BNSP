import BookCover from './BookCover.jsx';

/** Kolom "Buku" pada tabel order: buku pertama + badge "+N buku lainnya". */
export default function OrderBooksCell({ order }) {
  const [first, ...rest] = order.items;
  if (!first) return <span className="text-slate-400">-</span>;

  return (
    <div className="flex items-center gap-3">
      <BookCover src={first.cover_url} alt="" className="h-12 w-8 shrink-0 rounded" />
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{first.title}</p>
        <p className="truncate text-xs text-slate-500">
          {first.author}
          {first.quantity > 1 && ` · ×${first.quantity}`}
        </p>
        {rest.length > 0 && (
          <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
            +{rest.length} buku lainnya
          </span>
        )}
      </div>
    </div>
  );
}

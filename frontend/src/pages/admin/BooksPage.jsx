import { useCallback, useEffect, useMemo, useState } from 'react';
import BookFormModal from '../../components/admin/BookFormModal.jsx';
import BooksTable from '../../components/admin/BooksTable.jsx';
import Notice from '../../components/admin/Notice.jsx';
import { useNotice } from '../../hooks/useNotice.js';
import { bookService } from '../../services/bookService.js';
import { authorService } from '../../services/authorService.js';
import { genreService } from '../../services/genreService.js';
import { getErrorMessage } from '../../utils/format.js';

const LOW_STOCK = 10;

/** Menu 3 — Kelola Buku: CRUD master data buku + upload cover. */
export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { book: obj | null }
  const [notice, flash] = useNotice();

  const load = useCallback(
    () => bookService.list().then(setBooks).catch((e) => flash('error', getErrorMessage(e))),
    [flash]
  );

  useEffect(() => {
    load();
    genreService.list().then(setGenres).catch(() => {});
    authorService.list().then(setAuthors).catch(() => {});
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q) || (b.author?.name ?? '').toLowerCase().includes(q));
  }, [books, search]);

  const summary = useMemo(
    () => ({
      totalStock: books.reduce((s, b) => s + b.stock, 0),
      low: books.filter((b) => b.stock <= LOW_STOCK).length,
    }),
    [books]
  );

  const handleSave = async (formData) => {
    if (modal.book) {
      await bookService.update(modal.book.id, formData);
    } else {
      await bookService.create(formData);
    }
    setModal(null);
    flash('success', 'Data buku tersimpan.');
    load();
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Hapus buku "${book.title}"?`)) return;
    try {
      await bookService.remove(book.id);
      flash('success', 'Buku dihapus.');
      load();
    } catch (e) {
      flash('error', getErrorMessage(e));
    }
  };

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Kelola Buku</h1>
        <p className="text-sm text-slate-500">
          {books.length} judul · total stok {summary.totalStock} ·{' '}
          <span className={summary.low ? 'font-semibold text-red-600' : ''}>
            {summary.low} stok menipis (≤{LOW_STOCK})
          </span>
        </p>
      </header>

      <Notice notice={notice} />

      <BooksTable
        books={visible}
        search={search}
        onSearch={setSearch}
        onAdd={() => setModal({ book: null })}
        onEdit={(book) => setModal({ book })}
        onDelete={handleDelete}
      />

      {modal && (
        <BookFormModal
          book={modal.book}
          genres={genres}
          authors={authors}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

import { useCallback, useEffect, useState } from 'react';
import GenreFormModal from '../../components/admin/GenreFormModal.jsx';
import GenresTable from '../../components/admin/GenresTable.jsx';
import Notice from '../../components/admin/Notice.jsx';
import { useNotice } from '../../hooks/useNotice.js';
import { genreService } from '../../services/genreService.js';
import { getErrorMessage } from '../../utils/format.js';

/** Menu 4 — Master Genre: CRUD master data genre buku. */
export default function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [modal, setModal] = useState(null); // { genre: obj | null }
  const [notice, flash] = useNotice();

  const load = useCallback(
    () => genreService.list().then(setGenres).catch((e) => flash('error', getErrorMessage(e))),
    [flash]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload) => {
    const editing = modal.genre;
    if (editing) {
      await genreService.update(editing.id, payload);
    } else {
      await genreService.create(payload);
    }
    setModal(null);
    flash('success', editing ? 'Genre diperbarui.' : 'Genre dibuat.');
    load();
  };

  const handleDelete = async (genre) => {
    if (!window.confirm(`Hapus genre "${genre.name}"?`)) return;
    try {
      await genreService.remove(genre.id);
      flash('success', 'Genre dihapus.');
      load();
    } catch (e) {
      flash('error', getErrorMessage(e));
    }
  };

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Master Genre</h1>
        <p className="text-sm text-slate-500">{genres.length} genre terdaftar.</p>
      </header>

      <Notice notice={notice} />

      <GenresTable
        genres={genres}
        onAdd={() => setModal({ genre: null })}
        onEdit={(genre) => setModal({ genre })}
        onDelete={handleDelete}
      />

      {modal && (
        <GenreFormModal genre={modal.genre} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </>
  );
}

import { useCallback, useEffect, useState } from 'react';
import AuthorFormModal from '../../components/admin/AuthorFormModal.jsx';
import AuthorsTable from '../../components/admin/AuthorsTable.jsx';
import Notice from '../../components/admin/Notice.jsx';
import { useNotice } from '../../hooks/useNotice.js';
import { authorService } from '../../services/authorService.js';
import { getErrorMessage } from '../../utils/format.js';

/** Menu 4 — Master Penulis: CRUD tabel `authors` (dipilih saat mengisi buku). */
export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [modal, setModal] = useState(null); // { author: obj | null }
  const [notice, flash] = useNotice();

  const load = useCallback(
    () => authorService.list().then(setAuthors).catch((e) => flash('error', getErrorMessage(e))),
    [flash]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (formData) => {
    const editing = modal.author;
    if (editing) {
      await authorService.update(editing.id, formData);
    } else {
      await authorService.create(formData);
    }
    setModal(null);
    flash('success', editing ? 'Penulis diperbarui.' : 'Penulis ditambahkan.');
    load();
  };

  const handleDelete = async (author) => {
    if (!window.confirm(`Hapus penulis "${author.name}"?`)) return;
    try {
      await authorService.remove(author.id);
      flash('success', 'Penulis dihapus.');
      load();
    } catch (e) {
      flash('error', getErrorMessage(e));
    }
  };

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Master Penulis</h1>
        <p className="text-sm text-slate-500">{authors.length} penulis terdaftar.</p>
      </header>

      <Notice notice={notice} />

      <AuthorsTable
        authors={authors}
        onAdd={() => setModal({ author: null })}
        onEdit={(author) => setModal({ author })}
        onDelete={handleDelete}
      />

      {modal && (
        <AuthorFormModal author={modal.author} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </>
  );
}

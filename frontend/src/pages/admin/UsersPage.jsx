import { useCallback, useEffect, useMemo, useState } from 'react';
import Notice from '../../components/admin/Notice.jsx';
import UserFormModal from '../../components/admin/UserFormModal.jsx';
import UsersTable from '../../components/admin/UsersTable.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotice } from '../../hooks/useNotice.js';
import { userService } from '../../services/userService.js';
import { getErrorMessage } from '../../utils/format.js';

/** Menu 4 — Master User (Admin & Pelanggan). */
export default function UsersPage() {
  const { user: me, updateUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { user: obj | null }
  const [notice, flash] = useNotice();

  const load = useCallback(
    () => userService.list().then(setUsers).catch((e) => flash('error', getErrorMessage(e))),
    [flash]
  );

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  const handleSave = async (payload) => {
    const editing = modal.user;
    const saved = editing
      ? await userService.update(editing.id, payload)
      : await userService.create(payload);

    // Jika admin mengubah datanya sendiri, sinkronkan Navbar/sidebar.
    if (editing && editing.id === me.id) {
      updateUser({ ...me, name: saved.name, email: saved.email, phone: saved.phone, address: saved.address });
    }

    setModal(null);
    flash('success', editing ? 'Akun diperbarui.' : 'Akun dibuat.');
    load();
  };

  const handleDelete = async (target) => {
    if (!window.confirm(`Hapus akun "${target.name}"?`)) return;
    try {
      await userService.remove(target.id);
      flash('success', 'Akun dihapus.');
      load();
    } catch (e) {
      flash('error', getErrorMessage(e));
    }
  };

  return (
    <>
      <header>
        <h1 className="text-2xl font-extrabold text-slate-900">Master User</h1>
        <p className="text-sm text-slate-500">
          {users.filter((u) => u.role === 'admin').length} admin ·{' '}
          {users.filter((u) => u.role === 'customer').length} pelanggan
        </p>
      </header>

      <Notice notice={notice} />

      <UsersTable
        users={visible}
        currentUserId={me.id}
        search={search}
        onSearch={setSearch}
        onAdd={() => setModal({ user: null })}
        onEdit={(user) => setModal({ user })}
        onDelete={handleDelete}
      />

      {modal && (
        <UserFormModal
          user={modal.user}
          isSelf={modal.user?.id === me.id}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

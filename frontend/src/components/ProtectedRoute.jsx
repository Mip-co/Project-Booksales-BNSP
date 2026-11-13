import { Navigate, useLocation } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext.jsx';

/**
 * Pelindung halaman di sisi UI.
 * - Belum login            -> /login (menyimpan halaman asal)
 * - Role tidak sesuai      -> dialihkan ke halaman miliknya
 * - `roles` tidak diisi    -> semua user yang sudah login boleh masuk
 * Keamanan sebenarnya tetap ditegakkan server (auth:sanctum + role middleware).
 */
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return children;
}

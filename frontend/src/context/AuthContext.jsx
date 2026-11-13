import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY, USER_KEY } from '../api/axios.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

/** Tujuan setelah login berdasarkan role dari respons API. */
export const homePathFor = (user) => (user?.role === 'admin' ? '/admin/dashboard' : '/');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const persist = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  /** Login universal: role ditentukan server, bukan dipilih di form. */
  const login = useCallback(
    async (email, password) => persist(await authService.login({ email, password })),
    [persist]
  );

  const register = useCallback(
    async (payload) => persist(await authService.register(payload)),
    [persist]
  );

  /** Dipakai setelah profil diubah agar Navbar, Checkout, dll. ikut ter-update. */
  const updateUser = useCallback((fresh) => {
    localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    setUser(fresh);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Token mungkin sudah kedaluwarsa; sesi lokal tetap dibersihkan.
    } finally {
      clear();
    }
  }, [clear]);

  // Validasi ulang token ke server saat aplikasi dibuka (interceptor menangani 401).
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService
      .me()
      .then(updateUser)
      .catch(() => {});
  }, [updateUser]);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === 'admin', login, register, updateUser, logout }),
    [user, login, register, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}

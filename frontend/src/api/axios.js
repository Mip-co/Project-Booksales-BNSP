import axios from 'axios';

export const TOKEN_KEY = 'booksales_token';
export const USER_KEY = 'booksales_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
  timeout: 15000,
});

// Request interceptor: tempelkan Bearer Token dari localStorage.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: 401 pada sesi yang sedang login => bersihkan sesi & ke /login.
// Dicek "ada token" agar login gagal (tanpa token) tidak memicu redirect berulang.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(localStorage.getItem(TOKEN_KEY));
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

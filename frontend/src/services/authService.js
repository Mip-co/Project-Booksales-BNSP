import api from '../api/axios.js';

export const authService = {
  register: (payload) => api.post('/register', payload).then((r) => r.data.data),
  login: (payload) => api.post('/login', payload).then((r) => r.data.data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me').then((r) => r.data.data),
};

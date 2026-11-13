import api from '../api/axios.js';

export const genreService = {
  // Publik (menyertakan books_count)
  list: () => api.get('/genres').then((r) => r.data.data),

  // Admin
  create: (payload) => api.post('/admin/genres', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/admin/genres/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/admin/genres/${id}`),
};

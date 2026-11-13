import api from '../api/axios.js';

/** Kelola Master User (khusus admin). */
export const userService = {
  list: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data.data),
  create: (payload) => api.post('/admin/users', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/admin/users/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/admin/users/${id}`),
};

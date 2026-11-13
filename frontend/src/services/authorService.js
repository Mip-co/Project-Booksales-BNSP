import api from '../api/axios.js';

export const authorService = {
  list: () => api.get('/admin/authors').then((r) => r.data.data),
  create: (formData) => api.post('/admin/authors', formData).then((r) => r.data.data),
  /** POST + `_method=PUT` (multipart; lihat bookService.update). */
  update: (id, formData) => {
    formData.set('_method', 'PUT');
    return api.post(`/admin/authors/${id}`, formData).then((r) => r.data.data);
  },
  remove: (id) => api.delete(`/admin/authors/${id}`),
};

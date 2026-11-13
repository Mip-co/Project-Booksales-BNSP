import api from '../api/axios.js';

export const bookService = {
  // Publik
  list: (params = {}) => api.get('/books', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/books/${id}`).then((r) => r.data.data),

  // Admin. Payload berupa FormData karena memuat upload cover_photo (multipart).
  create: (formData) => api.post('/admin/books', formData).then((r) => r.data.data),
  /**
   * Endpoint di server: PUT /api/admin/books/{id}.
   * Dikirim sebagai POST + `_method=PUT` (method spoofing Laravel) karena PHP
   * tidak mem-parse multipart pada request PUT asli.
   */
  update: (id, formData) => {
    formData.set('_method', 'PUT');
    return api.post(`/admin/books/${id}`, formData).then((r) => r.data.data);
  },
  remove: (id) => api.delete(`/admin/books/${id}`),
};

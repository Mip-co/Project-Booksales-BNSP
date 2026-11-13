import api from '../api/axios.js';

export const profileService = {
  get: () => api.get('/user/profile').then((r) => r.data.data),

  /**
   * Endpoint di server: PUT /api/user/profile.
   * Karena mengirim file (multipart), dikirim sebagai POST + `_method=PUT`
   * (method spoofing Laravel) — PHP tidak mem-parse multipart pada PUT asli.
   */
  update: (formData) => {
    formData.set('_method', 'PUT');
    return api.post('/user/profile', formData).then((r) => r.data.data);
  },
};

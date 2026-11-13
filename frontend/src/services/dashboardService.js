import api from '../api/axios.js';

export const dashboardService = {
  get: () => api.get('/admin/dashboard').then((r) => r.data.data),
};

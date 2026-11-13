import api from '../api/axios.js';

export const orderService = {
  // Customer
  create: (payload) => api.post('/orders', payload).then((r) => r.data.data),
  myOrders: () => api.get('/orders/my-orders').then((r) => r.data.data),
  byCode: (code) => api.get(`/orders/code/${encodeURIComponent(code)}`).then((r) => r.data.data),

  // Admin
  adminList: () => api.get('/admin/orders').then((r) => r.data.data),
  updateStatus: (id, status) =>
    api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data.data),
};

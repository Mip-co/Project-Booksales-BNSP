import api from '../api/axios.js';

/**
 * Di database satu baris = satu buku, tetapi API menyajikan SATU objek per checkout:
 * { order_number: 'ORD-20261111-UIGX', items: [...], total_amount, status, ... }
 */
export const transactionService = {
  // Customer. create() mengembalikan satu objek order.
  create: (payload) => api.post('/transactions', payload).then((r) => r.data.data),
  my: () => api.get('/transactions').then((r) => r.data.data),

  // Admin. Status diubah untuk SEMUA buku dalam order tersebut.
  adminList: () => api.get('/admin/transactions').then((r) => r.data.data),
  updateStatus: (orderNumber, status) =>
    api.patch(`/admin/transactions/${encodeURIComponent(orderNumber)}/status`, { status }).then((r) => r.data.data),
};

/**
 * ══════════════════════════════════════════
 *  FashionWear — Axios API Client
 * ══════════════════════════════════════════
 *
 *  - Base URL from env (VITE_API_URL or localhost:5001)
 *  - Automatically attaches JWT token from localStorage
 *  - On 401 → clears token & redirects to auth
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fashionwear_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle errors globally ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth state
      localStorage.removeItem('fashionwear_token');
      localStorage.removeItem('fashionwear_user');
      // Dispatch a custom event so AppContext can react
      window.dispatchEvent(new CustomEvent('fw:unauthorized'));
    }
    return Promise.reject(error);
  },
);

// ── Typed API helpers ─────────────────────────────────────

// Auth
export const authApi = {
  register: (data)     => api.post('/auth/register', data),
  login:    (data)     => api.post('/auth/login', data),
  logout:   ()         => api.post('/auth/logout'),
  me:       ()         => api.get('/auth/me'),
  updateProfile: (data)=> api.patch('/auth/me', data),
};

// Products (uses static data by default; call these if backend is running with seeded products)
export const productApi = {
  list:   (params) => api.get('/products', { params }),
  get:    (id)     => api.get(`/products/${id}`),
  create: (data)   => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id)     => api.delete(`/products/${id}`),
  seed:   ()       => api.post('/products/seed'),
};

// Orders
export const orderApi = {
  create:       (data)        => api.post('/orders', data),
  myOrders:     ()            => api.get('/orders/my'),
  get:          (orderId)     => api.get(`/orders/${orderId}`),
  // Admin
  list:         (params)      => api.get('/orders', { params }),
  updateStatus: (orderId, data) => api.patch(`/orders/${orderId}/status`, data),
};

// Coupons
export const couponApi = {
  apply:  (code, cartSubtotal) => api.post('/coupons/apply', { code, cartSubtotal }),
  // Admin
  list:   ()         => api.get('/coupons'),
  create: (data)     => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id)       => api.delete(`/coupons/${id}`),
};

// Paytm
export const paytmApi = {
  initiate: (data)     => api.post('/paytm/initiate', data),
  verify:   (orderId)  => api.post('/paytm/verify', { orderId }),
};

// Admin
export const adminApi = {
  stats:          ()         => api.get('/admin/stats'),
  users:          (params)   => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
};

export default api;

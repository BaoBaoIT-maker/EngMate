import api from './api.js';
import useAuthStore from '../store/useAuthStore.js';

// ─── Cập nhật Axios interceptor để tự gắn token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth API calls ──────────────────────────────────────────────────────────

export const login = (data) =>
  api.post('/auth/login', data);

export const register = (data) =>
  api.post('/auth/register', data);

export const verifyOtp = (data) =>
  api.post('/auth/verify-otp', data);

export const resendOtp = (data) =>
  api.post('/auth/resend-otp', data);

export const forgotPassword = (data) =>
  api.post('/auth/forgot-password', data);

export const resetPassword = (data) =>
  api.post('/auth/reset-password', data);

export const changePassword = (data) =>
  api.post('/auth/change-password', data);

export const refreshToken = (data) =>
  api.post('/auth/refresh', data);

export const logout = (data) =>
  api.post('/auth/logout', data);

export const getMe = () =>
  api.get('/auth/me');

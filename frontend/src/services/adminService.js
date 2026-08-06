import api from './api';

// ── Stats ──────────────────────────────────────────────────────────────────────
export const getOverview = () => api.get('/admin/stats/overview');
export const getRevenue = (period = '7d') => api.get(`/admin/stats/revenue?period=${period}`);
export const getUserGrowth = (period = '7d') => api.get(`/admin/stats/users?period=${period}`);

// ── Users ──────────────────────────────────────────────────────────────────────
export const listUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/admin/users?${q}`);
};
export const getUserDetail = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, data) => api.patch(`/admin/users/${id}`, data);
export const toggleBan = (id) => api.patch(`/admin/users/${id}/ban`);
export const grantPlan = (id, planId) => api.post(`/admin/users/${id}/grant-plan`, { planId });

// ── Plans ──────────────────────────────────────────────────────────────────────
export const listPlans = () => api.get('/admin/plans');
export const createPlan = (data) => api.post('/admin/plans', data);
export const updatePlan = (id, data) => api.patch(`/admin/plans/${id}`, data);
export const togglePlan = (id) => api.patch(`/admin/plans/${id}/toggle`);

// ── Categories ─────────────────────────────────────────────────────────────────
export const listCategories = () => api.get('/admin/categories');
export const createCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.patch(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// ── Topics ─────────────────────────────────────────────────────────────────────
export const listTopics = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/admin/topics?${q}`);
};
export const createTopic = (data) => api.post('/admin/topics', data);
export const updateTopic = (id, data) => api.patch(`/admin/topics/${id}`, data);
export const deleteTopic = (id) => api.delete(`/admin/topics/${id}`);

// ── Vocabularies ───────────────────────────────────────────────────────────────
export const listVocabularies = (topicId, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/admin/topics/${topicId}/vocabularies?${q}`);
};
export const createVocabulary = (topicId, data) => api.post(`/admin/topics/${topicId}/vocabularies`, data);
export const aiGenerateVocabulary = (topicId, words) =>
  api.post(`/admin/topics/${topicId}/vocabularies/ai-generate`, { words });
export const bulkSaveVocabularies = (topicId, vocabularies) =>
  api.post(`/admin/topics/${topicId}/vocabularies/bulk-save`, { vocabularies });
export const updateVocabulary = (id, data) => api.patch(`/admin/vocabularies/${id}`, data);
export const deleteVocabulary = (id) => api.delete(`/admin/vocabularies/${id}`);

// ── Games ──────────────────────────────────────────────────────────────────────
export const listGameConfigs = () => api.get('/admin/games/config');
export const toggleGame = (gameType) => api.patch(`/admin/games/config/${gameType}`);

// ── Transactions ───────────────────────────────────────────────────────────────
export const listTransactions = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return api.get(`/admin/transactions?${q}`);
};

import api from './api';

export const listCategories = async () => {
  const res = await api.get('/vocabulary/categories');
  return res?.data || [];
};

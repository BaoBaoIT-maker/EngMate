import api from './api';

export const getOverviewStats = async () => {
  const res = await api.get('/stats/overview');
  return res.data;
};
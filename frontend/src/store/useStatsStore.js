import { create } from 'zustand';
import { getOverviewStats } from '../services/statService';

export const useStatsStore = create((set, get) => ({
  stats: null,
  loading: true,

  setStats: (stats) => set({ stats }),

  fetchStats: async () => {
    try {
      const data = await getOverviewStats();
      set({ stats: data, loading: false });
      return data;
    } catch (err) {
      console.error('Failed to load stats in store', err);
      set({ loading: false });
    }
  },

  // Cập nhật mục tiêu ngày tức thì (Optimistic UI update)
  updateDailyGoal: (target) => {
    const current = get().stats;
    if (!current) return;
    set({
      stats: {
        ...current,
        dailyGoal: {
          ...current.dailyGoal,
          target: Number(target),
        },
      },
    });
  },
}));

export default useStatsStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (payload) =>
        set({
          user: payload.user || payload,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      // Fetch thông tin user mới nhất từ server và cập nhật store
      fetchMe: async () => {
        try {
          // api interceptor trả về response.data luôn
          // nên 'res' ở đây = { success, message, data: user }
          const res = await api.get('/users/me');
          const freshUser = res?.data || res;
          set({ user: freshUser, isAuthenticated: true });
          return freshUser;
        } catch (err) {
          console.error('fetchMe failed', err);
          return get().user;
        }
      },
    }),
    {
      name: 'engmate-auth', // key trong localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

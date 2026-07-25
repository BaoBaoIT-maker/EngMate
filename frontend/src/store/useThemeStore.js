import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const light = {
  bg: '#FAFAF8',
  bgSub: '#F3F0EB',
  card: 'rgba(255,255,255,0.72)',
  cardBorder: 'rgba(234,179,8,0.12)',
  sidebar: 'rgba(255,255,255,0.92)',
  sidebarBorder: 'rgba(234,179,8,0.1)',
  text: '#1F2937',
  textSub: '#4B5563',
  textMuted: '#9CA3AF',
  gold: '#D97706',
  goldDark: '#B45309',
  goldBg: '#FEF3C7',
  shadow: 'rgba(0,0,0,0.06)',
  inputBg: 'rgba(255,255,255,0.7)',
  inputBorder: 'rgba(234,179,8,0.25)',
  msgAiBg: 'rgba(255,255,255,0.65)',
  msgAiBorder: 'rgba(234,179,8,0.15)',
};

const dark = {
  bg: '#0D0D10',
  bgSub: '#161619',
  card: 'rgba(30,30,36,0.85)',
  cardBorder: 'rgba(234,179,8,0.14)',
  sidebar: 'rgba(18,18,22,0.97)',
  sidebarBorder: 'rgba(234,179,8,0.1)',
  text: '#F9FAFB',
  textSub: '#D1D5DB',
  textMuted: '#6B7280',
  gold: '#EAB308',
  goldDark: '#FBBF24',
  goldBg: 'rgba(234,179,8,0.12)',
  shadow: 'rgba(0,0,0,0.4)',
  inputBg: 'rgba(30,30,36,0.8)',
  inputBorder: 'rgba(234,179,8,0.2)',
  msgAiBg: 'rgba(30,30,36,0.9)',
  msgAiBorder: 'rgba(234,179,8,0.12)',
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      toggleDark: () => set((state) => ({ isDark: !state.isDark })),
      getTheme: () => (get().isDark ? dark : light),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export default useThemeStore;

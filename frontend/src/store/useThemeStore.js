import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const light = {
  bg: '#FFFDF7',
  bgSub: '#F4EFE3',
  card: '#FFFFFF',
  cardBorder: '#F0EAD9',
  sidebar: '#FFFDF7',
  sidebarBorder: '#E8E0CD',
  text: '#1F2A22',
  textSub: '#4A5250',
  textMuted: '#7A7568',
  gold: '#F2A73B',
  goldDark: '#D4891E',
  goldBg: '#FFF1CE',
  green: '#2F9E56',
  greenDark: '#1D6B3C',
  greenBg: '#E9F5EA',
  shadow: 'rgba(47,158,86,0.07)',
  inputBg: '#FFFFFF',
  inputBorder: '#E8E0CD',
  msgAiBg: 'rgba(255,255,255,0.9)',
  msgAiBorder: '#F0EAD9',
};

const dark = {
  bg: '#0C1510',
  bgSub: '#111C14',
  card: 'rgba(20,30,22,0.92)',
  cardBorder: 'rgba(47,158,86,0.15)',
  sidebar: 'rgba(12,21,16,0.98)',
  sidebarBorder: 'rgba(47,158,86,0.12)',
  text: '#E8F0E9',
  textSub: '#A8B8AA',
  textMuted: '#6A7A6C',
  gold: '#F2A73B',
  goldDark: '#FBBF24',
  goldBg: 'rgba(242,167,59,0.14)',
  green: '#3DBE6A',
  greenDark: '#2F9E56',
  greenBg: 'rgba(47,158,86,0.14)',
  shadow: 'rgba(0,0,0,0.45)',
  inputBg: 'rgba(20,30,22,0.8)',
  inputBorder: 'rgba(47,158,86,0.18)',
  msgAiBg: 'rgba(20,30,22,0.92)',
  msgAiBorder: 'rgba(47,158,86,0.15)',
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

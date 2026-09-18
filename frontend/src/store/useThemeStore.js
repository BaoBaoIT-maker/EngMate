import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const light = {
  bg: '#FAFAF8',
  bgSub: '#F4EFE6',
  card: 'rgba(255, 255, 255, 0.88)',
  cardBorder: 'rgba(240, 180, 41, 0.18)',
  sidebar: '#FAFAF8',
  sidebarBorder: 'rgba(240, 180, 41, 0.18)',
  text: '#1C1407',
  textSub: '#6B6047',
  textMuted: '#9D8E6F',
  gold: '#F0B429',
  goldDark: '#D4960A',
  goldBg: 'rgba(240, 180, 41, 0.12)',
  green: '#10B981',
  greenDark: '#059669',
  greenBg: 'rgba(16, 185, 129, 0.12)',
  shadow: 'rgba(28, 20, 7, 0.08)',
  inputBg: '#FFFFFF',
  inputBorder: 'rgba(240, 180, 41, 0.24)',
  msgAiBg: '#FFFFFF',
  msgAiBorder: 'rgba(240, 180, 41, 0.18)',
  hover: 'rgba(240, 180, 41, 0.06)',
};

const dark = {
  bg: '#120D04',
  bgSub: '#1A1208',
  card: 'rgba(26, 18, 8, 0.88)',
  cardBorder: 'rgba(240, 180, 41, 0.20)',
  sidebar: '#120D04',
  sidebarBorder: 'rgba(240, 180, 41, 0.20)',
  text: '#FFFDF7',
  textSub: 'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  gold: '#F0B429',
  goldDark: '#D4960A',
  goldBg: 'rgba(240, 180, 41, 0.16)',
  green: '#10B981',
  greenDark: '#059669',
  greenBg: 'rgba(16, 185, 129, 0.18)',
  shadow: 'rgba(0, 0, 0, 0.55)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(240, 180, 41, 0.25)',
  msgAiBg: 'rgba(26, 18, 8, 0.90)',
  msgAiBorder: 'rgba(240, 180, 41, 0.20)',
  hover: 'rgba(240, 180, 41, 0.08)',
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

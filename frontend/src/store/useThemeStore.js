import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const light = {
  bg: '#F7FAF8',
  bgSub: '#EDF2EE',
  card: '#FFFFFF',
  cardBorder: '#E2ECE6',
  sidebar: '#F7FAF8',
  sidebarBorder: '#E2ECE6',
  text: '#111814',
  textSub: '#334139',
  textMuted: '#5C7164',
  gold: '#D97706',
  goldDark: '#B45309',
  goldBg: '#FEF3C7',
  green: '#006633',
  greenDark: '#004D26',
  greenBg: '#E8F5E9',
  shadow: 'rgba(0, 77, 38, 0.05)',
  inputBg: '#FFFFFF',
  inputBorder: '#D1E0D7',
  msgAiBg: '#FFFFFF',
  msgAiBorder: '#E2ECE6',
  hover: 'rgba(0, 102, 51, 0.04)',
};

const dark = {
  bg: '#080F0A',
  bgSub: '#0E1711',
  card: '#121F16',
  cardBorder: 'rgba(16, 185, 129, 0.18)',
  sidebar: '#0B140D',
  sidebarBorder: 'rgba(16, 185, 129, 0.14)',
  text: '#F8FAFC',
  textSub: '#CBD5E1',
  textMuted: '#94A3B8',
  gold: '#FBBF24',
  goldDark: '#F59E0B',
  goldBg: 'rgba(245, 158, 11, 0.16)',
  green: '#10B981',
  greenDark: '#059669',
  greenBg: 'rgba(16, 185, 129, 0.16)',
  shadow: 'rgba(0, 0, 0, 0.55)',
  inputBg: '#0D1811',
  inputBorder: 'rgba(16, 185, 129, 0.25)',
  msgAiBg: '#121F16',
  msgAiBorder: 'rgba(16, 185, 129, 0.18)',
  hover: 'rgba(255, 255, 255, 0.05)',
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

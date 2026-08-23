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
  textSub: '#3A4D40',
  textMuted: '#687F70',
  gold: '#F59E0B',
  goldDark: '#D97706',
  goldBg: '#FEF3C7',
  green: '#006633',
  greenDark: '#004D26',
  greenBg: '#E8F5E9',
  shadow: 'rgba(4,120,87,0.05)',
  inputBg: '#FFFFFF',
  inputBorder: '#E2ECE6',
  msgAiBg: 'rgba(255,255,255,0.9)',
  msgAiBorder: '#E2ECE6',
};

const dark = {
  bg: '#070C08',
  bgSub: '#0C140F',
  card: 'rgba(15,26,19,0.92)',
  cardBorder: 'rgba(16,185,129,0.12)',
  sidebar: 'rgba(7,12,8,0.98)',
  sidebarBorder: 'rgba(16,185,129,0.1)',
  text: '#ECFDF5',
  textSub: '#A7F3D0',
  textMuted: '#64748B',
  gold: '#FBBF24',
  goldDark: '#F59E0B',
  goldBg: 'rgba(245,158,11,0.15)',
  green: '#10B981',
  greenDark: '#059669',
  greenBg: 'rgba(16,185,129,0.12)',
  shadow: 'rgba(0,0,0,0.5)',
  inputBg: 'rgba(15,26,19,0.8)',
  inputBorder: 'rgba(16,185,129,0.15)',
  msgAiBg: 'rgba(15,26,19,0.92)',
  msgAiBorder: 'rgba(16,185,129,0.12)',
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

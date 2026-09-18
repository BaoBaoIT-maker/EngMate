import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import useSplashStore from '../store/useSplashStore';
import Nav from '../components/navigation/Nav';
import SupportChatWidget from '../components/support/SupportChatWidget';
import AdvisorChatWidget from '../components/advisor/AdvisorChatWidget';
import { getOverviewStats } from '../services/statService';

export default function DashboardLayout() {
  const { isDark } = useThemeStore();
  const pulseSplash = useSplashStore((s) => s.pulse);
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = () => {
    getOverviewStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats in layout', err))
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Đồng bộ biến isDark sang thẻ html để kích hoạt class .dark toàn cục
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    pulseSplash(700);
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--fg)',
        transition: 'background 0.3s ease, color 0.3s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Ambient glow layer as designed in Figma */}
      <div
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: isDark
            ? 'radial-gradient(circle at 80% 0%, rgba(240,180,41,0.07) 0%, transparent 55%), radial-gradient(circle at 20% 100%, rgba(240,180,41,0.04) 0%, transparent 50%)'
            : 'radial-gradient(circle at 80% 0%, rgba(240,180,41,0.06) 0%, transparent 55%)',
        }}
      />

      {/* Screen 1: Figma Navigation Header & Mobile Bar */}
      <Nav stats={stats} />

      {/* Main content container with dynamic offsets */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: 'var(--nav-offset)',
          paddingBottom: 'var(--bottom-offset)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          paddingLeft: '1.25rem',
          paddingRight: '1.25rem',
          boxSizing: 'border-box',
        }}
      >
        <Outlet context={{ stats, setStats, loading: loadingStats, reloadStats: fetchStats }} />
      </main>

      {/* Persistent AI chat widgets */}
      <AdvisorChatWidget />
      <SupportChatWidget />
    </div>
  );
}
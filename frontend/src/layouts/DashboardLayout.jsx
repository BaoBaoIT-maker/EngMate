import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import useSplashStore from '../store/useSplashStore';
import SupportChatWidget from '../components/support/SupportChatWidget';
import AdvisorChatWidget from '../components/advisor/AdvisorChatWidget';
import { getOverviewStats } from '../services/statService';

const NAV = [
  {
    id: '/dashboard', label: 'Trang chủ',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: '/dashboard/flashcards', label: 'Thẻ từ vựng',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: '/dashboard/games', label: 'Trò chơi',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
        <circle cx="15.5" cy="11" r="0.5" fill={color}/><circle cx="17.5" cy="13" r="0.5" fill={color}/>
        <path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/>
      </svg>
    ),
  },
  {
    id: '/dashboard/speaking', label: 'Luyện giao tiếp',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    id: '/dashboard/settings', label: 'Cài đặt',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

function SunIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ─── Desktop Top Header Navigation ────────────────────────────────
function TopHeader({ t, isDark, user, toggleDark, navigate, location, stats }) {
  const isPremium = user?.subscription?.isValid &&
    user?.subscription?.plan?.code !== 'FREE' &&
    (!user.subscription.endDate || new Date(user.subscription.endDate) > new Date());

  const streakDays = stats?.streak?.current || 0;

  return (
    <header style={{
      position: 'fixed',
      top: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2.5rem)',
      maxWidth: '1200px',
      height: '64px',
      zIndex: 100,
      background: isDark ? 'rgba(18, 31, 22, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: `1.5px solid ${t.cardBorder}`,
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,102,51,0.04)',
      transition: 'all 0.3s ease',
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 900, color: '#fff', boxShadow: `0 4px 12px ${t.green}30`
        }}>✦</div>
        <span style={{ fontWeight: 850, fontSize: '1.2rem', color: t.text, letterSpacing: '-0.03em' }}>
          Eng<span style={{ color: t.green }}>Mate</span>
        </span>
      </div>

      {/* Middle: Navigation Links (No icon, simple text capitalized with active underline) */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        {NAV.map(item => {
          const active = location.pathname === item.id;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                padding: '0.5rem 0',
                cursor: 'pointer',
                color: active ? t.green : t.textMuted,
                fontWeight: active ? 800 : 600,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                borderBottom: active ? `2px solid ${t.green}` : '2px solid transparent',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.color = t.text; } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.color = t.textMuted; } }}
            >
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Streak Info */}
        {streakDays > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 800, color: t.gold }}>
            <span>🔥</span>
            <span style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>{streakDays} DAYS</span>
          </div>
        )}

        {/* Upgrade / Premium Button (Always visible) */}
        <button
          onClick={() => navigate('/dashboard/premium')}
          style={{
            padding: '0.45rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            background: isPremium
              ? (isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7')
              : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9'),
            color: isPremium
              ? (isDark ? '#FBBF24' : '#D97706')
              : (isDark ? '#10B981' : '#006633'),
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {isPremium ? '👑 PREMIUM' : 'NÂNG CẤP'}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDark}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 8,
            borderRadius: '50%', color: t.textMuted, transition: 'background 0.2s',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`
          }}
          onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : t.bgSub}
          onMouseOut={e => e.currentTarget.style.background = 'none'}
        >
          {isDark ? <SunIcon color={t.gold} /> : <MoonIcon color={t.textMuted} />}
        </button>

        {/* User Profile */}
        <div
          onClick={() => navigate('/dashboard/settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '4px 10px 4px 4px',
            borderRadius: '30px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
          onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 800, color: '#fff', overflow: 'hidden'
          }}>
            {user?.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.profile?.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.text }}>
            {isPremium ? '👑' : ''} {user?.profile?.username || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}

function MobileHeader({ t, user, toggleDark, isDark, navigate }) {
  const isPremium = user?.subscription?.isValid &&
    user?.subscription?.plan?.code !== 'FREE' &&
    (!user.subscription.endDate || new Date(user.subscription.endDate) > new Date());

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 60,
      background: isDark ? 'rgba(8, 15, 10, 0.88)' : 'rgba(247, 250, 248, 0.88)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${t.cardBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1rem', paddingTop: 'env(safe-area-inset-top)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>E</span>
        </div>
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: t.text, letterSpacing: '-0.02em' }}>
          EngMate
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => navigate('/dashboard/premium')}
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 800,
            background: isPremium
              ? (isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7')
              : (isDark ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9'),
            color: isPremium
              ? (isDark ? '#FBBF24' : '#D97706')
              : (isDark ? '#10B981' : '#006633'),
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {isPremium ? '👑 PREMIUM' : 'NÂNG CẤP'}
        </button>
        <button onClick={toggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: t.textMuted }}>
          {isDark ? <SunIcon color={t.textMuted} /> : <MoonIcon color={t.textMuted} />}
        </button>
        <div 
          onClick={() => navigate('/dashboard/settings')}
          style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#fff', cursor: 'pointer', overflow: 'hidden' }}>
          {user?.profile?.avatarUrl ? (
            <img src={user?.profile?.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.profile?.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>
      </div>
    </div>
  );
}

function BottomNav({ t, user, isDark }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: isDark ? 'rgba(8, 15, 10, 0.92)' : 'rgba(247, 250, 248, 0.92)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: `1px solid ${t.cardBorder}`,
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.filter(i => ['/dashboard', '/dashboard/flashcards', '/dashboard/games', '/dashboard/speaking'].includes(i.id)).map(item => {
        const active = location.pathname === item.id;
        return (
          <div key={item.id} className="bottom-nav-item" onClick={() => navigate(item.id)} style={{ color: active ? t.green : t.textMuted }}>
            <span style={{ display: 'flex' }}>{item.icon(active ? t.green : t.textMuted)}</span>
            <span style={{ fontSize: '0.65rem' }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardLayout() {
  const { isDark, toggleDark, getTheme } = useThemeStore();
  const t = getTheme();
  const [isMobile, setIsMobile] = useState(false);
  const user = useAuthStore(s => s.user);
  const pulseSplash = useSplashStore(s => s.pulse);
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = () => {
    getOverviewStats()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats in layout', err))
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Đồng bộ biến isDark sang thẻ html để kích hoạt class .dark của Tailwind CSS toàn cục
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="dashboard-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', color: t.text, transition: 'background 0.3s, color 0.3s' }}>
      {!isMobile && (
        <TopHeader
          t={t}
          isDark={isDark}
          user={user}
          toggleDark={toggleDark}
          navigate={navigate}
          location={location}
          stats={stats}
        />
      )}

      {isMobile && <MobileHeader t={t} user={user} toggleDark={toggleDark} isDark={isDark} navigate={navigate} />}

      <main className="dashboard-content-container" style={{
        flex: 1,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile
          ? 'calc(60px + 1rem) 1rem 80px'
          : 'calc(64px + 3rem) 2rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        transition: 'padding 0.3s ease',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        <Outlet context={{ stats, setStats, loading: loadingStats, reloadStats: fetchStats }} />
      </main>

      {isMobile && <BottomNav t={t} user={user} isDark={isDark} />}
      <AdvisorChatWidget />
      <SupportChatWidget />
    </div>
  );
}
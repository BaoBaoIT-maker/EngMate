import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import { Icon } from '../components/icons';
import useAuthStore from '../store/useAuthStore';

const NAV = [
  { id: '/dashboard', label: 'Trang chủ', icon: Icon.home },
  { id: '/dashboard/flashcards', label: 'Flashcards', icon: Icon.cards },
  { id: '/dashboard/games', label: 'Mini-games', icon: Icon.games },
  { id: '/dashboard/speaking', label: 'AI Coach', icon: Icon.mic },
  { id: '/dashboard/settings', label: 'Cài đặt', icon: Icon.settings },
];

function Sidebar({ collapsed, setCollapsed, t, isDark, user }) {
  const W = collapsed ? 64 : 232;
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      width: W, minHeight: '100vh', flexShrink: 0,
      background: t.sidebar,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRight: `1px solid ${t.sidebarBorder}`,
      display: 'flex', flexDirection: 'column', padding: '1.25rem 0.75rem',
      transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden', zIndex: 50,
      boxShadow: isDark ? `2px 0 24px ${t.shadow}` : `2px 0 16px ${t.shadow}`,
    }}>
      {/* Logo + collapse toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '1.75rem', padding: '0 0.25rem' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#EAB308,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>✦</div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: t.text, letterSpacing: '-0.02em' }}>Eng<span style={{ color: t.gold }}>Mate</span></span>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#EAB308,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✦</div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
            {Icon.chevron(t.textMuted)}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV.map(item => {
          const active = location.pathname === item.id;
          return (
            <div key={item.id} className="nav-item"
              onClick={() => navigate(item.id)}
              style={{
                background: active ? t.goldBg : 'transparent',
                color: active ? t.gold : t.textSub,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon(active ? t.gold : t.textMuted)}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: t.gold }} />}
            </div>
          );
        })}
      </nav>

      {/* User avatar */}
      {!collapsed && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 12, background: t.goldBg, border: `1px solid ${t.cardBorder}`, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#EAB308,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {user?.profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: t.text, whiteSpace: 'nowrap' }}>{user?.profile?.username || 'User'}</div>
            <div style={{ fontSize: '0.68rem', color: t.textMuted }}>IELTS · Level 7</div>
          </div>
        </div>
      )}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{ background: t.goldBg, border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <svg width="14" height="14" fill="none" stroke={t.gold} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </div>
  );
}

function BottomNav({ t }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: t.sidebar, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${t.sidebarBorder}`,
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(item => {
        const active = location.pathname === item.id;
        return (
          <div key={item.id} className="bottom-nav-item" onClick={() => navigate(item.id)} style={{ color: active ? t.gold : t.textMuted }}>
            <span style={{ display: 'flex' }}>{item.icon(active ? t.gold : t.textMuted)}</span>
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardLayout() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", display: 'flex', minHeight: '100vh', background: t.bg, color: t.text, transition: 'background 0.3s, color 0.3s' }}>
      {!isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={t} isDark={isDark} user={user} />
      )}

      <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.25rem 1rem 80px' : '2rem 2.5rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {isMobile && <BottomNav t={t} />}
    </div>
  );
}

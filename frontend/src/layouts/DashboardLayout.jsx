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

  const isPremium = user?.subscription?.isValid &&
    user?.subscription?.plan?.code !== 'FREE' &&
    (!user.subscription.endDate || new Date(user.subscription.endDate) > new Date());

  return (
    <div style={{
      width: W, height: '100vh', flexShrink: 0,
      position: 'fixed', left: 0, top: 0, bottom: 0,
      background: t.sidebar,
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRight: `1px solid ${t.sidebarBorder}`,
      display: 'flex', flexDirection: 'column', padding: '1.25rem 0.75rem',
      transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
      overflowY: 'auto', overflowX: 'hidden', zIndex: 50,
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

      {/* Upgrade Banner for All Users */}
      {user && (
        <div style={{ padding: collapsed ? '0.5rem 0' : '0.5rem 0 0' }}>
          <div
            onClick={() => navigate('/dashboard/premium')}
            style={{
              background: 'linear-gradient(135deg, #EAB308, #B45309)',
              borderRadius: 14,
              padding: collapsed ? '0.75rem 0' : '1rem 0.75rem',
              color: '#fff',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(234, 179, 8, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(234,179,8,0.45)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(234,179,8,0.35)'; }}
          >
            {collapsed ? (
              <span style={{ fontSize: '1.2rem' }}>✦</span>
            ) : (
              <>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>✦</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>Nâng cấp gói</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '0.2rem' }}>Quản lý gói cước của bạn</div>
              </>
            )}
          </div>
        </div>
      )}

      {collapsed && (
        <button onClick={() => setCollapsed(false)} style={{ background: t.goldBg, border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem auto 0' }}>
          <svg width="14" height="14" fill="none" stroke={t.gold} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </div>
  );
}

function BottomNav({ t, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isPremium = user?.subscription?.isValid &&
    user?.subscription?.plan?.code !== 'FREE' &&
    (!user?.subscription?.endDate || new Date(user.subscription.endDate) > new Date());

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
      <div className="bottom-nav-item" onClick={() => navigate('/dashboard/premium')} style={{ color: isPremium ? t.gold : '#EAB308' }}>
        <span style={{ display: 'flex' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </span>
        <span>Gói cước</span>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { isDark, toggleDark, getTheme } = useThemeStore();
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

      <main style={{ flex: 1, marginLeft: isMobile ? 0 : (collapsed ? 64 : 232), minHeight: '100vh', padding: isMobile ? '4rem 1rem 80px' : '2rem 2.5rem', display: 'flex', justifyContent: 'center', transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)', position: 'relative' }}>
        {/* Global Theme Toggle Button */}
        <div style={{ position: 'absolute', top: isMobile ? '1rem' : '1.5rem', right: isMobile ? '1rem' : '2.5rem', zIndex: 50 }}>
          <button onClick={toggleDark} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.card, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, color: t.textSub, transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {isDark ? Icon.sun(t.gold) : Icon.moon(t.textSub)}
            {!isMobile && (isDark ? 'Sáng' : 'Tối')}
          </button>
        </div>

        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {isMobile && <BottomNav t={t} user={user} />}
    </div>
  );
}

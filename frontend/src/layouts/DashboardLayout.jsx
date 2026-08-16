import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import useSplashStore from '../store/useSplashStore';
import SupportChatWidget from '../components/support/SupportChatWidget';
import AdvisorChatWidget from '../components/advisor/AdvisorChatWidget';

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
    id: '/dashboard/flashcards', label: 'Flashcards',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: '/dashboard/games', label: 'Mini-games',
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
        <circle cx="15.5" cy="11" r="0.5" fill={color}/><circle cx="17.5" cy="13" r="0.5" fill={color}/>
        <path d="M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/>
      </svg>
    ),
  },
  {
    id: '/dashboard/speaking', label: 'AI Coach',
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

// SVG Vine decoration — đường dây lá mỏng chạy dọc sidebar
function VineDecoration({ color }) {
  return (
    <svg
      width="18" height="320" viewBox="0 0 18 320" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', right: 0, top: 80, pointerEvents: 'none', opacity: 0.55 }}
    >
      <path d="M9 0 C9 40, 14 55, 9 80 C4 105, 9 130, 9 160 C9 190, 14 210, 9 240 C4 270, 9 295, 9 320"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Leaf 1 */}
      <path d="M9 65 C14 55, 18 48, 16 40 C14 48, 10 55, 9 65Z" fill={color}/>
      {/* Leaf 2 */}
      <path d="M9 65 C4 55, 0 48, 2 40 C4 48, 8 55, 9 65Z" fill={color} opacity="0.6"/>
      {/* Leaf 3 */}
      <path d="M9 145 C14 135, 18 128, 16 120 C14 128, 10 135, 9 145Z" fill={color}/>
      {/* Leaf 4 */}
      <path d="M9 145 C4 135, 0 128, 2 120 C4 128, 8 135, 9 145Z" fill={color} opacity="0.6"/>
      {/* Leaf 5 */}
      <path d="M9 225 C14 215, 18 208, 16 200 C14 208, 10 215, 9 225Z" fill={color}/>
      {/* Leaf 6 */}
      <path d="M9 225 C4 215, 0 208, 2 200 C4 208, 8 215, 9 225Z" fill={color} opacity="0.6"/>
      {/* Leaf 7 */}
      <path d="M9 305 C14 295, 18 288, 16 280 C14 288, 10 295, 9 305Z" fill={color}/>
    </svg>
  );
}

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

function Sidebar({ collapsed, setCollapsed, t, isDark, user }) {
  const W = collapsed ? 68 : 236;
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
      borderRight: `1px solid ${t.sidebarBorder}`,
      display: 'flex', flexDirection: 'column', padding: '1.25rem 0.875rem',
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      overflowY: 'auto', overflowX: 'hidden', zIndex: 50,
      boxShadow: isDark ? `2px 0 32px rgba(0,0,0,0.4)` : `2px 0 20px rgba(47,158,86,0.06)`,
      position: 'fixed',
    }}>
      {/* Vine decoration */}
      {!collapsed && <VineDecoration color={isDark ? t.green : t.green} />}

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', marginBottom: '1.5rem', padding: '0 0.25rem' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0, boxShadow: `0 4px 12px ${t.goldBg}`
            }}>✦</div>
            <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: t.text, letterSpacing: '-0.02em' }}>
              Eng<span style={{ color: t.green }}>Mate</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>✦</div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', color: t.textMuted, transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = t.greenBg}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
      </div>

      {/* User Info */}
      <div
        onClick={() => navigate('/dashboard/settings')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: collapsed ? '0.5rem 0' : '0.625rem 0.75rem',
          marginBottom: '1.25rem', borderRadius: 14,
          cursor: 'pointer',
          background: isDark ? 'rgba(47,158,86,0.06)' : t.greenBg,
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'background 0.2s, transform 0.15s',
          border: `1px solid ${isDark ? 'rgba(47,158,86,0.1)' : '#DFF0E1'}`,
        }}
        onMouseOver={e => { e.currentTarget.style.background = isDark ? 'rgba(47,158,86,0.12)' : '#D1EBCF'; e.currentTarget.style.transform = 'scale(1.01)'; }}
        onMouseOut={e => { e.currentTarget.style.background = isDark ? 'rgba(47,158,86,0.06)' : t.greenBg; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${t.green}, ${t.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
          {user?.profile?.avatarUrl ? (
            <img src={user.profile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.profile?.username?.[0]?.toUpperCase() || 'U'
          )}
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.profile?.username || 'Người dùng'}
            </div>
            <div style={{ fontSize: '0.7rem', color: t.green, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {isPremium ? '✦ Premium' : 'Tài khoản Free'}
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {NAV.map(item => {
          const active = location.pathname === item.id;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: collapsed ? '0.7rem 0' : '0.65rem 0.875rem',
                borderRadius: 12, cursor: 'pointer',
                background: active ? (isDark ? t.greenBg : t.greenBg) : 'transparent',
                color: active ? t.greenDark : t.textMuted,
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontWeight: active ? 700 : 500,
                fontSize: '0.9rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'all 0.2s',
                border: active ? `1px solid ${isDark ? 'rgba(47,158,86,0.2)' : '#C8E6C9'}` : '1px solid transparent',
              }}
              onMouseOver={e => { if (!active) { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : t.bgSub; e.currentTarget.style.color = t.text; } }}
              onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted; } }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon(active ? t.green : t.textMuted)}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: t.green }} />}
            </div>
          );
        })}
      </nav>

      {/* Upgrade Banner */}
      {user && !collapsed && (
        <div style={{ marginTop: '0.75rem' }}>
          <div
            onClick={() => navigate('/dashboard/premium')}
            style={{
              background: `linear-gradient(135deg, ${t.gold} 0%, ${t.green} 100%)`,
              borderRadius: 16, padding: '1rem 0.875rem',
              color: '#fff', textAlign: 'center', cursor: 'pointer',
              boxShadow: `0 6px 20px rgba(47,158,86,0.25)`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = `0 10px 28px rgba(47,158,86,0.35)`; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(47,158,86,0.25)`; }}
          >
            <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>🌱</div>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-0.01em' }}>Nâng cấp gói</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.88, marginTop: '0.2rem' }}>Mở khóa toàn bộ tính năng</div>
          </div>
        </div>
      )}

      {/* Collapsed: Upgrade icon + Expand */}
      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div
            onClick={() => navigate('/dashboard/premium')}
            style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${t.gold}, ${t.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}
          >🌱</div>
          <button onClick={() => setCollapsed(false)} style={{ background: t.greenBg, border: 'none', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" fill="none" stroke={t.green} strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

function BottomNav({ t, user }) {
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
          <div key={item.id} className="bottom-nav-item" onClick={() => navigate(item.id)} style={{ color: active ? t.green : t.textMuted }}>
            <span style={{ display: 'flex' }}>{item.icon(active ? t.green : t.textMuted)}</span>
            <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '0.65rem' }}>{item.label}</span>
          </div>
        );
      })}
      <div className="bottom-nav-item" onClick={() => navigate('/dashboard/premium')} style={{ color: t.gold }}>
        <span style={{ fontSize: '1.1rem' }}>🌱</span>
        <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '0.65rem' }}>Gói cước</span>
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
  const pulseSplash = useSplashStore(s => s.pulse);
  const location = useLocation();

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
    <div style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif", display: 'flex', minHeight: '100vh', background: t.bg, color: t.text, transition: 'background 0.3s, color 0.3s' }}>
      {!isMobile && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} t={t} isDark={isDark} user={user} />
      )}

      <main style={{ flex: 1, marginLeft: isMobile ? 0 : (collapsed ? 68 : 236), minHeight: '100vh', padding: isMobile ? '4rem 1rem 80px' : '2rem 2.5rem', display: 'flex', justifyContent: 'center', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)', position: 'relative' }}>
        {/* Theme Toggle */}
        <div style={{ position: 'absolute', top: isMobile ? '1rem' : '1.5rem', right: isMobile ? '1rem' : '2.5rem', zIndex: 50 }}>
          <button
            onClick={toggleDark}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.875rem', borderRadius: 100,
              border: `1.5px solid ${t.cardBorder}`,
              background: t.card, cursor: 'pointer',
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: '0.8rem', fontWeight: 600, color: t.textSub,
              transition: 'all 0.2s', boxShadow: `0 2px 8px ${t.shadow}`,
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = isDark ? t.green : t.gold}
            onMouseOut={e => e.currentTarget.style.borderColor = t.cardBorder}
          >
            {isDark ? <SunIcon color={t.gold} /> : <MoonIcon color={t.textSub} />}
            {!isMobile && (isDark ? 'Sáng' : 'Tối')}
          </button>
        </div>

        <div style={{ width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {isMobile && <BottomNav t={t} user={user} />}
      <AdvisorChatWidget />
      <SupportChatWidget />
    </div>
  );
}

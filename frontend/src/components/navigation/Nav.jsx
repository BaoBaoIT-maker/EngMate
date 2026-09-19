import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';

const LINKS = [
  { id: 'home', path: '/dashboard', label: 'Trang chủ' },
  { id: 'flashcards', path: '/dashboard/flashcards', label: 'Flashcards' },
  { id: 'games', path: '/dashboard/games', label: 'Trò chơi' },
  { id: 'speaking', path: '/dashboard/speaking', label: 'Giao tiếp' },
  { id: 'settings', path: '/dashboard/settings', label: 'Cài đặt' },
];

const TABS = [
  { id: 'home', path: '/dashboard', label: 'Trang chủ', Icon: HomeIcon },
  { id: 'flashcards', path: '/dashboard/flashcards', label: 'Flashcards', Icon: CardsIcon },
  { id: 'games', path: '/dashboard/games', label: 'Trò chơi', Icon: GamesIcon },
  { id: 'speaking', path: '/dashboard/speaking', label: 'Giao tiếp', Icon: SpeakingIcon },
];

function determineActiveTab(pathname) {
  if (pathname.startsWith('/dashboard/flashcards')) return 'flashcards';
  if (pathname.startsWith('/dashboard/games')) return 'games';
  if (pathname.startsWith('/dashboard/speaking')) return 'speaking';
  if (pathname.startsWith('/dashboard/settings')) return 'settings';
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'home';
  return 'home';
}

export default function Nav({ stats }) {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const { isDark, toggleDark } = useThemeStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = determineActiveTab(location.pathname);

  const streakDays = stats?.streak?.current ?? 0;
  const isPremium = Boolean(
    user?.subscription?.isValid &&
    user?.subscription?.plan?.code !== 'FREE' &&
    (!user.subscription.endDate || new Date(user.subscription.endDate) > new Date())
  );

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (path) => {
    navigate(path);
  };

  return mobile ? (
    <MobileNav
      dark={isDark}
      setDark={toggleDark}
      activeTab={activeTab}
      onNavClick={handleNavClick}
      streakDays={streakDays}
      user={user}
      logout={logout}
      navigate={navigate}
      isPremium={isPremium}
    />
  ) : (
    <DesktopNav
      dark={isDark}
      setDark={toggleDark}
      activeTab={activeTab}
      onNavClick={handleNavClick}
      streakDays={streakDays}
      user={user}
      logout={logout}
      navigate={navigate}
      isPremium={isPremium}
    />
  );
}

/* ═══════════════════════════ DESKTOP NAV ═══════════════════════════ */

function DesktopNav({
  dark,
  setDark,
  activeTab,
  onNavClick,
  streakDays,
  user,
  logout,
  navigate,
  isPremium,
}) {
  const [hovered, setHovered] = useState(null);
  const [upgHover, setUpgHover] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(1140px, calc(100vw - 40px))',
        zIndex: 100,
      }}
    >
      <nav
        style={{
          height: '64px',
          borderRadius: '24px',
          background: dark ? 'rgba(26, 18, 8, 0.88)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid var(--card-border)',
          boxShadow: 'var(--nav-shadow), inset 0 1px 0 var(--card-highlight)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px 0 14px',
          gap: '8px',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => onNavClick('/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <LogoBadge />
        </div>

        {/* Links */}
        <ul
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            listStyle: 'none',
            margin: '0 auto',
            padding: 0,
          }}
        >
          {LINKS.map(({ id, path, label }) => {
            const active = activeTab === id;
            const hover = hovered === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavClick(path)}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'relative',
                    padding: '7px 13px 9px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: active
                      ? 'rgba(240, 180, 41, 0.10)'
                      : hover
                      ? 'rgba(240, 180, 41, 0.05)'
                      : 'transparent',
                    color: active ? '#C9920A' : 'var(--fg-2)',
                    fontFamily: 'inherit',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 500,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    transition: 'color 0.18s, background 0.18s',
                    outline: 'none',
                    lineHeight: 1,
                  }}
                >
                  {label}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      height: '2px',
                      width: active ? '18px' : '0',
                      borderRadius: '999px',
                      background: 'linear-gradient(90deg, #F5BE36, #D4960A)',
                      boxShadow: active ? '0 0 8px rgba(240, 180, 41, 0.7)' : 'none',
                      transition: 'width 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Streak counter */}
          <div
            title={`Chuỗi học tập: ${streakDays} ngày liên tiếp`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(240, 180, 41, 0.12)',
              border: '1px solid rgba(240, 180, 41, 0.28)',
              userSelect: 'none',
            }}
          >
            <FlameIcon />
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#C9920A',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}
            >
              {streakDays} NGÀY
            </span>
          </div>

          {/* Upgrade CTA */}
          <button
            type="button"
            onClick={() => onNavClick('/dashboard/premium')}
            onMouseEnter={() => setUpgHover(true)}
            onMouseLeave={() => setUpgHover(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: isPremium
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
              boxShadow: upgHover
                ? isPremium
                  ? '0 4px 20px rgba(16, 185, 129, 0.5)'
                  : '0 4px 20px rgba(240, 180, 41, 0.5)'
                : isPremium
                ? '0 2px 12px rgba(16, 185, 129, 0.3)'
                : '0 2px 12px rgba(240, 180, 41, 0.28)',
              transform: upgHover ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'box-shadow 0.2s, transform 0.2s',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.07em',
              color: isPremium ? '#FFFFFF' : '#1C1407',
              outline: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <CrownIcon color={isPremium ? '#FFFFFF' : '#1C1407'} />
            {isPremium ? 'VIP MEMBER' : 'NÂNG CẤP'}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            title={dark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid var(--card-border)',
              background: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(240, 180, 41, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              outline: 'none',
              flexShrink: 0,
            }}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Avatar with dropdown */}
          <AvatarDropdown user={user} logout={logout} navigate={navigate} isPremium={isPremium} dark={dark} />
        </div>
      </nav>
    </header>
  );
}

/* ═══════════════════════════ MOBILE NAV ═══════════════════════════ */

function MobileNav({
  dark,
  setDark,
  activeTab,
  onNavClick,
  streakDays,
  user,
  logout,
  navigate,
  isPremium,
}) {
  return (
    <>
      {/* Sticky top mini-bar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: dark ? 'rgba(18, 13, 4, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--card-border)',
        }}
      >
        <div
          onClick={() => onNavClick('/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(240, 180, 41, 0.3)',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 0L8.4 5.4L14 7L8.4 8.6L7 14L5.6 8.6L0 7L5.6 5.4L7 0Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', color: 'var(--fg)' }}>
            Eng<span style={{ color: '#F0B429' }}>Mate</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Streak pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '999px',
              background: 'rgba(240, 180, 41, 0.12)',
              border: '1px solid rgba(240, 180, 41, 0.25)',
            }}
          >
            <FlameIcon size={11} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#C9920A', letterSpacing: '0.06em' }}>
              {streakDays}
            </span>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setDark(!dark)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1.5px solid var(--card-border)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
            }}
          >
            {dark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
          </button>

          {/* Avatar dropdown */}
          <AvatarDropdown
            user={user}
            logout={logout}
            navigate={navigate}
            isPremium={isPremium}
            dark={dark}
            size={34}
          />
        </div>
      </header>

      {/* Bottom floating tab bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          width: 'calc(100vw - 32px)',
          maxWidth: '420px',
          height: '64px',
          borderRadius: '22px',
          background: dark ? 'rgba(26, 18, 8, 0.90)' : 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid var(--card-border)',
          boxShadow: 'var(--nav-shadow), inset 0 1px 0 var(--card-highlight)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
        }}
      >
        {TABS.map(({ id, path, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavClick(path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                padding: '8px 4px',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
                background: active ? 'rgba(240, 180, 41, 0.12)' : 'transparent',
                transition: 'background 0.2s',
                outline: 'none',
              }}
            >
              <Icon active={active} />
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.04em',
                  color: active ? '#C9920A' : 'var(--fg-3)',
                  transition: 'color 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/* ═══════════════════════════ SHARED ATOMS ═══════════════════════════ */

function LogoBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F5BE36 0%, #D4960A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(240, 180, 41, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 0L10.8 6.8L18 9L10.8 11.2L9 18L7.2 11.2L0 9L7.2 6.8L9 0Z" fill="white" />
        </svg>
      </div>
      <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: 'var(--fg)' }}>
        Eng<span style={{ color: '#F0B429' }}>Mate</span>
      </span>
    </div>
  );
}

function AvatarDropdown({ user, logout, navigate, isPremium, dark, size = 38 }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef(null);

  const avatarUrl = user?.profile?.avatarUrl || user?.avatar_url || user?.avatar || null;
  const displayName = user?.profile?.username || user?.profile?.fullName || user?.name || user?.email?.split('@')[0] || 'Học viên';
  const displayEmail = user?.email || '';

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: isPremium
            ? '2px solid #F0B429'
            : '2px solid rgba(240, 180, 41, 0.4)',
          boxShadow: isPremium ? '0 0 10px rgba(240, 180, 41, 0.4)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          outline: 'none',
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #E8DCC8, #C4A97A)',
        }}
        title={displayName}
      >
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={displayName}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="8" r="3.5" fill="#6B6047" opacity="0.65" />
            <path
              d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"
              stroke="#6B6047"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.65"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: `${size + 10}px`,
            right: 0,
            width: '230px',
            borderRadius: '18px',
            background: dark ? 'rgba(26, 18, 8, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid var(--card-border)',
            boxShadow: '0 12px 36px rgba(28, 20, 7, 0.25)',
            padding: '12px',
            zIndex: 150,
            animation: 'slide-up 0.2s ease',
          }}
        >
          {/* User profile header */}
          <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: 'var(--fg)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </div>
              {isPremium && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '999px',
                    background: 'rgba(240, 180, 41, 0.2)',
                    color: '#D4960A',
                    letterSpacing: '0.04em',
                  }}
                >
                  VIP
                </span>
              )}
            </div>
            {displayEmail && (
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--fg-3)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: '2px',
                }}
              >
                {displayEmail}
              </div>
            )}
          </div>

          {/* Action Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px 0' }}>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/settings');
              }}
              className="dropdown-item-hover"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: 'var(--fg-2)',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Cài đặt tài khoản
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/premium');
              }}
              className="dropdown-item-hover"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#D4960A',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <CrownIcon color="#D4960A" />
              Gói cước VIP
            </button>

            {user?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('/admin');
                }}
                className="dropdown-item-hover"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#6C63FF',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Trang quản trị (Admin)
              </button>
            )}
          </div>

          {/* Logout */}
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/login');
              }}
              className="dropdown-item-hover"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#EF4444',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlameIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1C7 1 10.5 4.5 10.5 7.5C10.5 9.43 8.93 11 7 11C5.07 11 3.5 9.43 3.5 7.5C3.5 6.5 4 5.5 4 5.5C4 5.5 4.5 7 5.5 7C5.5 5.5 6 3 7 1Z"
        fill="#F0B429"
      />
      <path
        d="M7 8C7 8 8 8.5 8 9.5C8 10.05 7.55 10.5 7 10.5C6.45 10.5 6 10.05 6 9.5C6 8.5 7 8 7 8Z"
        fill="#D4960A"
      />
    </svg>
  );
}

function CrownIcon({ color = '#1C1407' }) {
  return (
    <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
      <path d="M1 8L2.5 3.5L5.5 6.5L6.5 2L7.5 6.5L10.5 3.5L12 8H1Z" fill={color} opacity="0.85" />
      <rect x="1" y="9" width="11" height="1.5" rx="0.75" fill={color} opacity="0.85" />
    </svg>
  );
}

function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.2" stroke="#F0B429" strokeWidth="1.5" />
      <line x1="8" y1="1" x2="8" y2="2.8" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13.2" x2="8" y2="15" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="1" y1="8" x2="2.8" y2="8" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13.2" y1="8" x2="15" y2="8" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.1" y1="3.1" x2="4.4" y2="4.4" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.6" y1="11.6" x2="12.9" y2="12.9" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.9" y1="3.1" x2="11.6" y2="4.4" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.4" y1="11.6" x2="3.1" y2="12.9" stroke="#F0B429" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M13 9.5A5.5 5.5 0 0 1 6.5 3 5.5 5.5 0 1 0 13 9.5z"
        stroke="#9D8E6F"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ═══════════════════════════ MOBILE TAB ICONS ═══════════════════════════ */

function HomeIcon({ active }) {
  const c = active ? '#F0B429' : 'var(--fg-3)';
  const w = active ? 2 : 1.5;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 8.5L10 2.5L17 8.5V17.5H13V12.5H7V17.5H3V8.5Z"
        stroke={c}
        strokeWidth={w}
        strokeLinejoin="round"
        fill={active ? 'rgba(240,180,41,0.15)' : 'none'}
      />
    </svg>
  );
}

function CardsIcon({ active }) {
  const c = active ? '#F0B429' : 'var(--fg-3)';
  const w = active ? 2 : 1.5;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="3.5" width="12" height="9" rx="2" stroke={c} strokeWidth={w} opacity="0.4" />
      <rect
        x="2"
        y="6.5"
        width="12"
        height="9"
        rx="2"
        stroke={c}
        strokeWidth={w}
        fill={active ? 'rgba(240,180,41,0.15)' : 'none'}
      />
    </svg>
  );
}

function GamesIcon({ active }) {
  const c = active ? '#F0B429' : 'var(--fg-3)';
  const w = active ? 2 : 1.5;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="6"
        width="16"
        height="9"
        rx="3"
        stroke={c}
        strokeWidth={w}
        fill={active ? 'rgba(240,180,41,0.15)' : 'none'}
      />
      <line x1="7.5" y1="10.5" x2="5.5" y2="10.5" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <line x1="6.5" y1="9.5" x2="6.5" y2="11.5" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <circle cx="13.5" cy="9.8" r="0.85" fill={c} />
      <circle cx="15" cy="11.2" r="0.85" fill={c} />
    </svg>
  );
}

function SpeakingIcon({ active }) {
  const c = active ? '#F0B429' : 'var(--fg-3)';
  const w = active ? 2 : 1.5;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="7"
        y="2"
        width="6"
        height="9"
        rx="3"
        stroke={c}
        strokeWidth={w}
        fill={active ? 'rgba(240,180,41,0.15)' : 'none'}
      />
      <path
        d="M4 10.5C4 13.81 6.69 16.5 10 16.5C13.31 16.5 16 13.81 16 10.5"
        stroke={c}
        strokeWidth={w}
        strokeLinecap="round"
      />
      <line x1="10" y1="16.5" x2="10" y2="18.5" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <line x1="7.5" y1="18.5" x2="12.5" y2="18.5" stroke={c} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

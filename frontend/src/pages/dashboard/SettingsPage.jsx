import React, { useState } from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';

const card = (t, extra) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
});

export default function SettingsPage() {
  const { isDark, toggleDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);

  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [goal, setGoal] = useState(20);

  const Toggle = ({ on, setOn }) => (
    <div onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 100, background: on ? t.gold : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'), cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
    </div>
  );

  const Row = ({ label, desc, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: `1px solid ${t.cardBorder}` }}>
      <div>
        <div style={{ fontWeight: 600, color: t.text, fontSize: '0.9rem' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="screen-enter w-full max-w-7xl mx-auto">
      <Header title="Cài đặt" />

      {/* Profile */}
      <div style={{ ...card(t), padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Tài khoản</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${t.gold}, ${t.goldDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {user?.profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: '1.05rem' }}>{user?.profile?.username || 'User'}</div>
            <div style={{ fontSize: '0.78rem', color: t.textMuted }}>{user?.email || 'user@example.com'}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: t.goldBg, color: t.gold }}>Premium ✦</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 6, background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>Level 7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div style={{ ...card(t), padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Tuỳ chọn</div>
        <Row label="Chế độ tối" desc="Giao diện tối cho mắt" right={<Toggle on={isDark} setOn={toggleDark} />} />
        <Row label="Thông báo nhắc nhở" desc="Nhắc học vào 8:00 sáng mỗi ngày" right={<Toggle on={notif} setOn={setNotif} />} />
        <Row label="Âm thanh" desc="Phát âm từ khi học flashcard" right={<Toggle on={sound} setOn={setSound} />} />
        <Row label="Mục tiêu hàng ngày" desc={`${goal} từ / ngày`} right={
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {[10, 20, 30, 50].map(v => (
              <button key={v} onClick={() => setGoal(v)} style={{ padding: '0.3rem 0.625rem', borderRadius: 8, border: `1.5px solid ${goal === v ? t.gold : t.cardBorder}`, background: goal === v ? t.goldBg : 'transparent', color: goal === v ? t.gold : t.textMuted, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                {v}
              </button>
            ))}
          </div>
        } />
      </div>

      {/* Stats */}
      <div style={{ ...card(t), padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem' }}>Thống kê tổng</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[['1.284', 'Từ đã thuộc'], ['23', 'Ngày streak'], ['92%', 'Độ chính xác']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: t.gold }}>{v}</div>
              <div style={{ fontSize: '0.68rem', color: t.textMuted, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={() => {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }}
        style={{ width: '100%', padding: '0.875rem', borderRadius: 12, border: `1.5px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        Đăng xuất
      </button>
    </div>
  );
}

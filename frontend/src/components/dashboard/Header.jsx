import React from 'react';
import useThemeStore from '../../store/useThemeStore';
import { Icon } from '../icons';

export default function Header({ title, subtitle }) {
  const { isDark, toggleDark, getTheme } = useThemeStore();
  const t = getTheme();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: t.text, letterSpacing: '-0.025em', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.875rem', color: t.textMuted, margin: '0.25rem 0 0' }}>{subtitle}</p>}
      </div>
      <button onClick={toggleDark} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: 10, border: `1px solid ${t.cardBorder}`, background: t.card, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, color: t.textSub, transition: 'all 0.2s' }}>
        {isDark ? Icon.sun(t.gold) : Icon.moon(t.textSub)}
        {isDark ? 'Sáng' : 'Tối'}
      </button>
    </div>
  );
}

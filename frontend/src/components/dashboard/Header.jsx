import React from 'react';
import useThemeStore from '../../store/useThemeStore';
import { Icon } from '../icons';

export default function Header({ title, subtitle }) {
  const { isDark, toggleDark, getTheme } = useThemeStore();
  const t = getTheme();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif", fontSize: '1.5rem', fontWeight: 800, color: t.text, letterSpacing: '-0.025em', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: "'Be Vietnam Pro', system-ui, sans-serif", fontSize: '0.875rem', color: t.textMuted, margin: '0.25rem 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

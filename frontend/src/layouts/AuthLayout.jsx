import React from 'react';

const GOLD = '#F0B429';

export default function AuthLayout({ children }) {
  return (
    <div style={{
      background: '#FAFAF8',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
      color: '#1C1407'
    }}>
      {/* Background mesh */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(240,180,41,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(139,92,246,0.08) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,180,41,0.15) 0%, transparent 65%)',
        pointerEvents: 'none'
      }} />

      {/* Auth Card (similar to modal) */}
      <div className="animate-modal-in" style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        border: '1.5px solid rgba(255,255,255,0.95)',
        borderRadius: 28,
        boxShadow: '0 32px 80px rgba(28,20,7,0.2), 0 8px 24px rgba(240,180,41,0.12), 0 1px 0 rgba(255,255,255,0.9) inset',
        padding: '2.25rem',
        position: 'relative',
        zIndex: 10
      }}>
        {children}
      </div>
    </div>
  );
}

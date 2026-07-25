import React from 'react';

const GOLD = '#F0B429';

export default function PricingCard({ plan, onCta }) {
  const hl = plan.highlight;
  return (
    <div style={{
      borderRadius: 24, padding: '2rem',
      background: hl ? 'linear-gradient(160deg, #1C1407 0%, #2A1E08 100%)' : 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: hl ? '1.5px solid rgba(240,180,41,0.4)' : '1px solid rgba(255,255,255,0.88)',
      boxShadow: hl ? '0 16px 48px rgba(240,180,41,0.2), 0 4px 16px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {hl && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '0.25rem 0.75rem', borderRadius: 100,
          background: 'linear-gradient(135deg, #F0B429, #D4960A)',
          fontSize: '0.7rem', fontWeight: 700, color: 'white',
        }}>
          Phổ biến nhất
        </div>
      )}
      {hl && (
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,180,41,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: hl ? 'rgba(255,255,255,0.45)' : '#9D8E6F', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{plan.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 6 }}>
        <span style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: hl ? '#fff' : '#1C1407' }}>{plan.price}</span>
        <span style={{ fontSize: '0.9rem', color: hl ? 'rgba(255,255,255,0.4)' : '#9D8E6F' }}>{plan.period}</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: hl ? 'rgba(255,255,255,0.5)' : '#9D8E6F', marginBottom: '1.5rem' }}>{plan.desc}</div>

      <button onClick={onCta} className={hl ? 'btn-gold' : ''} style={{
        width: '100%', padding: '0.875rem', borderRadius: 12,
        fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem',
        ...(hl ? {} : {
          background: 'transparent', border: '1.5px solid rgba(28,20,7,0.15)',
          color: '#1C1407', transition: 'background 0.2s',
        }),
      }}>
        {plan.cta}
      </button>

      <div style={{ borderTop: `1px solid ${hl ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {plan.features.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(240,180,41,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.55rem', color: GOLD }}>✓</span>
            </div>
            <span style={{ fontSize: '0.83rem', color: hl ? 'rgba(255,255,255,0.8)' : '#6B6047' }}>{f}</span>
          </div>
        ))}
        {plan.locked.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', opacity: 0.38 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.55rem', color: '#9D8E6F' }}>✕</span>
            </div>
            <span style={{ fontSize: '0.83rem', color: '#9D8E6F', textDecoration: 'line-through' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

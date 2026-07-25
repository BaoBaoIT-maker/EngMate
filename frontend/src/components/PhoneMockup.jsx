import React, { useState } from 'react';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';
const GOLD_LIGHT = '#FEF3C7';

export default function PhoneMockup() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="animate-float" style={{ position: 'relative' }}>
      {/* Glow behind phone */}
      <div style={{
        position: 'absolute', inset: -40, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,180,41,0.25) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Floating badge — top right */}
      <div className="animate-float-slow glass" style={{
        position: 'absolute', top: -16, right: -24, zIndex: 10,
        padding: '0.5rem 0.875rem', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1C1407' }}>Streak: 23 days 🔥</span>
      </div>

      {/* Floating badge — bottom left */}
      <div className="animate-float-slow glass" style={{
        position: 'absolute', bottom: 24, left: -32, zIndex: 10,
        padding: '0.625rem 1rem', borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        animationDelay: '1.5s',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9D8E6F', marginBottom: 2 }}>AI Score</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: GOLD_DARK }}>94 / 100</div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: 240, height: 480,
        borderRadius: 36,
        background: 'linear-gradient(160deg, #2A2015 0%, #1A1208 100%)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.12) inset',
        padding: '8px',
        position: 'relative',
        cursor: 'pointer',
      }} onClick={() => setFlipped(f => !f)}>
        {/* Notch */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          width: 80, height: 24, background: '#0E0A04', borderRadius: '0 0 14px 14px', zIndex: 2,
        }} />
        {/* Screen */}
        <div style={{
          width: '100%', height: '100%', borderRadius: 30,
          background: flipped
            ? 'linear-gradient(160deg, #1A1208 0%, #2D1E00 100%)'
            : 'linear-gradient(160deg, #FFFDF7 0%, #FEF9EE 100%)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          transition: 'background 0.4s',
        }}>
          {/* Status bar */}
          <div style={{ height: 36 }} />
          {/* App header */}
          <div style={{ padding: '0.5rem 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: flipped ? 'rgba(255,255,255,0.5)' : '#9D8E6F' }}>Bài học hôm nay</div>
            <div style={{ background: GOLD_LIGHT, borderRadius: 100, padding: '2px 8px' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: GOLD_DARK }}>TOEIC</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ padding: '0 1rem', marginBottom: '0.75rem' }}>
            <div style={{ height: 4, borderRadius: 4, background: flipped ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '68%', height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DARK})` }} />
            </div>
            <div style={{ fontSize: '0.6rem', color: flipped ? 'rgba(255,255,255,0.4)' : '#9D8E6F', marginTop: 3 }}>17 / 25 từ</div>
          </div>
          {/* Flashcard */}
          <div style={{ margin: '0 0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!flipped ? (
              <div style={{
                background: 'white', borderRadius: 16, padding: '1rem',
                boxShadow: '0 4px 20px rgba(240,180,41,0.15), 0 1px 0 rgba(255,255,255,0.9) inset',
                border: '1px solid rgba(240,180,41,0.2)',
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Từ vựng</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1C1407', marginBottom: 4, letterSpacing: '-0.02em' }}>Meticulous</div>
                <div style={{ fontSize: '0.6rem', color: '#9D8E6F', fontStyle: 'italic', marginBottom: 8 }}>/məˈtɪk.jʊ.ləs/</div>
                <div style={{ fontSize: '0.62rem', color: '#6B6047', lineHeight: 1.5 }}>
                  adj. Tỉ mỉ, cẩn thận đến từng chi tiết.
                </div>
                <div style={{ marginTop: 8, padding: '0.4rem 0.6rem', background: GOLD_LIGHT, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.58rem', color: GOLD_DARK, lineHeight: 1.5, fontStyle: 'italic' }}>
                    "She was meticulous in her TOEIC preparation."
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #F0B429, #C9920A)', borderRadius: 16, padding: '1rem',
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 8px 32px rgba(240,180,41,0.4)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>Chính xác!</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)' }}>+40 XP nhận được</div>
              </div>
            )}
          </div>
          {/* Action buttons */}
          <div style={{ padding: '0.75rem 0.875rem', display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: '1.5px solid rgba(236,72,153,0.3)', background: 'rgba(236,72,153,0.06)', fontSize: '0.62rem', fontWeight: 700, color: '#EC4899', cursor: 'pointer' }}>
              Ôn lại ↩
            </button>
            <button style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #F0B429, #D4960A)', fontSize: '0.62rem', fontWeight: 700, color: 'white', cursor: 'pointer' }}>
              Thuộc rồi ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

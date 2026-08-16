import React, { useState } from 'react';

const GOLD = '#F0B429';
const GOLD_DARK = '#C9920A';

function WaveBar({ i }) {
  const durations = [0.6, 0.9, 0.7, 1.1, 0.8, 0.65, 0.95, 0.75, 1.0, 0.7, 0.85, 0.6, 1.2, 0.8, 0.7];
  const d = durations[i % durations.length];
  return (
    <div style={{
      width: 4, height: 48, borderRadius: 100,
      background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
      transformOrigin: 'center',
      animation: `wave-bar ${d}s ease-in-out infinite`,
      animationDelay: `${i * 0.07}s`,
    }} />
  );
}

export default function SpeakingCoach() {
  const [recording, setRecording] = useState(false);
  return (
    <div className="glass-dark" style={{
      borderRadius: 24, padding: '2rem',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      animation: 'card-in 0.5s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F0B429, #D4960A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎙️</div>
        <div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>AI Conversation</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Luyện hội thoại tiếng Anh với AI</div>
        </div>
      </div>

      {/* Transcript box */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Câu của bạn</div>
        <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.6, fontStyle: 'italic' }}>
          "The report was submitted{' '}
          <span style={{ color: GOLD, fontWeight: 700, textDecoration: 'underline', textDecorationStyle: 'dotted' }}>me-tic-u-lous-ly</span>
          {' '}on time."
        </div>
      </div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 56, justifyContent: 'center', marginBottom: '1.5rem' }}>
        {Array.from({ length: 15 }).map((_, i) => <WaveBar key={i} i={i} />)}
      </div>

      {/* Score row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[['Phát âm', '94'], ['Lưu loát', '88'], ['Ngữ điệu', '91']].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)', borderRadius: 12, padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: GOLD }}>{v}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{k}</div>
          </div>
        ))}
      </div>

      {/* Mic button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          {recording && <>
            <div style={{
              position: 'absolute', inset: -12, borderRadius: '50%',
              border: `2px solid ${GOLD}`,
              animation: 'pulse-ring 1.2s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute', inset: -20, borderRadius: '50%',
              border: `2px solid ${GOLD}`,
              animation: 'pulse-ring2 1.2s ease-out infinite 0.4s',
            }} />
          </>}
          <button
            onClick={() => setRecording(r => !r)}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: recording ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #F5BE36, #D4960A)',
              border: 'none', cursor: 'pointer', fontSize: '1.25rem',
              boxShadow: recording ? '0 0 0 4px rgba(239,68,68,0.2)' : '0 6px 20px rgba(240,180,41,0.5)',
              transition: 'all 0.3s',
            }}>
            {recording ? '⏹' : '🎤'}
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
        {recording ? 'Đang nghe… hãy nói tự nhiên' : 'Nhấn để bắt đầu nói'}
      </div>
    </div>
  );
}

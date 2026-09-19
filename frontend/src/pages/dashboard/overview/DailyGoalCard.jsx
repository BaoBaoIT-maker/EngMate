import React, { useState, useEffect } from 'react';

function Eyebrow({ children }) {
  return (
    <p
      style={{
        fontSize: '10.5px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--fg-3)',
        margin: '0 0 6px',
      }}
    >
      {children}
    </p>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '18px', fontWeight: 800, color, letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--fg-3)', marginTop: '2px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

export default function DailyGoalCard({ dailyGoal }) {
  const target = dailyGoal?.target || 15;
  const completed = dailyGoal?.completed || 0;
  const pct = Math.min(100, Math.round((completed / target) * 100));

  const r = 72;
  const stroke = 10;
  const norm = r - stroke / 2;
  const circ = 2 * Math.PI * norm;
  const targetDash = (pct / 100) * circ;

  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(targetDash), 120);
    return () => clearTimeout(t);
  }, [targetDash]);

  const angle = (animated / circ) * 360 - 90;
  const rad = (angle * Math.PI) / 180;
  const capX = r + stroke / 2 + norm * Math.cos(rad);
  const capY = r + stroke / 2 + norm * Math.sin(rad);

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--card-border)',
        borderRadius: '24px',
        boxShadow: 'var(--card-shadow)',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Top highlight line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--card-highlight)',
          pointerEvents: 'none',
        }}
      />

      <Eyebrow>Hôm nay</Eyebrow>
      <h3
        style={{
          margin: '0 0 24px',
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--fg)',
          letterSpacing: '-0.02em',
        }}
      >
        Mục tiêu ngày
      </h3>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <svg
          width={r * 2 + stroke}
          height={r * 2 + stroke}
          viewBox={`0 0 ${r * 2 + stroke} ${r * 2 + stroke}`}
        >
          <defs>
            <linearGradient id="goalGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5BE36" />
              <stop offset="100%" stopColor="#D4960A" />
            </linearGradient>
            <filter id="goalCapGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={r + stroke / 2}
            cy={r + stroke / 2}
            r={norm}
            fill="none"
            stroke="rgba(240,180,41,0.10)"
            strokeWidth={stroke}
          />

          {/* Progress Arc */}
          <circle
            cx={r + stroke / 2}
            cy={r + stroke / 2}
            r={norm}
            fill="none"
            stroke="url(#goalGaugeGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${animated} ${circ}`}
            strokeDashoffset={circ / 4}
            style={{ transition: 'stroke-dasharray 1.3s cubic-bezier(0.34,1,0.64,1)' }}
          />

          {/* Cap Glow Dot */}
          {animated > 4 && (
            <circle
              cx={capX}
              cy={capY}
              r={stroke / 2 + 1.5}
              fill="#F5BE36"
              filter="url(#goalCapGlow)"
            />
          )}

          {/* Centered Percentage */}
          <text
            x={r + stroke / 2}
            y={r + stroke / 2 - 6}
            textAnchor="middle"
            fill="var(--fg)"
            fontSize="30"
            fontWeight="800"
            fontFamily="var(--font-sans), sans-serif"
            letterSpacing="-1.5"
          >
            {pct}%
          </text>

          {/* Centered Label */}
          <text
            x={r + stroke / 2}
            y={r + stroke / 2 + 17}
            textAnchor="middle"
            fill="var(--fg-3)"
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans), sans-serif"
            letterSpacing="1"
          >
            MỤC TIÊU NGÀY
          </text>
        </svg>
      </div>

      {/* Bottom mini-stats */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: 'auto',
          padding: '16px',
          borderRadius: '16px',
          background: 'rgba(240,180,41,0.06)',
          border: '1px solid rgba(240,180,41,0.12)',
        }}
      >
        <MiniStat label="Đã ôn" value={`${completed} từ`} color="#10B981" />
        <div style={{ width: '1px', background: 'var(--card-border)' }} />
        <MiniStat
          label="Còn lại"
          value={`${Math.max(0, target - completed)} từ`}
          color="#EF4444"
        />
      </div>
    </div>
  );
}

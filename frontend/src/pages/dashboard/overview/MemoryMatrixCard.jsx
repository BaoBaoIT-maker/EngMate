import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function MemTile({ label, count, pct, color, bg, desc, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        borderRadius: '16px',
        background: hov ? `${color}14` : bg,
        border: `1.5px solid ${color}${hov ? '35' : '18'}`,
        cursor: 'pointer',
        transform: hov ? 'translateX(3px)' : 'translateX(0)',
        transition: 'all 0.18s ease',
      }}
    >
      {/* Large number */}
      <div
        style={{
          fontSize: '30px',
          fontWeight: 800,
          color,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          minWidth: '48px',
        }}
      >
        {count}
      </div>

      {/* Labels + mini bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--fg)', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--fg-3)', marginBottom: '8px' }}>
          {desc}
        </div>
        {/* Inline progress bar */}
        <div
          style={{
            height: '4px',
            borderRadius: '999px',
            background: `${color}20`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: color,
              borderRadius: '999px',
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>

      {/* Percent */}
      <div style={{ fontSize: '13px', fontWeight: 700, color, opacity: 0.85, flexShrink: 0 }}>
        {pct}%
      </div>
    </div>
  );
}

export default function MemoryMatrixCard({ memory }) {
  const navigate = useNavigate();

  const needReview = memory?.needReview || 0;
  const learning = memory?.learning || 0;
  const mastered = memory?.mastered || 0;
  const total = needReview + learning + mastered;
  const safeTotal = total > 0 ? total : 1;

  const memData = [
    {
      label: 'Cần ôn gấp',
      count: needReview,
      pct: Math.round((needReview / safeTotal) * 100),
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      desc: 'Học lại ngay hôm nay',
    },
    {
      label: 'Đang ghi nhớ',
      count: learning,
      pct: Math.round((learning / safeTotal) * 100),
      color: '#F0B429',
      bg: 'rgba(240, 180, 41, 0.08)',
      desc: 'Ôn lại trong 1–3 ngày',
    },
    {
      label: 'Đã khắc sâu',
      count: mastered,
      pct: Math.round((mastered / safeTotal) * 100),
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      desc: 'Nhớ bền vững dài hạn',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--card-border)',
        borderRadius: '24px',
        boxShadow: 'var(--card-shadow)',
        padding: '28px 24px',
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

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <Eyebrow>Kho từ vựng</Eyebrow>
          <h3
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--fg)',
              letterSpacing: '-0.02em',
            }}
          >
            Từ vựng của tôi
          </h3>
        </div>
        {/* Total pill */}
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(240, 180, 41, 0.10)',
            border: '1px solid rgba(240, 180, 41, 0.25)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#C9920A' }}>
            {total} từ
          </span>
        </div>
      </div>

      {/* Multi-segment distribution bar */}
      <div
        style={{
          display: 'flex',
          borderRadius: '10px',
          overflow: 'hidden',
          height: '8px',
          marginBottom: '20px',
          gap: '2px',
          background: 'rgba(240, 180, 41, 0.06)',
        }}
      >
        {memData.map(({ count, color }) => (
          <div
            key={color}
            style={{
              height: '100%',
              width: `${(count / safeTotal) * 100}%`,
              background: color,
              borderRadius: '4px',
              transition: 'width 1s cubic-bezier(0.34, 1, 0.64, 1)',
            }}
          />
        ))}
      </div>

      {/* Tiles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {memData.map((item) => (
          <MemTile
            key={item.label}
            {...item}
            onClick={() => navigate('/dashboard/flashcards')}
          />
        ))}
      </div>
    </div>
  );
}

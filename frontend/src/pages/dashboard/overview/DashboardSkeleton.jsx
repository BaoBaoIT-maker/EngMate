import React from 'react';

function Sk({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: 'linear-gradient(90deg, var(--sk-from) 25%, var(--sk-to) 50%, var(--sk-from) 75%)',
        backgroundSize: '200% 100%',
        animation: 'sk-shimmer 1.6s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export default function DashboardSkeleton({ isDark }) {
  const skFrom = isDark ? 'rgba(240, 180, 41, 0.05)' : '#F0ECE1';
  const skTo = isDark ? 'rgba(240, 180, 41, 0.12)' : '#E2DACE';

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '1.5px solid var(--card-border)',
    borderRadius: '24px',
    boxShadow: 'var(--card-shadow)',
    padding: '28px',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '0 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        '--sk-from': skFrom,
        '--sk-to': skTo,
      }}
    >
      {/* 1. HeroBanner skeleton */}
      <div style={{ ...cardStyle, padding: '32px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sk w={36} h={36} r={10} />
              <Sk w="45%" h={28} r={8} />
            </div>
            <Sk w="70%" h={16} r={6} />
          </div>
          <Sk w={160} h={44} r={999} />
        </div>
        <div style={{ display: 'flex', gap: '24px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
          <Sk w="20%" h={32} r={8} />
          <Sk w="20%" h={32} r={8} />
          <Sk w="20%" h={32} r={8} />
          <Sk w="20%" h={32} r={8} />
        </div>
      </div>

      {/* 2. ActivityHeatmap skeleton */}
      <div style={{ ...cardStyle, height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Sk w={90} h={12} r={4} style={{ marginBottom: 8 }} />
            <Sk w={160} h={20} r={6} />
          </div>
          <Sk w={120} h={14} r={4} />
        </div>
        <Sk w="100%" h={100} r={8} />
      </div>

      {/* 3. Bento Grid skeleton */}
      <div className="bento-grid">
        {/* DailyGoal */}
        <div style={{ ...cardStyle, height: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '100%' }}>
            <Sk w={60} h={12} r={4} style={{ marginBottom: 8 }} />
            <Sk w={120} h={18} r={6} />
          </div>
          <div style={{ width: 140, height: 140, borderRadius: '50%', border: `10px solid ${skFrom}` }} />
          <Sk w="100%" h={48} r={16} />
        </div>

        {/* MemoryMatrix */}
        <div style={{ ...cardStyle, height: '380px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Sk w={130} h={18} r={6} />
            <Sk w={60} h={24} r={999} />
          </div>
          <Sk w="100%" h={8} r={4} />
          <Sk w="100%" h={64} r={16} />
          <Sk w="100%" h={64} r={16} />
          <Sk w="100%" h={64} r={16} />
        </div>

        {/* FlashcardCarousel */}
        <div style={{ ...cardStyle, height: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Sk w={130} h={18} r={6} />
            <div style={{ display: 'flex', gap: 6 }}>
              <Sk w={32} h={32} r={10} />
              <Sk w={32} h={32} r={10} />
            </div>
          </div>
          <Sk w="100%" h={180} r={18} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            <Sk w={20} h={6} r={999} />
            <Sk w={6} h={6} r={999} />
            <Sk w={6} h={6} r={999} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sk-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
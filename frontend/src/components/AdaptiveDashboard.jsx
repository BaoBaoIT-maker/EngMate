import React from 'react';

const GOLD = '#F0B429';

const aiStats = [
  { label: 'Từ đã thuộc', value: '1.284', delta: '+48 hôm nay', color: GOLD },
  { label: 'Chuỗi ngày học', value: '23 ngày', delta: '🔥 Kỷ lục cá nhân', color: '#F97316' },
  { label: 'XP hôm nay', value: '840 pts', delta: 'Còn 160 lên cấp', color: '#8B5CF6' },
  { label: 'Độ chính xác', value: '94,2%', delta: '↑ 3,1% tuần này', color: '#10B981' },
];

export default function AdaptiveDashboard() {
  const weakAreas = ['Mệnh đề điều kiện', 'Câu bị động', 'Collocations'];
  const path = [
    { label: 'Danh từ', done: true },
    { label: 'Động từ', done: true },
    { label: 'Tính từ', done: true },
    { label: 'Thành ngữ', done: false, active: true },
    { label: 'Collocation', done: false },
    { label: 'Thi thử', done: false },
  ];
  return (
    <div className="glass-dark" style={{
      borderRadius: 24, padding: '2rem',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      animation: 'card-in 0.5s ease 0.1s both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🧠</div>
        <div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>Học thích nghi thông minh</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Cá nhân hóa theo điểm yếu của bạn</div>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {aiStats.map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '0.875rem' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: 2, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Learning path */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Lộ trình học của bạn</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {path.map((node, i) => (
            <div key={node.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: node.done ? 'linear-gradient(135deg, #F0B429, #D4960A)'
                    : node.active ? 'rgba(240,180,41,0.25)' : 'rgba(255,255,255,0.08)',
                  border: node.active ? `2px solid ${GOLD}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem',
                  boxShadow: node.active ? `0 0 12px rgba(240,180,41,0.5)` : 'none',
                }}>
                  {node.done ? '✓' : node.active ? '▶' : ''}
                </div>
                <div style={{ fontSize: '0.52rem', color: node.done ? 'rgba(255,255,255,0.6)' : node.active ? GOLD : 'rgba(255,255,255,0.25)', fontWeight: node.active ? 700 : 500, textAlign: 'center', lineHeight: 1.2 }}>
                  {node.label}
                </div>
              </div>
              {i < path.length - 1 && (
                <div style={{ width: '100%', height: 2, background: node.done ? `linear-gradient(90deg, ${GOLD}, ${GOLD}aa)` : 'rgba(255,255,255,0.08)', borderRadius: 1, flex: 1, maxWidth: 16 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weak areas */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Cần tập trung</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {weakAreas.map(a => (
            <span key={a} style={{ padding: '0.25rem 0.625rem', borderRadius: 100, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.25)', fontSize: '0.65rem', fontWeight: 600, color: '#F9A8D4' }}>
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

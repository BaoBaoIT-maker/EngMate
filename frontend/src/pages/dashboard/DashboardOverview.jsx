import React from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

function RadialProgress({ value, color, size = 72, strokeW = 6 }) {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const c = size / 2;
  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={strokeW} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
    </svg>
  );
}

const card = (t, extra) => ({
  background: t.card,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${t.cardBorder}`,
  borderRadius: 16,
  boxShadow: `0 4px 24px ${t.shadow}`,
  ...extra,
});

export default function DashboardOverview() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const skills = [
    { label: 'Từ vựng', value: 72, color: t.gold },
    { label: 'Ngữ pháp', value: 58, color: '#8B5CF6' },
    { label: 'Phát âm', value: 84, color: '#10B981' },
  ];
  const recent = [
    { word: 'Meticulous', correct: true, time: '2 giờ trước' },
    { word: 'Alleviate', correct: true, time: '2 giờ trước' },
    { word: 'Proliferate', correct: false, time: 'Hôm qua' },
    { word: 'Substantial', correct: true, time: 'Hôm qua' },
  ];

  return (
    <div className="screen-enter w-full max-w-7xl mx-auto">
      <Header title={`Chào buổi sáng, ${user?.profile?.username || 'User'} 👋`} subtitle="Tiếp tục chuỗi ngày học của bạn nhé!" />

      {/* Top row */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 mb-4">
        {/* Streak */}
        <div className="streak-badge" style={{ ...card(t), padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid rgba(234,179,8,0.3)` }}>
          <span className="anim-flame" style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: t.gold, letterSpacing: '-0.04em', lineHeight: 1 }}>23</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: t.textMuted, marginTop: 2 }}>Ngày liên tiếp</div>
          </div>
          <div style={{ marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '0.72rem', color: t.textMuted, marginBottom: 4 }}>Kỷ lục</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text }}>31 🏆</div>
          </div>
        </div>

        {/* XP + Level */}
        <div style={{ ...card(t), padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cấp độ</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text }}>Level 7 — Intermediate</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: t.textMuted }}>XP hôm nay</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.gold }}>840 / 1000</div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '84%', borderRadius: 100, background: `linear-gradient(90deg, ${t.gold}, ${t.goldDark})`, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>160 XP đến Level 8</span>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>1.284 từ đã thuộc</span>
          </div>
        </div>
      </div>

      {/* Skills + Next lesson */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Skills */}
        <div style={{ ...card(t), padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.125rem' }}>Kỹ năng</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {skills.map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <RadialProgress value={s.value} color={s.color} size={72} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: t.text }}>{s.value}%</div>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: t.textSub }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next lesson */}
        <div onClick={() => navigate('/dashboard/flashcards')} style={{ ...card(t), padding: '1.25rem', cursor: 'pointer', border: `1px solid rgba(234,179,8,0.25)`, transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${t.shadow}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px ${t.shadow}`; }}>
          <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${t.goldBg} 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>Bài học tiếp theo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: t.goldBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📚</div>
            <div>
              <div style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem' }}>TOEIC — Từ vựng kinh doanh</div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted }}>8 từ cần ôn tập hôm nay</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '68%', borderRadius: 100, background: `linear-gradient(90deg, ${t.gold}, ${t.goldDark})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>17 / 25 từ</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.gold }}>Tiếp tục →</span>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ ...card(t), padding: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Hoạt động gần đây</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: r.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                {r.correct ? '✓' : '✕'}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: t.text, fontSize: '0.875rem' }}>{r.word}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: t.textMuted }}>{r.time}</div>
              <div style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: r.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', fontSize: '0.65rem', fontWeight: 700, color: r.correct ? '#10B981' : '#EF4444' }}>
                {r.correct ? 'Thuộc' : 'Cần ôn'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

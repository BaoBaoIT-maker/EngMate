import React, { useState, useEffect } from 'react';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── Seed/Sprout Icon ───────────────────────────────────────────────
function SproutIcon({ streak }) {
  // Lá nhiều hơn khi streak cao hơn
  const level = streak >= 30 ? 4 : streak >= 14 ? 3 : streak >= 7 ? 2 : 1;
  return (
    <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stem */}
      <path d="M26 58 C26 42, 26 30, 26 18" stroke="#2F9E56" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Leaf left 1 */}
      <path d="M26 38 C18 32, 10 28, 8 20 C16 22, 22 28, 26 38Z" fill="#2F9E56"/>
      {/* Leaf right 1 */}
      <path d="M26 38 C34 32, 42 28, 44 20 C36 22, 30 28, 26 38Z" fill="#3DBE6A" opacity="0.85"/>
      {/* Leaf left 2 */}
      {level >= 2 && <path d="M26 28 C20 22, 12 18, 10 10 C18 12, 24 20, 26 28Z" fill="#2F9E56" opacity="0.9"/>}
      {/* Leaf right 2 */}
      {level >= 2 && <path d="M26 28 C32 22, 40 18, 42 10 C34 12, 28 20, 26 28Z" fill="#3DBE6A" opacity="0.75"/>}
      {/* Top bud */}
      {level >= 3 && <ellipse cx="26" cy="16" rx="5" ry="7" fill="#2F9E56" opacity="0.9"/>}
      {level >= 4 && <path d="M26 12 C22 6, 16 4, 14 0 C20 2, 25 7, 26 12Z" fill="#F2A73B"/>}
      {level >= 4 && <path d="M26 12 C30 6, 36 4, 38 0 C32 2, 27 7, 26 12Z" fill="#F2A73B" opacity="0.8"/>}
    </svg>
  );
}

// ─── Leaf Tag Icon ───────────────────────────────────────────────────
function LeafTag({ color = '#2F9E56' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.32c-.87 1.3.88 2.65 1.75 1.35C6.87 18.6 9.89 16 17 16c6 0 6-8 0-8z"/>
    </svg>
  );
}

// ─── Radial Progress ─────────────────────────────────────────────────
function RadialProgress({ value, color, size = 72, strokeW = 6 }) {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const c = size / 2;
  return (
    <svg width={size} height={size}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeW}/>
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }}/>
    </svg>
  );
}

// ─── Heatmap ──────────────────────────────────────────────────────────
function Heatmap({ data, t, isDark }) {
  const cols = 26;
  const rows = 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (cols * rows - 1));
  const startDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDay);

  const countMap = {};
  data.forEach(item => { countMap[item.date] = item.count; });

  const getLevel = (count) => {
    if (!count) return 0;
    if (count < 5) return 1;
    if (count < 15) return 2;
    if (count < 30) return 3;
    return 4;
  };

  // Garden palette heatmap: kem → xanh lá đậm
  const getBg = (level) => {
    if (isDark) {
      const palette = ['#1A2B1E', '#1D6B3C', '#2F9E56', '#3DBE6A', '#52D68A'];
      return palette[level];
    } else {
      const palette = ['#F3F9F4', '#C3E4CD', '#7DCD95', '#33A85C', '#1D753D'];
      return palette[level];
    }
  };

  const grid = [];
  const monthLabels = [];
  const monthNames = ['Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6','Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12'];
  let lastMonth = -1;
  let lastMonthCol = -5;

  let d = new Date(startDate);
  for (let c = 0; c < cols; c++) {
    const colData = [];
    for (let r = 0; r < rows; r++) {
      if (d > today) {
        colData.push(null);
      } else {
        const dateStr = d.toISOString().split('T')[0];
        const count = countMap[dateStr] || 0;
        colData.push({ date: dateStr, count });
        if (r === 0 && d.getMonth() !== lastMonth && c - lastMonthCol > 2) {
          monthLabels.push({ label: monthNames[d.getMonth()], colIndex: c });
          lastMonthCol = c;
          lastMonth = d.getMonth();
        }
      }
      d.setDate(d.getDate() + 1);
    }
    grid.push(colData);
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', overflowX: 'auto', maxWidth: '100%' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '8px', paddingTop: '20px', fontSize: '10px', color: t.textMuted, }}>
          {[0,1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 12, lineHeight: '12px' }}>
              {i === 1 ? 'T2' : i === 3 ? 'T4' : i === 5 ? 'T6' : ''}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '20px', position: 'relative', width: '100%' }}>
            {monthLabels.map((ml, idx) => (
              <span key={idx} style={{ position: 'absolute', left: ml.colIndex * 15, fontSize: '11px', color: t.textMuted, fontWeight: 500 }}>{ml.label}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {grid.map((col, cIdx) => (
              <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {col.map((cell, rIdx) => {
                  if (!cell) return <div key={rIdx} style={{ width: 12, height: 12, borderRadius: 3 }} />;
                  const level = getLevel(cell.count);
                  const dateObj = new Date(cell.date);
                  const formattedDate = dateObj.toLocaleDateString('vi-VN');
                  return (
                    <div key={rIdx} title={`${formattedDate}: ${cell.count} từ`}
                      style={{ width: 12, height: 12, borderRadius: 3, background: getBg(level), transition: 'transform 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.3)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '12px', gap: '4px', fontSize: '11px', color: t.textMuted, }}>
        <span style={{ marginRight: '4px' }}>Ít hơn</span>
        {[0,1,2,3,4].map(l => <div key={l} style={{ width: 12, height: 12, borderRadius: 3, background: getBg(l) }} />)}
        <span style={{ marginLeft: '4px' }}>Nhiều hơn</span>
      </div>
    </div>
  );
}

// ─── Card styles ───────────────────────────────────────────────────────
const card = (t) => ({
  background: t.card,
  border: `1px solid ${t.cardBorder}`,
  borderRadius: '24px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
});

// ─── Greeting ──────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'buổi sáng';
  if (h < 18) return 'buổi chiều';
  return 'buổi tối';
}

// ─── Skeleton primitive ─────────────────────────────────────────────────
function Sk({ w = '100%', h = 16, r = 8, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--sk-from) 25%, var(--sk-to) 50%, var(--sk-from) 75%)',
      backgroundSize: '200% 100%',
      animation: 'sk-shimmer 1.6s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

function DashboardSkeleton({ t, isDark }) {
  const skFrom = isDark ? 'rgba(47,158,86,0.08)' : '#F0EAD9';
  const skTo   = isDark ? 'rgba(47,158,86,0.18)' : '#E5DBCA';

  return (
    <div className="screen-enter w-full max-w-5xl mx-auto"
      style={{ '--sk-from': skFrom, '--sk-to': skTo }}
    >
      {/* Hero header skeleton */}
      <div style={{ marginBottom: '2rem' }}>
        <Sk w="55%" h={44} r={10} />
        <Sk w="38%" h={16} r={6} style={{ marginTop: 12 }} />
      </div>

      {/* Top row: Streak + XP + Goal */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-4 mb-4">
        {/* Streak card */}
        <div style={{ ...card(t), padding: '2rem', minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Sk w={52} h={60} r={12} />
            <div style={{ flex: 1 }}>
              <Sk w={60} h={36} r={8} />
              <Sk w={90} h={12} r={5} style={{ marginTop: 8 }} />
              <Sk w={70} h={12} r={5} style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>

        {/* XP card */}
        <div style={{ ...card(t), padding: '2rem', minWidth: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Sk w={52} h={52} r={26} />
            <div style={{ flex: 1 }}>
              <Sk w={60} h={36} r={8} />
              <Sk w={80} h={12} r={5} style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>

        {/* Goal card */}
        <div style={{ ...card(t), padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <Sk w={80} h={10} r={4} />
              <Sk w={160} h={18} r={6} style={{ marginTop: 8 }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Sk w={60} h={28} r={8} />
              <Sk w={50} h={10} r={4} style={{ marginTop: 6 }} />
            </div>
          </div>
          <Sk w="100%" h={10} r={100} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Sk w={80} h={10} r={4} />
            <Sk w={100} h={10} r={4} />
          </div>
        </div>
      </div>

      {/* Section label skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', marginTop: '0.5rem' }}>
        <Sk w={18} h={18} r={4} />
        <Sk w={130} h={18} r={6} />
        <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
      </div>

      {/* Heatmap + Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Heatmap */}
        <div style={{ ...card(t), padding: '2rem' }}>
          <Sk w={180} h={12} r={5} style={{ marginBottom: 20 }} />
          {/* Grid dots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[0,1,2,3,4,5,6].map(row => (
              <div key={row} style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: 26 }).map((_, col) => (
                  <Sk key={col} w={12} h={12} r={3}
                    style={{ animationDelay: `${(row * 26 + col) * 0.01}s` }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Memory */}
        <div style={{ ...card(t), padding: '2rem' }}>
          <Sk w={180} h={12} r={5} style={{ marginBottom: 24 }} />
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Sk w={68} h={68} r={34} />
                <Sk w={70} h={10} r={4} />
                <Sk w={55} h={9} r={4} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent words */}
      <div style={{ ...card(t), padding: '2rem' }}>
        <Sk w={160} h={12} r={5} style={{ marginBottom: 20 }} />
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', marginBottom: 4 }}>
            <Sk w={18} h={18} r={4} />
            <Sk w={`${100 + i * 30}px`} h={14} r={5} style={{ flex: 1 }} />
            <Sk w={80} h={10} r={4} />
            <Sk w={72} h={24} r={100} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function DashboardOverview() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/overview');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <DashboardSkeleton t={t} isDark={isDark} />;
  }

  const { streak, dailyGoal, memory, heatmap, recent } = stats;
  const goalPerc = Math.min(Math.round((dailyGoal.completed / dailyGoal.target) * 100), 100);
  const isGoalReached = dailyGoal.completed >= dailyGoal.target;

  const memoryTotal = memory.needReview + memory.learning + memory.mastered;
  const memArr = [
    { label: 'Cần ôn gấp', count: memory.needReview, color: t.gold, desc: 'Ôn lại ngay hôm nay' },
    { label: 'Đang ghi nhớ', count: memory.learning, color: t.goldDark, desc: 'Lặp lại đều đặn' },
    { label: 'Đã khắc sâu', count: memory.mastered, color: t.green, desc: 'Nhớ lâu dài ✓' },
  ];

  const usernameDisplay = user?.profile?.username || 'bạn';

  return (
    <div className="screen-enter w-full max-w-5xl mx-auto">
      {/* ── Hero Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontWeight: 600, fontSize: 'clamp(24px, 5vw, 36px)',
          color: t.text, margin: 0, lineHeight: 1.2, letterSpacing: '-0.03em',
        }}>
          Chào {getGreeting()},{' '}
          <em style={{ color: t.green, fontStyle: 'italic', fontWeight: 600 }}>{usernameDisplay}</em>
          {' '}👋
        </h1>
        <p style={{ color: t.textMuted, marginTop: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>
          {isGoalReached ? '🎉 Bạn đã hoàn thành mục tiêu hôm nay, tuyệt vời!' : 'Tiếp tục vun trồng khu vườn từ vựng của bạn nhé!'}
        </p>
      </div>

      {/* ── Top Row: Streak + XP + Daily Goal ── */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-4 mb-4">

        {/* Streak Card */}
        <div style={{ ...card(t), padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: `1px solid ${isDark ? 'rgba(47,158,86,0.25)' : '#C8E6C9'}`, minWidth: 200 }}>
          <div style={{ flexShrink: 0 }}>
            <SproutIcon streak={streak.current} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: t.green, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {streak.current}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginTop: 4 }}>Ngày liên tiếp</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.9rem' }}>🏆</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: t.gold }}>Kỷ lục: {streak.max}</span>
            </div>
          </div>
        </div>

        {/* XP Card */}
        <div style={{ ...card(t), padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', border: `1px solid ${isDark ? 'rgba(242,167,59,0.2)' : '#FFE9B0'}`, minWidth: 160 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${t.goldBg}, ${isDark ? 'rgba(242,167,59,0.2)' : '#FFD980'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>⭐</div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: t.gold, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {stats.totalExp || 0}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: t.textMuted, marginTop: 4 }}>XP đạt được</div>
          </div>
        </div>

        {/* Daily Goal Card */}
        <div style={{ ...card(t), padding: '2rem', border: isGoalReached ? `1px solid ${t.green}` : `1px solid ${t.cardBorder}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Mục tiêu hôm nay</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: isGoalReached ? t.green : t.text }}>
                {isGoalReached ? '✅ Hoàn thành xuất sắc!' : 'Cố lên, sắp xong rồi!'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isGoalReached ? t.green : t.text, lineHeight: 1 }}>
                {dailyGoal.completed}<span style={{ fontSize: '1rem', color: t.textMuted }}>/{dailyGoal.target}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 3 }}>thẻ đã học</div>
            </div>
          </div>
          <div style={{ height: 10, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : '#F0EAD9', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${goalPerc}%`, borderRadius: 100,
              background: `linear-gradient(90deg, ${t.gold}, ${t.green})`,
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: `0 0 12px ${t.gold}50`
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: t.textMuted }}>Tiến độ: <b style={{ color: isGoalReached ? t.green : t.gold }}>{goalPerc}%</b></span>
            <span style={{ fontSize: '0.72rem', color: t.textMuted }}>Tổng kho: {memoryTotal} từ</span>
          </div>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', marginTop: '0.5rem' }}>
        <LeafTag color={t.green} />
        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: t.text, fontStyle: 'italic' }}>Khu vườn tri thức</span>
        <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
      </div>

      {/* ── Heatmap & Memory ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Heatmap */}
        <div style={{ ...card(t), padding: '2rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📅</span> Mức độ chăm chỉ (6 tháng qua)
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Heatmap data={heatmap} t={t} isDark={isDark} />
          </div>
        </div>

        {/* Memory Retention */}
        <div style={{ ...card(t), padding: '2rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🧠</span> Phân bố trí nhớ
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {memArr.map(s => {
              const perc = memoryTotal > 0 ? Math.round((s.count / memoryTotal) * 100) : 0;
              return (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
                  <div style={{ position: 'relative' }}>
                    <RadialProgress value={perc} color={s.color} size={68} strokeW={6}/>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: 700, color: t.text }}>
                      {s.count}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color }}>{s.label}</div>
                    <div style={{ fontSize: '0.65rem', color: t.textMuted, marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Words ── */}
      <div style={{ ...card(t), padding: '2rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🕒</span> Vừa ôn tập gần đây
        </div>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: t.textMuted }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🌱</div>
            <div style={{ fontSize: '0.9rem' }}>Bạn chưa ôn tập từ vựng nào gần đây.<br/>Hãy bắt đầu vun trồng khu vườn của bạn!</div>
            <button onClick={() => navigate('/dashboard/flashcards')} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: 100, background: `linear-gradient(135deg, ${t.gold}, ${t.green})`, color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              Bắt đầu học ngay →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {recent.map((r, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', borderRadius: 12, background: 'transparent', transition: 'background 0.2s', cursor: 'default' }}
                onMouseOver={e => e.currentTarget.style.background = t.goldBg}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <LeafTag color={r.correct ? t.green : t.gold} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: t.text, fontSize: '0.9rem' }}>{r.word}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: t.textMuted }}>
                  {new Date(r.time).toLocaleString('vi-VN', { day: '2-digit', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ padding: '0.25rem 0.65rem', borderRadius: 100, background: r.correct ? t.greenBg : t.goldBg, fontSize: '0.68rem', fontWeight: 700, color: r.correct ? t.greenDark : t.goldDark, border: `1px solid ${r.correct ? '#C8E6C9' : '#FFE0A0'}` }}>
                  {r.correct ? '🌿 Thuộc' : '🌱 Ôn thêm'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

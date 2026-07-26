import React, { useState, useEffect } from 'react';
import Header from '../../components/dashboard/Header';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

function Heatmap({ data, t, isDark }) {
  // 1. Cấu hình số cột (số tuần) và số hàng (số ngày trong tuần)
  const cols = 26; // Hiển thị khoảng 6 tháng (26 tuần) để giống Github hơn
  const rows = 7;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // 2. Tìm ngày bắt đầu (Chủ nhật của tuần cách đây 'cols' tuần)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (cols * rows - 1));
  const startDay = startDate.getDay(); // 0 = Sunday
  startDate.setDate(startDate.getDate() - startDay); // Lùi về Chủ nhật
  
  // 3. Map dữ liệu
  const countMap = {};
  data.forEach(item => { countMap[item.date] = item.count; });

  const getLevel = (count) => {
    if (!count) return 0;
    if (count < 5) return 1;
    if (count < 15) return 2;
    if (count < 30) return 3;
    return 4;
  };

  const getBg = (level) => {
    if (isDark) {
      if (level === 0) return '#161b22';
      if (level === 1) return '#0e4429';
      if (level === 2) return '#006d32';
      if (level === 3) return '#26a641';
      return '#39d353';
    } else {
      if (level === 0) return '#ebedf0';
      if (level === 1) return '#9be9a8';
      if (level === 2) return '#40c463';
      if (level === 3) return '#30a14e';
      return '#216e39';
    }
  };

  // 4. Tạo grid và label tháng
  const grid = [];
  const monthLabels = []; // Lưu object: { label: 'Thg 7', colIndex: 5 }
  const monthNames = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
  let lastMonth = -1;
  let lastMonthCol = -5; // Để track khoảng cách giữa các nhãn

  let d = new Date(startDate);
  for (let c = 0; c < cols; c++) {
    const colData = [];

    for (let r = 0; r < rows; r++) {
      if (d > today) {
        colData.push(null); // Future days
      } else {
        const dateStr = d.toISOString().split('T')[0];
        const count = countMap[dateStr] || 0;
        colData.push({ date: dateStr, count });

        // Đánh dấu cột này có chứa ngày đầu tháng (chỉ xét hàng đầu tiên của cột để tránh label bị trùng)
        if (r === 0 && d.getMonth() !== lastMonth) {
          // Chỉ thêm nhãn nếu khoảng cách tới nhãn trước đó đủ lớn (tránh đè chữ)
          if (c - lastMonthCol > 2) {
            monthLabels.push({ label: monthNames[d.getMonth()], colIndex: c });
            lastMonthCol = c;
          }
          lastMonth = d.getMonth();
        }
      }
      d.setDate(d.getDate() + 1);
    }
    grid.push(colData);
  }

  return (
    <div style={{ 
      display: 'inline-flex', 
      flexDirection: 'column', 
      border: `1px solid ${t.cardBorder}`, 
      borderRadius: '6px', 
      padding: '16px',
      background: isDark ? '#0d1117' : '#ffffff',
      overflowX: 'auto',
      maxWidth: '100%'
    }}>
      <div style={{ display: 'flex' }}>
        {/* Day Labels */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '3px',
          paddingRight: '8px',
          paddingTop: '20px', // Khớp với chiều cao của month labels (20px)
          fontSize: '10px',
          color: t.textMuted
        }}>
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ height: 12, lineHeight: '12px' }}>
              {i === 1 ? 'Mon' : i === 3 ? 'Wed' : i === 5 ? 'Fri' : ''}
            </div>
          ))}
        </div>

        {/* Grid Container */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Month Labels Container */}
          <div style={{ height: '20px', position: 'relative', width: '100%' }}>
            {monthLabels.map((ml, idx) => (
              <span key={idx} style={{ 
                position: 'absolute', 
                left: ml.colIndex * 15, // 12px (width) + 3px (gap)
                fontSize: '12px', 
                color: t.textMuted 
              }}>
                {ml.label}
              </span>
            ))}
          </div>

          {/* Cells Container */}
          <div style={{ display: 'flex', gap: '3px' }}>
            {grid.map((col, cIdx) => (
              <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {col.map((cell, rIdx) => {
                  if (!cell) return <div key={rIdx} style={{ width: 12, height: 12, borderRadius: 2 }} />; 
                  
                  const level = getLevel(cell.count);
                  const dateObj = new Date(cell.date);
                  const formattedDate = dateObj.toLocaleDateString('vi-VN');
                  
                  return (
                    <div 
                      key={rIdx} 
                      title={`Ngày ${formattedDate}: ${cell.count} từ`}
                      style={{ 
                        width: 12, height: 12, borderRadius: 2, 
                        background: getBg(level),
                        boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'inset 0 0 0 1px rgba(27,31,35,0.06)'
                      }} 
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '16px', gap: '4px', fontSize: '12px', color: t.textMuted }}>
        <span style={{ marginRight: '4px' }}>Less</span>
        <div style={{ width: 12, height: 12, borderRadius: 2, background: getBg(0), boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'inset 0 0 0 1px rgba(27,31,35,0.06)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 2, background: getBg(1), boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'inset 0 0 0 1px rgba(27,31,35,0.06)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 2, background: getBg(2), boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'inset 0 0 0 1px rgba(27,31,35,0.06)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 2, background: getBg(3), boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'inset 0 0 0 1px rgba(27,31,35,0.06)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 2, background: getBg(4), boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'inset 0 0 0 1px rgba(27,31,35,0.06)' }} />
        <span style={{ marginLeft: '4px' }}>More</span>
      </div>
    </div>
  );
}

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
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: t.text }}>Loading...</div>;
  }

  const { streak, dailyGoal, memory, heatmap, recent } = stats;

  const goalPerc = Math.min(Math.round((dailyGoal.completed / dailyGoal.target) * 100), 100);
  const isGoalReached = dailyGoal.completed >= dailyGoal.target;

  const memoryTotal = memory.needReview + memory.learning + memory.mastered;
  const memArr = [
    { label: 'Cần ôn gấp', count: memory.needReview, color: '#EF4444', desc: 'Có thể quên ngay' },
    { label: 'Đang ghi nhớ', count: memory.learning, color: '#F59E0B', desc: 'Cần lặp lại đều' },
    { label: 'Đã khắc sâu', count: memory.mastered, color: '#10B981', desc: 'Nhớ lâu dài' },
  ];

  return (
    <div className="screen-enter w-full max-w-7xl mx-auto">
      <Header title={`Chào buổi sáng, ${user?.profile?.username || 'User'} 👋`} subtitle="Tiếp tục chuỗi ngày học của bạn nhé!" />

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-4 mb-4">
        {/* Streak */}
        <div className="streak-badge" style={{ ...card(t), padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid rgba(234,179,8,0.3)` }}>
          <span className="anim-flame" style={{ fontSize: '2.5rem', lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: t.gold, letterSpacing: '-0.04em', lineHeight: 1 }}>{streak.current}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: t.textMuted, marginTop: 2 }}>Ngày liên tiếp</div>
          </div>
          <div style={{ marginLeft: '0.5rem', paddingLeft: '1rem', borderLeft: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '0.72rem', color: t.textMuted, marginBottom: 4 }}>Kỷ lục</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: t.text }}>{streak.max} 🏆</div>
          </div>
        </div>

        {/* XP Card */}
        <div className="xp-badge" style={{ ...card(t), padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid rgba(139,92,246,0.3)` }}>
          <span className="anim-star" style={{ fontSize: '2.5rem', lineHeight: 1 }}>🌟</span>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#8B5CF6', letterSpacing: '-0.04em', lineHeight: 1 }}>{stats.totalExp || 0}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: t.textMuted, marginTop: 2 }}>XP đạt được</div>
          </div>
        </div>

        {/* Daily Goal */}
        <div style={{ ...card(t), padding: '1.25rem 1.5rem', border: isGoalReached ? `1px solid ${t.gold}` : `1px solid ${t.cardBorder}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mục tiêu hôm nay</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isGoalReached ? t.gold : t.text }}>
                {isGoalReached ? '🎉 Đã hoàn thành xuất sắc!' : 'Cố lên, sắp xong rồi!'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: t.textMuted }}>Số thẻ đã học</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isGoalReached ? t.gold : t.text }}>{dailyGoal.completed} / {dailyGoal.target}</div>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${goalPerc}%`, borderRadius: 100, background: `linear-gradient(90deg, ${t.gold}, ${t.goldDark})`, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>Tiến độ: {goalPerc}%</span>
            <span style={{ fontSize: '0.68rem', color: t.textMuted }}>Tổng số thẻ trong bộ nhớ: {memoryTotal} từ</span>
          </div>
        </div>
      </div>

      {/* Heatmap & Memory Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Heatmap */}
        <div style={{ ...card(t), padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mức độ chăm chỉ (6 tháng qua)</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Heatmap data={heatmap} t={t} isDark={isDark} />
          </div>
        </div>

        {/* Memory Retention */}
        <div style={{ ...card(t), padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.125rem' }}>Phân bố trí nhớ (Memory Retention)</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100px' }}>
            {memArr.map(s => {
              const perc = memoryTotal > 0 ? Math.round((s.count / memoryTotal) * 100) : 0;
              return (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <div style={{ position: 'relative' }}>
                    <RadialProgress value={perc} color={s.color} size={64} strokeW={5} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: t.text }}>{s.count}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.text }}>{s.label}</div>
                    <div style={{ fontSize: '0.65rem', color: t.textMuted, marginTop: '2px' }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ ...card(t), padding: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>Vừa ôn tập gần đây</div>
        {recent.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: t.textSub, fontStyle: 'italic' }}>Bạn chưa ôn tập từ vựng nào gần đây.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recent.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: r.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                  {r.correct ? '✓' : '✕'}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: t.text, fontSize: '0.875rem' }}>{r.word}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: t.textMuted }}>{new Date(r.time).toLocaleString('vi-VN')}</div>
                <div style={{ padding: '0.2rem 0.5rem', borderRadius: 6, background: r.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', fontSize: '0.65rem', fontWeight: 700, color: r.correct ? '#10B981' : '#EF4444' }}>
                  {r.correct ? 'Thuộc' : 'Cần ôn'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

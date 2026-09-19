import React, { useState, useMemo } from 'react';

const WEEKS = 26;
const DAYS = 7;
const WEEKDAYS = ['T2', '', 'T4', '', 'T6', '', 'CN'];
const HEAT_COLORS = [
  'rgba(240,180,41,0.07)',
  '#FEF3C7',
  '#FDE68A',
  '#F0B429',
  '#C9920A',
];

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

function HeatCell({ date, count, level, size }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      title={count > 0 ? `${date}: ${count} lượt ôn tập` : `${date}: Chưa học`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '4px',
        background: HEAT_COLORS[level] || HEAT_COLORS[0],
        border: '1px solid rgba(240,180,41,0.15)',
        boxShadow: hov && level > 0 ? `0 0 8px ${HEAT_COLORS[level]}` : 'none',
        transform: hov ? 'scale(1.35)' : 'scale(1)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
        flexShrink: 0,
        zIndex: hov ? 10 : 1,
        position: 'relative',
      }}
    />
  );
}

export default function ActivityHeatmap({ heatmap = [] }) {
  const cellSize = 13;
  const gap = 3;

  // Build 26 weeks x 7 days ending at the end of current week
  const { weeksData, monthHeaders } = useMemo(() => {
    const heatMap = {};
    if (Array.isArray(heatmap)) {
      heatmap.forEach((item) => {
        if (item?.date) {
          heatMap[item.date] = item.count || 0;
        }
      });
    }

    const today = new Date();
    // 0 is Sunday in JS, we treat Monday as 0
    const dayOfWeek = (today.getDay() + 6) % 7;
    // Current week's Monday
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - dayOfWeek);
    currentMonday.setHours(0, 0, 0, 0);

    // Starting Monday 25 weeks before current Monday
    const startMonday = new Date(currentMonday);
    startMonday.setDate(currentMonday.getDate() - 25 * 7);

    const generatedWeeks = [];
    const months = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const weekCells = [];
      const weekMonday = new Date(startMonday);
      weekMonday.setDate(startMonday.getDate() + w * 7);

      const m = weekMonday.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        months.push({ weekIndex: w, label: `Tháng ${m + 1}` });
      }

      for (let d = 0; d < DAYS; d++) {
        const cellDate = new Date(startMonday);
        cellDate.setDate(startMonday.getDate() + (w * 7 + d));
        const dateStr = cellDate.toISOString().split('T')[0];
        const count = heatMap[dateStr] || 0;

        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 5) level = 2;
        else if (count > 5 && count <= 9) level = 3;
        else if (count >= 10) level = 4;

        weekCells.push({ date: dateStr, count, level });
      }
      generatedWeeks.push(weekCells);
    }

    return { weeksData: generatedWeeks, monthHeaders: months };
  }, [heatmap]);

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1.5px solid var(--card-border)',
        borderRadius: '24px',
        boxShadow: 'var(--card-shadow)',
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
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

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <Eyebrow>Lịch sử học tập</Eyebrow>
          <h3
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--fg)',
              letterSpacing: '-0.02em',
            }}
          >
            Bản đồ kiên trì
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 500 }}>Ít</span>
          {HEAT_COLORS.map((c, i) => (
            <div
              key={i}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: '3px',
                background: c,
                border: '1px solid rgba(240,180,41,0.15)',
              }}
            />
          ))}
          <span style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 500 }}>Nhiều</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', gap: '6px', minWidth: '460px' }}>
          {/* Weekday labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap, paddingTop: '18px' }}>
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                style={{
                  height: cellSize,
                  width: '18px',
                  fontSize: '9.5px',
                  color: 'var(--fg-3)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid column */}
          <div>
            {/* Month row */}
            <div style={{ display: 'flex', position: 'relative', height: '16px', marginBottom: '4px' }}>
              {monthHeaders.map((m, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${m.weekIndex * (cellSize + gap)}px`,
                    fontSize: '10px',
                    color: 'var(--fg-3)',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div style={{ display: 'flex', gap, flexDirection: 'row' }}>
              {weeksData.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap }}>
                  {week.map((cell, di) => (
                    <HeatCell
                      key={di}
                      date={cell.date}
                      count={cell.count}
                      level={cell.level}
                      size={cellSize}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

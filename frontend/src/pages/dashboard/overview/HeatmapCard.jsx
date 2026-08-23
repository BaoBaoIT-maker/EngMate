function Heatmap({ data, t, isDark }) {
  const cols = 26, rows = 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (cols * rows - 1));
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const countMap = {};
  data.forEach(item => { countMap[item.date] = item.count; });

  const getLevel = (count) => !count ? 0 : count < 5 ? 1 : count < 15 ? 2 : count < 30 ? 3 : 4;
  const getBg = (level) => isDark
    ? ['#1A2B1E','#1D6B3C','#2F9E56','#3DBE6A','#52D68A'][level]
    : ['#F3F9F4','#C3E4CD','#7DCD95','#33A85C','#1D753D'][level];

  const grid = [], monthLabels = [];
  const monthNames = ['Thg 1','Thg 2','Thg 3','Thg 4','Thg 5','Thg 6','Thg 7','Thg 8','Thg 9','Thg 10','Thg 11','Thg 12'];
  let lastMonth = -1, lastMonthCol = -5;
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
          lastMonthCol = c; lastMonth = d.getMonth();
        }
      }
      d.setDate(d.getDate() + 1);
    }
    grid.push(colData);
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col min-w-max">
        <div className="flex">
          <div className="flex flex-col gap-0.5 pr-2 pt-5">
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className="h-3 text-xs leading-3" style={{ color: t.textMuted }}>
                {i === 1 ? 'T2' : i === 3 ? 'T4' : i === 5 ? 'T6' : ''}
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="h-5 relative w-full">
              {monthLabels.map((ml, idx) => (
                <span key={idx} className="absolute text-xs font-medium"
                  style={{ left: ml.colIndex * 15, color: t.textMuted }}>
                  {ml.label}
                </span>
              ))}
            </div>
            <div className="flex gap-0.5">
              {grid.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-0.5">
                  {col.map((cell, rIdx) => {
                    if (!cell) return <div key={rIdx} className="w-3 h-3 rounded-sm" />;
                    const level = getLevel(cell.count);
                    const dateObj = new Date(cell.date);
                    return (
                      <div
                        key={rIdx}
                        title={`${dateObj.toLocaleDateString('vi-VN')}: ${cell.count} từ`}
                        className="w-3 h-3 rounded-sm cursor-default transition-transform duration-150 hover:scale-125"
                        style={{ background: getBg(level) }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1 mt-3 text-xs" style={{ color: t.textMuted }}>
          <span className="mr-1">Ít hơn</span>
          {[0,1,2,3,4].map(l => <div key={l} className="w-3 h-3 rounded-sm" style={{ background: getBg(l) }} />)}
          <span className="ml-1">Nhiều hơn</span>
        </div>
      </div>
    </div>
  );
}

export default function HeatmapCard({ t, isDark, heatmap }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: `0 4px 20px ${t.shadow}` }}
    >
      <div className="text-xs font-bold uppercase mb-5 flex items-center gap-2"
        style={{ color: t.textMuted, letterSpacing: '0.1em' }}>
        <span>📅</span> Mức độ chăm chỉ (6 tháng qua)
      </div>
      <Heatmap data={heatmap} t={t} isDark={isDark} />
    </div>
  );
}
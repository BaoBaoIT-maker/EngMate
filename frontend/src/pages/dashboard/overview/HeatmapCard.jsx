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
    ? ['rgba(255,255,255,0.03)', '#165B33', '#1B8A4C', '#24B662', '#34D37A'][level]
    : ['rgba(0,0,0,0.03)', '#C8E6C9', '#81C784', '#4CAF50', '#2E7D32'][level];

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
          <div className="flex flex-col gap-1 pr-2.5 pt-5">
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className="h-3 text-[10px] font-bold leading-3" style={{ color: t.textMuted }}>
                {i === 1 ? 'T2' : i === 3 ? 'T4' : i === 5 ? 'T6' : ''}
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="h-5 relative w-full mb-1">
              {monthLabels.map((ml, idx) => (
                <span key={idx} className="absolute text-[10px] font-bold"
                  style={{ left: ml.colIndex * 16, color: t.textMuted }}>
                  {ml.label}
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              {grid.map((col, cIdx) => (
                <div key={cIdx} className="flex flex-col gap-1">
                  {col.map((cell, rIdx) => {
                    if (!cell) return <div key={rIdx} className="w-3.5 h-3.5 rounded-sm" />;
                    const level = getLevel(cell.count);
                    const dateObj = new Date(cell.date);
                    return (
                      <div
                        key={rIdx}
                        title={`${dateObj.toLocaleDateString('vi-VN')}: ${cell.count} từ`}
                        className="w-3.5 h-3.5 rounded-[3px] cursor-default transition-all duration-150 hover:scale-125"
                        style={{ background: getBg(level) }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-4 text-[10px] font-bold" style={{ color: t.textMuted }}>
          <span className="mr-1">Ít hơn</span>
          {[0,1,2,3,4].map(l => <div key={l} className="w-3.5 h-3.5 rounded-[3px]" style={{ background: getBg(l) }} />)}
          <span className="ml-1">Nhiều hơn</span>
        </div>
      </div>
    </div>
  );
}

export default function HeatmapCard({ t, isDark, heatmap }) {
  return (
    <div className="glass-panel p-6">
      <div className="text-[11px] font-bold uppercase tracking-wider mb-5 flex items-center gap-2"
        style={{ color: t.textMuted }}>
        <span>📅</span> Mức độ chăm chỉ (6 tháng qua)
      </div>
      <Heatmap data={heatmap} t={t} isDark={isDark} />
    </div>
  );
}
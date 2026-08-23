function RadialProgress({ value, color, size = 76, strokeW = 6 }) {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const c = size / 2;
  return (
    <svg width={size} height={size} aria-hidden="true" className="transition-transform duration-300 hover:scale-105">
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={strokeW}/>
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

export default function MemoryCard({ t, memory }) {
  const memoryTotal = memory.needReview + memory.learning + memory.mastered;
  const memArr = [
    { label: 'Cần ôn gấp',   count: memory.needReview, color: '#E05C00', desc: 'Ôn lại ngay hôm nay' },
    { label: 'Đang ghi nhớ', count: memory.learning,   color: '#D4891E', desc: 'Lặp lại đều đặn' },
    { label: 'Đã khắc sâu',  count: memory.mastered,   color: '#2F9E56', desc: 'Nhớ lâu dài ✓' },
  ];
  return (
    <div className="glass-panel p-6">
      <div className="text-[11px] font-bold uppercase tracking-wider mb-5 flex items-center gap-2"
        style={{ color: t.textMuted }}>
        <span>🧠</span> Phân bố trí nhớ
      </div>
      <div className="flex justify-around items-center gap-4 flex-wrap md:flex-nowrap">
        {memArr.map(s => {
          const perc = memoryTotal > 0 ? Math.round((s.count / memoryTotal) * 100) : 0;
          return (
            <div key={s.label} className="flex flex-col items-center gap-3 flex-1 min-w-[100px]">
              <div className="relative">
                <RadialProgress value={perc} color={s.color} size={76} strokeW={6} />
                <div
                  className="absolute inset-0 flex items-center justify-center text-lg font-extrabold"
                  style={{ color: t.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                >
                  {s.count}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold" style={{ color: s.color }}>{s.label}</div>
                <div className="text-[10px] font-medium mt-0.5" style={{ color: t.textMuted }}>{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
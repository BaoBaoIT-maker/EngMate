export default function MemoryCard({ t, memory }) {
  const memArr = [
    {
      label: 'CẦN ÔN TẬP',
      count: memory.needReview,
      icon: (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600 font-bold text-lg">
          !
        </div>
      ),
      bg: 'rgba(239, 68, 68, 0.05)',
      border: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'ĐANG HỌC',
      count: memory.learning,
      icon: (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 text-lg">
          🔄
        </div>
      ),
      bg: 'rgba(245, 158, 11, 0.05)',
      border: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'THÀNH THẠO',
      count: memory.mastered,
      icon: (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-lg">
          🏆
        </div>
      ),
      bg: 'rgba(16, 185, 129, 0.05)',
      border: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div
      className="glass-panel p-6 flex flex-col gap-4"
      style={{
        border: `1px solid ${t.cardBorder}`,
        boxShadow: `0 10px 30px ${t.shadow}`,
      }}
    >
      <div className="text-sm font-extrabold" style={{ color: t.text }}>
        Trạng thái bộ nhớ
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {memArr.map(s => (
          <div
            key={s.label}
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
            }}
          >
            <div>{s.icon}</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider opacity-60" style={{ color: t.text }}>
                {s.label}
              </span>
              <span className="text-2xl font-extrabold mt-0.5" style={{ color: t.text, fontVariantNumeric: 'tabular-nums' }}>
                {s.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
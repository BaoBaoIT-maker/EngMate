export default function MemoryCard({ t, memory, isDark }) {
  const memArr = [
    {
      label: 'CẦN ÔN TẬP',
      count: memory.needReview,
      icon: '!',
      iconBg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      iconColor: isDark ? '#F87171' : '#DC2626',
      bg: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
      border: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.12)',
    },
    {
      label: 'ĐANG HỌC',
      count: memory.learning,
      icon: '🔄',
      iconBg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      iconColor: isDark ? '#FBBF24' : '#D97706',
      bg: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)',
      border: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.12)',
    },
    {
      label: 'THÀNH THẠO',
      count: memory.mastered,
      icon: '🏆',
      iconBg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#E8F5E9',
      iconColor: isDark ? '#34D399' : '#059669',
      bg: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
      border: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
    },
  ];

  return (
    <div
      className="glass-panel p-6 flex flex-col gap-4"
      style={{
        border: `1px solid ${t.cardBorder}`,
        background: t.card,
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
            className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
              style={{ background: s.iconBg, color: s.iconColor }}
            >
              {s.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider" style={{ color: isDark ? '#CBD5E1' : '#5C7164' }}>
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
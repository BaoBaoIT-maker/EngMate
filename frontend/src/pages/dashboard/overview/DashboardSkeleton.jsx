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

export default function DashboardSkeleton({ t, isDark }) {
  const skFrom = isDark ? 'rgba(47,158,86,0.08)' : '#F0EAD9';
  const skTo   = isDark ? 'rgba(47,158,86,0.18)' : '#E5DBCA';
  const cardStyle = {
    background: t.card,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: '1rem',
    padding: '1.5rem',
  };

  return (
    <div className="w-full max-w-5xl mx-auto screen-enter"
      style={{ '--sk-from': skFrom, '--sk-to': skTo }}>

      {/* Hero skeleton */}
      <div className="mb-6">
        <Sk w="50%" h={32} r={8} />
        <Sk w="35%" h={14} r={6} style={{ marginTop: 10 }} />
        <div className="mt-4 inline-flex items-stretch rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${t.cardBorder}`, background: t.card }}>
          <div className="px-5 py-4 flex items-center gap-3">
            <Sk w={40} h={46} r={8} />
            <div>
              <Sk w={48} h={28} r={6} />
              <Sk w={70} h={10} r={4} style={{ marginTop: 8 }} />
            </div>
          </div>
          <div className="w-px" style={{ background: t.cardBorder }} />
          <div className="px-5 py-4 flex items-center gap-3">
            <Sk w={40} h={40} r={20} />
            <div>
              <Sk w={64} h={28} r={6} />
              <Sk w={56} h={10} r={4} style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-4">
        <div style={cardStyle}>
          <Sk w="60%" h={10} r={4} style={{ marginBottom: 12 }} />
          <Sk w="40%" h={48} r={8} style={{ marginBottom: 16 }} />
          <Sk w="100%" h={10} r={100} />
          <div className="flex justify-between mt-2">
            <Sk w="30%" h={10} r={4} />
            <Sk w="30%" h={10} r={4} />
          </div>
          <Sk w="100%" h={40} r={10} style={{ marginTop: 16 }} />
        </div>
        <div className="flex flex-col gap-4">
          <div style={cardStyle}>
            <Sk w="50%" h={10} r={4} style={{ marginBottom: 16 }} />
            <Sk w="100%" h={90} r={6} />
          </div>
          <div style={cardStyle}>
            <Sk w="50%" h={10} r={4} style={{ marginBottom: 16 }} />
            <div className="flex justify-around">
              <Sk w={72} h={72} r={36} />
              <Sk w={72} h={72} r={36} />
              <Sk w={72} h={72} r={36} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent skeleton */}
      <div style={cardStyle}>
        <Sk w="40%" h={10} r={4} style={{ marginBottom: 14 }} />
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <Sk w={16} h={16} r={4} />
            <Sk h={14} r={5} style={{ flex: 1 }} />
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
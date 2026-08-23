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
  const skFrom = isDark ? 'rgba(16,185,129,0.06)' : '#EAF2EC';
  const skTo   = isDark ? 'rgba(16,185,129,0.14)' : '#D5E6DB';

  const cardStyle = {
    background: isDark ? 'rgba(15,26,19,0.5)' : '#FFFFFF',
    border: `1px solid ${t.cardBorder}`,
    borderRadius: '24px',
    padding: '1.5rem',
  };

  return (
    <div className="w-full max-w-5xl mx-auto screen-enter"
      style={{ '--sk-from': skFrom, '--sk-to': skTo }}>

      {/* Hero skeleton */}
      <div className="mb-8">
        <Sk w="45%" h={36} r={10} />
        <Sk w="25%" h={16} r={6} style={{ marginTop: 12 }} />
      </div>

      {/* Grid: GoalCard | Memory + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 mb-6 items-start">
        {/* GoalCard skeleton */}
        <div style={{ ...cardStyle, height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="w-full"><Sk w="50%" h={16} r={6} /></div>
          {/* Circular progress loader */}
          <div className="w-[180px] h-[180px] rounded-full flex items-center justify-center" style={{ border: `12px solid ${skFrom}` }}>
            <div className="flex flex-col items-center">
              <Sk w={36} h={24} r={4} />
              <Sk w={50} h={10} r={2} style={{ marginTop: 6 }} />
            </div>
          </div>
          <Sk w="80%" h={12} r={4} />
          <Sk w="100%" h={44} r={100} />
        </div>

        {/* Right column skeleton */}
        <div className="flex flex-col gap-6">
          {/* Memory skeleton */}
          <div style={cardStyle}>
            <Sk w="30%" h={16} r={6} style={{ marginBottom: 20 }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border" style={{ borderColor: t.cardBorder }}>
                  <Sk w={40} h={40} r={20} />
                  <div className="flex-1">
                    <Sk w="50%" h={10} r={3} />
                    <Sk w="30%" h={18} r={4} style={{ marginTop: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap skeleton */}
          <div style={cardStyle}>
            <div className="flex justify-between items-center mb-6">
              <Sk w="35%" h={16} r={6} />
              <Sk w="15%" h={10} r={4} />
            </div>
            <Sk w="100%" h={90} r={8} />
          </div>
        </div>
      </div>

      {/* Recent skeleton */}
      <div style={cardStyle}>
        <div className="flex justify-between items-center mb-5">
          <Sk w="30%" h={16} r={6} />
          <Sk w="10%" h={12} r={4} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4.5 rounded-2xl border" style={{ borderColor: t.cardBorder }}>
              <div className="flex-1 pr-2">
                <Sk w="60%" h={16} r={4} />
                <Sk w="85%" h={12} r={3} style={{ marginTop: 8 }} />
              </div>
              <Sk w={24} h={24} r={12} />
            </div>
          ))}
        </div>
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
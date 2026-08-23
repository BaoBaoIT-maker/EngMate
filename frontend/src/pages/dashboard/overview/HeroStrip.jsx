function SproutIcon({ streak }) {
  const level = streak >= 30 ? 4 : streak >= 14 ? 3 : streak >= 7 ? 2 : 1;
  return (
    <svg width="40" height="46" viewBox="0 0 52 60" fill="none" aria-hidden="true">
      <path d="M26 58 C26 42, 26 30, 26 18" stroke="#2F9E56" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M26 38 C18 32, 10 28, 8 20 C16 22, 22 28, 26 38Z" fill="#2F9E56"/>
      <path d="M26 38 C34 32, 42 28, 44 20 C36 22, 30 28, 26 38Z" fill="#3DBE6A" opacity="0.85"/>
      {level >= 2 && <path d="M26 28 C20 22, 12 18, 10 10 C18 12, 24 20, 26 28Z" fill="#2F9E56" opacity="0.9"/>}
      {level >= 2 && <path d="M26 28 C32 22, 40 18, 42 10 C34 12, 28 20, 26 28Z" fill="#3DBE6A" opacity="0.75"/>}
      {level >= 3 && <ellipse cx="26" cy="16" rx="5" ry="7" fill="#2F9E56" opacity="0.9"/>}
      {level >= 4 && <path d="M26 12 C22 6, 16 4, 14 0 C20 2, 25 7, 26 12Z" fill="#F2A73B"/>}
      {level >= 4 && <path d="M26 12 C30 6, 36 4, 38 0 C32 2, 27 7, 26 12Z" fill="#F2A73B" opacity="0.8"/>}
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'buổi sáng';
  if (h < 18) return 'buổi chiều';
  return 'buổi tối';
}

export default function HeroStrip({ t, isDark, username, streak, totalExp, isGoalReached }) {
  return (
    <div className="mb-8 anim-slide-up">
      <div className="mb-5">
        <h1
          className="m-0 leading-tight tracking-tight"
          style={{ fontWeight: 800, fontSize: 'clamp(24px, 4.5vw, 34px)', color: t.text, letterSpacing: '-0.03em' }}
        >
          Chào {getGreeting()},{' '}
          <span style={{ color: t.green }}>{username}</span> 👋
        </h1>
        <p className="mt-1.5 text-sm font-medium" style={{ color: t.textMuted }}>
          {isGoalReached
            ? '🎉 Bạn đã hoàn thành mục tiêu hôm nay — thật tuyệt vời!'
            : 'Hãy tiếp tục gieo mầm kiến thức hôm nay nhé!'}
        </p>
      </div>

      {/* ─── Metric Strip: Streak | XP ─── */}
      <div
        className="inline-flex items-stretch rounded-3xl overflow-hidden glass-panel"
        style={{
          boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 30px rgba(47,158,86,0.03)',
        }}
      >
        {/* Streak */}
        <div className="flex items-center gap-4 px-6 py-4.5">
          <SproutIcon streak={streak.current} />
          <div>
            <div className="leading-none" style={{ fontSize: '2.2rem', fontWeight: 800, color: t.green, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {streak.current}
            </div>
            <div className="text-xs mt-1" style={{ fontWeight: 600, color: t.textMuted }}>Ngày liên tiếp</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px]">🏆</span>
              <span className="text-[11px]" style={{ fontWeight: 500, color: t.gold }}>Kỷ lục: {streak.max}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />

        {/* XP */}
        <div className="flex items-center gap-4 px-6 py-4.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: isDark ? 'rgba(242,167,59,0.12)' : '#FFF3D6' }}
            aria-hidden="true"
          >⭐</div>
          <div>
            <div className="leading-none" style={{ fontSize: '2.2rem', fontWeight: 800, color: t.gold, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {(totalExp || 0).toLocaleString()}
            </div>
            <div className="text-xs mt-1" style={{ fontWeight: 600, color: t.textMuted }}>Tổng XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
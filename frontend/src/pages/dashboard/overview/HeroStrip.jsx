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
    <div className="mb-6 anim-slide-up">
      <div className="mb-4">
        <h1
          className="m-0 leading-tight"
          style={{ fontWeight: 800, fontSize: 'clamp(22px, 4vw, 32px)', color: t.text, letterSpacing: '-0.03em' }}
        >
          Chào {getGreeting()},{' '}
          <em style={{ color: t.green, fontStyle: 'normal' }}>{username}</em> 👋
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: t.textMuted }}>
          {isGoalReached
            ? '🎉 Bạn đã hoàn thành mục tiêu hôm nay — xuất sắc!'
            : 'Tiếp tục vun trồng khu vườn từ vựng của bạn nhé!'}
        </p>
      </div>

      {/* ─── Metric Strip: Streak | XP ─── */}
      <div
        className="inline-flex items-stretch rounded-2xl overflow-hidden"
        style={{
          background: t.card,
          border: `1px solid ${isDark ? 'rgba(47,158,86,0.2)' : '#E4F0E7'}`,
          boxShadow: `0 2px 16px ${t.shadow}`,
        }}
      >
        {/* Streak */}
        <div className="flex items-center gap-3 px-5 py-4">
          <SproutIcon streak={streak.current} />
          <div>
            <div className="leading-none" style={{ fontSize: '2rem', fontWeight: 800, color: t.green, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {streak.current}
            </div>
            <div className="text-xs mt-1" style={{ fontWeight: 600, color: t.textMuted }}>Ngày liên tiếp</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs">🏆</span>
              <span className="text-xs" style={{ fontWeight: 500, color: t.gold }}>Kỷ lục: {streak.max}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px self-stretch" style={{ background: isDark ? 'rgba(255,255,255,0.07)' : '#EDE8DC' }} />

        {/* XP */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: isDark ? 'rgba(242,167,59,0.15)' : '#FFF1CE' }}
            aria-hidden="true"
          >⭐</div>
          <div>
            <div className="leading-none" style={{ fontSize: '2rem', fontWeight: 800, color: t.gold, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {(totalExp || 0).toLocaleString()}
            </div>
            <div className="text-xs mt-1" style={{ fontWeight: 600, color: t.textMuted }}>Tổng XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
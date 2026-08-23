import { useNavigate } from 'react-router-dom';

function LeafTag({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.32c-.87 1.3.88 2.65 1.75 1.35C6.87 18.6 9.89 16 17 16c6 0 6-8 0-8z"/>
    </svg>
  );
}

export default function RecentWordsCard({ t, recent }) {
  const navigate = useNavigate();

  if (recent.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3"
        style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: `0 4px 20px ${t.shadow}` }}
      >
        <div className="text-4xl">🌱</div>
        <div className="text-sm font-medium" style={{ color: t.textMuted }}>
          Bạn chưa ôn tập từ vựng nào gần đây.<br />
          Hãy bắt đầu vun trồng khu vườn của bạn!
        </div>
        <button
          onClick={() => navigate('/dashboard/flashcards')}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: 'linear-gradient(135deg, #F2A73B, #2F9E56)', boxShadow: '0 4px 12px rgba(242,167,59,0.35)' }}
        >
          Bắt đầu học ngay →
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: t.card, border: `1px solid ${t.cardBorder}`, boxShadow: `0 4px 20px ${t.shadow}` }}
    >
      <div className="text-xs font-bold uppercase mb-4 flex items-center gap-2"
        style={{ color: t.textMuted, letterSpacing: '0.1em' }}>
        <span>🕒</span> Vừa ôn tập gần đây
      </div>
      <div className="flex flex-col gap-1">
        {recent.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 cursor-default"
            onMouseOver={e => e.currentTarget.style.background = t.goldBg}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <LeafTag color={r.correct ? '#2F9E56' : '#F2A73B'} />
            <span className="flex-1 text-sm font-bold" style={{ color: t.text }}>{r.word}</span>
            <span className="text-xs" style={{ color: t.textMuted }}>
              {new Date(r.time).toLocaleString('vi-VN', { day: '2-digit', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: r.correct ? t.greenBg : t.goldBg,
                color: r.correct ? t.greenDark : t.goldDark,
                border: `1px solid ${r.correct ? '#C8E6C9' : '#FFE0A0'}`,
              }}
            >
              {r.correct ? '🌿 Thuộc' : '🌱 Ôn thêm'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
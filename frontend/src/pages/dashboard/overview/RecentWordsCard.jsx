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
      <div className="glass-panel p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="text-4xl">🌱</div>
        <div className="text-sm font-medium leading-relaxed" style={{ color: t.textMuted }}>
          Bạn chưa ôn tập từ vựng nào gần đây.<br />
          Hãy bắt đầu gieo trồng khu vườn từ vựng của bạn ngay hôm nay!
        </div>
        <button
          onClick={() => navigate('/dashboard/flashcards')}
          className="mt-1 px-6 py-3 rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: 'linear-gradient(135deg, #F2A73B, #2F9E56)', boxShadow: '0 4px 12px rgba(242,167,59,0.3)' }}
        >
          Bắt đầu học ngay →
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
        style={{ color: t.textMuted }}>
        <span>🕒</span> Vừa ôn tập gần đây
      </div>
      <div className="flex flex-col gap-1.5">
        {recent.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 cursor-default"
            onMouseOver={e => e.currentTarget.style.background = t.goldBg}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <LeafTag color={r.correct ? '#2F9E56' : '#F2A73B'} />
            <span className="flex-1 text-sm font-bold" style={{ color: t.text }}>{r.word}</span>
            <span className="text-xs font-500" style={{ color: t.textMuted }}>
              {new Date(r.time).toLocaleString('vi-VN', { day: '2-digit', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span
              className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide"
              style={{
                background: r.correct ? t.greenBg : t.goldBg,
                color: r.correct ? t.greenDark : t.goldDark,
                border: `1px solid ${r.correct ? 'rgba(47,158,86,0.15)' : 'rgba(240,180,41,0.15)'}`,
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
import { useNavigate } from 'react-router-dom';

export default function RecentWordsCard({ t, recent }) {
  const navigate = useNavigate();

  // Chỉ lấy tối đa 4 từ gần đây để hiển thị đúng 4 cột ngang như mockup
  const displayWords = (recent || []).slice(0, 4);

  if (displayWords.length === 0) {
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
          style={{ background: t.green, boxShadow: `0 4px 12px ${t.green}30` }}
        >
          Bắt đầu học ngay →
        </button>
      </div>
    );
  }

  return (
    <div
      className="glass-panel p-6 flex flex-col gap-4"
      style={{
        border: `1px solid ${t.cardBorder}`,
        background: t.card,
        boxShadow: `0 10px 30px ${t.shadow}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold" style={{ color: t.text }}>
          Từ vựng vừa ôn tập
        </div>
        <button
          onClick={() => navigate('/dashboard/flashcards')}
          className="text-xs font-extrabold tracking-wider bg-none border-none cursor-pointer focus:outline-none transition-opacity duration-200"
          style={{ color: t.green }}
          onMouseOver={e => e.currentTarget.style.opacity = 0.8}
          onMouseOut={e => e.currentTarget.style.opacity = 1}
        >
          XEM TẤT CẢ
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {displayWords.map((r, i) => {
          const isCorrect = r.correct;
          return (
            <div
              key={i}
              className="flex items-center justify-between p-4.5 rounded-2xl border transition-all duration-200 cursor-default"
              style={{
                background: isCorrect 
                  ? t.card 
                  : (t.text === '#F8FAFC' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'),
                borderColor: isCorrect ? t.cardBorder : 'rgba(239, 68, 68, 0.25)',
              }}
            >
              <div className="flex flex-col gap-1 pr-2">
                <span className="text-base font-extrabold tracking-tight truncate max-w-[120px]" style={{ color: t.text }} title={r.word}>
                  {r.word}
                </span>
                <span className="text-xs font-semibold truncate max-w-[140px]" style={{ color: t.text === '#F8FAFC' ? '#CBD5E1' : t.textMuted }} title={r.meaning || 'Chưa có nghĩa'}>
                  {r.meaning || 'Đang cập nhật...'}
                </span>
              </div>

              {/* Status Circle Icon */}
              <div className="flex-shrink-0">
                {isCorrect ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500 text-white text-xs font-bold shadow-sm">
                    ✓
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500 text-white text-[10px] font-bold shadow-sm">
                    ✕
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
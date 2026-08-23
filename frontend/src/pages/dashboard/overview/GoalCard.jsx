import { useNavigate } from 'react-router-dom';

export default function GoalCard({ t, isDark, dailyGoal, isGoalReached, goalPerc, memoryTotal }) {
  const navigate = useNavigate();
  return (
    <div
      className="glass-panel p-6 flex flex-col gap-5 h-full"
      style={{
        border: `1px solid ${isGoalReached ? t.green : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')}`,
        boxShadow: isGoalReached
          ? `0 0 20px ${t.green}15, 0 10px 30px ${t.shadow}`
          : `0 10px 30px ${t.shadow}`,
      }}
    >
      {/* Header */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.textMuted }}>
          Mục tiêu hôm nay
        </div>
        <div className="text-base font-extrabold" style={{ color: isGoalReached ? t.green : t.text }}>
          {isGoalReached ? '✅ Hoàn thành xuất sắc!' : 'Cố lên, sắp xong rồi!'}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-end gap-1.5">
        <span
          className="leading-none"
          style={{ fontSize: '3.2rem', fontWeight: 900, color: isGoalReached ? t.green : t.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}
        >
          {dailyGoal.completed}
        </span>
        <span className="mb-1 text-lg font-600" style={{ color: t.textMuted }}>
          / {dailyGoal.target} thẻ
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${goalPerc}%`,
              background: `linear-gradient(90deg, ${t.gold}, ${t.green})`,
              boxShadow: `0 0 12px ${t.gold}40`,
              transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2.5 text-xs font-500">
          <span style={{ color: t.textMuted }}>Tiến độ: <b style={{ color: isGoalReached ? t.green : t.gold }}>{goalPerc}%</b></span>
          <span style={{ color: t.textMuted }}>Kho: {memoryTotal} từ</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/dashboard/flashcards')}
        className="mt-auto w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${t.gold}, ${t.green})`,
          boxShadow: isDark ? '0 4px 15px rgba(240,180,41,0.2)' : '0 4px 15px rgba(240,180,41,0.3)',
        }}
      >
        {isGoalReached ? 'Xem lại từ vựng →' : 'Bắt đầu ôn từ ngay →'}
      </button>
    </div>
  );
}
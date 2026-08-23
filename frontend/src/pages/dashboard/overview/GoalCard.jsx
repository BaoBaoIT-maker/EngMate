import { useNavigate } from 'react-router-dom';

export default function GoalCard({ t, isDark, dailyGoal, isGoalReached, goalPerc, memoryTotal }) {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 h-full"
      style={{
        background: t.card,
        border: `1px solid ${isGoalReached ? t.green : t.cardBorder}`,
        boxShadow: isGoalReached
          ? `0 0 0 1px ${t.green}22, 0 4px 20px ${t.shadow}`
          : `0 4px 20px ${t.shadow}`,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase mb-2" style={{ color: t.textMuted, letterSpacing: '0.1em' }}>
          Mục tiêu hôm nay
        </div>
        <div className="text-base font-bold" style={{ color: isGoalReached ? t.green : t.text }}>
          {isGoalReached ? '✅ Hoàn thành xuất sắc!' : 'Cố lên, sắp xong rồi!'}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-end gap-1">
        <span
          className="leading-none"
          style={{ fontSize: '3rem', fontWeight: 800, color: isGoalReached ? t.green : t.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}
        >
          {dailyGoal.completed}
        </span>
        <span className="mb-1 text-lg" style={{ color: t.textMuted, fontWeight: 500 }}>
          / {dailyGoal.target} thẻ
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#F0EAD9' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${goalPerc}%`,
              background: `linear-gradient(90deg, ${t.gold}, ${t.green})`,
              boxShadow: `0 0 10px ${t.gold}50`,
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: t.textMuted }}>
            Tiến độ: <b style={{ color: isGoalReached ? t.green : t.gold }}>{goalPerc}%</b>
          </span>
          <span className="text-xs" style={{ color: t.textMuted }}>Kho: {memoryTotal} từ</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/dashboard/flashcards')}
        className="mt-auto w-full rounded-xl py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
        style={{
          background: `linear-gradient(135deg, ${t.gold}, ${t.green})`,
          boxShadow: `0 4px 14px ${t.gold}40`,
        }}
      >
        {isGoalReached ? 'Xem lại từ vựng →' : 'Bắt đầu ôn từ ngay →'}
      </button>
    </div>
  );
}
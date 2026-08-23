import { useNavigate } from 'react-router-dom';

function CircularProgress({ value, target, color, size = 180, strokeW = 12, isDark }) {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const percentage = Math.min(Math.round((value / target) * 100), 100);
  const offset = circ - (percentage / 100) * circ;
  const c = size / 2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true" className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : '#EAF2EC'}
          strokeWidth={strokeW}
        />
        {/* Progress circle */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight" style={{ color: isDark ? '#ECFDF5' : '#111814' }}>
          {value}
        </span>
        <span className="text-[10px] font-bold tracking-wider mt-1 opacity-60" style={{ color: isDark ? '#A7F3D0' : '#687F70' }}>
          /{target} WORDS
        </span>
      </div>
    </div>
  );
}

export default function GoalCard({ t, isDark, dailyGoal, isGoalReached, goalPerc, memoryTotal }) {
  const navigate = useNavigate();
  const leftCount = Math.max(dailyGoal.target - dailyGoal.completed, 0);

  return (
    <div
      className="glass-panel p-6 flex flex-col items-center gap-6 h-[420px] justify-between text-center"
      style={{
        border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,102,51,0.06)'}`,
        background: isDark ? 'rgba(15,26,19,0.5)' : '#FFFFFF',
        boxShadow: `0 10px 30px ${t.shadow}`,
      }}
    >
      {/* Title */}
      <div className="w-full text-left">
        <h3 className="text-base font-extrabold" style={{ color: t.text }}>
          Mục tiêu ngày
        </h3>
      </div>

      {/* Progress SVG */}
      <CircularProgress
        value={dailyGoal.completed}
        target={dailyGoal.target}
        color={t.green}
        size={180}
        strokeW={12}
        isDark={isDark}
      />

      {/* Info text */}
      <div className="px-2">
        <p className="text-xs font-semibold leading-relaxed" style={{ color: t.textMuted }}>
          {isGoalReached
            ? 'Bạn đã hoàn thành mục tiêu ngày hôm nay! Thật tuyệt vời!'
            : `Chỉ còn ${leftCount} từ nữa để hoàn thành mục tiêu!`}
        </p>
      </div>

      {/* Button */}
      <button
        onClick={() => navigate('/dashboard/flashcards')}
        className="w-full rounded-full py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
        style={{
          background: t.green,
          boxShadow: isDark ? '0 4px 14px rgba(16,185,129,0.2)' : '0 4px 14px rgba(0,102,51,0.15)',
        }}
      >
        {isGoalReached ? 'Xem lại từ vựng' : 'Bắt đầu học'}
      </button>
    </div>
  );
}
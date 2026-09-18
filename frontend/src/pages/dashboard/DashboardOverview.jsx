import { useOutletContext } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';

import HeroStrip from './overview/HeroStrip';
import GoalCard from './overview/GoalCard';
import HeatmapCard from './overview/HeatmapCard';
import MemoryCard from './overview/MemoryCard';
import RecentWordsCard from './overview/RecentWordsCard';
import DashboardSkeleton from './overview/DashboardSkeleton';

export default function DashboardOverview() {
  const { isDark, getTheme } = useThemeStore();
  const t = getTheme();
  const user = useAuthStore(s => s.user);

  // Lấy stats và loading trực tiếp từ layout context
  const { stats, loading } = useOutletContext();

  if (loading || !stats) {
    return <DashboardSkeleton t={t} isDark={isDark} />;
  }

  const { streak, dailyGoal, memory, heatmap, recent } = stats;
  const goalPerc = Math.min(Math.round((dailyGoal.completed / dailyGoal.target) * 100), 100);
  const isGoalReached = dailyGoal.completed >= dailyGoal.target;
  const memoryTotal = memory.needReview + memory.learning + memory.mastered;
  const username = user?.profile?.username || 'bạn';

  return (
    <div className="w-full max-w-5xl mx-auto screen-enter" style={{ color: t.text }}>
      {/* Lời chào: Greeting */}
      <HeroStrip
        t={t}
        isDark={isDark}
        username={username}
        streak={streak}
        totalExp={stats.totalExp}
        isGoalReached={isGoalReached}
      />

      {/* Grid: GoalCard (cột trái) | Memory + Heatmap (cột phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 mb-6 items-start">
        {/* Cột trái: GoalCard */}
        <GoalCard
          t={t}
          isDark={isDark}
          dailyGoal={dailyGoal}
          isGoalReached={isGoalReached}
          goalPerc={goalPerc}
          memoryTotal={memoryTotal}
        />

        {/* Cột phải: MemoryCard + HeatmapCard */}
        <div className="flex flex-col gap-6">
          <MemoryCard t={t} memory={memory} isDark={isDark} />
          <HeatmapCard t={t} isDark={isDark} heatmap={heatmap} />
        </div>
      </div>

      {/* Hàng dưới: RecentWordsCard */}
      <RecentWordsCard t={t} recent={recent} />
    </div>
  );
}
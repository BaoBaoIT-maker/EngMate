import { useState, useEffect } from 'react';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import { getOverviewStats } from '../../services/statService';

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

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverviewStats()
      .then(data => setStats(data))
      .catch(err => console.error('Failed to load stats', err))
      .finally(() => setLoading(false));
  }, []);


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

      {/* Hero: Greeting + Streak/XP strip */}
      <HeroStrip
        t={t}
        isDark={isDark}
        username={username}
        streak={streak}
        totalExp={stats.totalExp}
        isGoalReached={isGoalReached}
      />

      {/* Asymmetric grid: GoalCard (fixed 280px) | Heatmap + Memory (flex) */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mb-4">
        <GoalCard
          t={t}
          isDark={isDark}
          dailyGoal={dailyGoal}
          isGoalReached={isGoalReached}
          goalPerc={goalPerc}
          memoryTotal={memoryTotal}
        />
        <div className="flex flex-col gap-4">
          <HeatmapCard t={t} isDark={isDark} heatmap={heatmap} />
          <MemoryCard t={t} memory={memory} />
        </div>
      </div>

      {/* Recent Words — full width */}
      <RecentWordsCard t={t} recent={recent} />
    </div>
  );
}
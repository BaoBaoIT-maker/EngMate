import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';

import HeroBanner from './overview/HeroBanner';
import ActivityHeatmap from './overview/ActivityHeatmap';
import DailyGoalCard from './overview/DailyGoalCard';
import MemoryMatrixCard from './overview/MemoryMatrixCard';
import FlashcardCarousel from './overview/FlashcardCarousel';
import DashboardSkeleton from './overview/DashboardSkeleton';

export default function DashboardOverview() {
  const { isDark } = useThemeStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Lấy stats và loading trực tiếp từ DashboardLayout context
  const { stats, loading } = useOutletContext();

  if (loading || !stats) {
    return <DashboardSkeleton isDark={isDark} />;
  }

  return (
    <div
      style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '0 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        animation: 'slide-up 0.4s ease both',
      }}
    >
      {/* 1. Hero Greeting Banner */}
      <HeroBanner user={user} stats={stats} navigate={navigate} />

      {/* 2. Activity Heatmap (Bản đồ kiên trì) */}
      <ActivityHeatmap heatmap={stats.heatmap} />

      {/* 3. Bento Grid (Mục tiêu ngày, Kho từ vựng, Thẻ lật từ vựng) */}
      <div className="bento-grid">
        <DailyGoalCard dailyGoal={stats.dailyGoal} />
        <MemoryMatrixCard memory={stats.memory} />
        <FlashcardCarousel recent={stats.recent} />
      </div>
    </div>
  );
}
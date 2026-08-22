import prisma from '../config/prisma.js';

// Hàm helper để cộng điểm EXP và xử lý Streak
export const updateActivityAndExp = async (userId, expAmount) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userSkill = await prisma.userSkill.findUnique({ where: { userId } });
  
  if (!userSkill) return;

  const lastActive = userSkill.lastActiveDate ? new Date(userSkill.lastActiveDate) : null;
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  let newStreak = userSkill.streakDays;
  let newMaxStreak = userSkill.maxStreak;

  if (!lastActive) {
    // Ngày đầu tiên học
    newStreak = 1;
    newMaxStreak = 1;
  } else {
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 1) {
      // Học ngày tiếp theo -> Tăng streak
      newStreak += 1;
      if (newStreak > newMaxStreak) newMaxStreak = newStreak;
    } else if (diffDays > 1) {
      // Mất chuỗi -> Reset
      newStreak = 1;
    }
    // Nếu diffDays === 0, tức là đã học trong hôm nay rồi, không tăng streak, chỉ cập nhật ngày active và exp
  }

  await prisma.userSkill.update({
    where: { userId },
    data: {
      streakDays: newStreak,
      maxStreak: newMaxStreak,
      totalExp: { increment: expAmount },
      lastActiveDate: new Date(),
    }
  });
};

export const getOverviewStats = async (userId) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  // Gộp tất cả các truy vấn độc lập vào Promise.all để chạy song song (Tiết kiệm >60% thời gian)
  const [
    userSkillResult,
    userSetting,
    wordsReviewedToday,
    needReviewCount,
    learningCount,
    masteredCount,
    recentActivities,
    reviewLogs
  ] = await Promise.all([
    prisma.userSkill.findUnique({ where: { userId } }),
    prisma.userSetting.findUnique({ where: { userId } }),
    prisma.reviewLog.count({ where: { flashcard: { userId }, createdAt: { gte: startOfDay } } }),
    prisma.studyProgress.count({ where: { flashcard: { userId }, nextReviewDate: { lte: now } } }),
    prisma.studyProgress.count({ where: { flashcard: { userId }, nextReviewDate: { gt: now }, interval: { lt: 21 } } }),
    prisma.studyProgress.count({ where: { flashcard: { userId }, nextReviewDate: { gt: now }, interval: { gte: 21 } } }),
    prisma.reviewLog.findMany({
      where: { flashcard: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { flashcard: { include: { systemVocabulary: true } } }
    }),
    prisma.reviewLog.findMany({
      where: { flashcard: { userId }, createdAt: { gte: threeMonthsAgo } },
      select: { createdAt: true }
    })
  ]);

  let userSkill = userSkillResult;
  if (!userSkill) {
    userSkill = await prisma.userSkill.create({ data: { userId } });
  }

  const dailyTarget = userSetting?.dailyWordGoal || 15;

  // Group by date for Heatmap
  const heatmapData = {};
  reviewLogs.forEach(log => {
    const dateStr = log.createdAt.toISOString().split('T')[0];
    heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
  });

  const heatmapArray = Object.keys(heatmapData).map(date => ({
    date, count: heatmapData[date]
  }));

  const formattedRecent = recentActivities.map(log => ({
    word: log.flashcard.systemVocabulary?.word || log.flashcard.customWord || "Unknown",
    correct: log.isCorrect,
    time: log.createdAt
  }));

  return {
    streak: {
      current: userSkill.streakDays,
      max: userSkill.maxStreak
    },
    totalExp: userSkill.totalExp,
    dailyGoal: {
      target: dailyTarget,
      completed: wordsReviewedToday
    },
    memory: {
      needReview: needReviewCount,
      learning: learningCount,
      mastered: masteredCount
    },
    heatmap: heatmapArray,
    recent: formattedRecent
  };
};

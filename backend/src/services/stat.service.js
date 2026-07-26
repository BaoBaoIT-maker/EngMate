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
  // 1. Lấy thông tin cơ bản (Streak, Setting mục tiêu)
  let userSkill = await prisma.userSkill.findUnique({
    where: { userId }
  });

  if (!userSkill) {
    userSkill = await prisma.userSkill.create({
      data: { userId }
    });
  }

  const userSetting = await prisma.userSetting.findUnique({
    where: { userId }
  });
  const dailyTarget = userSetting?.dailyWordGoal || 15;

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // Lấy số từ đã ôn hôm nay
  const wordsReviewedToday = await prisma.reviewLog.count({
    where: {
      flashcard: { userId },
      createdAt: { gte: startOfDay }
    }
  });

  // 2. Lấy dữ liệu Heatmap từ ReviewLog (3 tháng gần nhất)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const reviewLogs = await prisma.reviewLog.findMany({
    where: {
      flashcard: { userId },
      createdAt: { gte: threeMonthsAgo }
    },
    select: { createdAt: true }
  });

  // Group by date
  const heatmapData = {};
  reviewLogs.forEach(log => {
    const dateStr = log.createdAt.toISOString().split('T')[0];
    heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
  });

  const heatmapArray = Object.keys(heatmapData).map(date => ({
    date,
    count: heatmapData[date]
  }));

  // 3. Phân tích trạng thái trí nhớ (Memory Retention)
  const needReviewCount = await prisma.studyProgress.count({
    where: { flashcard: { userId }, nextReviewDate: { lte: now } }
  });

  const learningCount = await prisma.studyProgress.count({
    where: { flashcard: { userId }, nextReviewDate: { gt: now }, interval: { lt: 21 } }
  });

  const masteredCount = await prisma.studyProgress.count({
    where: { flashcard: { userId }, nextReviewDate: { gt: now }, interval: { gte: 21 } }
  });

  // 4. Lấy hoạt động gần đây (Recent words)
  const recentActivities = await prisma.reviewLog.findMany({
    where: { flashcard: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      flashcard: {
        include: { systemVocabulary: true }
      }
    }
  });

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

import prisma from '../../../config/prisma.js';

/**
 * Tool 4: Lấy tổng quan tiến độ học tập
 */
export const getStudyOverviewTool = {
  name: 'get_study_overview',
  description: `Lấy tổng quan thống kê học tập của user: tổng số từ đã học, tổng XP tích lũy, streak liên tiếp hiện tại, streak dài nhất, điểm kỹ năng.
Gọi khi user hỏi tổng quát về tiến độ: "tôi học được bao nhiêu từ rồi", "XP của tôi là bao nhiêu", "streak của tôi thế nào", "trình độ tôi đang ở đâu", "tiến độ học tập của tôi".`,

  execute: async (userId) => {
    const [skill, totalFlashcards, masteredCards] = await Promise.all([
      prisma.userSkill.findUnique({ where: { userId } }),
      prisma.flashcard.count({ where: { userId } }),
      prisma.flashcard.count({
        where: {
          userId,
          progress: { boxLevel: { gte: 4 } } // Box 4-5 là đã thuộc tốt
        }
      })
    ]);

    if (!skill) return 'Chưa có dữ liệu học tập.';

    return JSON.stringify({
      totalFlashcards,
      masteredCards,
      learningCards: totalFlashcards - masteredCards,
      totalExp: skill.totalExp,
      streakDays: skill.streakDays,
      maxStreak: skill.maxStreak,
      currentLevel: skill.currentLevel,
      vocabularyScore: skill.vocabularyScore,
      speakingScore: skill.speakingScore,
      lastActiveDate: skill.lastActiveDate
        ? new Date(skill.lastActiveDate).toLocaleDateString('vi-VN')
        : 'Chưa có'
    });
  }
};

/**
 * Tool 5: Lấy thống kê Flashcard chi tiết theo chủ đề
 */
export const getFlashcardStatsTool = {
  name: 'get_flashcard_stats',
  description: `Lấy thống kê flashcard chi tiết: số thẻ đang học theo từng chủ đề, số thẻ cần ôn hôm nay (đến hạn theo SM-2), số thẻ đã thuộc.
Gọi khi user hỏi chi tiết về flashcard: "hôm nay tôi cần ôn bao nhiêu thẻ", "tôi học chủ đề nào nhiều nhất", "thẻ nào đến hạn ôn", "tiến độ flashcard của tôi".`,

  execute: async (userId) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [dueToday, byBox] = await Promise.all([
      // Số thẻ đến hạn ôn hôm nay
      prisma.studyProgress.count({
        where: {
          flashcard: { userId },
          nextReviewDate: { lte: tomorrow }
        }
      }),
      // Phân bố theo BoxLevel
      prisma.studyProgress.groupBy({
        by: ['boxLevel'],
        where: { flashcard: { userId } },
        _count: { boxLevel: true },
        orderBy: { boxLevel: 'asc' }
      })
    ]);

    const boxDistribution = byBox.map(b => ({
      box: b.boxLevel,
      count: b._count.boxLevel,
      label: b.boxLevel <= 2 ? 'Đang học' : b.boxLevel === 3 ? 'Trung bình' : 'Đã thuộc tốt'
    }));

    return JSON.stringify({ dueToday, boxDistribution });
  }
};

/**
 * Tool 6: Lấy danh sách phiên luyện nói AI Coach gần đây
 */
export const getSpeakingSessionsTool = {
  name: 'get_speaking_sessions',
  description: `Lấy danh sách các phiên luyện nói AI Coach gần đây: chủ đề, cấp độ mục tiêu, thời gian tạo, số lượng phiên.
Gọi khi user hỏi về lịch sử luyện nói: "tôi đã luyện nói bao nhiêu phiên", "các buổi luyện gần đây của tôi", "tôi luyện chủ đề gì rồi".`,

  execute: async (userId) => {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        topic: true,
        targetLevel: true,
        categoryCode: true,
        createdAt: true,
        _count: { select: { messages: true } }
      }
    });

    if (!sessions.length) return 'Chưa có phiên luyện nói nào.';

    return JSON.stringify({
      totalSessions: sessions.length,
      recentSessions: sessions.map(s => ({
        topic: s.topic,
        level: s.targetLevel,
        category: s.categoryCode,
        messagesCount: s._count.messages,
        date: new Date(s.createdAt).toLocaleDateString('vi-VN')
      }))
    });
  }
};

/**
 * Tool 7: Lấy thống kê Mini-games
 */
export const getGameStatsTool = {
  name: 'get_game_stats',
  description: `Lấy thống kê chơi game: tổng số lần chơi, phân loại theo từng loại game (Matching, Fill-in-the-blank), tỉ lệ trả lời đúng.
Gọi khi user hỏi về game: "tôi chơi game bao nhiêu lần rồi", "kết quả game của tôi thế nào", "tôi hay chơi game gì".`,

  execute: async (userId) => {
    const logs = await prisma.reviewLog.groupBy({
      by: ['gameType'],
      where: { flashcard: { userId } },
      _count: { gameType: true },
      _sum: { isCorrect: true } // Tổng số câu đúng
    });

    if (!logs.length) return 'Chưa có dữ liệu chơi game.';

    const totalPlays = logs.reduce((sum, g) => sum + g._count.gameType, 0);

    return JSON.stringify({
      totalPlays,
      byGameType: logs.map(g => ({
        gameType: g.gameType,
        plays: g._count.gameType,
      }))
    });
  }
};

/**
 * Tool 8: Gợi ý học tập cá nhân hóa
 */
export const getStudyRecommendationTool = {
  name: 'get_study_recommendation',
  description: `Lấy dữ liệu tổng hợp để đưa ra gợi ý học tập cá nhân hóa: streak, thẻ đến hạn ôn, phiên luyện nói.
Gọi khi user hỏi: "tôi nên học gì tiếp theo", "gợi ý lộ trình cho tôi", "tôi cần cải thiện gì", "hôm nay tôi nên làm gì".`,

  execute: async (userId) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [skill, dueCards, recentSessions] = await Promise.all([
      prisma.userSkill.findUnique({ where: { userId } }),
      prisma.studyProgress.count({
        where: { flashcard: { userId }, nextReviewDate: { lte: tomorrow } }
      }),
      prisma.chatSession.count({
        where: {
          userId,
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    return JSON.stringify({
      streakDays: skill?.streakDays || 0,
      currentLevel: skill?.currentLevel || 'A1',
      dueCardsToday: dueCards,
      speakingSessionsThisWeek: recentSessions,
      speakingScore: skill?.speakingScore || 0,
      vocabularyScore: skill?.vocabularyScore || 0
    });
  }
};

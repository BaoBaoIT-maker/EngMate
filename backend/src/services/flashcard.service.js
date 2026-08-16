import prisma from '../config/prisma.js';
import * as statService from './stat.service.js';
import * as aiService from './ai.service.js';
import { enqueueFlashcardReview } from '../queues/flashcard.queue.js';

export const getTopics = async (userId) => {
  // Lấy toàn bộ chủ đề và map categoryCode sang category để frontend FlashcardPage đọc được
  const topics = await prisma.vocabularyTopic.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { vocabularies: true }
      }
    }
  });

  return topics.map(t => ({
    ...t,
    category: t.categoryCode,
    wordCount: t._count.vocabularies
  }));
};

const formatSystemCard = (fc) => ({
  id: fc.id,
  word: fc.systemVocabulary.word,
  type: fc.systemVocabulary.type,
  phonetic: fc.systemVocabulary.phonetic,
  definitionText: fc.systemVocabulary.definitionText,
  vietnameseMeaning: fc.systemVocabulary.vietnameseMeaning,
  exampleJson: fc.systemVocabulary.exampleJson,
  category: fc.systemVocabulary.categoryCode,
  level: fc.systemVocabulary.level,
  progress: fc.progress
});

export const getFlashcardSession = async (userId, query) => {
  const { type, topicId, mode } = query;
  const now = new Date();

  // Đọc mục tiêu từ vựng hàng ngày từ cài đặt của user (fallback = 15)
  const userSetting = await prisma.userSetting.findUnique({ where: { userId } });
  const dailyGoal = userSetting?.dailyWordGoal ?? 15;

  // 1. Nếu là từ vựng custom
  if (type === 'custom') {
    const formatCustom = (fc) => ({
      id: fc.id,
      word: fc.customWord,
      type: 'custom',
      phonetic: fc.customPhonetic,
      definitionText: fc.customDefinition,
      vietnameseMeaning: fc.customMeaning || fc.customWord,
      exampleJson: fc.customExamples,
      category: 'GENERAL',
      level: 'A1',
      progress: fc.progress
    });

    // Mode "learn": lấy toàn bộ từ custom (bất kể ngày hạn), quá hạn lên trước
    if (mode === 'learn') {
      const allCards = await prisma.flashcard.findMany({
        where: { userId, systemVocabularyId: null, progress: { isNot: null } },
        include: { progress: true },
        orderBy: { progress: { nextReviewDate: 'asc' } },
        take: dailyGoal
      });
      return allCards.map(formatCustom);
    }

    // Mode mặc định: chỉ lấy từ đến hạn
    const dueCards = await prisma.flashcard.findMany({
      where: {
        userId,
        systemVocabularyId: null,
        progress: { nextReviewDate: { lte: now } }
      },
      include: { progress: true },
      take: dailyGoal
    });
    return dueCards.map(formatCustom);
  }

  // 1.5. Nếu là course (Ôn tập tổng hợp: System Cards thuộc Course + Custom Cards)
  if (type === 'course') {
    const { course } = query;
    if (!course) throw new Error('course is required for course type');

    // Sử dụng dailyGoal đã đọc từ userSetting ở trên

    // Lấy system cards đến hạn thuộc khóa học
    const dueSystemCards = await prisma.flashcard.findMany({
      where: {
        userId,
      systemVocabulary: { categoryCode: course },
        progress: { nextReviewDate: { lte: now } }
      },
      include: { systemVocabulary: true, progress: true },
      take: dailyGoal
    });

    const remainingLimit = dailyGoal - dueSystemCards.length;

    // Lấy thêm custom cards đến hạn nếu còn quota
    let dueCustomCards = [];
    if (remainingLimit > 0) {
      dueCustomCards = await prisma.flashcard.findMany({
        where: {
          userId,
          systemVocabularyId: null,
          progress: { nextReviewDate: { lte: now } }
        },
        include: { progress: true },
        take: remainingLimit
      });
    }

    const formattedSystem = dueSystemCards.map(fc => ({
      id: fc.id,
      word: fc.systemVocabulary.word,
      type: fc.systemVocabulary.type,
      phonetic: fc.systemVocabulary.phonetic,
      definitionText: fc.systemVocabulary.definitionText,
      vietnameseMeaning: fc.systemVocabulary.vietnameseMeaning,
      exampleJson: fc.systemVocabulary.exampleJson,
      category: fc.systemVocabulary.categoryCode,
      level: fc.systemVocabulary.level,
      progress: fc.progress
    }));

    const formattedCustom = dueCustomCards.map(fc => ({
      id: fc.id,
      word: fc.customWord,
      type: 'custom',
      phonetic: fc.customPhonetic,
      definitionText: fc.customDefinition,
      vietnameseMeaning: fc.customWord,
      exampleJson: fc.customExamples,
      category: 'GENERAL',
      level: 'A1',
      progress: fc.progress
    }));

    // Gộp và xáo trộn ngẫu nhiên
    const allCards = [...formattedSystem, ...formattedCustom].sort(() => Math.random() - 0.5);
    return allCards;
  }

  // 2. Nếu là system vocabulary theo Topic
  if (!topicId) throw new Error('topicId is required for system words');

  const topicIdNum = parseInt(topicId);
  // Sử dụng dailyGoal đã đọc từ userSetting ở trên

  // --- Mode: "learn" (Học ngay) ---
  // Ưu tiên: Từ mới chưa học → Sau đó mới là từ đã học (không quan tâm ngày hạn)
  if (mode === 'learn') {
    // 1. Lấy từ mới (chưa có flashcard)
    const newWords = await prisma.systemVocabulary.findMany({
      where: {
        topicId: topicIdNum,
        flashcards: { none: { userId } }
      },
      take: dailyGoal
    });

    // Tạo flashcard + progress cho từ mới
    const newCards = [];
    for (const word of newWords) {
      const fc = await prisma.flashcard.create({
        data: {
          userId,
          systemVocabularyId: word.id,
          progress: {
            create: {
              boxLevel: 1, easinessFactor: 2.5, interval: 0,
              repetitions: 0, nextReviewDate: now
            }
          }
        },
        include: { systemVocabulary: true, progress: true }
      });
      newCards.push(fc);
    }

    // 2. Nếu chưa đủ chỉ tiêu, lấy thêm từ đã học (bất kể ngày hạn, ưu tiên quá hạn trước)
    const remaining = dailyGoal - newCards.length;
    let reviewCards = [];
    if (remaining > 0) {
      reviewCards = await prisma.flashcard.findMany({
        where: {
          userId,
          systemVocabulary: { topicId: topicIdNum },
          // chỉ lấy từ đã có progress (đã từng học)
          progress: { isNot: null }
        },
        include: { systemVocabulary: true, progress: true },
        orderBy: { progress: { nextReviewDate: 'asc' } }, // quá hạn lên trước
        take: remaining
      });
      // Bỏ các từ vừa mới tạo ở trên để tránh trùng
      const newCardIds = new Set(newCards.map(c => c.id));
      reviewCards = reviewCards.filter(c => !newCardIds.has(c.id));
    }

    return [...newCards, ...reviewCards].map(formatSystemCard);
  }

  // --- Mode: mặc định (Ôn tập theo lịch SM-2) ---
  // Ưu tiên từ đến hạn, sau đó mới giới thiệu từ mới
  const dueCards = await prisma.flashcard.findMany({
    where: {
      userId,
      systemVocabulary: { topicId: topicIdNum },
      progress: { nextReviewDate: { lte: now } }
    },
    include: { systemVocabulary: true, progress: true },
    take: dailyGoal
  });

  const cardsToLearn = [...dueCards];

  if (cardsToLearn.length < dailyGoal) {
    const needed = dailyGoal - cardsToLearn.length;
    const newWords = await prisma.systemVocabulary.findMany({
      where: {
        topicId: topicIdNum,
        flashcards: { none: { userId } }
      },
      take: needed
    });

    for (const word of newWords) {
      const newFc = await prisma.flashcard.create({
        data: {
          userId,
          systemVocabularyId: word.id,
          progress: {
            create: {
              boxLevel: 1, easinessFactor: 2.5, interval: 0,
              repetitions: 0, nextReviewDate: now
            }
          }
        },
        include: { systemVocabulary: true, progress: true }
      });
      cardsToLearn.push(newFc);
    }
  }

  return cardsToLearn.map(formatSystemCard);
};

export const getLearnedWords = async (userId, query) => {
  const { type, topicId, course } = query;

  if (type === 'custom') {
    const cards = await prisma.flashcard.findMany({
      where: { userId, systemVocabularyId: null },
      include: { progress: true },
      orderBy: { createdAt: 'desc' }
    });
    return cards.map(fc => ({
      id: fc.id,
      word: fc.customWord,
      phonetic: fc.customPhonetic,
      vietnameseMeaning: fc.customMeaning || fc.customWord,
      definition: fc.customDefinition,
      examples: fc.customExamples || [],
      progress: fc.progress,
      type: 'custom'
    }));
  }

  if (type === 'topic') {
    const topicIdNum = parseInt(topicId);
    const cards = await prisma.flashcard.findMany({
      where: { userId, systemVocabulary: { topicId: topicIdNum } },
      include: { systemVocabulary: true, progress: true },
      orderBy: { createdAt: 'desc' }
    });
    return cards.map(fc => ({
      id: fc.id,
      word: fc.systemVocabulary.word,
      phonetic: fc.systemVocabulary.phonetic,
      vietnameseMeaning: fc.systemVocabulary.vietnameseMeaning,
      progress: fc.progress,
      type: 'system'
    }));
  }

  if (type === 'course') {
    const [systemCards, customCards] = await Promise.all([
      prisma.flashcard.findMany({
        where: { userId, systemVocabulary: { categoryCode: course } },
        include: { systemVocabulary: true, progress: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.flashcard.findMany({
        where: { userId, systemVocabularyId: null },
        include: { progress: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const formattedSystem = systemCards.map(fc => ({
      id: fc.id,
      word: fc.systemVocabulary.word,
      phonetic: fc.systemVocabulary.phonetic,
      vietnameseMeaning: fc.systemVocabulary.vietnameseMeaning,
      progress: fc.progress,
      type: 'system'
    }));

    const formattedCustom = customCards.map(fc => ({
      id: fc.id,
      word: fc.customWord,
      phonetic: fc.customPhonetic,
      vietnameseMeaning: fc.customWord,
      progress: fc.progress,
      type: 'custom'
    }));

    return [...formattedSystem, ...formattedCustom];
  }

  return [];
};

export const processFlashcardReview = async (userId, flashcardId, quality) => {
  // Quality: 1 (Hard), 3 (Good), 5 (Easy)
  if (quality < 0 || quality > 5) throw new Error('Quality must be between 0 and 5');

  const progress = await prisma.studyProgress.findUnique({
    where: { flashcardId }
  });

  if (!progress) throw new Error('Progress not found');

  // Kiểm tra quyền sở hữu
  const fc = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!fc || fc.userId !== userId) throw new Error('Unauthorized access to flashcard');

  let { repetitions, interval, easinessFactor } = progress;

  // Thuật toán SM-2
  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easinessFactor < 1.3) easinessFactor = 1.3;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  const updatedProgress = await prisma.studyProgress.update({
    where: { flashcardId },
    data: {
      repetitions,
      interval,
      easinessFactor,
      nextReviewDate,
      boxLevel: quality >= 3 ? progress.boxLevel + 1 : 1
    }
  });

  // Ghi log
  await prisma.reviewLog.create({
    data: {
      flashcardId,
      gameType: 'MATCHING', // Mặc định cho flashcard thông thường
      qualityRating: quality,
      isCorrect: quality >= 3
    }
  });

  // Cập nhật điểm kinh nghiệm và streak (+5 EXP cho mỗi từ vựng được học)
  // Chỉ cộng EXP nếu trả lời đúng hoặc không quá tệ
  if (quality >= 3) {
    await statService.updateActivityAndExp(userId, 5);
  } else {
    // Dù trả lời sai vẫn tính streak nhưng chỉ +1 EXP động viên
    await statService.updateActivityAndExp(userId, 1);
  }
  
  return updatedProgress;
};

export const reviewFlashcard = async (userId, flashcardId, quality) => {
  if (quality < 0 || quality > 5) throw new Error('Quality must be between 0 and 5');
  
  // Đưa vào Queue để xử lý ngầm (hoặc đồng bộ nếu Redis lỗi)
  await enqueueFlashcardReview({ userId, flashcardId, quality });
  
  // Trả về kết quả ngay lập tức (frontend sẽ dùng Optimistic UI)
  return { status: 'queued', message: 'Flashcard review added to background queue' };
};

export const createCustomFlashcard = async (userId, data) => {
  const { word, definition, phonetic, meaning, examples } = data;

  // Kiểm tra trùng lặp từ vựng (case-insensitive)
  const existing = await prisma.flashcard.findFirst({
    where: {
      userId,
      customWord: { equals: word.trim(), mode: 'insensitive' }
    }
  });

  if (existing) {
    const error = new Error('Bạn đã thêm từ vựng này rồi!');
    error.statusCode = 409;
    throw error;
  }

  const newFc = await prisma.flashcard.create({
    data: {
      userId,
      customWord: word.trim(),
      customMeaning: meaning || null,
      customDefinition: definition,
      customPhonetic: phonetic,
      customExamples: examples || [],
      progress: {
        create: {
          boxLevel: 1,
          easinessFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: new Date()
        }
      }
    }
  });

  return newFc;
};

export const updateCustomFlashcard = async (userId, flashcardId, data) => {
  const { word, definition, phonetic, meaning, examples } = data;

  // Kiểm tra quyền sở hữu
  const fc = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!fc || fc.userId !== userId) {
    const error = new Error('Không tìm thấy flashcard hoặc không có quyền chỉnh sửa');
    error.statusCode = 403;
    throw error;
  }

  if (!fc.customWord) {
    const error = new Error('Chỉ có thể chỉnh sửa từ vựng cá nhân');
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra trùng lặp nếu từ bị đổi tên (case-insensitive, loại bỏ chính nó)
  if (word && word.trim().toLowerCase() !== fc.customWord.toLowerCase()) {
    const duplicate = await prisma.flashcard.findFirst({
      where: {
        userId,
        customWord: { equals: word.trim(), mode: 'insensitive' },
        NOT: { id: flashcardId }
      }
    });
    if (duplicate) {
      const error = new Error('Bạn đã thêm từ vựng này rồi!');
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      ...(word && { customWord: word.trim() }),
      ...(meaning !== undefined && { customMeaning: meaning || null }),
      ...(definition !== undefined && { customDefinition: definition }),
      ...(phonetic !== undefined && { customPhonetic: phonetic }),
      ...(examples !== undefined && { customExamples: examples || [] }),
    }
  });

  return updated;
};

export const deleteFlashcard = async (userId, flashcardId) => {
  // Kiểm tra quyền sở hữu
  const fc = await prisma.flashcard.findUnique({ where: { id: flashcardId } });
  if (!fc || fc.userId !== userId) {
    const error = new Error('Không tìm thấy flashcard hoặc không có quyền xóa');
    error.statusCode = 403;
    throw error;
  }

  // Cascade sẽ tự xóa StudyProgress và ReviewLog
  await prisma.flashcard.delete({ where: { id: flashcardId } });

  return { message: 'Đã xóa từ vựng thành công' };
};

export const generateAIContent = async (word) => {
  return await aiService.generateFlashcardContent(word);
};

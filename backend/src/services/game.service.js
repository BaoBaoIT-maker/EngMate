import prisma from '../config/prisma.js';
import * as flashcardService from './flashcard.service.js';
import * as statService from './stat.service.js';

export const getMatchingData = async (userId, limit = 10) => {
  const now = new Date();

  // Tìm các flashcard cần ôn (overdue hoặc hôm nay)
  let cards = await prisma.flashcard.findMany({
    where: {
      userId,
      progress: { nextReviewDate: { lte: now } }
    },
    include: { systemVocabulary: true, progress: true },
    take: limit
  });

  // Nếu không đủ limit, lấy thêm các flashcard còn lại (không sort theo relation)
  if (cards.length < limit) {
    const remainingLimit = limit - cards.length;
    const existingIds = cards.map(c => c.id);
    
    const additionalCards = await prisma.flashcard.findMany({
      where: {
        userId,
        id: { notIn: existingIds.length > 0 ? existingIds : [-1] }
      },
      include: { systemVocabulary: true, progress: true },
      take: remainingLimit,
      orderBy: { createdAt: 'asc' }  // Sort đơn giản theo ngày tạo
    });
    
    cards = [...cards, ...additionalCards];
  }

  // Nếu không có từ nào, trả về mảng rỗng
  if (cards.length === 0) {
    return { englishCards: [], vietnameseCards: [], totalCards: 0 };
  }

  // Format data - lọc bỏ các thẻ thiếu dữ liệu
  const formattedCards = cards
    .filter(fc => {
      if (fc.systemVocabularyId) return fc.systemVocabulary && fc.systemVocabulary.word && fc.systemVocabulary.vietnameseMeaning;
      return fc.customWord && fc.customMeaning;
    })
    .map(fc => {
      const isCustom = !fc.systemVocabularyId;
      return {
        id: fc.id,
        word: isCustom ? fc.customWord : fc.systemVocabulary.word,
        meaning: isCustom ? fc.customMeaning : fc.systemVocabulary.vietnameseMeaning,
        phonetic: isCustom ? (fc.customPhonetic || '') : (fc.systemVocabulary.phonetic || ''),
      };
    });

  if (formattedCards.length === 0) {
    return { englishCards: [], vietnameseCards: [], totalCards: 0 };
  }

  // Xáo trộn và tách thành 2 mảng: mảng tiếng Anh và mảng tiếng Việt
  const englishCards = formattedCards.map(c => ({ id: c.id, text: c.word, type: 'en', phonetic: c.phonetic })).sort(() => Math.random() - 0.5);
  const vietnameseCards = formattedCards.map(c => ({ id: c.id, text: c.meaning, type: 'vi' })).sort(() => Math.random() - 0.5);

  return {
    englishCards,
    vietnameseCards,
    totalCards: formattedCards.length
  };
};

// ===== HELPER: Fetch user cards for any game =====
const fetchUserCards = async (userId, limit) => {
  const now = new Date();
  let cards = await prisma.flashcard.findMany({
    where: { userId, progress: { nextReviewDate: { lte: now } } },
    include: { systemVocabulary: true, progress: true },
    take: limit
  });
  if (cards.length < limit) {
    const existingIds = cards.map(c => c.id);
    const additional = await prisma.flashcard.findMany({
      where: { userId, id: { notIn: existingIds.length > 0 ? existingIds : [-1] } },
      include: { systemVocabulary: true, progress: true },
      take: limit - cards.length,
      orderBy: { createdAt: 'asc' }
    });
    cards = [...cards, ...additional];
  }
  return cards;
};

// ===== HELPER: Tìm và che từ trong câu ví dụ =====
const buildSentence = (word, examples) => {
  if (!examples || examples.length === 0) {
    return { sentence: `The word "______" is commonly used in English.`, hiddenWord: word };
  }
  const lowerWord = word.toLowerCase();
  const matchingSentence = examples.find(ex => ex.toLowerCase().includes(lowerWord));
  if (!matchingSentence) {
    return { sentence: `The word "______" means something important.`, hiddenWord: word };
  }
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}(?:s|es|ed|ing|d)?\\b`, 'i');
  const match = matchingSentence.match(regex);
  if (!match) {
    return { sentence: `The word "______" means something important.`, hiddenWord: word };
  }
  const hiddenWord = match[0];
  const sentence = matchingSentence.replace(regex, '______');
  return { sentence, hiddenWord };
};

export const getFillBlankData = async (userId, limit = 10) => {
  const cards = await fetchUserCards(userId, limit);
  if (cards.length === 0) return { questions: [], totalQuestions: 0 };

  const validCards = cards.filter(fc =>
    fc.systemVocabularyId ? fc.systemVocabulary?.word : fc.customWord
  );
  if (validCards.length === 0) return { questions: [], totalQuestions: 0 };

  const allWords = validCards.map(fc =>
    fc.systemVocabularyId ? fc.systemVocabulary.word : fc.customWord
  );

  const questions = validCards.map(fc => {
    const isCustom = !fc.systemVocabularyId;
    const word = isCustom ? fc.customWord : fc.systemVocabulary.word;
    const meaning = isCustom ? (fc.customMeaning || '') : fc.systemVocabulary.vietnameseMeaning;
    const examples = isCustom
      ? (Array.isArray(fc.customExamples) ? fc.customExamples : [])
      : (Array.isArray(fc.systemVocabulary.exampleJson) ? fc.systemVocabulary.exampleJson : []);

    const { sentence, hiddenWord } = buildSentence(word, examples);

    // 3 từ sai ngẫu nhiên từ pool
    const distractors = allWords
      .filter(w => w.toLowerCase() !== word.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Bù từ nếu không đủ 3 distractors
    const fillerWords = ['beautiful', 'important', 'quickly', 'sometimes', 'understand'];
    let fi = 0;
    while (distractors.length < 3) {
      if (!distractors.includes(fillerWords[fi])) distractors.push(fillerWords[fi]);
      fi++;
    }

    const options = [hiddenWord, ...distractors].sort(() => Math.random() - 0.5);
    return { flashcardId: fc.id, sentence, answer: hiddenWord, meaning, options };
  });

  return { questions, totalQuestions: questions.length };
};

// ===== XP CALCULATOR =====
const calcXP = (isCorrect, timeTaken, gameType) => {
  if (!isCorrect) return 0;
  if (gameType !== 'FILL_BLANK') return 2; // Matching: luôn +2 XP
  const t = timeTaken || 99;
  if (t < 5) return 5;
  if (t < 10) return 4;
  if (t < 20) return 3;
  if (t < 30) return 2;
  return 1;
};

export const submitGameResult = async (userId, results, gameType = 'MATCHING') => {
  // results: [{ flashcardId, isCorrect, timeTaken? }]
  let correctCount = 0;
  let totalXP = 0;


  // Đảm bảo userSkill tồn tại trước khi cập nhật
  await prisma.userSkill.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  for (const res of results) {
    try {
      const quality = res.isCorrect ? 3 : 1;

      // Lấy hoặc tạo StudyProgress nếu chưa có
      const progress = await prisma.studyProgress.findUnique({
        where: { flashcardId: res.flashcardId }
      });

      if (progress) {
        // Chạy thuật toán SM-2
        let { repetitions, interval, easinessFactor } = progress;

        if (quality >= 3) {
          if (repetitions === 0) interval = 1;
          else if (repetitions === 1) interval = 6;
          else interval = Math.round(interval * easinessFactor);
          repetitions += 1;
        } else {
          repetitions = 0;
          interval = 1;
        }

        easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easinessFactor < 1.3) easinessFactor = 1.3;

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);

        await prisma.studyProgress.update({
          where: { flashcardId: res.flashcardId },
          data: {
            repetitions,
            interval,
            easinessFactor,
            nextReviewDate,
            boxLevel: quality >= 3 ? Math.min(progress.boxLevel + 1, 5) : 1
          }
        });
      } else {
        // Nếu chưa có progress, tạo mới với giá trị mặc định
        await prisma.studyProgress.create({
          data: {
            flashcardId: res.flashcardId,
            boxLevel: quality >= 3 ? 2 : 1,
            repetitions: quality >= 3 ? 1 : 0,
            interval: quality >= 3 ? 1 : 0,
            easinessFactor: 2.5,
            nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        });
      }

      // Ghi ReviewLog với gameType động
      await prisma.reviewLog.create({
        data: {
          flashcardId: res.flashcardId,
          gameType: gameType,
          qualityRating: quality,
          isCorrect: res.isCorrect
        }
      });

      const xp = calcXP(res.isCorrect, res.timeTaken, gameType);
      if (res.isCorrect) correctCount++;
      totalXP += xp;
    } catch (cardErr) {
      // Ghi lỗi nhưng không dừng toàn bộ game
      console.error(`Error processing flashcard ${res.flashcardId}:`, cardErr.message);
    }
  }

  // Cập nhật XP & Streak sau khi xử lý hết cards
  try {
    await statService.updateActivityAndExp(userId, totalXP > 0 ? totalXP : 1);
  } catch (statErr) {
    console.error('Error updating stats:', statErr.message);
  }

  return { correctCount, totalXP, totalPlayed: results.length };
};

import prisma from '../config/prisma.js';
import { cacheDelete } from '../config/redis.js';
import { resolveConfiguredTargetWords } from './learningTarget.service.js';
import * as progressRepo from '../repository/learningProgress.repository.js';

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DEFAULT_LEVEL = 'A1';
const LEVEL_PASS_THRESHOLD = 70;
const MASTERY_WEIGHT = 0.6;
const ACCURACY_WEIGHT = 0.25;
const COVERAGE_WEIGHT = 0.15;

const userCacheKey = (userId) => `engmate:user:me:${userId}`;

const roundPercent = (value) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));

const isMasteredProgress = (progress) =>
  Boolean(progress) && (progress.boxLevel >= 5 || progress.interval >= 21);

const calculateLevel = (breakdown) => {
  let currentLevel = DEFAULT_LEVEL;

  for (const level of LEVEL_ORDER) {
    const item = breakdown[level];
    if (!item || item.totalWords === 0) break;

    const hasPassed =
      item.masteryRate >= LEVEL_PASS_THRESHOLD &&
      (item.totalReviews === 0 || item.accuracy >= LEVEL_PASS_THRESHOLD);

    if (!hasPassed) break;
    currentLevel = level;
  }

  return currentLevel;
};

const calculateProgressToTarget = ({ currentLevel, targetLevel, targetWords, masteredWords }) => {
  if (targetWords && targetWords > 0) {
    return roundPercent(Math.min(100, (masteredWords / targetWords) * 100));
  }

  if (targetLevel && LEVEL_ORDER.includes(targetLevel)) {
    const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
    const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
    if (targetIndex < 0) return 0;
    if (targetIndex === 0) return currentIndex >= 0 ? 100 : 0;
    return roundPercent((Math.min(currentIndex, targetIndex) / targetIndex) * 100);
  }

  return 0;
};

export const calculateVocabularyScore = ({ totalWords, studiedWords, masteredWords, accuracy }) => {
  if (totalWords === 0) return 0;

  const masteryRate = (masteredWords / totalWords) * 100;
  const coverageRate = (studiedWords / totalWords) * 100;

  return clampPercent(
    masteryRate * MASTERY_WEIGHT +
    accuracy * ACCURACY_WEIGHT +
    coverageRate * COVERAGE_WEIGHT
  );
};

export const recalculatePathProgress = async (userId, categoryCode) => {
  const code = String(categoryCode || '').toUpperCase();
  if (!code) return null;

  // Lấy UserLearningPath → cần pathId để upsert UserPathProgress
  const path = await prisma.userLearningPath.findUnique({
    where: { userId_categoryCode: { userId, categoryCode: code } },
  });
  if (!path || !path.isActive) return null;

  // Lấy category config (dùng cho progressToTarget)
  const category = await prisma.category.findUnique({
    where: { code },
    select: { code: true, targetConfig: true },
  });

  // --- DATA LAYER: Giao cho Repository (Raw SQL Aggregate) ---
  const sqlResults = await progressRepo.getAggregatedProgressByLevel(userId, code);

  // --- BUSINESS LOGIC: Map SQL rows vào breakdown, đảm bảo đủ 6 level ---
  const breakdown = LEVEL_ORDER.reduce((acc, level) => {
    const row = sqlResults.find((r) => r.level === level) ?? {
      totalWords: 0, studiedWords: 0, masteredWords: 0,
      totalReviews: 0, correctReviews: 0,
    };
    acc[level] = {
      totalWords:     row.totalWords,
      studiedWords:   row.studiedWords,
      masteredWords:  row.masteredWords,
      totalReviews:   row.totalReviews,
      correctReviews: row.correctReviews,
      masteryRate:  row.totalWords > 0 ? roundPercent((row.masteredWords / row.totalWords) * 100) : 0,
      coverageRate: row.totalWords > 0 ? roundPercent((row.studiedWords  / row.totalWords) * 100) : 0,
      accuracy:     row.totalReviews > 0 ? roundPercent((row.correctReviews / row.totalReviews) * 100) : 0,
    };
    return acc;
  }, {});

  // --- Tổng hợp toàn category ---
  let totalWords = 0, studiedWords = 0, masteredWords = 0;
  let totalReviews = 0, correctReviews = 0;
  for (const level of LEVEL_ORDER) {
    const item = breakdown[level];
    totalWords     += item.totalWords;
    studiedWords   += item.studiedWords;
    masteredWords  += item.masteredWords;
    totalReviews   += item.totalReviews;
    correctReviews += item.correctReviews;
  }

  const accuracy         = totalReviews > 0 ? roundPercent((correctReviews / totalReviews) * 100) : 0;
  const currentLevel     = calculateLevel(breakdown);
  const vocabularyScore  = calculateVocabularyScore({ totalWords, studiedWords, masteredWords, accuracy });
  const progressToTarget = calculateProgressToTarget({
    currentLevel,
    targetLevel:    path.targetLevel,
    targetWords:    resolveConfiguredTargetWords({
      category,
      targetLevel:    path.targetLevel,
      targetScore:    path.targetScore,
      targetWordCount: path.targetWordCount,
    }),
    masteredWords,
  });

  // --- PERSISTENCE: Upsert bằng pathId (khoá duy nhất của UserPathProgress) ---
  const payload = {
    userId, currentLevel, vocabularyScore, totalWords,
    studiedWords, masteredWords, accuracy, progressToTarget,
    levelBreakdown: breakdown, lastEvaluatedAt: new Date(),
  };
  const progress = await prisma.userPathProgress.upsert({
    where:  { pathId: path.id },
    update: payload,
    create: { pathId: path.id, ...payload },
  });

  await cacheDelete(userCacheKey(userId));
  return progress;
};


export const recalculateAllActivePaths = async () => {
  const paths = await prisma.userLearningPath.findMany({
    where: { isActive: true },
    select: { userId: true, categoryCode: true },
  });

  const results = [];
  for (const path of paths) {
    const progress = await recalculatePathProgress(path.userId, path.categoryCode);
    results.push({
      userId: path.userId,
      categoryCode: path.categoryCode,
      updated: Boolean(progress),
    });
  }

  return results;
};

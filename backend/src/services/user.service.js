import prisma from '../config/prisma.js';
import {
  findUserById,
  updateUserProfile,
  updateUserSetting,
  findLearningPathsByUserId,
  upsertLearningPath,
  deleteLearningPath,
} from '../repository/auth.repository.js';
import { cacheDelete, cacheGetJson, cacheSetJson } from '../config/redis.js';
import * as learningProgressService from './learningProgress.service.js';
import { getCategoryTargetConfig, TARGET_TYPES } from './learningTarget.service.js';

const userCacheKey = (userId) => `engmate:user:me:${userId}`;

const formatLearningPath = (path) => path ? ({
  ...path,
  category: path.categoryCode,
}) : path;

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    profile: user.profile || null,
    setting: user.setting || null,
    skill: user.skill || null,
    subscription: user.subscription
      ? { ...user.subscription, plan: user.subscription.plan || null }
      : null,
    learningPaths: (user.learningPaths || []).map(formatLearningPath),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getMe = async (userId) => {
  const cachedUser = await cacheGetJson(userCacheKey(userId));
  if (cachedUser) return cachedUser;

  const user = await findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const payload = sanitizeUser(user);
  await cacheSetJson(userCacheKey(userId), payload, 300);
  return payload;
};

export const updateProfile = async (userId, payload) => {
  const updates = {};
  if (payload.username !== undefined) updates.username = payload.username;
  if (payload.avatarUrl !== undefined) updates.avatarUrl = payload.avatarUrl;
  if (payload.bio !== undefined) updates.bio = payload.bio;

  if (Object.keys(updates).length === 0) {
    const error = new Error('No profile fields to update');
    error.statusCode = 400;
    throw error;
  }

  await updateUserProfile(userId, updates);
  await cacheDelete(userCacheKey(userId));
  return getMe(userId);
};

export const updateSetting = async (userId, payload) => {
  const updates = {};
  if (payload.theme !== undefined) updates.theme = payload.theme;
  if (payload.receiveEmails !== undefined) updates.receiveEmails = payload.receiveEmails;
  if (payload.dailyWordGoal !== undefined) {
    const goal = parseInt(payload.dailyWordGoal, 10);
    if (isNaN(goal) || goal < 1 || goal > 200) {
      const error = new Error('dailyWordGoal must be between 1 and 200');
      error.statusCode = 400;
      throw error;
    }
    updates.dailyWordGoal = goal;
  }
  if (payload.onboardingDone !== undefined) updates.onboardingDone = Boolean(payload.onboardingDone);

  if (Object.keys(updates).length === 0) {
    const error = new Error('No setting fields to update');
    error.statusCode = 400;
    throw error;
  }

  await updateUserSetting(userId, updates);
  await cacheDelete(userCacheKey(userId));
  return getMe(userId);
};

// ---- Learning Paths ----

export const getLearningPaths = async (userId) => {
  const paths = await findLearningPathsByUserId(userId);
  return paths.map(formatLearningPath);
};

const normalizeTargetScore = (category, value) => {
  if (value === null) return null;

  const config = getCategoryTargetConfig(category);
  if (config.targetType !== TARGET_TYPES.SCORE) {
    return value === undefined ? undefined : null;
  }
  if (value === undefined) return config.defaultTarget;

  const score = Number(value);
  const minScore = Number.isFinite(config.minScore) ? config.minScore : null;
  const maxScore = Number.isFinite(config.maxScore) ? config.maxScore : null;
  if (
    !Number.isFinite(score)
    || (minScore !== null && score < minScore)
    || (maxScore !== null && score > maxScore)
  ) {
    const range = minScore !== null && maxScore !== null
      ? ` between ${minScore} and ${maxScore}`
      : '';
    const error = new Error(`${category.code} targetScore must be a number${range}`);
    error.statusCode = 400;
    throw error;
  }

  return String(value);
};

const normalizeTargetLevel = (category, value) => {
  if (value === null) return null;

  const config = getCategoryTargetConfig(category);
  if (config.targetType !== TARGET_TYPES.LEVEL) {
    return value === undefined ? undefined : null;
  }
  if (value === undefined) return config.defaultTarget;

  const level = String(value).toUpperCase();
  const validTargets = config.options.map((option) => option.value);
  if (!validTargets.includes(level)) {
    const error = new Error(`targetLevel must be one of ${validTargets.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  return level;
};

/**
 * Upsert một hoặc nhiều lộ trình học cho user.
 * payload.paths = [{ category/categoryCode, targetLevel, targetWordCount }, ...]
 */
export const saveLearningPaths = async (userId, paths) => {
  if (!Array.isArray(paths) || paths.length === 0) {
    const error = new Error('paths must be a non-empty array');
    error.statusCode = 400;
    throw error;
  }

  // Validate categories dynamically from DB
  const activeCategories = await prisma.category.findMany({
    where: { isActive: true },
    select: { code: true, targetConfig: true },
  });
  const categoryByCode = new Map(activeCategories.map((category) => [category.code, category]));
  const validCodes = activeCategories.map((category) => category.code);

  for (const path of paths) {
    const {
      category,
      categoryCode: rawCode,
      targetLevel,
      targetWordCount,
      targetScore,
      currentLevel,
    } = path;
    const code = String(rawCode || category || '').toUpperCase(); // support both old and new field name

    if (!validCodes.includes(code)) {
      const error = new Error(`Invalid category: ${code}. Must be one of ${validCodes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const data = {
      isActive: true,
    };

    const categoryRecord = categoryByCode.get(code);
    const normalizedTargetLevel = normalizeTargetLevel(categoryRecord, targetLevel ?? currentLevel);
    if (normalizedTargetLevel !== undefined) {
      data.targetLevel = normalizedTargetLevel;
    }

    const normalizedTargetScore = normalizeTargetScore(categoryRecord, targetScore);
    if (normalizedTargetScore !== undefined) {
      data.targetScore = normalizedTargetScore;
    }

    if (targetWordCount !== undefined) {
      const count = parseInt(targetWordCount, 10);
      if (Number.isNaN(count) || count < 1) {
        const error = new Error('targetWordCount must be a positive number');
        error.statusCode = 400;
        throw error;
      }
      data.targetWordCount = count;
    }

    await upsertLearningPath(userId, code, data);
    await learningProgressService.recalculatePathProgress(userId, code);
  }

  await cacheDelete(userCacheKey(userId));
  const savedPaths = await findLearningPathsByUserId(userId);
  return savedPaths.map(formatLearningPath);
};

/**
 * Xoá mềm (deactivate) 1 lộ trình học của user theo category
 */
export const removeLearningPath = async (userId, categoryCode) => {
  const activeCategories = await prisma.category.findMany({ where: { isActive: true }, select: { code: true } });
  const validCodes = activeCategories.map(c => c.code);
  if (!validCodes.includes(categoryCode)) {
    const error = new Error(`Invalid category: ${categoryCode}`);
    error.statusCode = 400;
    throw error;
  }
  await deleteLearningPath(userId, categoryCode);
  await cacheDelete(userCacheKey(userId));
  const remainingPaths = await findLearningPathsByUserId(userId);
  return remainingPaths.map(formatLearningPath);
};

/**
 * Hoàn tất Onboarding: lưu paths + đánh dấu onboardingDone = true
 */
export const completeOnboarding = async (userId, { paths, dailyWordGoal }) => {
  // Lưu tất cả lộ trình
  await saveLearningPaths(userId, paths);

  // Cập nhật setting
  const settingUpdate = { onboardingDone: true };
  if (dailyWordGoal !== undefined) {
    const goal = parseInt(dailyWordGoal, 10);
    if (!isNaN(goal) && goal >= 1 && goal <= 200) {
      settingUpdate.dailyWordGoal = goal;
    }
  }
  await updateUserSetting(userId, settingUpdate);

  // Xóa cache TRƯỜC khi đọc lại để đảm bảo fetchMe không trả về dữ liệu cũ
  await cacheDelete(userCacheKey(userId));

  // Trả về user mới nhất (không có cache)
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  const payload = sanitizeUser(user);
  // Lưu lại cache với dữ liệu mới
  await cacheSetJson(userCacheKey(userId), payload, 300);
  return payload;
};

// Lấy profile admin đầu tiên để hiển thị trên trang About (public)
export const getFirstAdminProfile = async () => {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      profile: {
        select: { username: true, avatarUrl: true, bio: true },
      },
    },
  });
  if (!admin) throw Object.assign(new Error('Admin not found'), { statusCode: 404 });
  return {
    id: admin.id,
    email: admin.email,
    username: admin.profile?.username || 'Admin',
    avatarUrl: admin.profile?.avatarUrl || null,
    bio: admin.profile?.bio || null,
  };
};

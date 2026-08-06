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

const userCacheKey = (userId) => `engmate:user:me:${userId}`;

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
    learningPaths: user.learningPaths || [],
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
  return findLearningPathsByUserId(userId);
};

/**
 * Upsert một hoặc nhiều lộ trình học cho user.
 * payload.paths = [{ category, currentLevel, targetScore }, ...]
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
    select: { code: true },
  });
  const validCodes = activeCategories.map(c => c.code);

  for (const path of paths) {
    const { category, categoryCode: rawCode, currentLevel, targetScore } = path;
    const code = rawCode || category; // support both old and new field name

    if (!validCodes.includes(code)) {
      const error = new Error(`Invalid category: ${code}. Must be one of ${validCodes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const data = {
      currentLevel: currentLevel ? String(currentLevel) : 'A1',
      isActive: true,
    };
    if (targetScore !== undefined) {
      data.targetScore = targetScore === null ? null : String(targetScore);
    }

    await upsertLearningPath(userId, code, data);
  }

  await cacheDelete(userCacheKey(userId));
  return findLearningPathsByUserId(userId);
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
  return findLearningPathsByUserId(userId);
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
import {
  findUserById,
  updateUserProfile,
  updateUserSetting,
} from '../repository/auth.repository.js';
import { cacheDelete, cacheGetJson, cacheSetJson } from '../config/redis.js';

const userCacheKey = (userId) => `engmate:user:me:${userId}`;

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    profile: user.profile || null,
    setting: user.setting || null,
    skill: user.skill || null,
    subscription: user.subscription || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getMe = async (userId) => {
  const cachedUser = await cacheGetJson(userCacheKey(userId));

  if (cachedUser) {
    return cachedUser;
  }

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

  if (payload.username !== undefined) {
    updates.username = payload.username;
  }

  if (payload.avatarUrl !== undefined) {
    updates.avatarUrl = payload.avatarUrl;
  }

  if (payload.bio !== undefined) {
    updates.bio = payload.bio;
  }

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

  if (payload.theme !== undefined) {
    updates.theme = payload.theme;
  }

  if (payload.receiveEmails !== undefined) {
    updates.receiveEmails = payload.receiveEmails;
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error('No setting fields to update');
    error.statusCode = 400;
    throw error;
  }

  await updateUserSetting(userId, updates);
  await cacheDelete(userCacheKey(userId));

  return getMe(userId);
};
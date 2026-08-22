import prisma from '../config/prisma.js';

export const findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });

export const findUserByProvider = (provider, providerId) => prisma.user.findFirst({
  where: {
    provider,
    providerId,
  },
});

export const findUserById = (id) => prisma.user.findUnique({
  where: { id },
  include: {
    profile: true,
    setting: true,
    skill: true,
    subscription: { include: { plan: true } },
    learningPaths: {
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: { progress: true },
    },
  },
});

export const createAuthUser = (data) => prisma.user.create({ data });

export const updateAuthUser = (id, data) => prisma.user.update({
  where: { id },
  data,
});

export const markUserVerified = (id) => prisma.user.update({
  where: { id },
  data: {
    isVerified: true,
    verifiedAt: new Date(),
  },
});

export const createUserProfile = (data) => prisma.userProfile.create({ data });

export const updateUserProfile = (userId, data) => prisma.userProfile.update({
  where: { userId },
  data,
});

export const upsertUserProfile = (userId, data) => prisma.userProfile.upsert({
  where: { userId },
  update: data,
  create: {
    userId,
    ...data,
  },
});

export const createUserSetting = (data) => prisma.userSetting.create({ data });

export const updateUserSetting = (userId, data) => prisma.userSetting.update({
  where: { userId },
  data,
});

export const upsertUserSetting = (userId, data) => prisma.userSetting.upsert({
  where: { userId },
  update: data,
  create: {
    userId,
    ...data,
  },
});

export const createUserSkill = (data) => prisma.userSkill.create({ data });

export const updatePassword = (id, passwordHash) => prisma.user.update({
  where: { id },
  data: { passwordHash },
});

// ---- Learning Paths ----

export const findLearningPathsByUserId = (userId) =>
  prisma.userLearningPath.findMany({
    where: { userId, isActive: true },
    orderBy: { updatedAt: 'desc' },
    include: { progress: true },
  });

export const upsertLearningPath = (userId, categoryCode, data) =>
  prisma.userLearningPath.upsert({
    where: { userId_categoryCode: { userId, categoryCode } },
    update: { ...data, updatedAt: new Date() },
    create: { userId, categoryCode, ...data },
  });

export const deleteLearningPath = (userId, categoryCode) =>
  prisma.userLearningPath.updateMany({
    where: { userId, categoryCode },
    data: { isActive: false },
  });
